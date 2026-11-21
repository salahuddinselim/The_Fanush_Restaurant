import logging
import os
import time
from collections import defaultdict
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, Cookie, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import (
    verify_password, create_access_token, decode_token,
    COOKIE_NAME, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user,
)
from ..limiter import limiter

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger("restaurant.security")

_failed: dict[str, list[float]] = defaultdict(list)
_WINDOWS = 300
_MAX = 10
_MAX_TRACKED_USERS = 10_000


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _prune_lockouts() -> None:
    now = time.time()
    for username in list(_failed):
        _failed[username] = [t for t in _failed[username] if now - t < _WINDOWS]
        if not _failed[username]:
            _failed.pop(username, None)
    if len(_failed) > _MAX_TRACKED_USERS:
        for username in list(_failed)[: len(_failed) - _MAX_TRACKED_USERS]:
            _failed.pop(username, None)


def _check_lockout(username: str) -> None:
    _prune_lockouts()
    if len(_failed[username]) >= _MAX:
        logger.warning("Auth lockout triggered for username=%s", username)
        raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 5 minutes.")


def _secure_cookies() -> bool:
    return (
        os.environ.get("PRODUCTION", "").lower() in ("1", "true", "yes")
        or os.environ.get("SECURE_COOKIES", "").lower() in ("1", "true", "yes")
    )


@router.post("/login", response_model=schemas.LoginResult)
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
        logger.warning(
            "Failed login username=%s ip=%s", body.username, _client_ip(request)
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    _failed.pop(body.username, None)
    db.query(models.RevokedToken).filter(
        models.RevokedToken.expires_at < datetime.now(timezone.utc)
    ).delete(synchronize_session=False)
    db.commit()

    token = create_access_token({"sub": user.username})
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="strict",
        secure=_secure_cookies(),
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    logger.info("Successful login username=%s ip=%s", user.username, _client_ip(request))
    # The token is deliberately NOT returned in the body: it stays in the
    # HttpOnly cookie so client-side scripts cannot read it.
    return schemas.LoginResult()


@router.get("/me")
@limiter.limit("60/minute")
def me(request: Request, current_user: models.User = Depends(get_current_user)):
    return {"username": current_user.username}


@router.post("/logout")
@limiter.limit("30/minute")
def logout(
    request: Request,
    response: Response,
    session_token: Optional[str] = Cookie(default=None),
    db: Session = Depends(get_db),
):
    response.delete_cookie(key=COOKIE_NAME, path="/")
    if session_token:
        try:
            payload = decode_token(session_token)
        except HTTPException:
            payload = None  # expired/invalid token: nothing to revoke
        if payload:
            jti = payload.get("jti")
            exp = payload.get("exp")
            if jti and exp:
                try:
                    db.add(models.RevokedToken(
                        jti=jti,
                        expires_at=datetime.fromtimestamp(exp, tz=timezone.utc),
                    ))
                    db.commit()
                except Exception as exc:
                    db.rollback()
                    logger.error("Session revocation failed jti=%s: %s", jti, exc)
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Could not revoke session",
                    ) from exc
    logger.info("Logout ip=%s", _client_ip(request))
    return {"detail": "Logged out"}
