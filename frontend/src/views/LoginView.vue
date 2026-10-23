<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthCard from '@/components/auth/AuthCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useAuthStore } from '@/stores/auth'
import { safeRedirect } from '@/utils/redirect'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const form = reactive({ email: '', password: '' })
const errors = ref({})
const serverError = ref('')
const submitting = ref(false)

function validate() {
  const e = {}
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Masukkan email yang valid.'
  if (!form.password) e.password = 'Password wajib diisi.'
  errors.value = e
  return !Object.keys(e).length
}

async function onSubmit() {
  serverError.value = ''
  if (!validate()) return
  submitting.value = true
  try {
    const user = await auth.login(form.email, form.password)
    const fallback = { name: user?.role === 'admin' ? 'admin' : 'home' }
    router.replace(safeRedirect(route.query.redirect) ?? fallback)
  } catch (e) {
    serverError.value = e.message || 'Gagal masuk. Coba lagi.'
    form.password = ''
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthCard title="Masuk" subtitle="Masuk untuk checkout dan melihat riwayat pesananmu.">
    <form class="form" novalidate @submit.prevent="onSubmit">
      <BaseInput v-model="form.email" label="Email" type="email" required :error="errors.email" placeholder="nama@email.com" />
      <BaseInput v-model="form.password" label="Password" type="password" required :error="errors.password" />
      <p v-if="serverError" class="form__error" role="alert">{{ serverError }}</p>
      <BaseButton type="submit" block :disabled="submitting">{{ submitting ? 'Memproses…' : 'Masuk' }}</BaseButton>
    </form>

    <template #footer>
      Belum punya akun?
      <RouterLink :to="{ name: 'register', query: route.query.redirect ? { redirect: route.query.redirect } : {} }">Daftar</RouterLink>
    </template>
  </AuthCard>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: var(--space-4); }
.form__error { padding: var(--space-3); background: var(--color-danger-bg); color: var(--color-danger); border-radius: var(--radius-sm); font-size: 13.5px; }
</style>
