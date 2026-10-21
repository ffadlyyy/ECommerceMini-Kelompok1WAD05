
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { request } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const subtotal = ref(0)
  const loading = ref(false)

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  function applyCart(data) {
    items.value = data.items ?? []
    subtotal.value = data.subtotal ?? 0
  }

  async function fetchCart() {
    const auth = useAuthStore()

    if (!auth.token) {
      items.value = []
      subtotal.value = 0
      return
    }

    loading.value = true

    try {
      const data = await request('/cart')
      applyCart(data)
      return data
    } finally {
      loading.value = false
    }
  }

  async function addItem(product, quantity = 1) {
    const auth = useAuthStore()

    if (!auth.token) {
      throw new Error('Silakan login terlebih dahulu.')
    }

    const productId = product.product_id ?? product.id

    if (!productId) {
      throw new Error('ID produk tidak ditemukan.')
    }

    const data = await request('/cart/items', {
      method: 'POST',
      body: {
        product_id: productId,
        quantity,
      },
    })

    applyCart(data)
    return data
  }

  async function updateItem(itemId, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error('Jumlah barang minimal 1.')
    }

    const data = await request(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: { quantity },
    })

    applyCart(data)
    return data
  }

  async function removeItem(itemId) {
    const data = await request(`/cart/items/${itemId}`, {
      method: 'DELETE',
    })

    applyCart(data)
    return data
  }

  function resetCart() {
    items.value = []
    subtotal.value = 0
  }

  return {
    items,
    subtotal,
    loading,
    totalItems,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    resetCart,
  }
})
