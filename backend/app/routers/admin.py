from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from app.schemas.sales import SalesSummaryOut, DailySales, CategorySales
from app.schemas.order import AdminOrderOut, OrderStatus, OrderStatusUpdate
from app.routers.products import _format_product
from app.routers.orders import _format_order
from app.core.deps import require_role

# Order yang dihitung sebagai penjualan (sudah dibayar dan tidak dibatalkan).
SALES_STATUSES = ["paid", "shipped", "completed"]

# Alur status yang boleh diubah admin. `completed` dan `cancelled` adalah status akhir.
STATUS_TRANSITIONS = {
    "pending": {"paid", "cancelled"},
    "paid": {"shipped", "cancelled"},
    "shipped": {"completed"},
}

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_role("admin"))])

@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == payload.category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Kategori tidak valid.")

    product = Product(
        name=payload.name,
        description=payload.description,
        price=payload.price,
        stock=payload.stock,
        image_url=payload.image_url,
        is_new=payload.is_new,
        category_id=payload.category_id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    product = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.reviews)
    ).filter(Product.id == product.id).first()

    return _format_product(product)

@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan.")

    if payload.category_id is not None:
        cat = db.query(Category).filter(Category.id == payload.category_id).first()
        if not cat:
            raise HTTPException(status_code=400, detail="Kategori tidak valid.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    product = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.reviews)
    ).filter(Product.id == product.id).first()

    return _format_product(product)

@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan.")

    # order_items.product_id memakai ON DELETE RESTRICT, jadi riwayat order harus tetap utuh.
    if db.query(OrderItem).filter(OrderItem.product_id == product_id).first():
        raise HTTPException(
            status_code=409,
            detail="Produk sudah pernah dipesan dan tidak bisa dihapus. Ubah stok menjadi 0 untuk menonaktifkannya.",
        )

    db.delete(product)
    db.commit()
    return {"message": "Produk berhasil dihapus."}

@router.get("/sales-summary", response_model=SalesSummaryOut)
def get_sales_summary(db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.status.in_(SALES_STATUSES)).all()

    total_revenue = sum(o.total_amount for o in orders)
    total_orders = len(orders)

    daily_map = {}
    for o in orders:
        date_str = o.created_at.strftime("%Y-%m-%d")
        if date_str not in daily_map:
            daily_map[date_str] = {"revenue": 0, "orders": 0}
        daily_map[date_str]["revenue"] += o.total_amount
        daily_map[date_str]["orders"] += 1

    daily_sales = [
        DailySales(date=d, revenue=vals["revenue"], orders=vals["orders"])
        for d, vals in sorted(daily_map.items())
    ]

    category_map = {}
    order_ids = [o.id for o in orders]
    if order_ids:
        items = db.query(OrderItem).filter(OrderItem.order_id.in_(order_ids)).options(
            joinedload(OrderItem.product).joinedload(Product.category)
        ).all()

        for it in items:
            if it.product and it.product.category:
                cat = it.product.category
                if cat.id not in category_map:
                    category_map[cat.id] = {
                        "category_name": cat.name,
                        "revenue": 0,
                        "quantity_sold": 0,
                    }
                category_map[cat.id]["revenue"] += it.price * it.quantity
                category_map[cat.id]["quantity_sold"] += it.quantity

    category_sales = [
        CategorySales(
            category_id=cid,
            category_name=cdata["category_name"],
            revenue=cdata["revenue"],
            quantity_sold=cdata["quantity_sold"],
        )
        for cid, cdata in category_map.items()
    ]

    return SalesSummaryOut(
        total_revenue=total_revenue,
        total_orders=total_orders,
        daily_sales=daily_sales,
        category_sales=category_sales,
    )

def _format_admin_order(order: Order, user: Optional[User]) -> AdminOrderOut:
    return AdminOrderOut(
        **_format_order(order).model_dump(),
        customer_name=user.full_name if user else None,
        customer_email=user.email if user else None,
    )

@router.get("/orders", response_model=list[AdminOrderOut])
def list_orders(status: Optional[OrderStatus] = Query(None), db: Session = Depends(get_db)):
    query = (
        db.query(Order, User)
        .outerjoin(User, User.id == Order.user_id)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
    )
    if status:
        query = query.filter(Order.status == status)
    rows = query.order_by(Order.created_at.desc(), Order.id.desc()).all()
    return [_format_admin_order(order, user) for order, user in rows]

@router.patch("/orders/{order_id}/status", response_model=AdminOrderOut)
def update_order_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).with_for_update().first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan.")

    new_status = payload.status
    if new_status not in STATUS_TRANSITIONS.get(order.status, set()):
        raise HTTPException(
            status_code=409,
            detail=f"Status '{order.status}' tidak bisa diubah menjadi '{new_status}'.",
        )

    if new_status == "paid":
        order.payment_status = "paid"
    elif new_status == "cancelled":
        # Kembalikan stok yang dikurangi saat checkout.
        for it in order.items:
            if it.product:
                it.product.stock += it.quantity
        if order.payment_status == "paid":
            order.payment_status = "refunded"

    order.status = new_status
    db.commit()
    db.refresh(order)
    user = db.query(User).filter(User.id == order.user_id).first() if order.user_id else None
    return _format_admin_order(order, user)
