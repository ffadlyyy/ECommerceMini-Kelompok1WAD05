// Implementasi palsu dari API pesanan — dipakai saat VITE_USE_MOCK !== 'false'.
// Kontrak sama dengan orderService.js dan adminService.js (lihat backend/README.md).
import { DEMO_CUSTOMER, seedOrders } from '@/mocks/data'
import { ApiError } from './api'

const DELAY = import.meta.env?.MODE === 'test' ? 0 : 350
export const wait = () => new Promise((resolve) => setTimeout(resolve, DELAY))

// State bersama dengan mockAdminService (admin mengubah status -> riwayat customer ikut berubah).
export const orders = structuredClone(seedOrders)

const newestFirst = (a, b) => new Date(b.created_at) - new Date(a.created_at) || b.id - a.id

function toCustomerOrder(order) {
  const { customer_name, customer_email, ...rest } = structuredClone(order)
  return rest
}

const isMine = (o) => o.customer_email === DEMO_CUSTOMER.email

export async function listMyOrders() {
  await wait()
  return orders.filter(isMine).sort(newestFirst).map(toCustomerOrder)
}

export async function getMyOrder(id) {
  await wait()
  const order = orders.find((o) => o.id === Number(id) && isMine(o))
  if (!order) throw new ApiError('Order tidak ditemukan.', 404)
  return toCustomerOrder(order)
}
