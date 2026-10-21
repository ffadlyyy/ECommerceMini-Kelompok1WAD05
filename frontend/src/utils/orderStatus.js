// Status pesanan — harus sama dengan backend (app/routers/admin.py: STATUS_TRANSITIONS).
export const ORDER_STATUSES = [
  { value: 'pending', label: 'Menunggu pembayaran', badge: 'muted' },
  { value: 'paid', label: 'Dibayar', badge: 'accent' },
  { value: 'shipped', label: 'Dikirim', badge: 'dark' },
  { value: 'completed', label: 'Selesai', badge: 'success' },
  { value: 'cancelled', label: 'Dibatalkan', badge: 'danger' },
]

// `completed` dan `cancelled` adalah status akhir.
export const STATUS_TRANSITIONS = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['completed'],
}

// Teks tombol admin untuk tiap status tujuan.
export const STATUS_ACTIONS = {
  paid: 'Tandai dibayar',
  shipped: 'Tandai dikirim',
  completed: 'Tandai selesai',
  cancelled: 'Batalkan',
}

export const PAYMENT_LABELS = {
  unpaid: 'Belum dibayar',
  paid: 'Lunas',
  failed: 'Pembayaran gagal',
  refunded: 'Dana dikembalikan',
}

// Order yang dihitung sebagai penjualan di ringkasan admin.
export const SALES_STATUSES = ['paid', 'shipped', 'completed']

export function statusMeta(status) {
  return ORDER_STATUSES.find((s) => s.value === status) ?? { value: status, label: status, badge: 'muted' }
}

export function nextStatuses(status) {
  return STATUS_TRANSITIONS[status] ?? []
}
