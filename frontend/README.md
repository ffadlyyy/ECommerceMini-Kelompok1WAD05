# Frontend — Nook (E-commerce Mini)

Vue 3 + Vite + Pinia + Vue Router. Dikerjakan oleh **Ridho (Task 1: Frontend UI Specialist)**.

## Menjalankan

```bash
npm install
cp .env.example .env     # sudah ada; VITE_USE_MOCK=true = jalan tanpa backend
npm run dev              # http://localhost:5173
npm run test             # vitest
npm run build
```

Saat backend FastAPI siap: set `VITE_USE_MOCK=false` dan `VITE_API_BASE_URL` di `.env`.
Kontrak data ada di [`../docs/api-contract-frontend.md`](../docs/api-contract-frontend.md).

## Cakupan Task 1

| Tugas | Lokasi |
|---|---|
| Homepage | `views/HomeView.vue` |
| Katalog produk | `views/CatalogView.vue`, `components/product/ProductGrid.vue`, `ProductCard.vue`, `PaginationBar.vue` |
| Search bar (debounce 400 ms) | `components/product/SearchBar.vue` |
| Filter kategori | `components/product/CategoryFilter.vue` (+ `CategoryTile.vue` di homepage) |
| Detail produk | `views/ProductDetailView.vue` |
| Form & daftar review/rating | `components/product/ReviewForm.vue`, `ReviewList.vue`, `components/ui/StarRating.vue` |
| Konsistensi UI/UX | `assets/styles/tokens.css`, `components/ui/*`, `layouts/*` |

Filter katalog disimpan di URL: `/products?q=lampu&category=pencahayaan&sort=price_asc&page=2`.

## Cakupan Task 2 (Autentikasi, frontend)

| Tugas | Lokasi |
|---|---|
| Halaman masuk & daftar | `views/LoginView.vue`, `views/RegisterView.vue`, `components/auth/AuthCard.vue` |
| Sesi (token JWT + data akun dari `GET /auth/me`) | `stores/auth.js`, `services/authService.js` |
| Proteksi route (login, role admin, halaman khusus tamu) | `router/index.js` |
| Token kedaluwarsa → sesi dibersihkan otomatis | `services/api.js` (`setUnauthorizedHandler`) |

Login dan daftar **selalu memakai API asli**, juga saat `VITE_USE_MOCK=true`, jadi backend harus jalan.
Setelah login, `?redirect=` membawa user kembali ke halaman asal (hanya path internal, lihat `utils/redirect.js`).
Akun demo dari seed backend: `admin@example.com` / `admin12345` dan `customer@example.com` / `customer12345`.

## Cakupan Task 4 (Keranjang, Checkout, Pembayaran)

| Tugas | Lokasi |
|---|---|
| Keranjang (ubah jumlah, hapus, subtotal, peringatan stok) | `views/CartView.vue`, `stores/cart.js` |
| Checkout (form alamat + ringkasan, total dihitung server) | `views/CheckoutView.vue` |
| Simulasi pembayaran (berhasil / gagal lalu coba lagi) | `views/PaymentView.vue` (`/orders/:id/payment`) |
| API | `services/cartService.js` (`/cart`, `/orders/checkout`, `/orders/{id}/pay`) |

- **Tamu** tetap bisa menambah barang; keranjangnya disimpan di `localStorage`. Saat login, isinya
  dipindahkan ke keranjang server (barang yang stoknya tidak cukup dilewati dan diberi tahu).
- **Sudah login**: semua lewat API `/cart`. Keranjang, checkout, dan pembayaran selalu memakai API asli.
- Pesanan `pending` di riwayat punya tombol **Bayar sekarang** (tidak muncul untuk data mock).

## Cakupan Task 5 (Admin Dashboard & Riwayat Pesanan)

| Tugas | Lokasi |
|---|---|
| Ringkasan admin: angka penjualan, grafik pendapatan harian, pendapatan per kategori | `views/admin/AdminDashboardView.vue`, `components/admin/SalesChart.vue`, `CategorySalesBars.vue`, `StatTile.vue` |
| Tabel CRUD produk (tambah, ubah, hapus, cari, halaman) | `views/admin/AdminProductsView.vue`, `components/admin/ProductFormModal.vue` |
| Manajemen status pesanan | `views/admin/AdminOrdersView.vue` |
| Riwayat pesanan customer | `views/OrdersView.vue` |
| Data & API | `stores/admin.js`, `stores/order.js`, `services/adminService.js`, `services/orderService.js` (+ versi mock) |
| Label & alur status | `utils/orderStatus.js` (harus sama dengan `STATUS_TRANSITIONS` di `backend/app/routers/admin.py`) |

Route: `/orders` (butuh login), `/admin`, `/admin/products`, `/admin/orders` (butuh admin).
Guard di `router/index.js` hanya untuk UX; keamanan tetap di backend (401/403). Di mode mock
(`VITE_USE_MOCK=true`) guard dilewati supaya halaman bisa didemokan tanpa login.

Alur status pesanan: `pending` → `paid` → `shipped` → `completed`; `pending`/`paid` bisa `cancelled`
(stok dikembalikan). Grafik bisa dibaca lewat hover/fokus keyboard dan tombol **Lihat sebagai tabel**.

## Komponen bersama (boleh dipakai semua anggota)

| Komponen | Fungsi |
|---|---|
| `BaseButton` | tombol / link (`variant`: primary, outline, accent, text; `size`: md, sm; `to` untuk router) |
| `BaseInput` | input & textarea + label, error, hint (`v-model`) |
| `BaseSelect` | dropdown (`v-model`, `options: [{value,label}]`) |
| `BaseBadge`, `BaseCard`, `BaseModal` | lencana, kartu, dialog |
| `LoadingSpinner`, `EmptyState`, `ErrorMessage` | tiga state wajib tiap halaman data |
| `StarRating`, `QuantityStepper`, `PriceTag` | rating, jumlah, harga Rupiah |
| `ProductImage` | gambar produk + ikon fallback |
| `AppIcon` | ikon SVG berbasis data (`components/ui/icons.js`) |

**Aturan konsistensi**
1. Warna, font, spacing, radius **hanya** lewat variabel di `tokens.css` (`var(--color-ink)`, `var(--space-4)`, …).
2. Setiap halaman yang memuat data menangani loading, error, dan kosong (lihat `ProductGrid.vue`).
3. Jangan pakai `v-html` untuk teks dari pengguna (review, alamat, nama) — risiko XSS. Gunakan `{{ }}`.
4. Tombol ikon wajib `aria-label`.
5. Format harga lewat `formatRupiah` / `<PriceTag>`.

## Titik integrasi dengan anggota lain

| File | Pemilik | Status |
|---|---|---|
| `stores/auth.js` | Task 2 | memakai API asli — tetap sediakan `isAuthenticated`, `isAdmin`, `user.name` |
| `stores/cart.js` | Task 4 | API `/cart` (login) atau localStorage (tamu) — `addItem(product, qty)` sekarang async dan melempar error stok |
| `router/index.js` | bersama | jangan ubah `name` route karena dipakai navbar dan tombol |
| `layouts/AdminLayout.vue` | Task 5 | menu Ringkasan, Produk, Pesanan |

## Struktur

```
src/
├── assets/styles/   tokens.css, base.css
├── components/
│   ├── ui/          komponen dasar reusable
│   ├── layout/      AppHeader, AppFooter
│   ├── product/     komponen khusus produk
│   ├── auth/        kartu form login/daftar
│   ├── admin/       grafik, stat tile, form produk
│   └── order/       badge status, rincian pesanan
├── layouts/         MainLayout, AdminLayout
├── views/           Home, Catalog, ProductDetail, Login, Register, Cart, Checkout, Payment, Orders, NotFound
│   └── admin/       AdminDashboard, AdminProducts, AdminOrders
├── stores/          product (milik Ridho), auth (Task 2), cart (Task 4), admin & order (Task 5)
├── services/        api.js, authService.js, cartService.js, product/order/adminService.js + versi mock
├── mocks/           data contoh
├── router/
├── utils/           format, debounce
└── __tests__/
```
