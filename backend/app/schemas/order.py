from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class CheckoutRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    shipping_name: str = Field(min_length=1, max_length=100)
    shipping_phone: str = Field(min_length=6, max_length=30)
    shipping_address: str = Field(min_length=5, max_length=500)
    shipping_city: str = Field(min_length=1, max_length=100)
    shipping_postal_code: str = Field(pattern=r"^\d{5}$")


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    name: str
    quantity: int
    price: int
    line_total: int


class OrderOut(BaseModel):
    id: int
    status: str
    payment_status: str
    total_amount: int
    created_at: datetime
    shipping_name: Optional[str] = None
    shipping_phone: Optional[str] = None
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_postal_code: Optional[str] = None
    items: List[OrderItemOut]

class PayRequest(BaseModel):
    result: Literal["success", "failed"] = "success"


OrderStatus = Literal["pending", "paid", "shipped", "completed", "cancelled"]


class AdminOrderOut(OrderOut):
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus