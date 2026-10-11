// Implementasi palsu dari API produk — dipakai saat VITE_USE_MOCK !== 'false'.
// Kontrak yang sama dengan productService.js (lihat docs/api-contract-frontend.md).
import { categories, products, seedReviews } from '@/mocks/data'
import { ApiError } from './api'

const DELAY = import.meta.env?.MODE === 'test' ? 0 : 350
const wait = () => new Promise((resolve) => setTimeout(resolve, DELAY))

const reviews = seedReviews.map((r) => ({ ...r }))
let nextReviewId = reviews.length + 1

function withRating(product) {
  const list = reviews.filter((r) => r.product_id === product.id)
  const count = list.length
  const avg = count ? list.reduce((sum, r) => sum + r.rating, 0) / count : 0
  const { icon, ...rest } = product
  return { ...rest, icon, image_url: null, rating_avg: Math.round(avg * 10) / 10, rating_count: count }
}

const sorters = {
  newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name, 'id'),
}

export async function listCategories() {
  await wait()
  return categories.map((c) => ({ ...c }))
}

export async function listProducts({ q = '', category = '', sort = 'newest', page = 1, page_size = 9 } = {}) {
  await wait()
  const keyword = String(q).trim().toLowerCase()
  let items = products.filter((p) => {
    if (category && p.category.slug !== category) return false
    if (!keyword) return true
    return (
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword) ||
      p.category.name.toLowerCase().includes(keyword)
    )
  })
  items = [...items].sort(sorters[sort] ?? sorters.newest)

  const size = Math.max(1, Number(page_size) || 9)
  const current = Math.max(1, Number(page) || 1)
  const start = (current - 1) * size
  return {
    items: items.slice(start, start + size).map(withRating),
    total: items.length,
    page: current,
    page_size: size,
  }
}

export async function getProduct(id) {
  await wait()
  const product = products.find((p) => p.id === Number(id))
  if (!product) throw new ApiError('Produk tidak ditemukan.', 404)
  return withRating(product)
}

export async function listReviews(productId) {
  await wait()
  return reviews
    .filter((r) => r.product_id === Number(productId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((r) => ({ ...r }))
}

export async function createReview(productId, { rating, comment }) {
  await wait()
  if (!products.some((p) => p.id === Number(productId))) throw new ApiError('Produk tidak ditemukan.', 404)
  if (!(rating >= 1 && rating <= 5)) throw new ApiError('Rating harus 1–5.', 422)
  const review = {
    id: nextReviewId++,
    product_id: Number(productId),
    user_name: 'Kamu (contoh)',
    rating,
    comment,
    created_at: new Date().toISOString(),
  }
  reviews.push(review)
  return { ...review }
}
