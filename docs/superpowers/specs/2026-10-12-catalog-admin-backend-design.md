# Design Specification: Catalog & Admin Backend (Task 3)

**Author:** Haris M (Catalog & Admin Backend Specialist)  
**Date:** 2026-10-12  
**Status:** Approved  
**Target:** `/backend`

---

## 1. Overview & Context

Project **E-Commerce Mini (Kelompok 1 WAD)** requires a modular client-server web app using Vue 3 on frontend and FastAPI (Python) on backend with PostgreSQL database.

This specification covers **Task 3: Catalog & Admin Backend Specialist**:
- Product and Category relational database schema.
- Product catalog APIs (search keyword, category slug filter, sorting, pagination).
- Product CRUD endpoints for Admin.
- Sales summary analytics endpoint (`/admin/sales-summary`) for Admin Dashboard chart visualization.
- Data seeding matching frontend mock dataset (`frontend/src/mocks/data.js`).

---

## 2. Technology Stack

- **Framework:** FastAPI
- **ORM:** SQLAlchemy 2.0 (Synchronous mode)
- **Database Driver:** `psycopg2-binary`
- **Database Engine:** PostgreSQL 16
  - Connection: `postgresql://admin:R3hasa1234@localhost:5432/ecommerce_wad`
- **Validation:** Pydantic v2
- **Database Migrations:** Alembic
- **Testing:** Pytest, HTTPX

---

## 3. Database Schema

### 3.1. `categories`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK, Auto-increment | Unique identifier |
| `name` | String(100) | NOT NULL | Display name (e.g. "Ruang tamu") |
| `slug` | String(100) | UNIQUE, INDEX, NOT NULL | URL/filter slug (e.g. "ruang-tamu") |

### 3.2. `products`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK, Auto-increment | Unique identifier |
| `name` | String(200) | INDEX, NOT NULL | Product name |
| `description` | Text | NULLABLE | Product description |
| `price` | Integer | NOT NULL, CHECK (price >= 0) | Price in Indonesian Rupiah |
| `stock` | Integer | NOT NULL, DEFAULT 0, CHECK (stock >= 0) | Available inventory |
| `image_url` | String(500) | NULLABLE | URL of product image |
| `is_new` | Boolean | NOT NULL, DEFAULT TRUE | New arrival flag |
| `category_id` | Integer | FK(`categories.id`, ON DELETE RESTRICT) | Category reference |
| `created_at` | DateTime(tz=True) | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | DateTime(tz=True) | NOT NULL, DEFAULT now(), onupdate now() | Update timestamp |

### 3.3. `reviews` (Sync with frontend review contract)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK, Auto-increment | Unique identifier |
| `product_id` | Integer | FK(`products.id`, ON DELETE CASCADE), INDEX | Product reference |
| `user_name` | String(100) | NOT NULL | Reviewer display name |
| `rating` | Integer | NOT NULL, CHECK (rating >= 1 AND rating <= 5) | Star rating 1 to 5 |
| `comment` | Text | NOT NULL | Feedback comment |
| `created_at` | DateTime(tz=True) | NOT NULL, DEFAULT now() | Creation timestamp |

### 3.4. `orders` & `order_items` (Foundation for Sales Chart Query)
- **`orders`**: `id` (PK), `total_amount` (Integer), `status` (String: `pending`, `paid`, `completed`, `cancelled`), `created_at` (DateTime(tz=True)).
- **`order_items`**: `id` (PK), `order_id` (FK `orders.id` CASCADE), `product_id` (FK `products.id` RESTRICT), `quantity` (Integer), `price` (Integer).

---

## 4. API Endpoints Contract

Aligns strictly with `docs/api-contract-frontend.md`:

### 4.1. Public / Customer Endpoints

#### `GET /categories`
- **Response `200`:**
  ```json
  [
    { "id": 1, "name": "Ruang tamu", "slug": "ruang-tamu" }
  ]
  ```

#### `GET /products`
- **Query Parameters:**
  - `q` (string, optional): search term matched case-insensitively across product name, description, and category name.
  - `category` (string, optional): category slug.
  - `sort` (string, optional, default: `newest`): `newest` | `price_asc` | `price_desc` | `name`.
  - `page` (int, default: 1): page index (1-based).
  - `page_size` (int, default: 9): items per page.
- **Response `200`:**
  ```json
  {
    "items": [
      {
        "id": 1,
        "name": "Lampu Meja Linen",
        "description": "Lampu meja dengan kap linen...",
        "price": 620000,
        "stock": 14,
        "image_url": null,
        "is_new": true,
        "created_at": "2026-10-08T08:00:00Z",
        "category": { "id": 2, "name": "Pencahayaan", "slug": "pencahayaan" },
        "rating_avg": 4.5,
        "rating_count": 2
      }
    ],
    "total": 14,
    "page": 1,
    "page_size": 9
  }
  ```

#### `GET /products/{id}`
- **Response `200`:** Single product object (identical to item schema above).
- **Response `404`:** `{"detail": "Produk tidak ditemukan."}`

#### `GET /products/{id}/reviews`
- **Response `200`:**
  ```json
  [
    {
      "id": 1,
      "product_id": 1,
      "user_name": "Dewi A.",
      "rating": 5,
      "comment": "Cahayanya hangat...",
      "created_at": "2026-10-09T10:20:00Z"
    }
  ]
  ```

### 4.2. Admin Endpoints

#### `POST /admin/products`
- **Request Body:**
  ```json
  {
    "name": "Kursi Minimalis",
    "description": "Kursi kayu minimalis",
    "price": 1250000,
    "stock": 10,
    "category_id": 1,
    "image_url": null,
    "is_new": true
  }
  ```
- **Response `201`:** Product detail object.
- **Response `400` / `422`:** Validation errors.

#### `PUT /admin/products/{id}`
- **Request Body:** Partial / full fields update.
- **Response `200`:** Updated product detail object.
- **Response `404`:** `{"detail": "Produk tidak ditemukan."}`

#### `DELETE /admin/products/{id}`
- **Response `200`:** `{"message": "Produk berhasil dihapus."}`
- **Response `404`:** `{"detail": "Produk tidak ditemukan."}`

#### `GET /admin/sales-summary`
- Aggregates paid/completed orders for visualization in Admin charts.
- **Response `200`:**
  ```json
  {
    "total_revenue": 15420000,
    "total_orders": 28,
    "daily_sales": [
      { "date": "2026-10-06", "revenue": 1200000, "orders": 3 },
      { "date": "2026-10-07", "revenue": 2450000, "orders": 5 }
    ],
    "category_sales": [
      { "category_id": 1, "category_name": "Ruang tamu", "revenue": 5200000, "quantity_sold": 4 }
    ]
  }
  ```

---

## 5. Project Layout (`backend/`)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── category.py
│   │   ├── product.py
│   │   ├── review.py
│   │   └── order.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── category.py
│   │   ├── product.py
│   │   ├── review.py
│   │   └── sales.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── categories.py
│   │   ├── products.py
│   │   └── admin.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── product_service.py
│   │   └── sales_service.py
│   └── seed.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_categories.py
│   ├── test_products.py
│   └── test_admin.py
├── .env.example
├── requirements.txt
└── README.md
```

---

## 6. Verification & Testing Strategy

1. **Unit & Integration Tests:**
   - Test category list and retrieval.
   - Test product catalog search, category filtering, sort combinations, pagination bounds.
   - Test admin CRUD (create, update, delete, not-found behavior).
   - Test sales summary calculation logic against known order data.
2. **End-to-End Database Validation:**
   - Run seed script importing categories, 14 products, and sample reviews from `frontend/src/mocks/data.js`.
   - Verify responses against `docs/api-contract-frontend.md`.
