from typing import List, Optional
from pydantic import BaseModel, Field


class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1, le=99)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1, le=99)


class CartItemOut(BaseModel):
    id: int
    product_id: int
    name: str
    price: int
    image_url: Optional[str] = None
    stock: int
    quantity: int
    line_total: int


class CartOut(BaseModel):
    items: List[CartItemOut]
    total_items: int
    subtotal: int