USER = {"full_name": "Budi", "email": "budi@example.com", "password": "rahasia123"}


def _register_and_login(client):
    client.post("/auth/register", json=USER)
    res = client.post("/auth/login", json={"email": USER["email"], "password": USER["password"]})
    return res.json()["access_token"]


def test_register_success(client_and_db):
    client, _ = client_and_db
    res = client.post("/auth/register", json=USER)
    assert res.status_code == 201
    body = res.json()
    assert body["email"] == USER["email"]
    assert body["role"] == "customer"
    assert "hashed_password" not in body
    assert "password" not in body


def test_register_ignores_role_field(client_and_db):
    client, _ = client_and_db
    res = client.post("/auth/register", json={**USER, "role": "admin"})
    assert res.status_code == 201
    assert res.json()["role"] == "customer"


def test_register_duplicate_email(client_and_db):
    client, _ = client_and_db
    client.post("/auth/register", json=USER)
    res = client.post("/auth/register", json=USER)
    assert res.status_code == 409


def test_register_short_password(client_and_db):
    client, _ = client_and_db
    res = client.post("/auth/register", json={**USER, "password": "123"})
    assert res.status_code == 422


def test_login_success(client_and_db):
    client, _ = client_and_db
    client.post("/auth/register", json=USER)
    res = client.post("/auth/login", json={"email": USER["email"], "password": USER["password"]})
    assert res.status_code == 200
    assert res.json()["token_type"] == "bearer"
    assert res.json()["access_token"]


def test_login_wrong_password(client_and_db):
    client, _ = client_and_db
    client.post("/auth/register", json=USER)
    res = client.post("/auth/login", json={"email": USER["email"], "password": "salahbanget"})
    assert res.status_code == 401


def test_login_unknown_email(client_and_db):
    client, _ = client_and_db
    res = client.post("/auth/login", json={"email": "gaada@example.com", "password": "rahasia123"})
    assert res.status_code == 401


def test_me_requires_token(client_and_db):
    client, _ = client_and_db
    res = client.get("/auth/me")
    assert res.status_code == 401


def test_me_with_token(client_and_db):
    client, _ = client_and_db
    token = _register_and_login(client)
    res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == USER["email"]


def test_me_invalid_token(client_and_db):
    client, _ = client_and_db
    res = client.get("/auth/me", headers={"Authorization": "Bearer token.ngawur.banget"})
    assert res.status_code == 401