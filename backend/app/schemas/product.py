from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.category import CategoryOut

class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    price: int = Field(ge=0)
    stock: int = Field(ge=0, default=0)
    image_url: Optional[str] = None
    is_new: bool = True

class ProductCreate(ProductBase):
    category_id: int

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    price: Optional[int] = Field(None, ge=0)
    stock: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None
    is_new: Optional[bool] = None
    category_id: Optional[int] = None

class ProductOut(ProductBase):
    id: int
    created_at: datetime
    category: CategoryOut
    rating_avg: float = 0.0
    rating_count: int = 0
    model_config = ConfigDict(from_attributes=True)

class ProductListOut(BaseModel):
    items: List[ProductOut]
    total: int
    page: int
    page_size: int
