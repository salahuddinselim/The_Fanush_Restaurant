import os
import uuid
from fastapi import HTTPException, UploadFile

MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

# Magic-byte signatures for allowed image types
_MAGIC = [
    b"\xff\xd8\xff",           # JPEG
    b"\x89PNG\r\n\x1a\n",      # PNG
    b"GIF87a",                 # GIF
    b"GIF89a",                 # GIF
    b"RIFF",                   # WebP (followed by WEBP at offset 8)
]


async def save_upload(file: UploadFile, upload_dir: str) -> str:
    """Validate and save an uploaded image. Returns the saved file path."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"File extension '{ext}' not allowed. Use: {', '.join(ALLOWED_EXTENSIONS)}")

    content = await file.read()

    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, f"File exceeds the 5 MB limit ({len(content) // 1024} KB received)")

    if not any(content.startswith(sig) for sig in _MAGIC):
        raise HTTPException(400, "File content does not match a supported image type (JPEG/PNG/GIF/WebP)")

    # WebP extra check: magic is RIFF????WEBP
    if content.startswith(b"RIFF") and b"WEBP" not in content[8:12]:
        raise HTTPException(400, "RIFF file is not a valid WebP image")

    os.makedirs(upload_dir, exist_ok=True)
    filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(upload_dir, filename)
    with open(path, "wb") as f:
        f.write(content)

    return filename
