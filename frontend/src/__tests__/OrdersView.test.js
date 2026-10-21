import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

const orders = [
  {
    id: 8, status: 'paid', payment_status: 'paid', total_amount: 1360000, created_at: '2026-10-11T07:55:00Z',
    shipping_name: 'Budi', shipping_phone: '0812', shipping_address: 'Jl. Mawar 1', shipping_city: 'Bogor', shipping_postal_code: '16111',
    items: [
      { id: 1, product_id: 5, name: 'Keranjang Anyaman Pasar', quantity: 2, price: 410000, line_total: 820000 },
      { id: 2, product_id: 8, name: 'Set Vas Terakota', quantity: 1, price: 540000, line_total: 540000 },
    ],
  },
  {
    id: 1, status: 'completed', payment_status: 'paid', total_amount: 620000, created_at: '2026-10-03T09:15:00Z',
    items: [{ id: 3, product_id: 1, name: 'Lampu Meja Linen', quantity: 1, price: 620000, line_total: 620000 }],
  },
]

const listMyOrders = vi.fn()
vi.mock('@/services/orderService', () => ({ listMyOrders: (...a) => listMyOrders(...a) }))

const OrdersView = (await import('@/views/OrdersView.vue')).default

function factory() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/products', name: 'catalog', component: { template: '<div />' } }],
  })
  return mount(OrdersView, { global: { plugins: [router] } })
}

describe('OrdersView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    listMyOrders.mockReset()
  })

  it('menampilkan daftar pesanan dengan status dan total', async () => {
    listMyOrders.mockResolvedValue(orders)
    const w = factory()
    await flushPromises()
    const text = w.text().replace(/\s/g, ' ')
    expect(text).toContain('Pesanan #8')
    expect(text).toContain('Keranjang Anyaman Pasar dan 1 barang lain')
    expect(text).toContain('Dibayar')
    expect(text).toContain('Rp 1.360.000')
  })

  it('membuka rincian barang dan alamat', async () => {
    listMyOrders.mockResolvedValue(orders)
    const w = factory()
    await flushPromises()
    const toggle = w.get('.order__toggle')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(w.text()).toContain('Set Vas Terakota')
    expect(w.text()).toContain('Jl. Mawar 1')
  })

  it('filter status menyaring daftar', async () => {
    listMyOrders.mockResolvedValue(orders)
    const w = factory()
    await flushPromises()
    await w.findAll('.orders__tab').find((b) => b.text().startsWith('Selesai')).trigger('click')
    expect(w.findAll('.order')).toHaveLength(1)
    expect(w.text()).toContain('Pesanan #1')
  })

  it('menampilkan state kosong', async () => {
    listMyOrders.mockResolvedValue([])
    const w = factory()
    await flushPromises()
    expect(w.text()).toContain('Belum ada pesanan')
  })

  it('menampilkan error dari server', async () => {
    listMyOrders.mockRejectedValue(new Error('Belum login.'))
    const w = factory()
    await flushPromises()
    expect(w.get('[role="alert"]').text()).toContain('Belum login.')
  })
})
