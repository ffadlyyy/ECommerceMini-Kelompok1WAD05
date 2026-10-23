#!/bin/sh
set -e

# Isi data awal (kategori, produk, akun admin & customer) kalau RUN_SEED=true. Seed aman dijalankan berulang.
# Password akun wajib diisi lewat env supaya server tidak memakai password default yang ada di repo.
if [ "$RUN_SEED" = "true" ]; then
  if [ -z "$SEED_ADMIN_PASSWORD" ] || [ -z "$SEED_CUSTOMER_PASSWORD" ]; then
    echo "RUN_SEED=true butuh SEED_ADMIN_PASSWORD dan SEED_CUSTOMER_PASSWORD di .env" >&2
    exit 1
  fi
  python -m app.seed
fi

exec "$@"
