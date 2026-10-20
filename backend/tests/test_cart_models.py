import pytest
from sqlalchemy.exc import IntegrityError
from app.models import Category, Product, User, Cart, CartItem, Order


def _user_and_product(db):
    user = User(full_name="Budi", email="budi@example.com", hashed_password="x", role="customer")
    cat = Category(name="Tekstil", slug="tekstil")
    db.add_all([user, cat])
    db.commit()
    prod = Product(name="Bantal", price=350000, stock=10, category_id=cat.id)
    db.add(prod)
    db.commit()
    return user, prod


def test_cart_with_item(client_and_db):
    _, db = client_and_db
    user, prod = _user_and_product(db)
    cart = Cart(user_id=user.id)
    db.add(cart)
    db.commit()
    db.add(CartItem(cart_id=cart.id, product_id=prod.id, quantity=2))
    db.commit()
    db.refresh(cart)
    assert len(cart.items) == 1
    assert cart.items[0].product.name == "Bantal"
    assert cart.items[0].quantity == 2


def test_one_cart_per_user(client_and_db):
    _, db = client_and_db
    user, _ = _user_and_product(db)
    db.add(Cart(user_id=user.id))
    db.commit()
    db.add(Cart(user_id=user.id))
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()


def test_same_product_cannot_repeat_in_cart(client_and_db):
    _, db = client_and_db
    user, prod = _user_and_product(db)
    cart = Cart(user_id=user.id)
    db.add(cart)
    db.commit()
    db.add(CartItem(cart_id=cart.id, product_id=prod.id, quantity=1))
    db.commit()
    db.add(CartItem(cart_id=cart.id, product_id=prod.id, quantity=1))
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()


def test_quantity_must_be_positive(client_and_db):
    _, db = client_and_db
    user, prod = _user_and_product(db)
    cart = Cart(user_id=user.id)
    db.add(cart)
    db.commit()
    db.add(CartItem(cart_id=cart.id, product_id=prod.id, quantity=0))
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()


def test_order_has_user_and_shipping_fields(client_and_db):
    _, db = client_and_db
    user, _ = _user_and_product(db)
    order = Order(
        user_id=user.id, total_amount=700000,
        shipping_name="Budi", shipping_phone="0812", shipping_address="Jl. Mawar 1",
        shipping_city="Bogor", shipping_postal_code="16111",
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    assert order.payment_status == "unpaid"
    assert order.status == "pending"
    assert order.shipping_city == "Bogor"