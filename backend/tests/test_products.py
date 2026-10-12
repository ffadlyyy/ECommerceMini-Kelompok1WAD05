from app.models import Category, Product, Review

def test_list_products_search_and_filter(client_and_db):
    client, db = client_and_db
    c1 = Category(name="Pencahayaan", slug="pencahayaan")
    c2 = Category(name="Ruang tamu", slug="ruang-tamu")
    db.add_all([c1, c2])
    db.commit()

    p1 = Product(name="Lampu Meja Linen", description="Kap linen", price=620000, stock=14, category_id=c1.id)
    p2 = Product(name="Kursi Rotan", description="Kayu jati", price=3850000, stock=5, category_id=c2.id)
    db.add_all([p1, p2])
    db.commit()

    # Search by q
    res_q = client.get("/products?q=lampu")
    assert res_q.status_code == 200
    assert res_q.json()["total"] == 1
    assert res_q.json()["items"][0]["name"] == "Lampu Meja Linen"

    # Filter by category slug
    res_cat = client.get("/products?category=ruang-tamu")
    assert res_cat.status_code == 200
    assert res_cat.json()["total"] == 1
    assert res_cat.json()["items"][0]["name"] == "Kursi Rotan"

    # Filter non-existent category
    res_none = client.get("/products?category=nonexistent")
    assert res_none.status_code == 200
    assert res_none.json()["total"] == 0
    assert res_none.json()["items"] == []

    # Sort price asc
    res_sort = client.get("/products?sort=price_asc")
    assert res_sort.status_code == 200
    assert res_sort.json()["items"][0]["price"] == 620000

    # Sort price desc
    res_sort_desc = client.get("/products?sort=price_desc")
    assert res_sort_desc.status_code == 200
    assert res_sort_desc.json()["items"][0]["price"] == 3850000

def test_get_product_detail_and_reviews(client_and_db):
    client, db = client_and_db
    c = Category(name="Pencahayaan", slug="pencahayaan")
    db.add(c)
    db.commit()

    p = Product(name="Lampu Meja", price=500000, stock=10, category_id=c.id)
    db.add(p)
    db.commit()

    r = Review(product_id=p.id, user_name="Dewi A.", rating=5, comment="Bagus banget")
    db.add(r)
    db.commit()

    # Success get product
    res = client.get(f"/products/{p.id}")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Lampu Meja"
    assert data["rating_avg"] == 5.0
    assert data["rating_count"] == 1

    # Product not found
    res_404 = client.get("/products/99999")
    assert res_404.status_code == 404
    assert res_404.json() == {"detail": "Produk tidak ditemukan."}

    # Product reviews
    res_rev = client.get(f"/products/{p.id}/reviews")
    assert res_rev.status_code == 200
    assert len(res_rev.json()) == 1
    assert res_rev.json()[0]["user_name"] == "Dewi A."
