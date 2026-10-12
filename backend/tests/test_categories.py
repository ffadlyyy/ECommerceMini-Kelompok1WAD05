from app.models.category import Category

def test_get_categories_empty(client_and_db):
    client, _ = client_and_db
    res = client.get("/categories")
    assert res.status_code == 200
    assert res.json() == []

def test_get_categories_list(client_and_db):
    client, db = client_and_db
    db.add(Category(name="Ruang tamu", slug="ruang-tamu"))
    db.add(Category(name="Pencahayaan", slug="pencahayaan"))
    db.commit()

    res = client.get("/categories")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    assert data[0]["slug"] == "ruang-tamu"
    assert data[1]["slug"] == "pencahayaan"
