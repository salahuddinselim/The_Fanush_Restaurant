import os
import uuid

from fastapi import HTTPException, UploadFile
from PIL import Image

MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB
CHUNK_BYTES = 64 * 1024

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

_MAGIC = [
    b"\xff\xd8\xff",           # JPEG
    b"\x89PNG\r\n\x1a\n",      # PNG
    b"GIF87a",                 # GIF
    b"GIF89a",                 # GIF
    b"RIFF",                   # WebP (followed by WEBP at offset 8)
]


def safe_upload_path(upload_dir: str, filename: str) -> str:
    """Resolve a stored filename and guarantee it stays inside upload_dir."""
    base = os.path.realpath(upload_dir)
    target = os.path.realpath(os.path.join(upload_dir, filename))
    if target != base and not target.startswith(base + os.sep):
        raise HTTPException(400, "Invalid image path")
    return target


async def save_upload(file: UploadFile, upload_dir: str) -> str:
    """Stream, validate and save an uploaded image. Returns the saved filename."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"File extension '{ext}' not allowed. Use: {', '.join(ALLOWED_EXTENSIONS)}")

    os.makedirs(upload_dir, exist_ok=True)
    temp_path = os.path.join(upload_dir, f".upload-{uuid.uuid4()}.tmp")
    size = 0
    header = b""
    try:
        with open(temp_path, "wb") as out:
            while chunk := await file.read(CHUNK_BYTES):
                size += len(chunk)
                if size > MAX_UPLOAD_BYTES:
                    raise HTTPException(413, "File exceeds the 5 MB limit")
                header = (header + chunk)[:16]
                out.write(chunk)

        if not any(header.startswith(sig) for sig in _MAGIC):
            raise HTTPException(400, "File content does not match a supported image type (JPEG/PNG/GIF/WebP)")
        if header.startswith(b"RIFF") and b"WEBP" not in header[8:12]:
            raise HTTPException(400, "RIFF file is not a valid WebP image")

        # Decode the image fully: magic bytes alone accept polyglot files.
        try:
            with Image.open(temp_path) as image:
                image.verify()
        except Exception as exc:
            raise HTTPException(400, "Uploaded file is not a valid image") from exc

        filename = f"{uuid.uuid4()}{ext}"
        os.replace(temp_path, safe_upload_path(upload_dir, filename))
        return filename
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)
