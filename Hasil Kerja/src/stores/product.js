import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as productService from '@/services/productService'

export const PAGE_SIZE = 9

export const useProductStore = defineStore('products', () => {
  // ---- kategori ----
  const categories = ref([])

  // ---- daftar produk (katalog) ----
  const products = ref([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(PAGE_SIZE)
  const loading = ref(false)
  const error = ref('')
  let listRequestId = 0

  // ---- produk unggulan (homepage), terpisah supaya tidak bentrok dengan katalog ----
  const featured = ref([])
  const featuredLoading = ref(false)
  const featuredError = ref('')

  // ---- detail produk + review ----
  const current = ref(null)
  const currentLoading = ref(false)
  const currentError = ref('')
  const reviews = ref([])
  const reviewsLoading = ref(false)
  const reviewSubmitting = ref(false)
  let detailRequestId = 0

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

  async function fetchCategories() {
    if (categories.value.length) return
    try {
      categories.value = await productService.listCategories()
    } catch {
      /* non-fatal: filter kategori kosong saja */
    }
  }

  /** params: { q, category, sort, page } */
  async function fetchProducts(params = {}) {
    const requestId = ++listRequestId
    loading.value = true
    error.value = ''
    try {
      const res = await productService.listProducts({ page_size: PAGE_SIZE, ...params })
      if (requestId !== listRequestId) return // respons lama (user mengetik cepat), abaikan
      products.value = res.items
      total.value = res.total
      page.value = res.page
      pageSize.value = res.page_size
    } catch (e) {
      if (requestId !== listRequestId) return
      products.value = []
      total.value = 0
      error.value = e.message || 'Gagal memuat produk.'
    } finally {
      if (requestId === listRequestId) loading.value = false
    }
  }

  async function fetchFeatured(limit = 6) {
    featuredLoading.value = true
    featuredError.value = ''
    try {
      const res = await productService.listProducts({ sort: 'newest', page: 1, page_size: limit })
      featured.value = res.items
    } catch (e) {
      featuredError.value = e.message || 'Gagal memuat produk.'
    } finally {
      featuredLoading.value = false
    }
  }

  async function fetchProduct(id) {
    const requestId = ++detailRequestId
    currentLoading.value = true
    currentError.value = ''
    current.value = null
    try {
      const product = await productService.getProduct(id)
      if (requestId === detailRequestId) current.value = product
    } catch (e) {
      if (requestId === detailRequestId) currentError.value = e.message || 'Gagal memuat produk.'
    } finally {
      if (requestId === detailRequestId) currentLoading.value = false
    }
  }

  async function fetchReviews(productId) {
    reviewsLoading.value = true
    try {
      reviews.value = await productService.listReviews(productId)
    } catch {
      reviews.value = []
    } finally {
      reviewsLoading.value = false
    }
  }

  /** Melempar error ke pemanggil supaya form bisa menampilkan pesannya. */
  async function submitReview(productId, payload) {
    reviewSubmitting.value = true
    try {
      await productService.createReview(productId, payload)
      const [list, product] = await Promise.all([
        productService.listReviews(productId),
        productService.getProduct(productId),
      ])
      reviews.value = list
      current.value = product // rating rata-rata ikut diperbarui
    } finally {
      reviewSubmitting.value = false
    }
  }

  return {
    categories, products, total, page, pageSize, loading, error, totalPages,
    featured, featuredLoading, featuredError,
    current, currentLoading, currentError, reviews, reviewsLoading, reviewSubmitting,
    fetchCategories, fetchProducts, fetchFeatured, fetchProduct, fetchReviews, submitReview,
  }
})
