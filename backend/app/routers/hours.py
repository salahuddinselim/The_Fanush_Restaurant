from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/hours", tags=["hours"])


@router.get("", response_model=List[schemas.BusinessHourOut])
def get_hours(db: Session = Depends(get_db)):
    return db.query(models.BusinessHour).order_by(models.BusinessHour.day_of_week).all()


@router.put("/{hour_id}", response_model=schemas.BusinessHourOut)
def update_hour(
    hour_id: int,
    body: schemas.BusinessHourUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    hour = db.query(models.BusinessHour).filter(models.BusinessHour.id == hour_id).first()
    if not hour:
        raise HTTPException(status_code=404, detail="Hour not found")
    for field, val in body.model_dump(exclude_unset=True).items():
        setattr(hour, field, val)
    db.commit()
    db.refresh(hour)
    return hour
