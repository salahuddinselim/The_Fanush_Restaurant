from enum import Enum
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ConfigItem(BaseModel):
    key: str
    value: Optional[str] = None


class ConfigBulkUpdate(BaseModel):
    items: List[ConfigItem]


class BusinessHourBase(BaseModel):
    day_of_week: int
    open_time: Optional[str] = None
    close_time: Optional[str] = None
    is_closed: bool = False


class BusinessHourOut(BusinessHourBase):
    id: int
    model_config = {"from_attributes": True}


class BusinessHourUpdate(BaseModel):
    open_time: Optional[str] = None
    close_time: Optional[str] = None
    is_closed: Optional[bool] = None


class MenuCategoryCreate(BaseModel):
    name: str
    display_order: int = 0
    is_active: bool = True


class MenuCategoryUpdate(BaseModel):
    name: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    is_available: bool = True
    display_order: int = 0


class MenuItemCreate(MenuItemBase):
    category_id: int


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_available: Optional[bool] = None
    display_order: Optional[int] = None
    category_id: Optional[int] = None


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
    caption: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class ReservationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=30)
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    time: str = Field(pattern=r"^\d{2}:\d{2}$")
    party_size: int = Field(ge=1, le=50)
    notes: Optional[str] = Field(None, max_length=1000)


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
