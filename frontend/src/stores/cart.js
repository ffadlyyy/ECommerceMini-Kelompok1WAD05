// Keranjang belanja (Task 4).
// - Belum login: disimpan di localStorage (keranjang tamu).
// - Sudah login: memakai API /cart; isi keranjang tamu digabung ke server saat login.
// Komponen lain memakai `totalItems` dan `addItem(product, qty)` — jangan ganti nama ini.
import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import * as cartService from '@/services/cartService'
import { useAuthStore } from './auth'

const STORAGE_KEY = 'cart_stub'

function loadGuest() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

function saveGuest(items) {
  try {
    if (items.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* abaikan */
  }
}

export const useCartStore = defineStore('cart', () => {
  const auth = useAuthStore()

  // Bentuk item sama untuk dua mode: { id, product_id, name, price, image_url, stock, quantity, line_total }
  // Keranjang tamu tidak punya id server, jadi id = null.
  const items = ref([])
  const loading = ref(false)
  const error = ref('')
  const mergeWarning = ref('')
  const isServer = computed(() => !!auth.user)

  const totalItems = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
  const subtotal = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0))
  const hasStockProblem = computed(() => items.value.some((i) => i.stock != null && i.quantity > i.stock))

  function applyServerCart(cart) {
    items.value = cart.items
  }

  function setGuestItems(next) {
    items.value = next.map((i) => ({ ...i, id: null, line_total: i.price * i.quantity }))
    saveGuest(items.value)
  }

  async function fetchCart() {
    if (!isServer.value) {
      setGuestItems(loadGuest())
      return
    }
    loading.value = true
    error.value = ''
    try {
      applyServerCart(await cartService.getCart())
    } catch (e) {
      error.value = e.message || 'Gagal memuat keranjang.'
    } finally {
      loading.value = false
    }
  }

  /** Pindahkan isi keranjang tamu ke server. Item yang stoknya tidak cukup dilewati. */
  async function mergeGuestCart() {
    const guest = loadGuest()
    if (!guest.length) return
    const skipped = []
    for (const it of guest) {
      try {
        await cartService.addItem(it.product_id, it.quantity)
      } catch {
        skipped.push(it.name)
      }
    }
    saveGuest([])
    if (skipped.length) mergeWarning.value = `Sebagian barang tidak bisa dipindahkan ke keranjangmu: ${skipped.join(', ')}.`
  }

  /** Melempar error (mis. stok tidak cukup) ke pemanggil. */
  async function addItem(product, quantity = 1) {
    if (isServer.value) {
      applyServerCart(await cartService.addItem(product.id, quantity))
      return
    }
    const next = items.value.map((i) => ({ ...i }))
    const existing = next.find((i) => i.product_id === product.id)
    const max = product.stock ?? Infinity
    if ((existing?.quantity ?? 0) + quantity > max) {
      const err = new Error(`Stok tidak cukup. Tersisa ${max}.`)
      err.status = 400
      throw err
    }
    if (existing) existing.quantity += quantity
    else
      next.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url ?? null,
        stock: product.stock ?? null,
        quantity,
      })
    setGuestItems(next)
  }

  async function updateQuantity(item, quantity) {
    if (isServer.value) {
      applyServerCart(await cartService.updateItem(item.id, quantity))
      return
    }
    setGuestItems(items.value.map((i) => (i.product_id === item.product_id ? { ...i, quantity } : i)))
  }

  async function removeItem(item) {
    if (isServer.value) {
      applyServerCart(await cartService.removeItem(item.id))
      return
    }
    setGuestItems(items.value.filter((i) => i.product_id !== item.product_id))
  }

  /** Setelah checkout, server sudah mengosongkan keranjang. */
  function clear() {
    items.value = []
    if (!isServer.value) saveGuest([])
  }

  // Login -> gabungkan keranjang tamu lalu muat dari server. Logout -> kembali ke keranjang tamu (kosong).
  watch(
    () => auth.user?.id,
    async (userId) => {
      if (userId) await mergeGuestCart()
      await fetchCart()
    },
    { immediate: true },
  )

  return {
    items, loading, error, mergeWarning, isServer, totalItems, subtotal, hasStockProblem,
    fetchCart, addItem, updateQuantity, removeItem, clear,
  }
})
