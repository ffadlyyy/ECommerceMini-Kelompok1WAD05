from datetime import datetime, timezone
from app.models import Category, Product, Order, OrderItem

def test_sales_summary_empty(client_and_db, admin_headers):
    client, _ = client_and_db
    res = client.get("/admin/sales-summary", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_revenue"] == 0
    assert data["total_orders"] == 0
    assert data["daily_sales"] == []
    assert data["category_sales"] == []

def test_sales_summary_with_paid_orders(client_and_db, admin_headers):
    client, db = client_and_db
    cat = Category(name="Dekorasi", slug="dekorasi")
    db.add(cat)
    db.commit()

    prod = Product(name="Vas Bunga", price=100000, stock=50, category_id=cat.id)
    db.add(prod)
    db.commit()

    order = Order(total_amount=200000, status="paid", created_at=datetime.now(timezone.utc))
    db.add(order)
    db.commit()

    item = OrderItem(order_id=order.id, product_id=prod.id, quantity=2, price=100000)
    db.add(item)
    db.commit()

    res = client.get("/admin/sales-summary", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_revenue"] == 200000
    assert data["total_orders"] == 1
    assert len(data["category_sales"]) == 1
    assert data["category_sales"][0]["category_name"] == "Dekorasi"
    assert data["category_sales"][0]["quantity_sold"] == 2
