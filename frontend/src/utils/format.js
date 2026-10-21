const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

/** 620000 -> "Rp 620.000" */
export function formatRupiah(value) {
  return rupiah.format(Number(value) || 0)
}

/** ISO date -> "12 Okt 2026" */
export function formatDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

const compact = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 })

/** 4140000 -> "Rp 4,1 jt" (untuk sumbu grafik dan angka ringkas) */
export function formatCompactRupiah(value) {
  return `Rp ${compact.format(Number(value) || 0)}`
}

/** ISO date -> "12 Okt" */
export function formatDayMonth(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(d)
}

/** ISO date -> "12 Okt 2026, 18.02" */
export function formatDateTime(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}
