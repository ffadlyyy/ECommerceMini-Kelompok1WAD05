from datetime import datetime, timezone
import pytest
from pydantic import ValidationError
from app.schemas.category import CategoryOut
from app.schemas.product import ProductOut, ProductCreate, ProductUpdate, ProductListOut
from app.schemas.review import ReviewOut
from app.schemas.sales import SalesSummaryOut, DailySales, CategorySales

def test_product_out_schema_matches_contract():
    cat = CategoryOut(id=1, name="Pencahayaan", slug="pencahayaan")
    prod = ProductOut(
        id=1,
        name="Lampu Meja",
        description="Deskripsi",
        price=500000,
        stock=10,
        image_url=None,
        is_new=True,
        created_at=datetime.now(timezone.utc),
        category=cat,
        rating_avg=4.5,
        rating_count=2
    )
    assert prod.price == 500000
    assert prod.category.slug == "pencahayaan"
    assert prod.rating_avg == 4.5
    assert prod.rating_count == 2

def test_product_create_rejects_negative_price():
    with pytest.raises(ValidationError):
        ProductCreate(name="Bad Product", price=-1000, stock=5, category_id=1)

def test_product_create_rejects_negative_stock():
    with pytest.raises(ValidationError):
        ProductCreate(name="Bad Product", price=10000, stock=-5, category_id=1)

def test_sales_summary_schema():
    summary = SalesSummaryOut(
        total_revenue=15420000,
        total_orders=28,
        daily_sales=[DailySales(date="2026-10-06", revenue=1200000, orders=3)],
        category_sales=[CategorySales(category_id=1, category_name="Ruang tamu", revenue=5200000, quantity_sold=4)]
    )
    assert summary.total_revenue == 15420000
    assert summary.total_orders == 28
    assert len(summary.daily_sales) == 1
    assert len(summary.category_sales) == 1
