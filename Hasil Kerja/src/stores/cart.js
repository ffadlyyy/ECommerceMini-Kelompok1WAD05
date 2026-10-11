// ==========================================================================
// STUB — milik Task 4 (Arico). Agar tombol "Tambah" dan badge keranjang di
// navbar bisa berfungsi sekarang, versi sementara ini menyimpan item di
// localStorage. Arico: ganti dengan versi yang memanggil API /cart, tapi
// PERTAHANKAN:
//   - state  `totalItems`            (jumlah seluruh quantity, untuk badge)
//   - action `addItem(product, qty)` (product = objek produk dari API)
// ==========================================================================
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'cart_stub'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref(load()) // [{ product_id, name, price, quantity }]

  const totalItems = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
    } catch {
      /* abaikan */
    }
  }

  function addItem(product, quantity = 1) {
    const existing = items.value.find((i) => i.product_id === product.id)
    const max = product.stock ?? Infinity
    if (existing) existing.quantity = Math.min(max, existing.quantity + quantity)
    else items.value.push({ product_id: product.id, name: product.name, price: product.price, quantity: Math.min(max, quantity) })
    persist()
  }

  return { items, totalItems, addItem }
})
