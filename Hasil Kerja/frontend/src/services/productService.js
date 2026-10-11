// Satu-satunya pintu frontend ke data produk.
// VITE_USE_MOCK=false -> pakai API FastAPI; selain itu -> data mock.
import { request } from './api'
import * as mock from './mockProductService'

export const USE_MOCK = import.meta.env?.VITE_USE_MOCK !== 'false'

export const listCategories = () => (USE_MOCK ? mock.listCategories() : request('/categories'))

/** params: { q, category, sort, page, page_size } -> { items, total, page, page_size } */
export const listProducts = (params) => (USE_MOCK ? mock.listProducts(params) : request('/products', { params }))

export const getProduct = (id) => (USE_MOCK ? mock.getProduct(id) : request(`/products/${id}`))

export const listReviews = (productId) =>
  USE_MOCK ? mock.listReviews(productId) : request(`/products/${productId}/reviews`)

/** Butuh login (JWT). payload: { rating: 1..5, comment: string } */
export const createReview = (productId, payload) =>
  USE_MOCK ? mock.createReview(productId, payload) : request(`/products/${productId}/reviews`, { method: 'POST', body: payload })
