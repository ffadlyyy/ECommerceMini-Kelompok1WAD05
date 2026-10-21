# Kontrak API untuk Frontend (Task 1 → Haris & Fadly)

Dokumen ini adalah bentuk data yang **sudah dipakai frontend** (lihat `frontend/src/mocks/data.js`).
Haris/Fadly cukup menyamakan respons backend dengan bentuk ini, lalu set `VITE_USE_MOCK=false`.
Bila ada yang ingin diubah, kabari Ridho agar frontend disesuaikan.

## Kategori

`GET /categories` → `200`
```json
[{ "id": 1, "name": "Ruang tamu", "slug": "ruang-tamu" }]
```
`slug` dipakai untuk filter dan ikon kategori.

## Daftar produk (katalog, pencarian, filter)

`GET /products?q=&category=&sort=&page=&page_size=` → `200`

| Parameter | Arti | Default |
|---|---|---|
| `q` | kata kunci, cocokkan nama/deskripsi/nama kategori (case-insensitive) | kosong |
| `category` | **slug** kategori | semua |
| `sort` | `newest` \| `price_asc` \| `price_desc` \| `name` | `newest` |
| `page` | mulai dari 1 | 1 |
| `page_size` | jumlah per halaman | 9 |

```json
{
  "items": [
    {
      "id": 1,
      "name": "Lampu Meja Linen",
      "description": "…",
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
- `price` = integer rupiah (bukan string, tanpa desimal).
- `image_url` boleh `null`; frontend menampilkan ikon placeholder.
- `rating_avg` (0–5, 1 desimal) dan `rating_count` boleh `0`.
- `is_new` boleh dihitung backend (mis. dibuat < 14 hari) atau kolom biasa.

## Detail produk

`GET /products/{id}` → `200` objek produk (bentuk sama dengan item di atas) · `404` bila tidak ada
```json
{ "detail": "Produk tidak ditemukan." }
```

## Review

`GET /products/{id}/reviews` → `200`
```json
[{ "id": 1, "product_id": 1, "user_name": "Dewi A.", "rating": 5, "comment": "…", "created_at": "2026-10-09T10:20:00Z" }]
```

`POST /products/{id}/reviews` — **wajib JWT** (`Authorization: Bearer <token>`)
```json
{ "rating": 5, "comment": "minimal 10 karakter, maksimal 500" }
```
→ `201` review yang dibuat · `401` bila belum login · `422` bila validasi gagal.
Backend wajib memvalidasi ulang rating 1–5 dan panjang komentar (jangan percaya validasi frontend).

## Format error

Frontend membaca `detail` ala FastAPI:
```json
{ "detail": "Pesan yang bisa ditampilkan ke pengguna." }
```

## Auth (Task 2)

| Endpoint | Body | Respons |
|---|---|---|
| `POST /auth/register` | `{ full_name, email, password }` (password 8–72) | `201` user · `409` email terdaftar · `422` |
| `POST /auth/login` | `{ email, password }` | `200 { access_token, token_type }` · `401` |
| `GET /auth/me` | — (JWT) | `200 { id, full_name, email, role, created_at }` · `401` |

- Token disimpan di `localStorage` dengan kunci `access_token` dan dikirim otomatis oleh `frontend/src/services/api.js`.
- Respons `401` pada request yang membawa token membuat frontend menghapus sesi.
- `stores/auth.js` menyediakan `isAuthenticated`, `isAdmin`, `user.name` (= `full_name`), `login()`, `register()`, `logout()`, `fetchMe()`.

## Keranjang & checkout (Task 4)

Semua butuh JWT. Respons keranjang (`GET /cart`, dan juga hasil `POST`/`PATCH`/`DELETE /cart/items...`):
```json
{
  "items": [{ "id": 11, "product_id": 1, "name": "Lampu Meja Linen", "price": 620000, "image_url": null, "stock": 14, "quantity": 2, "line_total": 1240000 }],
  "total_items": 2,
  "subtotal": 1240000
}
```
- `POST /cart/items` `{ product_id, quantity }` · `PATCH /cart/items/{id}` `{ quantity }` · `DELETE /cart/items/{id}` — `{id}` = id item keranjang. `400` bila stok tidak cukup.
- `POST /orders/checkout` `{ shipping_name, shipping_phone, shipping_address, shipping_city, shipping_postal_code }` → `201` order (`pending` / `unpaid`), keranjang dikosongkan.
- `POST /orders/{id}/pay` `{ "result": "success" | "failed" }` → order. `409` bila sudah dibayar.
- `stores/cart.js` menyediakan `items`, `totalItems`, `subtotal`, `addItem(product, qty)` (async), `updateQuantity`, `removeItem`, `fetchCart`, `clear`.

## Pesanan (Task 5)

`GET /orders` (customer, JWT) → `200` daftar pesanan milik user, terbaru dulu:
```json
[{
  "id": 8, "status": "paid", "payment_status": "paid", "total_amount": 1360000,
  "created_at": "2026-10-11T07:55:00Z",
  "shipping_name": "…", "shipping_phone": "…", "shipping_address": "…", "shipping_city": "…", "shipping_postal_code": "16111",
  "items": [{ "id": 1, "product_id": 5, "name": "Keranjang Anyaman Pasar", "quantity": 2, "price": 410000, "line_total": 820000 }]
}]
```

`GET /admin/orders?status=` (admin) → bentuk sama + `customer_name`, `customer_email`.

`PATCH /admin/orders/{id}/status` (admin) body `{ "status": "shipped" }` → `200` order terbaru · `409` bila melompati alur.

| `status` | Label UI |
|---|---|
| `pending` | Menunggu pembayaran |
| `paid` | Dibayar |
| `shipped` | Dikirim |
| `completed` | Selesai |
| `cancelled` | Dibatalkan |

`payment_status`: `unpaid`, `paid`, `failed`, `refunded`.

## Untuk Siwi (Admin & Riwayat)

- Layout `AdminLayout.vue` sudah ada; route `/admin` memakainya lewat `meta.layout: 'admin'`.
- Pakai `BaseButton`, `BaseInput`, `BaseSelect`, `BaseBadge`, `BaseModal` (konfirmasi hapus), `BaseCard`, `LoadingSpinner`, `ErrorMessage`, `EmptyState`.
