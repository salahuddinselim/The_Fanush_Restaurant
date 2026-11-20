from fastapi import FastAPI, Request
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


_cors_env = os.getenv("CORS_ALLOW_ORIGINS")
_cors_origins = (
    [o.strip() for o in _cors_env.split(",") if o.strip()]
    if _cors_env
    else [
        "http://localhost:4200", "http://127.0.0.1:4200",
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|.*\.local)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next) -> Response:
    response: Response = await call_next(request)
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "img-src 'self' https://images.unsplash.com https://api.iconify.design data: blob:; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "connect-src 'self' https://api.iconify.design; "
        "frame-src https://www.openstreetmap.org;"
    )
    # cache public GET responses for 30 seconds
    if request.method == "GET" and response.status_code == 200:
        response.headers.setdefault("Cache-Control", "public, max-age=30, stale-while-revalidate=60")
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
