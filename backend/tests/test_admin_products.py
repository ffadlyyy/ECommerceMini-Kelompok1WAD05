from app.models import Category, Product

def test_admin_create_product(client_and_db, admin_headers):
    client, db = client_and_db
    cat = Category(name="Tekstil", slug="tekstil")
    db.add(cat)
    db.commit()

    payload = {
        "name": "Bantal Linen",
        "description": "Bantal sofa linen",
        "price": 350000,
        "stock": 20,
        "category_id": cat.id,
        "image_url": None,
        "is_new": True,
    }
    res = client.post("/admin/products", json=payload, headers=admin_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Bantal Linen"
    assert data["category"]["slug"] == "tekstil"
    assert data["price"] == 350000

def test_admin_create_product_invalid_category(client_and_db, admin_headers):
    client, _ = client_and_db
    payload = {
        "name": "Barang Baru",
        "price": 10000,
        "stock": 5,
        "category_id": 9999,
    }
    res = client.post("/admin/products", json=payload, headers=admin_headers)
    assert res.status_code == 400
    assert "Kategori tidak valid" in res.json()["detail"]

def test_admin_create_product_negative_price(client_and_db, admin_headers):
    client, db = client_and_db
    cat = Category(name="Tekstil", slug="tekstil")
    db.add(cat)
    db.commit()

    payload = {
        "name": "Barang Minus",
        "price": -100,
        "stock": 5,
        "category_id": cat.id,
    }
    res = client.post("/admin/products", json=payload, headers=admin_headers)
    assert res.status_code == 422

def test_admin_update_product(client_and_db, admin_headers):
    client, db = client_and_db
    cat = Category(name="Tekstil", slug="tekstil")
    db.add(cat)
    db.commit()
    prod = Product(name="Bantal", price=300000, stock=5, category_id=cat.id)
    db.add(prod)
    db.commit()

    res = client.put(f"/admin/products/{prod.id}", json={"price": 320000, "stock": 15}, headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["price"] == 320000
    assert res.json()["stock"] == 15
    assert res.json()["name"] == "Bantal"

def test_admin_update_product_not_found(client_and_db, admin_headers):
    client, _ = client_and_db
    res = client.put("/admin/products/9999", json={"price": 10000}, headers=admin_headers)
    assert res.status_code == 404

def test_admin_delete_product(client_and_db, admin_headers):
    client, db = client_and_db
    cat = Category(name="Tekstil", slug="tekstil")
    db.add(cat)
    db.commit()
    prod = Product(name="Bantal", price=300000, stock=5, category_id=cat.id)
    db.add(prod)
    db.commit()

    res = client.delete(f"/admin/products/{prod.id}", headers=admin_headers)
    assert res.status_code == 200
    assert res.json() == {"message": "Produk berhasil dihapus."}

    res_get = client.get(f"/products/{prod.id}")
    assert res_get.status_code == 404

def test_admin_delete_product_not_found(client_and_db, admin_headers):
    client, _ = client_and_db
    res = client.delete("/admin/products/9999", headers=admin_headers)
    assert res.status_code == 404
