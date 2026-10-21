import { beforeEach, describe, expect, it, vi } from 'vitest'

// Modul mock menyimpan state; muat ulang per test supaya tidak saling memengaruhi.
let admin, orderMock, data
beforeEach(async () => {
  vi.resetModules()
  data = await import('@/mocks/data')
  orderMock = await import('@/services/mockOrderService')
  admin = await import('@/services/mockAdminService')
})

describe('mockAdminService — pesanan', () => {
  it('menolak perubahan status yang melompati alur', async () => {
    const pending = orderMock.orders.find((o) => o.status === 'pending')
    await expect(admin.updateOrderStatus(pending.id, 'completed')).rejects.toMatchObject({ status: 409 })
  })

  it('membatalkan pesanan mengembalikan stok dan menandai refund', async () => {
    const paid = orderMock.orders.find((o) => o.status === 'paid' && o.payment_status === 'paid')
    const item = paid.items[0]
    const product = data.products.find((p) => p.id === item.product_id)
    const before = product.stock

    const updated = await admin.updateOrderStatus(paid.id, 'cancelled')
    expect(updated.status).toBe('cancelled')
    expect(updated.payment_status).toBe('refunded')
    expect(product.stock).toBe(before + item.quantity)
  })

  it('perubahan admin terlihat di riwayat customer', async () => {
    const mine = (await orderMock.listMyOrders()).find((o) => o.status === 'paid')
    await admin.updateOrderStatus(mine.id, 'shipped')
    const after = await orderMock.getMyOrder(mine.id)
    expect(after.status).toBe('shipped')
    expect(after).not.toHaveProperty('customer_email')
  })

  it('ringkasan hanya menghitung pesanan dibayar/dikirim/selesai', async () => {
    const sold = orderMock.orders.filter((o) => ['paid', 'shipped', 'completed'].includes(o.status))
    const summary = await admin.getSalesSummary()
    expect(summary.total_orders).toBe(sold.length)
    expect(summary.total_revenue).toBe(sold.reduce((s, o) => s + o.total_amount, 0))
    expect(summary.daily_sales.map((d) => d.date)).toEqual([...summary.daily_sales.map((d) => d.date)].sort())
  })
})

describe('mockAdminService — produk', () => {
  it('menambah lalu menghapus produk yang belum pernah dipesan', async () => {
    const created = await admin.createProduct({ name: 'Vas Uji', price: 100000, stock: 3, category_id: 6 })
    expect(created.category.slug).toBe('dekorasi')
    await admin.deleteProduct(created.id)
    expect(data.products.some((p) => p.id === created.id)).toBe(false)
  })

  it('menolak menghapus produk yang sudah pernah dipesan', async () => {
    const orderedId = orderMock.orders[0].items[0].product_id
    await expect(admin.deleteProduct(orderedId)).rejects.toMatchObject({ status: 409 })
  })

  it('kategori tidak valid ditolak', async () => {
    await expect(admin.createProduct({ name: 'X', price: 1, stock: 1, category_id: 999 })).rejects.toMatchObject({ status: 400 })
  })
})
