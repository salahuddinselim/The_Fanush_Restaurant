import logging
import time
from collections import defaultdict

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import joinedload
import os
from pathlib import Path
from .database import engine, Base, SessionLocal
from .limiter import limiter
from .routers import auth, config, hours, menu, gallery, reservations, reviews
from . import models

Base.metadata.create_all(bind=engine)
_backend_dir = Path(__file__).resolve().parent.parent
_static_dir = _backend_dir / "static"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("restaurant")

_debug = os.getenv("DEBUG", "").lower() in ("1", "true", "yes")
app = FastAPI(
    title="Restaurant CMS API",
    version="1.0.0",
    docs_url="/docs" if _debug else None,
    redoc_url="/redoc" if _debug else None,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(GZipMiddleware, minimum_size=500)


_production = os.getenv("PRODUCTION", "").lower() in ("1", "true", "yes")
_cors_env = os.getenv("CORS_ALLOW_ORIGINS")
_cors_origins = (
    [o.strip() for o in _cors_env.split(",") if o.strip()]
    if _cors_env
    else [
        "http://localhost:4200", "http://127.0.0.1:4200",
    ]
)
# Private-network origins are permitted only when explicitly opted into for
# local development. Production uses the explicit CORS_ALLOW_ORIGINS allowlist.
_dev_cors = os.getenv("ALLOW_PRIVATE_NETWORK_CORS", "").lower() in ("1", "true", "yes")
_cors_regex = (
    r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|"
    r"10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|.*\.local)(:\d+)?$"
    if _dev_cors else None
)
if _production and not _cors_env:
    raise RuntimeError("CORS_ALLOW_ORIGINS must be set in production")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=_cors_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)


# Coarse per-IP request cap in addition to per-endpoint slowapi limits.
# Bounded and self-pruning so it cannot be used to exhaust memory.
_request_counts: dict[tuple[str, str], tuple[float, int]] = defaultdict(lambda: (time.time(), 0))
_RATE_WINDOW = 300
_RATE_MAX_READ = 300
_RATE_MAX_WRITE = 60
_MAX_TRACKED_IPS = 10_000


@app.middleware("http")
async def global_rate_limit(request: Request, call_next):
    ip = request.client.host if request.client else "unknown"
    kind = "write" if request.method in {"POST", "PUT", "PATCH", "DELETE"} else "read"
    key = (ip, kind)
    now = time.time()
    window_start, count = _request_counts[key]
    if now - window_start > _RATE_WINDOW:
        window_start, count = now, 0
    count += 1
    _request_counts[key] = (window_start, count)
    if len(_request_counts) > _MAX_TRACKED_IPS:
        for tracked in list(_request_counts)[: len(_request_counts) - _MAX_TRACKED_IPS]:
            _request_counts.pop(tracked, None)
    limit = _RATE_MAX_WRITE if kind == "write" else _RATE_MAX_READ
    if count > limit:
        logger.warning("Rate limit exceeded ip=%s kind=%s", ip, kind)
        return JSONResponse(status_code=429, content={"detail": "Too many requests"})
    return await call_next(request)


@app.exception_handler(Exception)
async def unhandled_exception(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path, exc_info=exc)
    return JSONResponse(status_code=500, content={"detail": "An internal error occurred"})


@app.middleware("http")
async def add_security_headers(request: Request, call_next) -> Response:
    response: Response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "img-src 'self' https://images.unsplash.com data: blob:; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "font-src 'self'; "
        "connect-src 'self'; "
        "frame-src https://www.openstreetmap.org; "
        "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
    )
    # Only anonymous public content is cacheable. Auth and admin data must never be
    # stored by shared caches.
    if request.method == "GET" and response.status_code == 200:
        public_paths = {
            "/config", "/hours", "/gallery", "/reviews",
            "/page/home", "/health", "/menu/categories", "/menu/items",
        }
        if request.url.path in public_paths:
            response.headers.setdefault("Cache-Control", "public, max-age=30, stale-while-revalidate=60")
        else:
            response.headers["Cache-Control"] = "private, no-store"
    return response

_static_dir.joinpath("uploads").mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(_static_dir)), name="static")

app.include_router(auth.router)
app.include_router(config.router)
app.include_router(hours.router)
app.include_router(menu.router)
app.include_router(gallery.router)
app.include_router(reservations.router)
app.include_router(reviews.router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/page/home")
def page_home():
    """Single aggregated endpoint — returns all data needed by the home page in one request."""
    db = SessionLocal()
    try:
        cfg_rows = db.query(models.SiteConfig).all()
        config_data = {r.key: r.value for r in cfg_rows}

        categories = (
            db.query(models.MenuCategory)
            .options(joinedload(models.MenuCategory.items))
            .filter(models.MenuCategory.is_active == True)
            .order_by(models.MenuCategory.display_order)
            .all()
        )
        cats_out = []
        for c in categories:
            items = [
                {
                    "id": i.id, "category_id": i.category_id, "name": i.name,
                    "description": i.description, "price": float(i.price),
                    "image_url": i.image_url, "is_available": i.is_available,
                    "display_order": i.display_order,
                }
                for i in sorted(c.items, key=lambda x: x.display_order)
                if i.is_available
            ]
            cats_out.append({
                "id": c.id, "name": c.name, "display_order": c.display_order,
                "is_active": c.is_active, "items": items,
            })

        gallery = (
            db.query(models.GalleryImage)
            .filter(models.GalleryImage.is_active == True)
            .order_by(models.GalleryImage.display_order)
            .all()
        )
        gallery_out = [
            {"id": g.id, "image_url": g.image_url, "caption": g.caption,
             "display_order": g.display_order, "is_active": g.is_active}
            for g in gallery
        ]

        hours = db.query(models.BusinessHour).order_by(models.BusinessHour.day_of_week).all()
        hours_out = [
            {"id": h.id, "day_of_week": h.day_of_week, "open_time": h.open_time,
             "close_time": h.close_time, "is_closed": h.is_closed}
            for h in hours
        ]

        reviews = (
            db.query(models.Review)
            .order_by(models.Review.created_at.desc())
            .limit(20)
            .all()
        )
        reviews_out = [
            {"id": r.id, "name": r.name, "rating": r.rating, "comment": r.comment,
             "created_at": r.created_at.isoformat()}
            for r in reviews
        ]

        return {
            "config": config_data,
            "categories": cats_out,
            "gallery": gallery_out,
            "hours": hours_out,
            "reviews": reviews_out,
        }
    finally:
        db.close()
