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

## Untuk Fadly (Auth)

- Token disimpan di `localStorage` dengan kunci `access_token` dan dikirim otomatis oleh `frontend/src/services/api.js`.
- Ganti isi `frontend/src/stores/auth.js` (sekarang stub), tapi pertahankan: `isAuthenticated`, `isAdmin`, `user.name`.

## Untuk Arico (Cart)

- Ganti isi `frontend/src/stores/cart.js` (sekarang stub localStorage), tapi pertahankan `totalItems` dan `addItem(product, quantity)`.
- Komponen siap pakai: `QuantityStepper`, `PriceTag`, `ProductImage`, `EmptyState`.

## Untuk Siwi (Admin & Riwayat)

- Layout `AdminLayout.vue` sudah ada; route `/admin` memakainya lewat `meta.layout: 'admin'`.
- Pakai `BaseButton`, `BaseInput`, `BaseSelect`, `BaseBadge`, `BaseModal` (konfirmasi hapus), `BaseCard`, `LoadingSpinner`, `ErrorMessage`, `EmptyState`.
