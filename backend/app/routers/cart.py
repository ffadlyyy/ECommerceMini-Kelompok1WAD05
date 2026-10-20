from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartItemAdd, CartItemOut, CartItemUpdate, CartOut

router = APIRouter(prefix="/cart", tags=["Cart"])


def _get_or_create_cart(db: Session, user: User) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if cart is None:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


def _format_cart(cart: Cart) -> CartOut:
    items = []
    for it in sorted(cart.items, key=lambda i: i.id):
        p = it.product
        items.append(CartItemOut(
            id=it.id,
            product_id=p.id,
            name=p.name,
            price=p.price,
            image_url=p.image_url,
            stock=p.stock,
            quantity=it.quantity,
            line_total=p.price * it.quantity,
        ))
    return CartOut(
        items=items,
        total_items=sum(i.quantity for i in items),
        subtotal=sum(i.line_total for i in items),
    )


def _find_item(db: Session, cart: Cart, item_id: int) -> CartItem:
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item keranjang tidak ditemukan.")
    return item


@router.get("", response_model=CartOut)
def get_cart(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _format_cart(_get_or_create_cart(db, user))


@router.post("/items", response_model=CartOut, status_code=status.HTTP_201_CREATED)
def add_item(payload: CartItemAdd, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan.")

    cart = _get_or_create_cart(db, user)
    item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id, CartItem.product_id == product.id
    ).first()

    new_qty = payload.quantity + (item.quantity if item else 0)
    if new_qty > product.stock:
        raise HTTPException(status_code=400, detail=f"Stok tidak cukup. Tersisa {product.stock}.")

    if item:
        item.quantity = new_qty
    else:
        db.add(CartItem(cart_id=cart.id, product_id=product.id, quantity=new_qty))
    db.commit()
    db.refresh(cart)
    return _format_cart(cart)


@router.patch("/items/{item_id}", response_model=CartOut)
def update_item(item_id: int, payload: CartItemUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = _get_or_create_cart(db, user)
    item = _find_item(db, cart, item_id)
    if payload.quantity > item.product.stock:
        raise HTTPException(status_code=400, detail=f"Stok tidak cukup. Tersisa {item.product.stock}.")
    item.quantity = payload.quantity
    db.commit()
    db.refresh(cart)
    return _format_cart(cart)


@router.delete("/items/{item_id}", response_model=CartOut)
def remove_item(item_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = _get_or_create_cart(db, user)
    item = _find_item(db, cart, item_id)
    db.delete(item)
    db.commit()
    db.refresh(cart)
    return _format_cart(cart)