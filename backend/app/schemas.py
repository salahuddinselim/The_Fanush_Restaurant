from enum import Enum
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime, date as date_type


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=150)
    password: str = Field(min_length=12, max_length=72)

    @field_validator("password")
    @classmethod
    def password_bytes_bounded(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must not exceed 72 bytes")
        return value


class LoginResult(BaseModel):
    detail: str = "Logged in"


class ConfigItem(BaseModel):
    key: str = Field(max_length=100)
    value: Optional[str] = None


class ConfigBulkUpdate(BaseModel):
    items: List[ConfigItem]


class BusinessHourBase(BaseModel):
    day_of_week: int = Field(ge=0, le=6)
    open_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    close_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    is_closed: bool = False


class BusinessHourOut(BusinessHourBase):
    id: int
    model_config = {"from_attributes": True}


class BusinessHourUpdate(BaseModel):
    open_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    close_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    is_closed: Optional[bool] = None


class MenuCategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    display_order: int = Field(default=0, ge=0, le=10000)
    is_active: bool = True


class MenuCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    display_order: Optional[int] = Field(None, ge=0, le=10000)
    is_active: Optional[bool] = None


class MenuItemBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    price: float = Field(ge=0, le=100000, allow_inf_nan=False)
    is_available: bool = True
    display_order: int = Field(default=0, ge=0, le=10000)


class MenuItemCreate(MenuItemBase):
    category_id: int


class MenuItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    price: Optional[float] = Field(None, ge=0, le=100000, allow_inf_nan=False)
    is_available: Optional[bool] = None
    display_order: Optional[int] = Field(None, ge=0, le=10000)
    category_id: Optional[int] = Field(None, ge=1)


class MenuItemOut(MenuItemBase):
    id: int
    category_id: int
    image_url: Optional[str] = None
    model_config = {"from_attributes": True}


class MenuCategoryOut(BaseModel):
    id: int
    name: str
    display_order: int
    is_active: bool
    items: List[MenuItemOut] = []
    model_config = {"from_attributes": True}


class GalleryImageOut(BaseModel):
    id: int
    image_url: str
    caption: Optional[str] = None
    display_order: int
    is_active: bool
    model_config = {"from_attributes": True}


class GalleryImageUpdate(BaseModel):
    caption: Optional[str] = Field(None, max_length=300)
    display_order: Optional[int] = Field(None, ge=0, le=10000)
    is_active: Optional[bool] = None


class ReservationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=30)
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    time: str = Field(pattern=r"^\d{2}:\d{2}$")
    party_size: int = Field(ge=1, le=20)
    notes: Optional[str] = Field(None, max_length=1000)

    @field_validator("date")
    @classmethod
    def date_must_be_future(cls, v: str) -> str:
        parsed = date_type.fromisoformat(v)
        if parsed < date_type.today():
            raise ValueError("Reservation date must be today or in the future")
        return v


class ReservationOut(ReservationCreate):
    id: int
    status: str
    created_at: datetime
    model_config = {"from_attributes": True}


class ReservationStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class ReservationStatusUpdate(BaseModel):
    status: ReservationStatus


class ReviewCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)


class ReviewOut(ReviewCreate):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}
