
import { request } from './api'

export async function login(email, password) {
  const result = await request('/auth/login', {
    method: 'POST',
    body: { email, password },
  })

  return result
}

export async function register(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: payload,
  })
}

export async function getCurrentUser() {
  return request('/auth/me')
}
