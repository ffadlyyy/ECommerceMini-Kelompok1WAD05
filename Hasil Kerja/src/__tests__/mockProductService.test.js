import { describe, expect, it } from 'vitest'
import * as svc from '@/services/mockProductService'

describe('mockProductService.listProducts', () => {
  it('memaginasi 9 produk per halaman', async () => {
    const p1 = await svc.listProducts({ page: 1 })
    const p2 = await svc.listProducts({ page: 2 })
    expect(p1.items).toHaveLength(9)
    expect(p1.total).toBe(14)
    expect(p2.items).toHaveLength(5)
  })

  it('mencari berdasarkan kata kunci (tidak peka huruf besar/kecil)', async () => {
    const res = await svc.listProducts({ q: 'ROTAN' })
    expect(res.total).toBeGreaterThan(0)
    expect(res.items.every((p) => /rotan/i.test(p.name + p.description + p.category.name))).toBe(true)
  })

  it('memfilter per kategori', async () => {
    const res = await svc.listProducts({ category: 'tekstil' })
    expect(res.total).toBe(3)
    expect(res.items.every((p) => p.category.slug === 'tekstil')).toBe(true)
  })

  it('menggabungkan pencarian dan kategori; hasil kosong bila tak cocok', async () => {
    const res = await svc.listProducts({ q: 'lampu', category: 'tekstil' })
    expect(res.total).toBe(0)
    expect(res.items).toEqual([])
  })

  it('mengurutkan harga naik dan turun', async () => {
    const asc = (await svc.listProducts({ sort: 'price_asc', page_size: 50 })).items.map((p) => p.price)
    const desc = (await svc.listProducts({ sort: 'price_desc', page_size: 50 })).items.map((p) => p.price)
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
    expect(desc).toEqual([...desc].sort((a, b) => b - a))
  })
})

describe('mockProductService detail & review', () => {
  it('menolak produk yang tidak ada dengan status 404', async () => {
    await expect(svc.getProduct(9999)).rejects.toMatchObject({ status: 404 })
  })

  it('menambah review memperbarui rata-rata rating', async () => {
    const before = await svc.getProduct(9)
    await svc.createReview(9, { rating: 5, comment: 'Bantalnya empuk sekali.' })
    const after = await svc.getProduct(9)
    expect(after.rating_count).toBe(before.rating_count + 1)
    expect(after.rating_avg).toBe(5)
  })

  it('menolak rating di luar 1–5', async () => {
    await expect(svc.createReview(1, { rating: 9, comment: 'x'.repeat(12) })).rejects.toMatchObject({ status: 422 })
  })
})
