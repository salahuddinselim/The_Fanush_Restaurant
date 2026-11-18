from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Optional
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/config", tags=["config"])

_PUBLIC_KEYS = {
    "restaurant_name", "tagline", "description", "address", "phone",
    "email", "hero_image_url", "logo_url", "location_label", "cta_text",
}


@router.get("", response_model=Dict[str, Optional[str]])
def get_config(db: Session = Depends(get_db)):
    items = db.query(models.SiteConfig).filter(
        models.SiteConfig.key.in_(_PUBLIC_KEYS)
    ).all()
    return {item.key: item.value for item in items}


@router.put("")
def update_config(
    body: schemas.ConfigBulkUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    for item in body.items:
        existing = db.query(models.SiteConfig).filter(models.SiteConfig.key == item.key).first()
        if existing:
            existing.value = item.value
        else:
            db.add(models.SiteConfig(key=item.key, value=item.value))
    db.commit()
    return {"detail": "Config updated"}
