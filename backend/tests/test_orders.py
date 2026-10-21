from app.models import Category, Product

ADDRESS = {
    "shipping_name": "Budi Santoso",
    "shipping_phone": "081234567890",
    "shipping_address": "Jl. Mawar No. 1",
    "shipping_city": "Bogor",
    "shipping_postal_code": "16111",
}


def _product(db, stock=10, price=100000, name="Bantal"):
    cat = db.query(Category).first()
    if cat is None:
        cat = Category(name="Tekstil", slug="tekstil")
        db.add(cat)
        db.commit()
    p = Product(name=name, price=price, stock=stock, category_id=cat.id)
    db.add(p)
    db.commit()
    return p


def _fill_cart(client, db, headers, qty=2, **kw):
    p = _product(db, **kw)
    client.post("/cart/items", json={"product_id": p.id, "quantity": qty}, headers=headers)
    return p


def _other_headers(client):
    other = {"full_name": "Orang Lain", "email": "lain@example.com", "password": "rahasia123"}
    client.post("/auth/register", json=other)
    token = client.post("/auth/login", json={"email": other["email"], "password": other["password"]}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_checkout_requires_login(client_and_db):
    client, _ = client_and_db
    assert client.post("/orders/checkout", json=ADDRESS).status_code == 401


def test_checkout_empty_cart(client_and_db, customer_headers):
    client, _ = client_and_db
    res = client.post("/orders/checkout", json=ADDRESS, headers=customer_headers)
    assert res.status_code == 400


def test_checkout_success(client_and_db, customer_headers):
    client, db = client_and_db
    p = _fill_cart(client, db, customer_headers, qty=2, price=100000, stock=10)
    res = client.post("/orders/checkout", json=ADDRESS, headers=customer_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["total_amount"] == 200000
    assert data["status"] == "pending"
    assert data["payment_status"] == "unpaid"
    assert data["shipping_city"] == "Bogor"
    assert len(data["items"]) == 1
    assert data["items"][0]["price"] == 100000
    assert data["items"][0]["line_total"] == 200000
    assert client.get("/cart", headers=customer_headers).json()["items"] == []
    db.refresh(p)
    assert p.stock == 8


def test_checkout_ignores_client_total_and_status(client_and_db, customer_headers):
    client, db = client_and_db
    _fill_cart(client, db, customer_headers, qty=2, price=100000)
    res = client.post(
        "/orders/checkout",
        json={**ADDRESS, "total_amount": 1, "status": "paid", "payment_status": "paid"},
        headers=customer_headers,
    )
    assert res.status_code == 201
    assert res.json()["total_amount"] == 200000
    assert res.json()["status"] == "pending"
    assert res.json()["payment_status"] == "unpaid"


def test_checkout_stock_changed_since_added(client_and_db, customer_headers):
    client, db = client_and_db
    p = _fill_cart(client, db, customer_headers, qty=3, stock=5)
    p.stock = 1
    db.commit()
    res = client.post("/orders/checkout", json=ADDRESS, headers=customer_headers)
    assert res.status_code == 400
    assert len(client.get("/cart", headers=customer_headers).json()["items"]) == 1
    db.refresh(p)
    assert p.stock == 1


def test_checkout_invalid_postal_code(client_and_db, customer_headers):
    client, db = client_and_db
    _fill_cart(client, db, customer_headers)
    res = client.post("/orders/checkout", json={**ADDRESS, "shipping_postal_code": "abc"}, headers=customer_headers)
    assert res.status_code == 422


def test_checkout_missing_address(client_and_db, customer_headers):
    client, db = client_and_db
    _fill_cart(client, db, customer_headers)
    bad = {k: v for k, v in ADDRESS.items() if k != "shipping_address"}
    res = client.post("/orders/checkout", json=bad, headers=customer_headers)
    assert res.status_code == 422


def test_order_history_only_shows_own_orders(client_and_db, customer_headers):
    client, db = client_and_db
    _fill_cart(client, db, customer_headers)
    client.post("/orders/checkout", json=ADDRESS, headers=customer_headers)
    mine = client.get("/orders", headers=customer_headers).json()
    assert len(mine) == 1
    other = client.get("/orders", headers=_other_headers(client)).json()
    assert other == []


def test_order_detail(client_and_db, customer_headers):
    client, db = client_and_db
    _fill_cart(client, db, customer_headers, qty=1, price=250000)
    order_id = client.post("/orders/checkout", json=ADDRESS, headers=customer_headers).json()["id"]
    res = client.get(f"/orders/{order_id}", headers=customer_headers)
    assert res.status_code == 200
    assert res.json()["total_amount"] == 250000
    assert res.json()["items"][0]["name"] == "Bantal"


def test_cannot_view_other_users_order(client_and_db, customer_headers):
    client, db = client_and_db
    _fill_cart(client, db, customer_headers)
    order_id = client.post("/orders/checkout", json=ADDRESS, headers=customer_headers).json()["id"]
    res = client.get(f"/orders/{order_id}", headers=_other_headers(client))
    assert res.status_code == 404


def test_order_detail_not_found(client_and_db, customer_headers):
    client, _ = client_and_db
    assert client.get("/orders/9999", headers=customer_headers).status_code == 404

def _place_order(client, db, headers, qty=2, price=100000):
    _fill_cart(client, db, headers, qty=qty, price=price)
    return client.post("/orders/checkout", json=ADDRESS, headers=headers).json()


def test_pay_requires_login(client_and_db):
    client, _ = client_and_db
    assert client.post("/orders/1/pay").status_code == 401


def test_pay_success(client_and_db, customer_headers):
    client, db = client_and_db
    order = _place_order(client, db, customer_headers)
    res = client.post(f"/orders/{order['id']}/pay", headers=customer_headers)
    assert res.status_code == 200
    assert res.json()["payment_status"] == "paid"
    assert res.json()["status"] == "paid"


def test_pay_failed_then_retry(client_and_db, customer_headers):
    client, db = client_and_db
    order = _place_order(client, db, customer_headers)
    url = f"/orders/{order['id']}/pay"
    res = client.post(url, json={"result": "failed"}, headers=customer_headers)
    assert res.json()["payment_status"] == "failed"
    assert res.json()["status"] == "pending"
    res = client.post(url, headers=customer_headers)
    assert res.json()["payment_status"] == "paid"


def test_pay_twice_rejected(client_and_db, customer_headers):
    client, db = client_and_db
    order = _place_order(client, db, customer_headers)
    url = f"/orders/{order['id']}/pay"
    assert client.post(url, headers=customer_headers).status_code == 200
    assert client.post(url, headers=customer_headers).status_code == 409


def test_pay_invalid_result(client_and_db, customer_headers):
    client, db = client_and_db
    order = _place_order(client, db, customer_headers)
    res = client.post(f"/orders/{order['id']}/pay", json={"result": "gratis"}, headers=customer_headers)
    assert res.status_code == 422


def test_cannot_pay_other_users_order(client_and_db, customer_headers):
    client, db = client_and_db
    order = _place_order(client, db, customer_headers)
    res = client.post(f"/orders/{order['id']}/pay", headers=_other_headers(client))
    assert res.status_code == 404
    still = client.get(f"/orders/{order['id']}", headers=customer_headers).json()
    assert still["payment_status"] == "unpaid"


def test_pay_unknown_order(client_and_db, customer_headers):
    client, _ = client_and_db
    assert client.post("/orders/9999/pay", headers=customer_headers).status_code == 404


def test_paid_order_appears_in_sales_summary(client_and_db, customer_headers, admin_headers):
    client, db = client_and_db
    order = _place_order(client, db, customer_headers, qty=2, price=100000)
    before = client.get("/admin/sales-summary", headers=admin_headers).json()
    assert before["total_orders"] == 0
    client.post(f"/orders/{order['id']}/pay", headers=customer_headers)
    after = client.get("/admin/sales-summary", headers=admin_headers).json()
    assert after["total_orders"] == 1
    assert after["total_revenue"] == 200000