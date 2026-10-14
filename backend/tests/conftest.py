import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.database import Base, get_db
from app.main import app

@pytest.fixture
def client_and_db():
    test_engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    session = TestingSession()
    client = TestClient(app)
    yield client, session
    app.dependency_overrides.clear()

@pytest.fixture
def admin_headers(client_and_db):
    from app.core.security import create_access_token, hash_password
    from app.models.user import User

    _, session = client_and_db
    admin = User(
        full_name="Admin Test",
        email="admin@test.com",
        hashed_password=hash_password("admin12345"),
        role="admin",
    )
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return {"Authorization": f"Bearer {create_access_token(admin.id, admin.role)}"}


@pytest.fixture
def customer_headers(client_and_db):
    from app.core.security import create_access_token, hash_password
    from app.models.user import User

    _, session = client_and_db
    user = User(
        full_name="Customer Test",
        email="customer@test.com",
        hashed_password=hash_password("customer12345"),
        role="customer",
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"Authorization": f"Bearer {create_access_token(user.id, user.role)}"}