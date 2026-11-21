from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import os
from pathlib import Path
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user
from ..utils.upload import save_upload, safe_upload_path

router = APIRouter(prefix="/gallery", tags=["gallery"])

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "static" / "uploads" / "gallery"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.get("", response_model=List[schemas.GalleryImageOut])
def get_gallery(db: Session = Depends(get_db)):
    return (
        db.query(models.GalleryImage)
        .filter(models.GalleryImage.is_active == True)
        .order_by(models.GalleryImage.display_order)
        .all()
    )


@router.get("/all", response_model=List[schemas.GalleryImageOut])
def get_gallery_admin(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.GalleryImage).order_by(models.GalleryImage.display_order).all()


@router.post("", response_model=schemas.GalleryImageOut)
async def upload_image(
    caption: str = Form("", max_length=300),
    display_order: int = Form(0, ge=0, le=10000),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    filename = await save_upload(file, str(UPLOAD_DIR))
    image = models.GalleryImage(
        image_url=f"/static/uploads/gallery/{filename}",
        caption=caption or None,
        display_order=display_order,
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.put("/{image_id}", response_model=schemas.GalleryImageOut)
def update_image(image_id: int, body: schemas.GalleryImageUpdate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    img = db.query(models.GalleryImage).filter(models.GalleryImage.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    for field, val in body.model_dump(exclude_unset=True).items():
        setattr(img, field, val)
    db.commit()
    db.refresh(img)
    return img


@router.delete("/{image_id}")
def delete_image(image_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    img = db.query(models.GalleryImage).filter(models.GalleryImage.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    local_path = img.image_url.lstrip("/")
    if local_path.startswith("static/uploads/gallery/"):
        filename = local_path.rsplit("/", 1)[-1]
        resolved = safe_upload_path(str(UPLOAD_DIR), filename)
        if os.path.isfile(resolved):
            os.remove(resolved)
    db.delete(img)
    db.commit()
    return {"detail": "Deleted"}
