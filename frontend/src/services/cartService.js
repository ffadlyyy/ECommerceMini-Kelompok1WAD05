// Keranjang, checkout, dan simulasi pembayaran (Task 4). Semua butuh login,
// jadi selalu memakai API asli — juga saat VITE_USE_MOCK=true.
import { request } from './api'

/** -> { items: [{ id, product_id, name, price, image_url, stock, quantity, line_total }], total_items, subtotal } */
export const getCart = () => request('/cart')

export const addItem = (productId, quantity) =>
  request('/cart/items', { method: 'POST', body: { product_id: productId, quantity } })

/** itemId = id item keranjang, bukan product_id */
export const updateItem = (itemId, quantity) => request(`/cart/items/${itemId}`, { method: 'PATCH', body: { quantity } })

export const removeItem = (itemId) => request(`/cart/items/${itemId}`, { method: 'DELETE' })

/** payload: { shipping_name, shipping_phone, shipping_address, shipping_city, shipping_postal_code } -> order */
export const checkout = (payload) => request('/orders/checkout', { method: 'POST', body: payload })

export const getOrder = (id) => request(`/orders/${id}`)

/** result: 'success' | 'failed' -> order */
export const payOrder = (id, result = 'success') => request(`/orders/${id}/pay`, { method: 'POST', body: { result } })
