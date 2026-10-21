// Dashboard admin (Task 5): ringkasan penjualan, manajemen pesanan, dan CRUD produk.
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as adminService from '@/services/adminService'
import * as productService from '@/services/productService'

export const ADMIN_PAGE_SIZE = 10

export const useAdminStore = defineStore('admin', () => {
  // ---- ringkasan penjualan ----
  const summary = ref(null)
  const summaryLoading = ref(false)
  const summaryError = ref('')

  // ---- pesanan ----
  const orders = ref([])
  const ordersLoading = ref(false)
  const ordersError = ref('')

  // ---- produk ----
  const products = ref([])
  const productsTotal = ref(0)
  const productsPage = ref(1)
  const productsLoading = ref(false)
  const productsError = ref('')
  let productsRequestId = 0

  const productsTotalPages = computed(() => Math.max(1, Math.ceil(productsTotal.value / ADMIN_PAGE_SIZE)))

  async function fetchSummary() {
    summaryLoading.value = true
    summaryError.value = ''
    try {
      summary.value = await adminService.getSalesSummary()
    } catch (e) {
      summaryError.value = e.message || 'Gagal memuat ringkasan penjualan.'
    } finally {
      summaryLoading.value = false
    }
  }

  async function fetchOrders() {
    ordersLoading.value = true
    ordersError.value = ''
    try {
      orders.value = await adminService.listOrders()
    } catch (e) {
      orders.value = []
      ordersError.value = e.message || 'Gagal memuat pesanan.'
    } finally {
      ordersLoading.value = false
    }
  }

  /** Melempar error ke pemanggil supaya halaman bisa menampilkan pesannya. */
  async function updateOrderStatus(id, status) {
    const updated = await adminService.updateOrderStatus(id, status)
    const index = orders.value.findIndex((o) => o.id === updated.id)
    if (index !== -1) orders.value[index] = updated
    summary.value = null // ringkasan perlu dimuat ulang
    return updated
  }

  /** params: { q, page } */
  async function fetchProducts(params = {}) {
    const requestId = ++productsRequestId
    productsLoading.value = true
    productsError.value = ''
    try {
      const res = await productService.listProducts({ sort: 'newest', page_size: ADMIN_PAGE_SIZE, ...params })
      if (requestId !== productsRequestId) return
      products.value = res.items
      productsTotal.value = res.total
      productsPage.value = res.page
    } catch (e) {
      if (requestId !== productsRequestId) return
      products.value = []
      productsTotal.value = 0
      productsError.value = e.message || 'Gagal memuat produk.'
    } finally {
      if (requestId === productsRequestId) productsLoading.value = false
    }
  }

  /** id kosong -> tambah produk baru. Melempar error ke pemanggil. */
  function saveProduct(payload, id = null) {
    return id ? adminService.updateProduct(id, payload) : adminService.createProduct(payload)
  }

  function deleteProduct(id) {
    return adminService.deleteProduct(id)
  }

  return {
    summary, summaryLoading, summaryError,
    orders, ordersLoading, ordersError,
    products, productsTotal, productsPage, productsLoading, productsError, productsTotalPages,
    fetchSummary, fetchOrders, updateOrderStatus,
    fetchProducts, saveProduct, deleteProduct,
  }
})
