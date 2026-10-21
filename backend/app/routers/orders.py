from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.cart import Cart
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import CheckoutRequest, OrderItemOut, OrderOut, PayRequest

router = APIRouter(prefix="/orders", tags=["Orders"])


def _format_order(order: Order) -> OrderOut:
    items = [
        OrderItemOut(
            id=it.id,
            product_id=it.product_id,
            name=it.product.name if it.product else "-",
            quantity=it.quantity,
            price=it.price,
            line_total=it.price * it.quantity,
        )
        for it in sorted(order.items, key=lambda i: i.id)
    ]
    return OrderOut(
        id=order.id,
        status=order.status,
        payment_status=order.payment_status,
        total_amount=order.total_amount,
        created_at=order.created_at,
        shipping_name=order.shipping_name,
        shipping_phone=order.shipping_phone,
        shipping_address=order.shipping_address,
        shipping_city=order.shipping_city,
        shipping_postal_code=order.shipping_postal_code,
        items=items,
    )


@router.post("/checkout", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def checkout(payload: CheckoutRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if cart is None or not cart.items:
        raise HTTPException(status_code=400, detail="Keranjang kosong.")

    # Kunci baris produk (urut by id) agar dua checkout bersamaan tidak menjual stok yang sama.
    ids = sorted(it.product_id for it in cart.items)
    products = {
        p.id: p
        for p in db.query(Product).filter(Product.id.in_(ids)).order_by(Product.id).with_for_update().all()
    }

    total = 0
    for it in cart.items:
        p = products[it.product_id]
        if it.quantity > p.stock:
            raise HTTPException(status_code=400, detail=f"Stok '{p.name}' tidak cukup. Tersisa {p.stock}.")
        total += p.price * it.quantity

    order = Order(
        user_id=user.id,
        total_amount=total,
        status="pending",
        payment_status="unpaid",
        **payload.model_dump(),
    )
    db.add(order)
    db.flush()

    for it in list(cart.items):
        p = products[it.product_id]
        db.add(OrderItem(order_id=order.id, product_id=p.id, quantity=it.quantity, price=p.price))
        p.stock -= it.quantity
        db.delete(it)

    db.commit()
    db.refresh(order)
    return _format_order(order)


@router.get("", response_model=list[OrderOut])
def list_my_orders(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.user_id == user.id)
        .order_by(Order.created_at.desc(), Order.id.desc())
        .all()
    )
    return [_format_order(o) for o in orders]


@router.get("/{order_id}", response_model=OrderOut)
def get_my_order(order_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan.")
    return _format_order(order)

@router.post("/{order_id}/pay", response_model=OrderOut)
def pay_order(
    order_id: int,
    payload: Optional[PayRequest] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == user.id)
        .with_for_update()
        .first()
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan.")
    if order.payment_status == "paid":
        raise HTTPException(status_code=409, detail="Order sudah dibayar.")
    if order.status != "pending":
        raise HTTPException(status_code=409, detail="Order ini tidak bisa dibayar.")

    result = payload.result if payload else "success"
    if result == "success":
        order.payment_status = "paid"
        order.status = "paid"
    else:
        order.payment_status = "failed"

    db.commit()
    db.refresh(order)
    return _format_order(order)