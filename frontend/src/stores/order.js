// Riwayat pesanan customer (Task 5).
import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as orderService from '@/services/orderService'

export const useOrderStore = defineStore('orders', () => {
  const orders = ref([])
  const loading = ref(false)
  const error = ref('')

  async function fetchOrders() {
    loading.value = true
    error.value = ''
    try {
      orders.value = await orderService.listMyOrders()
    } catch (e) {
      orders.value = []
      error.value = e.message || 'Gagal memuat riwayat pesanan.'
    } finally {
      loading.value = false
    }
  }

  return { orders, loading, error, fetchOrders }
})
