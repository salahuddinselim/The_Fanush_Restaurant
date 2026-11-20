from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..limiter import limiter

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/", response_model=List[schemas.ReviewOut])
def get_reviews(db: Session = Depends(get_db)):
    return db.query(models.Review).order_by(models.Review.created_at.desc()).all()


@router.post("/", response_model=schemas.ReviewOut, status_code=201)
@limiter.limit("5/minute")
def create_review(request: Request, review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    db_review = models.Review(**review.model_dump())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


@router.delete("/{review_id}", status_code=204)
def delete_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
