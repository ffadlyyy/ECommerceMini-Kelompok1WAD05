from datetime import datetime, timedelta, timezone
from app.models import Category, Product, Order, OrderItem, User


def _order(db, status="pending", payment_status="unpaid", qty=2, stock=10, days_ago=0, email="pembeli@test.com"):
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(full_name="Pembeli", email=email, hashed_password="x", role="customer")
        db.add(user)
    cat = db.query(Category).first()
    if cat is None:
        cat = Category(name="Tekstil", slug="tekstil")
        db.add(cat)
    db.commit()
    p = Product(name="Bantal", price=100000, stock=stock, category_id=cat.id)
    db.add(p)
    db.commit()
    order = Order(
        user_id=user.id,
        total_amount=100000 * qty,
        status=status,
        payment_status=payment_status,
        shipping_name="Budi",
        shipping_city="Bogor",
        created_at=datetime.now(timezone.utc) - timedelta(days=days_ago),
    )
    db.add(order)
    db.commit()
    db.add(OrderItem(order_id=order.id, product_id=p.id, quantity=qty, price=100000))
    db.commit()
    return order, p


def test_admin_orders_requires_admin(client_and_db, customer_headers):
    client, _ = client_and_db
    assert client.get("/admin/orders").status_code == 401
    assert client.get("/admin/orders", headers=customer_headers).status_code == 403
    assert client.patch("/admin/orders/1/status", json={"status": "shipped"}, headers=customer_headers).status_code == 403


def test_admin_list_orders_includes_customer_and_newest_first(client_and_db, admin_headers):
    client, db = client_and_db
    old, _ = _order(db, days_ago=3)
    new, _ = _order(db, status="paid", payment_status="paid")
    res = client.get("/admin/orders", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert [o["id"] for o in data] == [new.id, old.id]
    assert data[0]["customer_name"] == "Pembeli"
    assert data[0]["customer_email"] == "pembeli@test.com"
    assert data[0]["items"][0]["line_total"] == 200000


def test_admin_list_orders_filter_by_status(client_and_db, admin_headers):
    client, db = client_and_db
    _order(db)
    paid, _ = _order(db, status="paid", payment_status="paid")
    res = client.get("/admin/orders", params={"status": "paid"}, headers=admin_headers)
    assert [o["id"] for o in res.json()] == [paid.id]


def test_admin_list_orders_invalid_status_filter(client_and_db, admin_headers):
    client, _ = client_and_db
    assert client.get("/admin/orders", params={"status": "hilang"}, headers=admin_headers).status_code == 422


def test_admin_ship_then_complete(client_and_db, admin_headers):
    client, db = client_and_db
    order, _ = _order(db, status="paid", payment_status="paid")
    res = client.patch(f"/admin/orders/{order.id}/status", json={"status": "shipped"}, headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "shipped"
    res = client.patch(f"/admin/orders/{order.id}/status", json={"status": "completed"}, headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "completed"


def test_admin_mark_pending_as_paid_sets_payment_status(client_and_db, admin_headers):
    client, db = client_and_db
    order, _ = _order(db)
    res = client.patch(f"/admin/orders/{order.id}/status", json={"status": "paid"}, headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "paid"
    assert res.json()["payment_status"] == "paid"


def test_admin_cannot_skip_status(client_and_db, admin_headers):
    client, db = client_and_db
    order, _ = _order(db)
    res = client.patch(f"/admin/orders/{order.id}/status", json={"status": "completed"}, headers=admin_headers)
    assert res.status_code == 409
    db.refresh(order)
    assert order.status == "pending"


def test_admin_cannot_change_final_status(client_and_db, admin_headers):
    client, db = client_and_db
    order, _ = _order(db, status="completed", payment_status="paid")
    res = client.patch(f"/admin/orders/{order.id}/status", json={"status": "cancelled"}, headers=admin_headers)
    assert res.status_code == 409


def test_admin_cancel_restores_stock_and_refunds(client_and_db, admin_headers):
    client, db = client_and_db
    order, p = _order(db, status="paid", payment_status="paid", qty=2, stock=8)
    res = client.patch(f"/admin/orders/{order.id}/status", json={"status": "cancelled"}, headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "cancelled"
    assert res.json()["payment_status"] == "refunded"
    db.refresh(p)
    assert p.stock == 10


def test_admin_cancel_unpaid_keeps_payment_status(client_and_db, admin_headers):
    client, db = client_and_db
    order, _ = _order(db)
    res = client.patch(f"/admin/orders/{order.id}/status", json={"status": "cancelled"}, headers=admin_headers)
    assert res.json()["payment_status"] == "unpaid"


def test_admin_update_status_unknown_value(client_and_db, admin_headers):
    client, db = client_and_db
    order, _ = _order(db)
    res = client.patch(f"/admin/orders/{order.id}/status", json={"status": "hilang"}, headers=admin_headers)
    assert res.status_code == 422


def test_admin_update_status_not_found(client_and_db, admin_headers):
    client, _ = client_and_db
    res = client.patch("/admin/orders/999/status", json={"status": "shipped"}, headers=admin_headers)
    assert res.status_code == 404


def test_customer_sees_status_changed_by_admin(client_and_db, admin_headers, customer_headers):
    client, db = client_and_db
    order, _ = _order(db, status="paid", payment_status="paid", email="customer@test.com")
    client.patch(f"/admin/orders/{order.id}/status", json={"status": "shipped"}, headers=admin_headers)
    res = client.get("/orders", headers=customer_headers)
    assert res.json()[0]["status"] == "shipped"


def test_sales_summary_counts_shipped_but_not_cancelled(client_and_db, admin_headers):
    client, db = client_and_db
    _order(db, status="shipped", payment_status="paid", qty=1)
    _order(db, status="cancelled", payment_status="refunded", qty=5)
    data = client.get("/admin/sales-summary", headers=admin_headers).json()
    assert data["total_orders"] == 1
    assert data["total_revenue"] == 100000


def test_admin_delete_product_with_orders_is_rejected(client_and_db, admin_headers):
    client, db = client_and_db
    _, p = _order(db)
    res = client.delete(f"/admin/products/{p.id}", headers=admin_headers)
    assert res.status_code == 409
    assert db.query(Product).filter(Product.id == p.id).first() is not None
