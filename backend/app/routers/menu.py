from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import shutil, os, uuid
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/menu", tags=["menu"])

UPLOAD_DIR = "static/uploads/menu"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/categories", response_model=List[schemas.MenuCategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return (
        db.query(models.MenuCategory)
        .filter(models.MenuCategory.is_active == True)
        .order_by(models.MenuCategory.display_order)
        .all()
    )


@router.get("/categories/all", response_model=List[schemas.MenuCategoryOut])
def get_all_categories(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.MenuCategory).order_by(models.MenuCategory.display_order).all()


@router.post("/categories", response_model=schemas.MenuCategoryOut)
def create_category(body: schemas.MenuCategoryCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    cat = models.MenuCategory(**body.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/categories/{cat_id}", response_model=schemas.MenuCategoryOut)
def update_category(cat_id: int, body: schemas.MenuCategoryUpdate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    cat = db.query(models.MenuCategory).filter(models.MenuCategory.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for field, val in body.model_dump(exclude_unset=True).items():
        setattr(cat, field, val)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/categories/{cat_id}")
def delete_category(cat_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    cat = db.query(models.MenuCategory).filter(models.MenuCategory.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
    return {"detail": "Deleted"}


@router.get("/items", response_model=List[schemas.MenuItemOut])
def get_items(db: Session = Depends(get_db)):
    return db.query(models.MenuItem).order_by(models.MenuItem.display_order).all()


@router.post("/items", response_model=schemas.MenuItemOut)
def create_item(body: schemas.MenuItemCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    item = models.MenuItem(**body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/items/{item_id}", response_model=schemas.MenuItemOut)
def update_item(item_id: int, body: schemas.MenuItemUpdate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, val in body.model_dump(exclude_unset=True).items():
        setattr(item, field, val)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"detail": "Deleted"}


@router.post("/items/{item_id}/image")
async def upload_item_image(item_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    item.image_url = f"/static/uploads/menu/{filename}"
    db.commit()
    return {"image_url": item.image_url}


@router.delete("/items/{item_id}/image")
def remove_item_image(item_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.image_url:
        local_path = item.image_url.lstrip("/")
        if os.path.exists(local_path):
            os.remove(local_path)
        item.image_url = None
        db.commit()
    return {"detail": "Image removed"}
