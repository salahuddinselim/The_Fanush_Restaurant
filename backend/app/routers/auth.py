import os
import time
from collections import defaultdict
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, Cookie, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import verify_password, create_access_token, decode_token, COOKIE_NAME, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user
from ..limiter import limiter

router = APIRouter(prefix="/auth", tags=["auth"])

_failed: dict[str, list[float]] = defaultdict(list)
_WINDOW = 300   # 5 minutes
_MAX = 10       # max failed attempts before lockout


def _check_lockout(username: str) -> None:
    now = time.time()
    recent = [t for t in _failed[username] if now - t < _WINDOW]
    if recent:
        _failed[username] = recent
    else:
        _failed.pop(username, None)
    if len(recent) >= _MAX:
        raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 5 minutes.")


@router.post("/login", response_model=schemas.Token)
@limiter.limit("5/minute")
def login(
    request: Request,
    body: schemas.LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    _check_lockout(body.username)
    user = db.query(models.User).filter(models.User.username == body.username).first()
    if not user or not verify_password(body.password, user.hashed_password):
        _failed[body.username].append(time.time())
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    _failed.pop(body.username, None)
    token = create_access_token({"sub": user.username})
    secure = os.environ.get("PRODUCTION", "").lower() in ("1", "true", "yes")
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="strict",
        secure=secure,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def me(current_user: models.User = Depends(get_current_user)):
    return {"username": current_user.username}


@router.post("/logout")
def logout(
    response: Response,
    session_token: Optional[str] = Cookie(default=None),
    db: Session = Depends(get_db),
):
    response.delete_cookie(key=COOKIE_NAME, path="/")  # always clear, even if revocation fails
    if session_token:
        try:
            payload = decode_token(session_token)
            jti = payload.get("jti")
            exp = payload.get("exp")
            if jti and exp:
                db.add(models.RevokedToken(
                    jti=jti,
                    expires_at=datetime.fromtimestamp(exp, tz=timezone.utc),
                ))
                db.commit()
        except Exception:
            pass
    return {"detail": "Logged out"}
