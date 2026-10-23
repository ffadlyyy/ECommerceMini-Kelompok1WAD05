# E-commerce Mini

Sistem jual-beli skala kecil dengan alur dari menjelajahi katalog, menambahkan produk ke keranjang, hingga checkout. Proyek ini dibuat sebagai **Group Project Web Application Development** (Kelompok E-commerce Mini).

> Catatan: nama kelompok, nama brand/toko, dan URL deployment bisa disesuaikan di bagian bertanda `TODO`.

## Daftar Isi

- [Tujuan Proyek](#tujuan-proyek)
- [Tech Stack](#tech-stack)
- [Fitur Utama](#fitur-utama)
- [Peran Pengguna](#peran-pengguna)
- [Anggota Tim & Pembagian Tugas](#anggota-tim--pembagian-tugas)
- [Entitas Database](#entitas-database)
- [Struktur Folder](#struktur-folder)
- [Cara Menjalankan](#cara-menjalankan)
- [Variabel Lingkungan](#variabel-lingkungan)
- [Dokumentasi API](#dokumentasi-api)
- [Keamanan](#keamanan)
- [Testing & CI/CD](#testing--cicd)
- [Konvensi Git & Kolaborasi](#konvensi-git--kolaborasi)
- [Di Luar Scope](#di-luar-scope)

---

## Tujuan Proyek

Membangun aplikasi web full-stack yang mendemonstrasikan:

- **CPL02**: kemampuan merancang arsitektur aplikasi web client-server yang dinamis.
- **CPL05**: penerapan prinsip keamanan pada aplikasi full-stack.

## Tech Stack

| Lapisan | Teknologi |
|---|---|
| Frontend | Vue 3, Vite, Pinia, Vue Router |
| Backend | FastAPI (Python) |
| Database | PostgreSQL, SQLAlchemy, Alembic |
| Autentikasi | JWT |
| Version control & CI/CD | Git, GitHub, GitHub Actions |

## Fitur Utama

- Registrasi dan login pengguna dengan JWT
- Katalog produk dengan pencarian dan filter kategori
- Halaman detail produk (dan review/rating, opsional)
- Keranjang belanja: tambah, ubah kuantitas, hapus item
- Checkout dengan form alamat dan ringkasan pesanan
- Simulasi status pembayaran
- Riwayat pesanan untuk customer
- Dashboard admin: CRUD produk, manajemen status pesanan, grafik ringkasan penjualan

## Peran Pengguna

| Role | Hak Akses |
|---|---|
| **Customer** | Menjelajahi katalog, mengelola keranjang, checkout, melihat riwayat pesanan |
| **Admin** | Mengelola produk dan kategori, mengelola status pesanan, melihat ringkasan penjualan |

## Anggota Tim & Pembagian Tugas

| No | Anggota | Peran | Fokus |
|---|---|---|---|
| 1 | **Ridho** | Frontend UI Specialist | Tampilan utama (client-side) & layouting |
| 2 | **Fadly** | Backend & Auth Specialist | Keamanan, autentikasi, manajemen user |
| 3 | **Haris** | Catalog & Admin Backend Specialist | Database produk & API admin |
| 4 | **Arico** | Cart & Order Specialist | Alur keranjang & logika transaksi |
| 5 | **Siwi** | Admin Dashboard & History Specialist | Dashboard admin & riwayat pesanan |

### Task 1: Ridho (Frontend UI Specialist)

- Desain/slicing UI Homepage dan Katalog Produk
- Komponen search bar dan UI filter kategori
- Halaman Detail Produk dan UI form Review/Rating (jika diambil)
- Menjaga konsistensi UI/UX seluruh aplikasi (design tokens dan komponen reusable)

### Task 2: Fadly (Backend & Auth Specialist)

- Setup arsitektur backend dasar dan koneksi database
- Implementasi autentikasi (register dan login) dengan JWT
- Skema database `User`
- Middleware/proteksi route (pembedaan hak akses Customer vs Admin)

### Task 3: Haris (Catalog & Admin Backend Specialist)

- Skema database `Product` dan `Category`
- Endpoint API CRUD produk
- Endpoint pencarian dan filter kategori
- Endpoint data untuk summary sales chart di dashboard admin

### Task 4: Arico (Cart & Order Specialist)

- Skema database `Cart`, `CartItem`, `Order`, dan `OrderItem`
- Fitur shopping cart (tambah, ubah kuantitas, hapus)
- Logika checkout (form alamat dan kalkulasi total tagihan)
- Simulasi status pembayaran

### Task 5: Siwi (Admin Dashboard & History Specialist)

- Slicing UI Dashboard Admin (tabel CRUD produk, chart sales)
- Fitur manajemen status pesanan oleh admin
- Halaman Order History untuk customer

## Entitas Database

`User`, `Product`, `Category`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment` (status saja), `Review/Rating` (opsional).

> TODO: tambahkan gambar ERD di `docs/erd.png` lalu tampilkan di sini:
>
> `![ERD](docs/erd.png)`

## Struktur Folder

> Struktur di bawah adalah usulan awal; sesuaikan dengan kesepakatan tim.

```
ecommerce-mini/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/            # config, security, dependencies
│   │   ├── models/          # model SQLAlchemy
│   │   ├── schemas/         # skema Pydantic
│   │   ├── routers/         # auth, products, cart, orders, admin
│   │   └── services/        # logika bisnis
│   ├── alembic/             # migrasi database
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── assets/          # style global dan design tokens
│   │   ├── components/      # komponen reusable (ProductCard, SearchBar, dll.)
│   │   ├── layouts/         # MainLayout, AdminLayout
│   │   ├── views/           # Home, Catalog, ProductDetail, Cart, Orders, Admin
│   │   ├── stores/          # store Pinia (auth, product, cart, order)
│   │   ├── router/
│   │   └── services/        # pemanggil API
│   ├── package.json
│   └── .env.example
├── docs/                    # ERD, diagram arsitektur, screenshot
├── .github/workflows/       # CI/CD GitHub Actions
└── README.md
```

## Cara Menjalankan

### Prasyarat

- Node.js 18+ dan npm
- Python 3.10+
- PostgreSQL 14+
- Git

### 1. Clone repository

```bash
git clone <URL-REPOSITORY>
cd ecommerce-mini
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # lalu isi nilai yang sesuai

alembic upgrade head            # jalankan migrasi database
uvicorn app.main:app --reload
```

Backend berjalan di `http://localhost:8000`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

### Deploy dengan Docker

Satu perintah menjalankan PostgreSQL, backend, dan frontend (Caddy). Backend tidak dibuka ke luar; Caddy mem-proxy `/api/*` ke backend, jadi tidak perlu atur CORS.

```bash
cp .env.docker.example .env      # isi SECRET_KEY dan POSTGRES_PASSWORD
docker compose up -d --build
```

App hanya dibuka di `127.0.0.1:${APP_PORT}` (default 8080). Domain dan HTTPS diurus Caddy yang terpasang di VPS, cukup tambahkan ke `/etc/caddy/Caddyfile` lalu `sudo systemctl reload caddy`:

```
toko.domainmu.com {
	reverse_proxy 127.0.0.1:8080
}
```

Kalau backend dan frontend di-deploy terpisah (mis. backend di Railway, frontend di layanan lain), build frontend dengan URL publik backend dan isi `CORS_ORIGINS` di backend:

```bash
docker build -t nook-frontend --build-arg VITE_API_BASE_URL=https://api.domainmu.com ./frontend
```

## Variabel Lingkungan

**`backend/.env`**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db
SECRET_KEY=ganti-dengan-string-acak-yang-panjang
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:5173
```

**`frontend/.env`**

```env
VITE_API_BASE_URL=http://localhost:8000
```

> Jangan pernah meng-commit file `.env` asli. Hanya `.env.example` yang boleh masuk repository.

## Dokumentasi API

FastAPI menyediakan dokumentasi interaktif otomatis saat backend berjalan:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

Ringkasan endpoint (akan dilengkapi seiring pengembangan):

| Modul | Contoh Endpoint | Akses |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login` | Publik |
| Produk | `GET /products`, `GET /products/{id}` | Publik |
| Produk (admin) | `POST/PUT/DELETE /products` | Admin |
| Kategori | `GET /categories` | Publik |
| Keranjang | `GET/POST/PUT/DELETE /cart` | Customer |
| Pesanan | `POST /orders/checkout`, `GET /orders` | Customer |
| Admin pesanan | `PATCH /admin/orders/{id}/status` | Admin |
| Statistik | `GET /admin/sales-summary` | Admin |

## Keamanan

Bagian ini mengukur CPL05 dan bobot nilai 20%. Langkah yang diterapkan:

- Password di-hash (bcrypt/argon2), tidak pernah disimpan sebagai teks biasa
- Autentikasi berbasis JWT dengan masa berlaku token
- RBAC: pembatasan endpoint berdasarkan role Customer dan Admin
- Validasi input di backend (Pydantic) dan frontend
- Perlindungan SQL Injection melalui ORM SQLAlchemy (query terparameter)
- Perlindungan XSS: tidak menggunakan `v-html` untuk konten dari pengguna
- Konfigurasi CORS yang dibatasi ke origin yang diizinkan
- Rahasia disimpan di environment variable, bukan di kode

> TODO: tambahkan mitigasi lain yang benar-benar diterapkan (rate limiting, security headers, dsb.) dan hapus yang belum.

## Testing & CI/CD

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm run test
```

Pipeline GitHub Actions (`.github/workflows/`) menjalankan lint dan test otomatis pada setiap push dan pull request.

> TODO: tambahkan URL deployment jika sudah tersedia.

## Konvensi Git & Kolaborasi

- Satu repository GitHub bersama; **setiap anggota push dengan akun GitHub masing-masing**.
- Branch utama: `main` (hanya berisi kode yang stabil).
- Buat branch per fitur: `feature/<nama-fitur>`, misalnya `feature/product-catalog`.
- Format pesan commit yang disarankan: `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`, `test: ...`.
- Ajukan Pull Request dan minta review minimal satu anggota lain sebelum merge.
- Sepakati kontrak API (bentuk JSON dan parameter) sebelum frontend dan backend saling terhubung.

## Di Luar Scope

Fitur berikut sengaja tidak dikerjakan agar proyek tetap realistis:

- Integrasi payment gateway asli (Midtrans, Xendit, dll.); pembayaran hanya simulasi status
- Sistem multi-vendor / marketplace
- Perhitungan ongkos kirim otomatis
- Rekomendasi produk berbasis AI
- Dukungan multi-mata uang

## Anggota

| Nama | Peran |
|---|---|
| Ridho | Frontend UI Specialist |
| Fadly | Backend & Auth Specialist |
| Haris | Catalog & Admin Backend Specialist |
| Arico | Cart & Order Specialist |
| Siwi | Admin Dashboard & History Specialist |
