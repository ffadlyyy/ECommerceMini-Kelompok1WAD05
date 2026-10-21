// Implementasi palsu dari API admin (/admin/...) — dipakai saat VITE_USE_MOCK !== 'false'.
import { categories, products } from '@/mocks/data'
import { SALES_STATUSES, nextStatuses } from '@/utils/orderStatus'
import { ApiError } from './api'
import { orders, wait } from './mockOrderService'

const newestFirst = (a, b) => new Date(b.created_at) - new Date(a.created_at) || b.id - a.id

export async function getSalesSummary() {
  await wait()
  const sold = orders.filter((o) => SALES_STATUSES.includes(o.status))

  const daily = new Map()
  const byCategory = new Map()
  for (const o of sold) {
    const date = o.created_at.slice(0, 10)
    const day = daily.get(date) ?? { date, revenue: 0, orders: 0 }
    day.revenue += o.total_amount
    day.orders += 1
    daily.set(date, day)

    for (const it of o.items) {
      const category = products.find((p) => p.id === it.product_id)?.category
      if (!category) continue
      const row = byCategory.get(category.id) ?? { category_id: category.id, category_name: category.name, revenue: 0, quantity_sold: 0 }
      row.revenue += it.price * it.quantity
      row.quantity_sold += it.quantity
      byCategory.set(category.id, row)
    }
  }

  return {
    total_revenue: sold.reduce((sum, o) => sum + o.total_amount, 0),
    total_orders: sold.length,
    daily_sales: [...daily.values()].sort((a, b) => a.date.localeCompare(b.date)),
    category_sales: [...byCategory.values()],
  }
}

export async function listOrders({ status } = {}) {
  await wait()
  return orders
    .filter((o) => !status || o.status === status)
    .sort(newestFirst)
    .map((o) => structuredClone(o))
}

export async function updateOrderStatus(id, status) {
  await wait()
  const order = orders.find((o) => o.id === Number(id))
  if (!order) throw new ApiError('Order tidak ditemukan.', 404)
  if (!nextStatuses(order.status).includes(status)) {
    throw new ApiError(`Status '${order.status}' tidak bisa diubah menjadi '${status}'.`, 409)
  }
  if (status === 'paid') order.payment_status = 'paid'
  if (status === 'cancelled') {
    for (const it of order.items) {
      const p = products.find((x) => x.id === it.product_id)
      if (p) p.stock += it.quantity
    }
    if (order.payment_status === 'paid') order.payment_status = 'refunded'
  }
  order.status = status
  return structuredClone(order)
}

function toProductOut(p) {
  return { ...p, image_url: p.image_url ?? null, rating_avg: 0, rating_count: 0 }
}

function categoryOf(categoryId) {
  const category = categories.find((c) => c.id === Number(categoryId))
  if (!category) throw new ApiError('Kategori tidak valid.', 400)
  return category
}

export async function createProduct(payload) {
  await wait()
  const product = {
    id: Math.max(0, ...products.map((p) => p.id)) + 1,
    name: payload.name,
    description: payload.description ?? '',
    price: payload.price,
    stock: payload.stock,
    image_url: payload.image_url ?? null,
    is_new: payload.is_new ?? true,
    created_at: new Date().toISOString(),
    category: categoryOf(payload.category_id),
  }
  products.push(product)
  return toProductOut(product)
}

export async function updateProduct(id, payload) {
  await wait()
  const product = products.find((p) => p.id === Number(id))
  if (!product) throw new ApiError('Produk tidak ditemukan.', 404)
  const { category_id, ...rest } = payload
  if (category_id !== undefined) product.category = categoryOf(category_id)
  Object.assign(product, rest)
  return toProductOut(product)
}

export async function deleteProduct(id) {
  await wait()
  const index = products.findIndex((p) => p.id === Number(id))
  if (index === -1) throw new ApiError('Produk tidak ditemukan.', 404)
  if (orders.some((o) => o.items.some((it) => it.product_id === Number(id)))) {
    throw new ApiError('Produk sudah pernah dipesan dan tidak bisa dihapus. Ubah stok menjadi 0 untuk menonaktifkannya.', 409)
  }
  products.splice(index, 1)
  return { message: 'Produk berhasil dihapus.' }
}
