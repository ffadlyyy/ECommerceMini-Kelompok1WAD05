import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models import Category, Product, Review, Order, OrderItem

@pytest.fixture
def db_session():
    test_engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_create_category_and_product(db_session):
    cat = Category(name="Pencahayaan", slug="pencahayaan")
    db_session.add(cat)
    db_session.commit()

    prod = Product(
        name="Lampu Meja Linen",
        description="Lampu meja linen hangat",
        price=620000,
        stock=14,
        category_id=cat.id,
        is_new=True
    )
    db_session.add(prod)
    db_session.commit()

    assert prod.id is not None
    assert prod.category.slug == "pencahayaan"
    assert prod.price == 620000

def test_create_review_and_order(db_session):
    cat = Category(name="Tekstil", slug="tekstil")
    db_session.add(cat)
    db_session.commit()

    prod = Product(
        name="Bantal Sofa Linen",
        price=350000,
        stock=30,
        category_id=cat.id
    )
    db_session.add(prod)
    db_session.commit()

    rev = Review(
        product_id=prod.id,
        user_name="Dewi A.",
        rating=5,
        comment="Bagus banget teksturnya"
    )
    db_session.add(rev)
    db_session.commit()

    assert rev.id is not None
    assert len(prod.reviews) == 1

    order = Order(total_amount=350000, status="paid")
    db_session.add(order)
    db_session.commit()

    item = OrderItem(order_id=order.id, product_id=prod.id, quantity=1, price=350000)
    db_session.add(item)
    db_session.commit()

    assert order.id is not None
    assert len(order.items) == 1
    assert order.items[0].product.name == "Bantal Sofa Linen"
