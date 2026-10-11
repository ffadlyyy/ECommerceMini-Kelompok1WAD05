// ==========================================================================
// STUB — milik Task 2 (Fadly). Ridho hanya butuh tiga hal ini untuk UI:
//   isAuthenticated, isAdmin, user?.name
// Fadly: ganti isi file ini dengan implementasi sebenarnya (login/register ke
// FastAPI, simpan token), tapi PERTAHANKAN nama-nama di atas agar navbar,
// form review, dan route guard tidak perlu diubah.
// ==========================================================================
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { TOKEN_KEY } from '@/services/api'

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(readToken())
  const user = ref(null) // { id, name, email, role: 'customer' | 'admin' }

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setSession(newToken, newUser) {
    token.value = newToken
    user.value = newUser
    try {
      localStorage.setItem(TOKEN_KEY, newToken)
    } catch {
      /* abaikan */
    }
  }

  function logout() {
    token.value = null
    user.value = null
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* abaikan */
    }
  }

  return { token, user, isAuthenticated, isAdmin, setSession, logout }
})
