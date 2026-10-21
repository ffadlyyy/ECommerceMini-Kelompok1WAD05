// Endpoint /admin/... (wajib JWT ber-role admin). Daftar produk memakai GET /products biasa.
import { request } from './api'
import { USE_MOCK } from './productService'
import * as mock from './mockAdminService'

/** -> { total_revenue, total_orders, daily_sales: [{date, revenue, orders}], category_sales: [...] } */
export const getSalesSummary = () => (USE_MOCK ? mock.getSalesSummary() : request('/admin/sales-summary'))

/** params: { status } -> [order + customer_name, customer_email] */
export const listOrders = (params) => (USE_MOCK ? mock.listOrders(params) : request('/admin/orders', { params }))

export const updateOrderStatus = (id, status) =>
  USE_MOCK ? mock.updateOrderStatus(id, status) : request(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status } })

/** payload: { name, description, price, stock, image_url, is_new, category_id } */
export const createProduct = (payload) =>
  USE_MOCK ? mock.createProduct(payload) : request('/admin/products', { method: 'POST', body: payload })

export const updateProduct = (id, payload) =>
  USE_MOCK ? mock.updateProduct(id, payload) : request(`/admin/products/${id}`, { method: 'PUT', body: payload })

export const deleteProduct = (id) =>
  USE_MOCK ? mock.deleteProduct(id) : request(`/admin/products/${id}`, { method: 'DELETE' })
