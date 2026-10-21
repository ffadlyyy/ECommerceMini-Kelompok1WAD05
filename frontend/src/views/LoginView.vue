
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, getCurrentUser } from '@/services/authService'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''
  loading.value = true

  try {
    const result = await login(email.value.trim(), password.value)

    if (!result?.access_token) {
      throw new Error('Token login tidak ditemukan dari server.')
    }

    // Simpan token agar request /auth/me menggunakan token baru.
    auth.setSession(result.access_token, null)

    try {
      const user = await getCurrentUser()
      auth.setSession(result.access_token, user)
    } catch (error) {
      auth.logout()
      throw error
    }

    await router.replace({ name: 'home' })
  } catch (error) {
    errorMessage.value =
      error.message || 'Login gagal. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="login-page">
    <form class="login-card" @submit.prevent="handleLogin">
      <p class="eyebrow">SELAMAT DATANG DI NOOK</p>
      <h1>Masuk ke akunmu</h1>
      <p class="subtitle">
        Masuk untuk melanjutkan belanja dan mengakses keranjangmu.
      </p>

      <label for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        placeholder="nama@email.com"
        autocomplete="email"
        required
      />

      <label for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        placeholder="Masukkan password"
        autocomplete="current-password"
        required
      />

      <p v-if="errorMessage" class="error-message" role="alert">
        {{ errorMessage }}
      </p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Memproses...' : 'Masuk' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.login-page {
  min-height: 70vh;
  display: grid;
  place-items: center;
  padding: 48px 20px;
  background: #f4f1e9;
}

.login-card {
  width: 100%;
  max-width: 440px;
  padding: 36px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
}

.eyebrow {
  color: #81745e;
  font-size: 12px;
  letter-spacing: 1.5px;
  font-weight: 700;
}

h1 {
  margin: 12px 0;
  color: #292820;
  font-size: 28px;
}

.subtitle {
  margin-bottom: 28px;
  color: #777;
  line-height: 1.6;
}

label {
  display: block;
  margin: 16px 0 8px;
  font-size: 14px;
  font-weight: 600;
}

input {
  box-sizing: border-box;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d8d5cc;
  border-radius: 8px;
  font: inherit;
}

input:focus {
  outline: 2px solid #a59a80;
  outline-offset: 1px;
}

button {
  width: 100%;
  margin-top: 24px;
  padding: 13px;
  border: 0;
  border-radius: 8px;
  background: #39372e;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.error-message {
  margin-top: 16px;
  color: #b42318;
  font-size: 14px;
}
</style>
