# Catalog & Admin Backend (Task 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a robust, tested FastAPI backend for Task 3 containing Product & Category models, catalog search and filtering, Admin product CRUD, and sales summary chart API connected to PostgreSQL.

**Architecture:** Modular FastAPI backend structured into `core` (config/database), `models` (SQLAlchemy 2.0 ORM), `schemas` (Pydantic v2), `routers` (REST endpoints), and `seed` (data populator syncing with frontend mock dataset). All database interactions use standard synchronous SQLAlchemy sessions with automated table creation on startup.

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy 2.0, psycopg2-binary, Pydantic v2, pytest, httpx.

**Spec:** `docs/superpowers/specs/2026-10-12-catalog-admin-backend-design.md`

## Global Constraints

- Backend directory: all backend code lives inside `/backend`.
- Database connection default: `postgresql://admin:R3hasa1234@localhost:5432/ecommerce_wad`.
- Price representation: integer rupiah (no decimals, non-negative).
- Frontend API contract compliance: exact JSON response structure specified in `docs/api-contract-frontend.md`.
- Error format: FastAPI standard `{"detail": "..."}`.
- Git commits: commit as user `Haris M`, do NOT add Claude attribution lines.

## Review Focus

- Empty catalog search query: returns paginated list of all active products without throwing 422 or 500.
- Category filter with non-existent slug: returns empty items list with `total: 0` (not 404/500).
- Product creation with negative price or stock: rejected with 422 Unprocessable Entity.
- Product deletion with reviews / order items: properly handles foreign keys without cascading into data corruption.
- Sales summary endpoint when no orders exist: returns zero metrics and empty arrays without division-by-zero or null crashes.

---

### Task 1: Environment & Core Configuration

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/.env.example`
- Create: `backend/app/__init__.py`
- Create: `backend/app/core/__init__.py`
- Create: `backend/app/core/config.py`
- Create: `backend/app/core/database.py`
- Test: `backend/tests/test_config.py`

**Interfaces:**
- Consumes: Environment variables (`DATABASE_URL`, `CORS_ORIGINS`).
- Produces: `settings` (from `config.py`), `Base`, `engine`, `SessionLocal`, `get_db` generator (from `database.py`).

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_config.py
from app.core.config import settings

def test_settings_load_defaults():
    assert settings.PROJECT_NAME == "E-Commerce Mini Backend"
    assert "ecommerce_wad" in settings.DATABASE_URL
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_config.py`
Expected: FAIL with ModuleNotFoundError or ImportError.

- [ ] **Step 3: Write minimal implementation**

```txt
# backend/requirements.txt
fastapi>=0.110.0,<1.0.0
uvicorn[standard]>=0.29.0,<1.0.0
pydantic>=2.6.0,<3.0.0
pydantic-settings>=2.2.0,<3.0.0
sqlalchemy>=2.0.28,<3.0.0
psycopg2-binary>=2.9.9,<3.0.0
python-dotenv>=1.0.1,<2.0.0
httpx>=0.27.0,<1.0.0
pytest>=8.1.0,<9.0.0
```

```env
# backend/.env.example
DATABASE_URL=postgresql://admin:R3hasa1234@localhost:5432/ecommerce_wad
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
PROJECT_NAME="E-Commerce Mini Backend"
```

```python
# backend/app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "E-Commerce Mini Backend"
    DATABASE_URL: str = "postgresql://admin:R3hasa1234@localhost:5432/ecommerce_wad"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
```

```python
# backend/app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_config.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "feat: setup backend config and database connection"
```

---

### Task 2: SQLAlchemy Models (Category, Product, Review, Order, OrderItem)

**Files:**
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/category.py`
- Create: `backend/app/models/product.py`
- Create: `backend/app/models/review.py`
- Create: `backend/app/models/order.py`
- Test: `backend/tests/test_models.py`

**Interfaces:**
- Consumes: `Base` from `app.core.database`.
- Produces: `Category`, `Product`, `Review`, `Order`, `OrderItem` ORM classes with relationships.

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_models.py
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_models.py`
Expected: FAIL with ImportError.

- [ ] **Step 3: Write minimal implementation**

```python
# backend/app/models/category.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)

    products = relationship("Product", back_populates="category")
```

```python
# backend/app/models/product.py
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Integer, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    image_url = Column(String(500), nullable=True)
    is_new = Column(Boolean, nullable=False, default=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    category = relationship("Category", back_populates="products")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")

    __table_args__ = (
        CheckConstraint("price >= 0", name="check_product_price_non_negative"),
        CheckConstraint("stock >= 0", name="check_product_stock_non_negative"),
    )
```

```python
# backend/app/models/review.py
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    user_name = Column(String(100), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product", back_populates="reviews")

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_review_rating_1_to_5"),
    )
```

```python
# backend/app/models/order.py
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    total_amount = Column(Integer, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=1)
    price = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
```

```python
# backend/app/models/__init__.py
from app.models.category import Category
from app.models.product import Product
from app.models.review import Review
from app.models.order import Order, OrderItem

__all__ = ["Category", "Product", "Review", "Order", "OrderItem"]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_models.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/models/ backend/tests/test_models.py
git commit -m "feat: add database models for categories, products, reviews, and orders"
```

---

### Task 3: Pydantic Schemas

**Files:**
- Create: `backend/app/schemas/__init__.py`
- Create: `backend/app/schemas/category.py`
- Create: `backend/app/schemas/product.py`
- Create: `backend/app/schemas/review.py`
- Create: `backend/app/schemas/sales.py`
- Test: `backend/tests/test_schemas.py`

**Interfaces:**
- Consumes: Standard types and Pydantic v2 `BaseModel`.
- Produces: `CategoryOut`, `ProductOut`, `ProductListOut`, `ProductCreate`, `ProductUpdate`, `ReviewOut`, `SalesSummaryOut`.

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_schemas.py
from datetime import datetime, timezone
import pytest
from pydantic import ValidationError
from app.schemas.category import CategoryOut
from app.schemas.product import ProductOut, ProductCreate

def test_product_out_schema_matches_contract():
    cat = CategoryOut(id=1, name="Pencahayaan", slug="pencahayaan")
    prod = ProductOut(
        id=1,
        name="Lampu Meja",
        description="Deskripsi",
        price=500000,
        stock=10,
        image_url=None,
        is_new=True,
        created_at=datetime.now(timezone.utc),
        category=cat,
        rating_avg=4.5,
        rating_count=2
    )
    assert prod.price == 500000
    assert prod.category.slug == "pencahayaan"

def test_product_create_rejects_negative_price():
    with pytest.raises(ValidationError):
        ProductCreate(name="Bad Product", price=-1000, stock=5, category_id=1)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_schemas.py`
Expected: FAIL with ImportError.

- [ ] **Step 3: Write minimal implementation**

```python
# backend/app/schemas/category.py
from pydantic import BaseModel, ConfigDict

class CategoryBase(BaseModel):
    name: str
    slug: str

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
```

```python
# backend/app/schemas/review.py
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class ReviewBase(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=5, max_length=1000)

class ReviewCreate(ReviewBase):
    pass

class ReviewOut(ReviewBase):
    id: int
    product_id: int
    user_name: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
```

```python
# backend/app/schemas/product.py
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.category import CategoryOut

class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    price: int = Field(ge=0)
    stock: int = Field(ge=0, default=0)
    image_url: Optional[str] = None
    is_new: bool = True

class ProductCreate(ProductBase):
    category_id: int

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    price: Optional[int] = Field(None, ge=0)
    stock: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None
    is_new: Optional[bool] = None
    category_id: Optional[int] = None

class ProductOut(ProductBase):
    id: int
    created_at: datetime
    category: CategoryOut
    rating_avg: float = 0.0
    rating_count: int = 0
    model_config = ConfigDict(from_attributes=True)

class ProductListOut(BaseModel):
    items: List[ProductOut]
    total: int
    page: int
    page_size: int
```

```python
# backend/app/schemas/sales.py
from typing import List
from pydantic import BaseModel

class DailySales(BaseModel):
    date: str
    revenue: int
    orders: int

class CategorySales(BaseModel):
    category_id: int
    category_name: str
    revenue: int
    quantity_sold: int

class SalesSummaryOut(BaseModel):
    total_revenue: int
    total_orders: int
    daily_sales: List[DailySales]
    category_sales: List[CategorySales]
```

```python
# backend/app/schemas/__init__.py
from app.schemas.category import CategoryOut, CategoryCreate
from app.schemas.product import ProductOut, ProductCreate, ProductUpdate, ProductListOut
from app.schemas.review import ReviewOut, ReviewCreate
from app.schemas.sales import SalesSummaryOut, DailySales, CategorySales

__all__ = [
    "CategoryOut", "CategoryCreate",
    "ProductOut", "ProductCreate", "ProductUpdate", "ProductListOut",
    "ReviewOut", "ReviewCreate",
    "SalesSummaryOut", "DailySales", "CategorySales",
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_schemas.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/schemas/ backend/tests/test_schemas.py
git commit -m "feat: add pydantic schemas matching frontend API contract"
```

---

### Task 4: Categories Endpoint (`GET /categories`)

**Files:**
- Create: `backend/app/routers/__init__.py`
- Create: `backend/app/routers/categories.py`
- Create: `backend/app/main.py`
- Create: `backend/tests/conftest.py`
- Test: `backend/tests/test_categories.py`

**Interfaces:**
- Consumes: `get_db` from `app.core.database`, `Category` model.
- Produces: `router` handling `GET /categories`.

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.main import app

@pytest.fixture
def client_and_db():
    test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
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
```

```python
# backend/tests/test_categories.py
from app.models.category import Category

def test_get_categories_empty(client_and_db):
    client, _ = client_and_db
    res = client.get("/categories")
    assert res.status_code == 200
    assert res.json() == []

def test_get_categories_list(client_and_db):
    client, db = client_and_db
    db.add(Category(name="Ruang tamu", slug="ruang-tamu"))
    db.add(Category(name="Pencahayaan", slug="pencahayaan"))
    db.commit()

    res = client.get("/categories")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    assert data[0]["slug"] == "ruang-tamu"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_categories.py`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

```python
# backend/app/routers/categories.py
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryOut

router = APIRouter(tags=["Categories"])

@router.get("/categories", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.id.asc()).all()
```

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.routers import categories

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_categories.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/routers/categories.py backend/app/main.py backend/tests/conftest.py backend/tests/test_categories.py
git commit -m "feat: add GET /categories endpoint and test"
```

---

### Task 5: Product Catalog Endpoints (`GET /products`, `GET /products/{id}`, `GET /products/{id}/reviews`)

**Files:**
- Create: `backend/app/routers/products.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/test_products.py`

**Interfaces:**
- Consumes: `Category`, `Product`, `Review` models, `get_db`.
- Produces: `router` with search, category filtering, sort (`newest`, `price_asc`, `price_desc`, `name`), pagination, and product detail.

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_products.py
from app.models import Category, Product, Review

def test_list_products_search_and_filter(client_and_db):
    client, db = client_and_db
    c1 = Category(name="Pencahayaan", slug="pencahayaan")
    c2 = Category(name="Ruang tamu", slug="ruang-tamu")
    db.add_all([c1, c2])
    db.commit()

    p1 = Product(name="Lampu Meja Linen", description="Kap linen", price=620000, stock=14, category_id=c1.id)
    p2 = Product(name="Kursi Rotan", description="Kayu jati", price=3850000, stock=5, category_id=c2.id)
    db.add_all([p1, p2])
    db.commit()

    # Search by q
    res_q = client.get("/products?q=lampu")
    assert res_q.status_code == 200
    assert res_q.json()["total"] == 1
    assert res_q.json()["items"][0]["name"] == "Lampu Meja Linen"

    # Filter by category slug
    res_cat = client.get("/products?category=ruang-tamu")
    assert res_cat.status_code == 200
    assert res_cat.json()["total"] == 1
    assert res_cat.json()["items"][0]["name"] == "Kursi Rotan"

def test_get_product_detail_and_reviews(client_and_db):
    client, db = client_and_db
    c = Category(name="Pencahayaan", slug="pencahayaan")
    db.add(c)
    db.commit()

    p = Product(name="Lampu Meja", price=500000, stock=10, category_id=c.id)
    db.add(p)
    db.commit()

    r = Review(product_id=p.id, user_name="Dewi A.", rating=5, comment="Bagus banget")
    db.add(r)
    db.commit()

    res = client.get(f"/products/{p.id}")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Lampu Meja"
    assert data["rating_avg"] == 5.0
    assert data["rating_count"] == 1

    res_rev = client.get(f"/products/{p.id}/reviews")
    assert res_rev.status_code == 200
    assert len(res_rev.json()) == 1
    assert res_rev.json()[0]["user_name"] == "Dewi A."
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_products.py`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

```python
# backend/app/routers/products.py
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
                func.lower(Product.description).like(term),
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

    return db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_products.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/routers/products.py backend/app/main.py backend/tests/test_products.py
git commit -m "feat: add catalog listing with search, category filter, and product detail endpoints"
```

---

### Task 6: Admin Product CRUD Endpoints

**Files:**
- Create: `backend/app/routers/admin.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/test_admin_products.py`

**Interfaces:**
- Consumes: `Product`, `Category` models, `ProductCreate`, `ProductUpdate` schemas.
- Produces: `POST /admin/products`, `PUT /admin/products/{id}`, `DELETE /admin/products/{id}`.

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_admin_products.py
from app.models import Category, Product

def test_admin_create_product(client_and_db):
    client, db = client_and_db
    cat = Category(name="Tekstil", slug="tekstil")
    db.add(cat)
    db.commit()

    payload = {
        "name": "Bantal Linen",
        "description": "Bantal sofa linen",
        "price": 350000,
        "stock": 20,
        "category_id": cat.id,
        "image_url": None,
        "is_new": True
    }
    res = client.post("/admin/products", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Bantal Linen"
    assert data["category"]["slug"] == "tekstil"

def test_admin_update_product(client_and_db):
    client, db = client_and_db
    cat = Category(name="Tekstil", slug="tekstil")
    db.add(cat)
    db.commit()
    prod = Product(name="Bantal", price=300000, stock=5, category_id=cat.id)
    db.add(prod)
    db.commit()

    res = client.put(f"/admin/products/{prod.id}", json={"price": 320000, "stock": 15})
    assert res.status_code == 200
    assert res.json()["price"] == 320000
    assert res.json()["stock"] == 15

def test_admin_delete_product(client_and_db):
    client, db = client_and_db
    cat = Category(name="Tekstil", slug="tekstil")
    db.add(cat)
    db.commit()
    prod = Product(name="Bantal", price=300000, stock=5, category_id=cat.id)
    db.add(prod)
    db.commit()

    res = client.delete(f"/admin/products/{prod.id}")
    assert res.status_code == 200
    assert res.json() == {"message": "Produk berhasil dihapus."}

    res_get = client.get(f"/products/{prod.id}")
    assert res_get.status_code == 404
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_admin_products.py`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

```python
# backend/app/routers/admin.py
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_admin_products.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/routers/admin.py backend/app/main.py backend/tests/test_admin_products.py
git commit -m "feat: add admin product CRUD endpoints"
```

---

### Task 7: Admin Sales Summary Chart Endpoint (`GET /admin/sales-summary`)

**Files:**
- Modify: `backend/app/routers/admin.py`
- Test: `backend/tests/test_sales_summary.py`

**Interfaces:**
- Consumes: `Order`, `OrderItem`, `Category`, `Product` models, `SalesSummaryOut` schema.
- Produces: `GET /admin/sales-summary`.

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_sales_summary.py
from datetime import datetime, timezone
from app.models import Category, Product, Order, OrderItem

def test_sales_summary_empty(client_and_db):
    client, _ = client_and_db
    res = client.get("/admin/sales-summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_revenue"] == 0
    assert data["total_orders"] == 0
    assert data["daily_sales"] == []
    assert data["category_sales"] == []

def test_sales_summary_with_paid_orders(client_and_db):
    client, db = client_and_db
    cat = Category(name="Dekorasi", slug="dekorasi")
    db.add(cat)
    db.commit()

    prod = Product(name="Vas Bunga", price=100000, stock=50, category_id=cat.id)
    db.add(prod)
    db.commit()

    order = Order(total_amount=200000, status="paid", created_at=datetime.now(timezone.utc))
    db.add(order)
    db.commit()

    item = OrderItem(order_id=order.id, product_id=prod.id, quantity=2, price=100000)
    db.add(item)
    db.commit()

    res = client.get("/admin/sales-summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_revenue"] == 200000
    assert data["total_orders"] == 1
    assert len(data["category_sales"]) == 1
    assert data["category_sales"][0]["category_name"] == "Dekorasi"
    assert data["category_sales"][0]["quantity_sold"] == 2
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_sales_summary.py`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

Tambahkan ke `backend/app/routers/admin.py`:
```python
from app.models.order import Order, OrderItem
from app.schemas.sales import SalesSummaryOut, DailySales, CategorySales

@router.get("/sales-summary", response_model=SalesSummaryOut)
def get_sales_summary(db: Session = Depends(get_db)):
    valid_statuses = ["paid", "completed"]
    orders = db.query(Order).filter(Order.status.in_(valid_statuses)).all()

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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_sales_summary.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/routers/admin.py backend/tests/test_sales_summary.py
git commit -m "feat: add admin sales summary endpoint with revenue and category aggregations"
```

---

### Task 8: Data Seeding Script & Frontend Sync

**Files:**
- Create: `backend/app/seed.py`
- Test: `backend/tests/test_seed.py`

**Interfaces:**
- Consumes: Mock data structure from `frontend/src/mocks/data.js`.
- Produces: `seed_data()` populating 6 categories, 14 products, 6 reviews, and demo orders.

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_seed.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.seed import seed_data
from app.models import Category, Product, Review

def test_seed_data_populates_tables():
    test_engine = create_engine("sqlite:///:memory:")
    Session = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = Session()

    seed_data(db)

    assert db.query(Category).count() == 6
    assert db.query(Product).count() == 14
    assert db.query(Review).count() == 6
    db.close()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_seed.py`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

```python
# backend/app/seed.py
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.models import Category, Product, Review, Order, OrderItem

CATEGORIES = [
    {"id": 1, "name": "Ruang tamu", "slug": "ruang-tamu"},
    {"id": 2, "name": "Pencahayaan", "slug": "pencahayaan"},
    {"id": 3, "name": "Tekstil", "slug": "tekstil"},
    {"id": 4, "name": "Meja makan", "slug": "meja-makan"},
    {"id": 5, "name": "Penyimpanan", "slug": "penyimpanan"},
    {"id": 6, "name": "Dekorasi", "slug": "dekorasi"},
]

PRODUCTS = [
    {"id": 1, "name": "Lampu Meja Linen", "price": 620000, "stock": 14, "category_id": 2, "is_new": True, "description": "Lampu meja dengan kap linen berwarna gading yang menyebarkan cahaya hangat. Cocok untuk sudut baca atau meja samping tempat tidur. Tinggi 42 cm, kabel 1,8 m."},
    {"id": 2, "name": "Kursi Santai Rotan", "price": 3850000, "stock": 5, "category_id": 1, "is_new": False, "description": "Kursi santai berangka kayu jati dengan anyaman rotan alami. Ringan dipindahkan, nyaman untuk duduk lama. Dimensi 70 × 75 × 80 cm."},
    {"id": 3, "name": "Set Mug Keramik", "price": 290000, "stock": 40, "category_id": 4, "is_new": True, "description": "Satu set empat mug keramik glasir matte dengan warna tanah. Aman untuk microwave dan mesin pencuci piring. Kapasitas 320 ml per mug."},
    {"id": 4, "name": "Tanaman Pakis Sintetis", "price": 485000, "stock": 22, "category_id": 6, "is_new": False, "description": "Tanaman pakis tiruan dalam pot semen, tampak segar tanpa perlu disiram. Tinggi total 55 cm."},
    {"id": 5, "name": "Keranjang Anyaman Pasar", "price": 410000, "stock": 18, "category_id": 5, "is_new": False, "description": "Keranjang anyaman dengan dua pegangan kulit. Muat untuk selimut, majalah, atau mainan. Diameter 38 cm."},
    {"id": 6, "name": "Cermin Bingkai Kayu Oak", "price": 1150000, "stock": 7, "category_id": 6, "is_new": True, "description": "Cermin oval berbingkai kayu oak solid dengan finishing minyak alami. Bisa digantung atau disandarkan. 50 × 80 cm."},
    {"id": 7, "name": "Kursi Boucle", "price": 5200000, "stock": 3, "category_id": 1, "is_new": False, "description": "Kursi dengan kain boucle bertekstur lembut dan kaki kayu ramping. Busa padat yang tidak mudah kempis."},
    {"id": 8, "name": "Set Vas Terakota", "price": 540000, "stock": 25, "category_id": 6, "is_new": False, "description": "Dua vas terakota bentuk berbeda, dibuat tangan sehingga setiap pasang sedikit unik. Tinggi 22 cm dan 18 cm."},
    {"id": 9, "name": "Bantal Sofa Linen", "price": 350000, "stock": 31, "category_id": 3, "is_new": False, "description": "Sarung bantal linen cuci-enzim yang makin lembut setiap dicuci, lengkap dengan isian dakron. 45 × 45 cm."},
    {"id": 10, "name": "Peti Rotan Serbaguna", "price": 1980000, "stock": 0, "category_id": 5, "is_new": False, "description": "Peti penyimpanan berpenutup dari rotan, bisa jadi bangku tambahan. Saat ini sedang habis, sedang dalam proses restok."},
    {"id": 11, "name": "Karpet Wol Tenun", "price": 2750000, "stock": 6, "category_id": 3, "is_new": False, "description": "Karpet wol tenun tangan dengan pola geometris halus. Ukuran 160 × 230 cm."},
    {"id": 12, "name": "Selimut Rajut Hangat", "price": 520000, "stock": 16, "category_id": 3, "is_new": False, "description": "Selimut rajut katun tebal dengan rumbai di ujung, nyaman untuk malam yang dingin. 130 × 170 cm."},
    {"id": 13, "name": "Set Piring Stoneware", "price": 780000, "stock": 12, "category_id": 4, "is_new": False, "description": "Enam piring makan stoneware glasir krem dengan tepi sedikit tidak rata yang memberi karakter. Diameter 26 cm."},
    {"id": 14, "name": "Rak Dinding Kayu", "price": 690000, "stock": 9, "category_id": 5, "is_new": False, "description": "Rak dinding dua tingkat dari kayu mahoni, lengkap dengan bracket tersembunyi. Lebar 80 cm."},
]

REVIEWS = [
    {"product_id": 1, "user_name": "Dewi A.", "rating": 5, "comment": "Cahayanya hangat banget, pas buat baca sebelum tidur. Kapnya rapi."},
    {"product_id": 1, "user_name": "Raka P.", "rating": 4, "comment": "Bagus dan sesuai foto. Kabelnya agak pendek untuk meja yang jauh dari stopkontak."},
    {"product_id": 2, "user_name": "Sinta M.", "rating": 5, "comment": "Nyaman dan anyamannya halus, tidak menusuk. Sangat puas."},
    {"product_id": 3, "user_name": "Budi S.", "rating": 4, "comment": "Warnanya cantik, ukurannya pas di tangan."},
    {"product_id": 7, "user_name": "Laras K.", "rating": 5, "comment": "Teksturnya mewah dan duduknya empuk tapi tetap padat."},
    {"product_id": 7, "user_name": "Hendra W.", "rating": 3, "comment": "Kualitas bagus tapi harganya cukup tinggi, pengiriman agak lama."},
]

def seed_data(db: Session):
    for c in CATEGORIES:
        existing = db.query(Category).filter(Category.id == c["id"]).first()
        if not existing:
            db.add(Category(**c))
    db.commit()

    for p in PRODUCTS:
        existing = db.query(Product).filter(Product.id == p["id"]).first()
        if not existing:
            db.add(Product(**p))
    db.commit()

    if db.query(Review).count() == 0:
        for r in REVIEWS:
            db.add(Review(**r))
        db.commit()

    if db.query(Order).count() == 0:
        now = datetime.now(timezone.utc)
        o1 = Order(total_amount=620000, status="paid", created_at=now - timedelta(days=2))
        o2 = Order(total_amount=4140000, status="paid", created_at=now - timedelta(days=1))
        o3 = Order(total_amount=290000, status="completed", created_at=now)
        db.add_all([o1, o2, o3])
        db.commit()

        db.add_all([
            OrderItem(order_id=o1.id, product_id=1, quantity=1, price=620000),
            OrderItem(order_id=o2.id, product_id=2, quantity=1, price=3850000),
            OrderItem(order_id=o2.id, product_id=3, quantity=1, price=290000),
            OrderItem(order_id=o3.id, product_id=3, quantity=1, price=290000),
        ])
        db.commit()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_data(db)
    db.close()
    print("Database seeded successfully!")
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_seed.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/seed.py backend/tests/test_seed.py
git commit -m "feat: add database seeding script synced with frontend mock data"
```

---

### Task 9: Full Suite Verification & Documentation

**Files:**
- Create: `backend/README.md`
- Test: All tests in `backend/tests/`

- [ ] **Step 1: Run all tests in test suite**

Run: `pytest backend/tests -v`
Expected: 100% PASS.

- [ ] **Step 2: Create backend documentation in `backend/README.md`**

Write clear guide covering:
- Virtualenv setup and dependencies installation.
- Database setup in PostgreSQL (`CREATE DATABASE ecommerce_wad;`).
- Seeding data with `python -m app.seed`.
- Running server with `uvicorn app.main:app --reload`.
- Interactive Swagger docs at `http://localhost:8000/docs`.

- [ ] **Step 3: Commit**

```bash
git add backend/README.md
git commit -m "docs: add backend setup and API documentation for team"
```
