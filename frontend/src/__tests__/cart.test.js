import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ApiError } from '@/services/api'

const cartApi = { getCart: vi.fn(), addItem: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn() }
vi.mock('@/services/cartService', () => ({
  getCart: (...a) => cartApi.getCart(...a),
  addItem: (...a) => cartApi.addItem(...a),
  updateItem: (...a) => cartApi.updateItem(...a),
  removeItem: (...a) => cartApi.removeItem(...a),
}))
vi.mock('@/services/authService', () => ({ login: vi.fn(), register: vi.fn(), me: vi.fn() }))

const { useCartStore } = await import('@/stores/cart')
const { useAuthStore } = await import('@/stores/auth')

const lamp = { id: 1, name: 'Lampu Meja Linen', price: 620000, stock: 3, image_url: null }
const mug = { id: 3, name: 'Set Mug Keramik', price: 290000, stock: 40, image_url: null }
const serverCart = (items) => ({
  items,
  total_items: items.reduce((s, i) => s + i.quantity, 0),
  subtotal: items.reduce((s, i) => s + i.line_total, 0),
})
const line = (id, p, quantity) => ({ id, product_id: p.id, name: p.name, price: p.price, image_url: null, stock: p.stock, quantity, line_total: p.price * quantity })

function loginAs(id = 7) {
  useAuthStore().setSession('jwt', { id, name: 'Budi', role: 'customer' })
}

describe('cart store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    Object.values(cartApi).forEach((fn) => fn.mockReset())
  })

  it('tamu: disimpan di localStorage dan menghitung total', async () => {
    const cart = useCartStore()
    await cart.addItem(lamp, 2)
    await cart.addItem(mug, 1)
    await cart.addItem(lamp, 1)
    expect(cart.totalItems).toBe(4)
    expect(cart.subtotal).toBe(620000 * 3 + 290000)
    expect(JSON.parse(localStorage.getItem('cart_stub'))).toHaveLength(2)
    expect(cartApi.addItem).not.toHaveBeenCalled()
  })

  it('tamu: menolak jumlah melebihi stok', async () => {
    const cart = useCartStore()
    await cart.addItem(lamp, 3)
    await expect(cart.addItem(lamp, 1)).rejects.toThrow('Stok tidak cukup. Tersisa 3.')
    expect(cart.totalItems).toBe(3)
  })

  it('login: keranjang tamu digabung ke server lalu dimuat dari API', async () => {
    const cart = useCartStore()
    await cart.addItem(lamp, 2)
    cartApi.addItem.mockResolvedValue(serverCart([line(11, lamp, 2)]))
    cartApi.getCart.mockResolvedValue(serverCart([line(11, lamp, 2), line(12, mug, 1)]))

    loginAs()
    await flushPromises()

    expect(cartApi.addItem).toHaveBeenCalledWith(1, 2)
    expect(localStorage.getItem('cart_stub')).toBeNull()
    expect(cart.isServer).toBe(true)
    expect(cart.totalItems).toBe(3)
  })

  it('login: barang yang gagal dipindahkan dilaporkan', async () => {
    const cart = useCartStore()
    await cart.addItem(lamp, 2)
    cartApi.addItem.mockRejectedValue(new ApiError('Stok tidak cukup. Tersisa 1.', 400))
    cartApi.getCart.mockResolvedValue(serverCart([]))
    loginAs()
    await flushPromises()
    expect(cart.mergeWarning).toContain('Lampu Meja Linen')
  })

  it('sudah login: ubah jumlah dan hapus memakai id item keranjang', async () => {
    cartApi.getCart.mockResolvedValue(serverCart([line(11, lamp, 1)]))
    loginAs()
    const cart = useCartStore()
    await flushPromises()

    cartApi.updateItem.mockResolvedValue(serverCart([line(11, lamp, 2)]))
    await cart.updateQuantity(cart.items[0], 2)
    expect(cartApi.updateItem).toHaveBeenCalledWith(11, 2)
    expect(cart.totalItems).toBe(2)

    cartApi.removeItem.mockResolvedValue(serverCart([]))
    await cart.removeItem(cart.items[0])
    expect(cartApi.removeItem).toHaveBeenCalledWith(11)
    expect(cart.items).toEqual([])
  })

  it('stok yang berubah ditandai sebagai masalah', async () => {
    cartApi.getCart.mockResolvedValue(serverCart([{ ...line(11, lamp, 3), stock: 1 }]))
    loginAs()
    const cart = useCartStore()
    await flushPromises()
    expect(cart.hasStockProblem).toBe(true)
  })

  it('logout kembali ke keranjang tamu yang kosong', async () => {
    cartApi.getCart.mockResolvedValue(serverCart([line(11, lamp, 1)]))
    loginAs()
    const cart = useCartStore()
    await flushPromises()
    useAuthStore().logout()
    await flushPromises()
    expect(cart.isServer).toBe(false)
    expect(cart.items).toEqual([])
  })
})
