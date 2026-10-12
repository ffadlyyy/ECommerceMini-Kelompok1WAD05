from typing import List
from pydantic import BaseModel

class DailySales(BaseModel):
    date: str
    revenue: int
    orders: int

class CategorySales(BaseModel):
    category_id: int
    category_name: str
    revenue: int
    quantity_sold: int

class SalesSummaryOut(BaseModel):
    total_revenue: int
    total_orders: int
    daily_sales: List[DailySales]
    category_sales: List[CategorySales]
