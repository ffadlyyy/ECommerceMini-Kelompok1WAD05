// Autentikasi ke FastAPI (/auth/...). Selalu memakai API asli, juga saat VITE_USE_MOCK=true.
import { request } from './api'

/** -> { access_token, token_type } · 401 bila email/password salah */
export const login = (email, password) => request('/auth/login', { method: 'POST', body: { email, password } })

/** payload: { full_name, email, password } -> user · 409 bila email sudah terdaftar */
export const register = (payload) => request('/auth/register', { method: 'POST', body: payload })

/** -> { id, full_name, email, role, created_at } (butuh token) */
export const me = () => request('/auth/me')
