from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .database import engine, Base
from .routers import auth, config, hours, menu, gallery, reservations

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Restaurant CMS API", version="1.0.0")


def configured_cors_origins() -> list[str]:
    configured = os.getenv("CORS_ALLOW_ORIGINS")
    if configured is None:
        return ["http://localhost:4200", "http://127.0.0.1:4200"]
    return [origin.strip() for origin in configured.split(",") if origin.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=configured_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router)
app.include_router(config.router)
app.include_router(hours.router)
app.include_router(menu.router)
app.include_router(gallery.router)
app.include_router(reservations.router)


@app.get("/health")
def health():
    return {"status": "ok"}
