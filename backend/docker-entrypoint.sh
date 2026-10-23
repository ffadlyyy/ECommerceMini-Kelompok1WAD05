#!/bin/sh
set -e

# Isi data awal (kategori, produk, akun demo) kalau RUN_SEED=true. Seed aman dijalankan berulang.
if [ "$RUN_SEED" = "true" ]; then
  python -m app.seed
fi

exec "$@"
