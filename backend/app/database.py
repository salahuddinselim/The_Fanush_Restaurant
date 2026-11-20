import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Resolve restaurant.db relative to backend directory so CWD doesn't create empty databases
_backend_dir = Path(__file__).resolve().parent.parent
_default_db = _backend_dir / "restaurant.db"
_db_env = os.environ.get("DB_PATH")
_db_path = Path(_db_env).resolve() if _db_env else _default_db
_db_path.parent.mkdir(parents=True, exist_ok=True)
SQLALCHEMY_DATABASE_URL = f"sqlite:///{_db_path.as_posix()}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
