from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/reservations", tags=["reservations"])


@router.post("", response_model=schemas.ReservationOut, status_code=201)
def create_reservation(body: schemas.ReservationCreate, db: Session = Depends(get_db)):
    reservation = models.Reservation(**body.model_dump())
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


@router.get("", response_model=List[schemas.ReservationOut])
def list_reservations(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Reservation)
        .order_by(models.Reservation.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.put("/{reservation_id}", response_model=schemas.ReservationOut)
def update_reservation_status(
    reservation_id: int,
    body: schemas.ReservationStatusUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    r = db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")
    r.status = body.status
    db.commit()
    db.refresh(r)
    return r


@router.delete("/{reservation_id}")
def delete_reservation(reservation_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    r = db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")
    db.delete(r)
    db.commit()
    return {"detail": "Deleted"}
