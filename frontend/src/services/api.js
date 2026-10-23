// Pembungkus fetch untuk memanggil backend FastAPI.
const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000'
export const TOKEN_KEY = 'access_token'

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Dipanggil saat server menolak token yang dikirim (kedaluwarsa / tidak valid).
// Didaftarkan oleh stores/auth.js supaya sesi dibersihkan.
let onUnauthorized = null
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

/**
 * @param {string} path  contoh '/products'
 * @param {{method?: string, params?: object, body?: object}} options
 */
export async function request(path, { method = 'GET', params, body } = {}) {
  // BASE_URL boleh absolut (http://localhost:8000) atau relatif (/api, di-proxy Caddy)
  const url = new URL(BASE_URL.replace(/\/$/, '') + path, window.location.origin)
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
  }

  const headers = { Accept: 'application/json' }
  if (body) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi Anda.')
  }

  if (response.status === 401 && token) onUnauthorized?.()

  if (!response.ok) {
    let message = `Permintaan gagal (${response.status})`
    try {
      const data = await response.json()
      // FastAPI: { detail: "..." } atau { detail: [ { msg } ] }
      if (typeof data.detail === 'string') message = data.detail
      else if (Array.isArray(data.detail) && data.detail[0]?.msg) message = data.detail[0].msg
    } catch {
      /* body bukan JSON */
    }
    throw new ApiError(message, response.status)
  }

  return response.status === 204 ? null : response.json()
}
