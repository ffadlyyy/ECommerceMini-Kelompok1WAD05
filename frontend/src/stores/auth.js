// Sesi login (Task 2). Token JWT disimpan di localStorage dan dikirim otomatis oleh services/api.js.
// Komponen lain memakai: isAuthenticated, isAdmin, user?.name — jangan ganti nama-nama ini.
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { TOKEN_KEY, setUnauthorizedHandler } from '@/services/api'
import * as authService from '@/services/authService'

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function writeToken(value) {
  try {
    if (value) localStorage.setItem(TOKEN_KEY, value)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* abaikan */
  }
}

// Respons /auth/me -> bentuk yang dipakai UI (`name` dipertahankan untuk kompatibilitas)
const toUser = (u) => ({ id: u.id, name: u.full_name, full_name: u.full_name, email: u.email, role: u.role })

export const useAuthStore = defineStore('auth', () => {
  const token = ref(readToken())
  const user = ref(null) // { id, name, full_name, email, role: 'customer' | 'admin' }
  let pendingMe = null

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setSession(newToken, newUser = null) {
    token.value = newToken
    user.value = newUser
    writeToken(newToken)
  }

  function logout() {
    token.value = null
    user.value = null
    writeToken(null)
  }

  // Token ditolak server di request mana pun -> sesi berakhir
  setUnauthorizedHandler(logout)

  /** Memuat data akun dari token yang tersimpan. Aman dipanggil berkali-kali. */
  function fetchMe() {
    if (!token.value) return Promise.resolve(null)
    if (user.value) return Promise.resolve(user.value)
    pendingMe ??= authService
      .me()
      .then((u) => (user.value = toUser(u)))
      .catch((e) => {
        if (e.status === 401) logout()
        throw e
      })
      .finally(() => (pendingMe = null))
    return pendingMe
  }

  /** Melempar error (mis. 401 "Email atau password salah.") ke pemanggil. */
  async function login(email, password) {
    const { access_token } = await authService.login(email.trim().toLowerCase(), password)
    setSession(access_token)
    try {
      await fetchMe()
    } catch (e) {
      logout()
      throw e
    }
    return user.value
  }

  /** Daftar lalu langsung masuk. */
  async function register({ full_name, email, password }) {
    await authService.register({ full_name: full_name.trim(), email: email.trim().toLowerCase(), password })
    return login(email, password)
  }

  return { token, user, isAuthenticated, isAdmin, setSession, logout, fetchMe, login, register }
})
