import { describe, expect, it } from 'vitest'
import { nextStatuses, statusMeta } from '@/utils/orderStatus'
import { formatCompactRupiah } from '@/utils/format'

describe('orderStatus', () => {
  it('mengikuti alur status yang sama dengan backend', () => {
    expect(nextStatuses('pending')).toEqual(['paid', 'cancelled'])
    expect(nextStatuses('paid')).toEqual(['shipped', 'cancelled'])
    expect(nextStatuses('shipped')).toEqual(['completed'])
  })

  it('status akhir tidak punya langkah berikutnya', () => {
    expect(nextStatuses('completed')).toEqual([])
    expect(nextStatuses('cancelled')).toEqual([])
  })

  it('status tak dikenal tetap punya label', () => {
    expect(statusMeta('shipped').label).toBe('Dikirim')
    expect(statusMeta('aneh')).toEqual({ value: 'aneh', label: 'aneh', badge: 'muted' })
  })
})

describe('formatCompactRupiah', () => {
  it('meringkas angka besar', () => {
    expect(formatCompactRupiah(4140000).replace(/\s/g, ' ')).toBe('Rp 4,1 jt')
    expect(formatCompactRupiah(0)).toBe('Rp 0')
  })
})
