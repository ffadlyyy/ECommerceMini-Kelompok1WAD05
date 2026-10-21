import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import ProductCard from '@/components/product/ProductCard.vue'
import { useCartStore } from '@/stores/cart'

const product = {
  id: 1,
  name: 'Lampu Meja Linen',
  price: 620000,
  stock: 14,
  icon: 'lamp',
  image_url: null,
  is_new: true,
  category: { id: 2, name: 'Pencahayaan', slug: 'pencahayaan' },
  rating_avg: 4.5,
  rating_count: 2,
}

function factory(overrides = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/products/:id', name: 'product-detail', component: { template: '<div />' } }],
  })
  return mount(ProductCard, {
    props: { product: { ...product, ...overrides } },
    global: { plugins: [router] },
  })
}

describe('ProductCard', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('menampilkan nama, kategori, harga, dan tautan ke detail', () => {
    const w = factory()
    expect(w.text()).toContain('Lampu Meja Linen')
    expect(w.text()).toContain('Pencahayaan')
    expect(w.text().replace(/\s/g, ' ')).toContain('Rp 620.000')
    expect(w.find('a[href="/products/1"]').exists()).toBe(true)
  })

  it('tombol Tambah memasukkan produk ke keranjang', async () => {
    const w = factory()
    await w.get('button').trigger('click')
    await flushPromises()
    expect(useCartStore().totalItems).toBe(1)
    expect(w.get('button').text()).toBe('Ditambahkan')
  })

  it('menampilkan pesan bila jumlah melebihi stok', async () => {
    const w = factory({ stock: 1 })
    await w.get('button').trigger('click')
    await w.get('button').trigger('click')
    await flushPromises()
    expect(useCartStore().totalItems).toBe(1)
    expect(w.get('[role="alert"]').text()).toBe('Stok tidak cukup. Tersisa 1.')
  })

  it('produk dengan stok 0 tidak bisa ditambahkan', () => {
    const w = factory({ stock: 0 })
    expect(w.get('button').attributes('disabled')).toBeDefined()
    expect(w.text()).toContain('Habis')
  })
})
