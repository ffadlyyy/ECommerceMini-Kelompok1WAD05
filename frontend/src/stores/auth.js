
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const TOKEN_KEY = 'access_token'
const USER_KEY = 'user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(
    (() => {
      try {
        return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
      } catch {
        return null
      }
    })()
  )

  const isAuthenticated = computed(() => Boolean(token.value))

  function setSession(accessToken, userData = null) {
    token.value = accessToken || ''
    user.value = userData

    if (token.value) {
      localStorage.setItem(TOKEN_KEY, token.value)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }

    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }

  function logout() {
    setSession('', null)

    // Kosongkan tampilan keranjang di browser.
    // Data keranjang di database tidak dihapus.
    import('@/stores/cart').then(({ useCartStore }) => {
      useCartStore().resetCart()
    })
  }

  return {
    token,
    user,
    isAuthenticated,
    setSession,
    logout,
  }
})
