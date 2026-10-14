def test_admin_route_without_token(client_and_db):
    client, _ = client_and_db
    res = client.get("/admin/sales-summary")
    assert res.status_code == 401


def test_admin_route_as_customer_forbidden(client_and_db, customer_headers):
    client, _ = client_and_db
    res = client.get("/admin/sales-summary", headers=customer_headers)
    assert res.status_code == 403


def test_admin_route_as_admin_ok(client_and_db, admin_headers):
    client, _ = client_and_db
    res = client.get("/admin/sales-summary", headers=admin_headers)
    assert res.status_code == 200