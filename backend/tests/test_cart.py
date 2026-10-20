from app.models import Category, Product


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


def test_cart_requires_login(client_and_db):
    client, _ = client_and_db
    assert client.get("/cart").status_code == 401


def test_empty_cart(client_and_db, customer_headers):
    client, _ = client_and_db
    res = client.get("/cart", headers=customer_headers)
    assert res.status_code == 200
    assert res.json() == {"items": [], "total_items": 0, "subtotal": 0}


def test_add_item(client_and_db, customer_headers):
    client, db = client_and_db
    p = _product(db, price=100000)
    res = client.post("/cart/items", json={"product_id": p.id, "quantity": 2}, headers=customer_headers)
    assert res.status_code == 201
    data = res.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["line_total"] == 200000
    assert data["subtotal"] == 200000
    assert data["total_items"] == 2


def test_add_same_product_increments(client_and_db, customer_headers):
    client, db = client_and_db
    p = _product(db)
    client.post("/cart/items", json={"product_id": p.id, "quantity": 1}, headers=customer_headers)
    res = client.post("/cart/items", json={"product_id": p.id, "quantity": 2}, headers=customer_headers)
    assert len(res.json()["items"]) == 1
    assert res.json()["items"][0]["quantity"] == 3


def test_add_exceeds_stock(client_and_db, customer_headers):
    client, db = client_and_db
    p = _product(db, stock=3)
    client.post("/cart/items", json={"product_id": p.id, "quantity": 2}, headers=customer_headers)
    res = client.post("/cart/items", json={"product_id": p.id, "quantity": 2}, headers=customer_headers)
    assert res.status_code == 400


def test_add_unknown_product(client_and_db, customer_headers):
    client, _ = client_and_db
    res = client.post("/cart/items", json={"product_id": 9999, "quantity": 1}, headers=customer_headers)
    assert res.status_code == 404


def test_add_invalid_quantity(client_and_db, customer_headers):
    client, db = client_and_db
    p = _product(db)
    res = client.post("/cart/items", json={"product_id": p.id, "quantity": 0}, headers=customer_headers)
    assert res.status_code == 422


def test_update_quantity(client_and_db, customer_headers):
    client, db = client_and_db
    p = _product(db)
    added = client.post("/cart/items", json={"product_id": p.id, "quantity": 1}, headers=customer_headers)
    item_id = added.json()["items"][0]["id"]
    res = client.patch(f"/cart/items/{item_id}", json={"quantity": 5}, headers=customer_headers)
    assert res.status_code == 200
    assert res.json()["items"][0]["quantity"] == 5


def test_update_over_stock(client_and_db, customer_headers):
    client, db = client_and_db
    p = _product(db, stock=2)
    added = client.post("/cart/items", json={"product_id": p.id, "quantity": 1}, headers=customer_headers)
    item_id = added.json()["items"][0]["id"]
    res = client.patch(f"/cart/items/{item_id}", json={"quantity": 5}, headers=customer_headers)
    assert res.status_code == 400


def test_remove_item(client_and_db, customer_headers):
    client, db = client_and_db
    p = _product(db)
    added = client.post("/cart/items", json={"product_id": p.id, "quantity": 1}, headers=customer_headers)
    item_id = added.json()["items"][0]["id"]
    res = client.delete(f"/cart/items/{item_id}", headers=customer_headers)
    assert res.status_code == 200
    assert res.json()["items"] == []


def test_cannot_touch_other_users_item(client_and_db, customer_headers):
    client, db = client_and_db
    p = _product(db)
    added = client.post("/cart/items", json={"product_id": p.id, "quantity": 1}, headers=customer_headers)
    item_id = added.json()["items"][0]["id"]

    other = {"full_name": "Orang Lain", "email": "lain@example.com", "password": "rahasia123"}
    client.post("/auth/register", json=other)
    token = client.post("/auth/login", json={"email": other["email"], "password": other["password"]}).json()["access_token"]
    other_headers = {"Authorization": f"Bearer {token}"}

    assert client.patch(f"/cart/items/{item_id}", json={"quantity": 2}, headers=other_headers).status_code == 404
    assert client.delete(f"/cart/items/{item_id}", headers=other_headers).status_code == 404