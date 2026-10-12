from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from app.routers.products import _format_product

router = APIRouter(prefix="/admin", tags=["Admin"])

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

    db.delete(product)
    db.commit()
    return {"message": "Produk berhasil dihapus."}
