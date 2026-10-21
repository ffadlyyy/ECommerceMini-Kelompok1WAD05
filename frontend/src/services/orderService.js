// Pesanan milik customer yang sedang login (wajib JWT).
import { request } from './api'
import { USE_MOCK } from './productService'
import * as mock from './mockOrderService'

/** -> [order] terbaru dulu */
export const listMyOrders = () => (USE_MOCK ? mock.listMyOrders() : request('/orders'))

export const getMyOrder = (id) => (USE_MOCK ? mock.getMyOrder(id) : request(`/orders/${id}`))
