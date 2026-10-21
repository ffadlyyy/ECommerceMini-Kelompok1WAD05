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
```bash
cp .env.example .env
```
Isi `.env`:
```env
PROJECT_NAME="E-Commerce Mini Backend"
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ecommerce_wad"
CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
SECRET_KEY="idabfasudfna8ef9a" (key example)
ACCESS_TOKEN_EXPIRE_MINUTES=60
```
`SECRET_KEY`:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```
`.env`

Pastikan database PostgreSQL sudah dibuat:
```sql
CREATE DATABASE ecommerce_wad;
```

### 4. Database Seeding
Jalankan script seeding untuk mengisi database dengan mock data frontend (6 kategori, 14 produk, 6 review, 3 order):
```bash
PYTHONPATH=. python -m app.seed
```
Seed membuat dua akun demo (only development):
| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `admin12345` |
| Customer | `customer@example.com` | `customer12345` |

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

### Auth API
- `POST /auth/register` - Daftar akun baru. Body: `full_name`, `email`, `password` (8-72 karakter). Role selalu `customer`. Respons `201`; `409` jika email sudah terdaftar; `422` jika data tidak valid.
- `POST /auth/login` - Body: `email`, `password`. Mengembalikan `access_token` (JWT, berlaku sesuai `ACCESS_TOKEN_EXPIRE_MINUTES`). `401` jika email atau password salah.
- `GET /auth/me` - Data akun yang sedang login (butuh token).

Kirim token di setiap request yang dilindungi:
```
Authorization: Bearer <access_token>
```
Di Swagger UI (`/docs`), klik **Authorize** lalu tempel token (tanpa kata `Bearer`).

Kode status: `401` = belum login atau token tidak valid/kedaluwarsa, `403` = sudah login tetapi role tidak punya akses.

### Cart API (wajib login)
- `GET /cart` - Isi keranjang milik user, beserta `subtotal` dan `total_items`.
- `POST /cart/items` - Tambah produk. Body: `product_id`, `quantity` (1-99). Produk yang sama akan menambah kuantitas. `400` jika melebihi stok, `404` jika produk tidak ada.
- `PATCH /cart/items/{item_id}` - Ubah kuantitas. Body: `quantity`. `{item_id}` adalah `id` item keranjang, bukan `product_id`.
- `DELETE /cart/items/{item_id}` - Hapus item dari keranjang.

Harga selalu diambil dari database, tidak pernah dari klien.

### Order API (wajib login)
- `POST /orders/checkout` - Buat order dari isi keranjang. Body: `shipping_name`, `shipping_phone`, `shipping_address`, `shipping_city`, `shipping_postal_code` (5 digit). Total dihitung server, stok dicek dan dikurangi, keranjang dikosongkan. Order baru berstatus `pending` / `unpaid`. `400` jika keranjang kosong atau stok tidak cukup.
- `GET /orders` - Riwayat order milik user (terbaru dulu).
- `GET /orders/{id}` - Detail order. Order milik user lain mengembalikan `404`.
- `POST /orders/{id}/pay` - Simulasi pembayaran. Tanpa body atau `{"result": "success"}` mengubah `payment_status` dan `status` menjadi `paid`; `{"result": "failed"}` menandai `failed` dan boleh dicoba lagi. `409` jika order sudah dibayar.

Hanya order berstatus `paid` atau `completed` yang dihitung di `/admin/sales-summary`.

### Admin API
- `POST /admin/products` - Tambah produk baru
- `PUT /admin/products/{id}` - Update data produk
- `DELETE /admin/products/{id}` - Hapus produk
- `GET /admin/sales-summary` - Visualisasi / summary chart penjualan (total pendapatan, total order, daily sales breakdown, dan category sales breakdown)
Seluruh endpoint `/admin/...` hanya bisa diakses dengan token milik user ber-role `admin`.

## Memproteksi Route (untuk anggota tim)
```python
from fastapi import Depends
from app.core.deps import get_current_user, require_role
from app.models.user import User

# Hanya perlu login (customer atau admin)
@router.get("/orders/me")
def my_orders(user: User = Depends(get_current_user)):
    ...

# Hanya admin
@router.get("/admin/contoh", dependencies=[Depends(require_role("admin"))])
def contoh():
    ...
```
Di test, pakai fixture `admin_headers` atau `customer_headers` (ada di `tests/conftest.py`):
```python
def test_contoh(client_and_db, admin_headers):
    client, _ = client_and_db
    res = client.get("/admin/sales-summary", headers=admin_headers)
```

## Menjalankan Unit Tests (TDD)
```bash
cd backend
PYTHONPATH=. venv/bin/pytest tests -v
```
Seluruh pengujian menggunakan isolated SQLite in-memory database dengan static pool sehingga tidak mengubah data di PostgreSQL.
