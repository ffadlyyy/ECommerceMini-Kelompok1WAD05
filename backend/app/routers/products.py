from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_
from app.core.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.models.review import Review
from app.schemas.product import ProductOut, ProductListOut
from app.schemas.review import ReviewOut

router = APIRouter(tags=["Products"])

def _calculate_rating(product: Product):
    if not product.reviews:
        return 0.0, 0
    total = sum(r.rating for r in product.reviews)
    count = len(product.reviews)
    avg = round(total / count, 1)
    return avg, count

def _format_product(product: Product) -> ProductOut:
    avg, count = _calculate_rating(product)
    return ProductOut(
        id=product.id,
        name=product.name,
        description=product.description,
        price=product.price,
        stock=product.stock,
        image_url=product.image_url,
        is_new=product.is_new,
        created_at=product.created_at,
        category=product.category,
        rating_avg=avg,
        rating_count=count,
    )

@router.get("/products", response_model=ProductListOut)
def list_products(
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    sort: Optional[str] = Query("newest"),
    page: int = Query(1, ge=1),
    page_size: int = Query(9, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Product).join(Product.category).options(
        joinedload(Product.category),
        joinedload(Product.reviews)
    )

    if q and q.strip():
        term = f"%{q.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(Product.name).like(term),
                func.lower(func.coalesce(Product.description, "")).like(term),
                func.lower(Category.name).like(term),
            )
        )

    if category and category.strip():
        query = query.filter(Category.slug == category.strip())

    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort == "name":
        query = query.order_by(Product.name.asc())
    else:  # newest
        query = query.order_by(Product.created_at.desc(), Product.id.desc())

    total = query.count()
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()

    formatted_items = [_format_product(p) for p in items]

    return ProductListOut(
        items=formatted_items,
        total=total,
        page=page,
        page_size=page_size,
    )

@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.reviews)
    ).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan.")

    return _format_product(product)

@router.get("/products/{product_id}/reviews", response_model=List[ReviewOut])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan.")

    reviews = db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()
    return reviews
