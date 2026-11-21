import os
import uuid
from pathlib import Path
import bcrypt as _bcrypt
import jwt as _jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status, Cookie
from sqlalchemy.orm import Session
from .database import get_db
from . import models

def _load_secret() -> str:
    """Fail closed: never generate an ephemeral signing key at runtime."""
    value = os.environ.get("JWT_SECRET_KEY")
    if not value:
        secret_file = Path(__file__).resolve().parent.parent / ".jwt-secret"
        try:
            if secret_file.exists():
                value = secret_file.read_text(encoding="utf-8").strip()
        except OSError:
            value = None
    if not value or len(value) < 32:
        raise RuntimeError(
            "A JWT signing secret of at least 32 characters is required. "
            "Set JWT_SECRET_KEY or provide the .jwt-secret file."
        )
    return value


SECRET_KEY = _load_secret()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
COOKIE_NAME = "session_token"


BCRYPT_MAX_BYTES = 72


def _password_bytes(password: str) -> bytes:
    raw = password.encode("utf-8")
    if len(raw) > BCRYPT_MAX_BYTES:
        raise ValueError("Password must not exceed 72 bytes")
    return raw


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return _bcrypt.checkpw(_password_bytes(plain), hashed.encode())
    except (ValueError, TypeError):
        return False


def hash_password(password: str) -> str:
    return _bcrypt.hashpw(_password_bytes(password), _bcrypt.gensalt()).decode()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "jti": str(uuid.uuid4())})
    return _jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return _jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except _jwt.exceptions.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def get_current_user(
    session_token: Optional[str] = Cookie(default=None),
    db: Session = Depends(get_db),
) -> models.User:
    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(session_token)
    jti = payload.get("jti")
    if jti and db.query(models.RevokedToken).filter(models.RevokedToken.jti == jti).first():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session has been revoked")
    username: str = payload.get("sub")  # type: ignore[assignment]
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
