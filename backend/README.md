# E-Commerce Mini - Backend API

FastAPI backend service untuk E-Commerce Mini (Kelompok 1 WAD).
Fokus: **Catalog & Admin Backend Specialist** (Database Produk, Kategori, CRUD Admin, Search & Filter, Sales Summary Chart).

## Tech Stack
- **Framework:** FastAPI
- **ASGI Server:** Uvicorn
- **Database:** PostgreSQL (Driver: `psycopg2-binary` & `psycopg` 3)
- **ORM:** SQLAlchemy 2.0
- **Validation:** Pydantic v2
- **Testing:** Pytest & HTTPX (In-memory SQLite isolation)

## Requirements
- Python 3.10+
- PostgreSQL server (port 5432)

## Setup & Instalasi

### 1. Masuk ke direktori backend & Buat Virtual Environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Konfigurasi Environment & Database
Salin file konfigurasi environment atau buat `.env`:
```env
PROJECT_NAME="E-Commerce Mini Backend"
DATABASE_URL="postgresql://admin:password@localhost:5432/ecommerce_wad"
CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
```

Pastikan database PostgreSQL sudah dibuat:
```sql
CREATE DATABASE ecommerce_wad;
```

### 4. Database Seeding
Jalankan script seeding untuk mengisi database dengan mock data frontend (6 kategori, 14 produk, 6 review, 3 order):
```bash
PYTHONPATH=. python -m app.seed
```

### 5. Menjalankan Server Development
```bash
PYTHONPATH=. uvicorn app.main:app --reload --port 8000
```
Server akan aktif di `http://localhost:8000`.
Dokumentasi interaktif OpenAPI / Swagger UI tersedia di `http://localhost:8000/docs`.

## Endpoint API

### Public / Catalog API
- `GET /health` - Health check status
- `GET /categories` - Daftar seluruh kategori
- `GET /products` - Katalog produk dengan query:
  - `q`: Search keyword pada nama, deskripsi, atau kategori
  - `category`: Filter slug kategori (misal: `ruang-tamu`)
  - `sort`: `newest` (default), `price_asc`, `price_desc`, `name`
  - `page`: Nomor halaman (default: 1)
  - `page_size`: Jumlah per halaman (default: 9)
- `GET /products/{id}` - Detail produk beserta kalkulasi rating
- `GET /products/{id}/reviews` - Daftar review untuk produk tertentu

### Admin API
- `POST /admin/products` - Tambah produk baru
- `PUT /admin/products/{id}` - Update data produk
- `DELETE /admin/products/{id}` - Hapus produk
- `GET /admin/sales-summary` - Visualisasi / summary chart penjualan (total pendapatan, total order, daily sales breakdown, dan category sales breakdown)

## Menjalankan Unit Tests (TDD)
```bash
cd backend
PYTHONPATH=. venv/bin/pytest tests -v
```
Seluruh pengujian menggunakan isolated SQLite in-memory database dengan static pool sehingga tidak mengubah data di PostgreSQL.
