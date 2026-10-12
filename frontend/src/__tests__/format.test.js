import { describe, expect, it, vi } from 'vitest'
import { formatRupiah } from '@/utils/format'
import { debounce } from '@/utils/debounce'

describe('formatRupiah', () => {
  it('memformat dengan pemisah ribuan titik', () => {
    expect(formatRupiah(620000).replace(/\s/g, ' ')).toBe('Rp 620.000')
    expect(formatRupiah(3850000).replace(/\s/g, ' ')).toBe('Rp 3.850.000')
  })
  it('nilai tidak valid menjadi 0', () => {
    expect(formatRupiah(undefined).replace(/\s/g, ' ')).toBe('Rp 0')
  })
})

describe('debounce', () => {
  it('hanya memanggil sekali setelah jeda', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const d = debounce(fn, 300)
    d('a'); d('ab'); d('abc')
    vi.advanceTimersByTime(299)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('abc')
    vi.useRealTimers()
  })
  it('cancel membatalkan panggilan', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const d = debounce(fn, 100)
    d('x'); d.cancel()
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()
    vi.useRealTimers()
  })
})
