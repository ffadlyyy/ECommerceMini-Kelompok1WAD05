<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthCard from '@/components/auth/AuthCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useAuthStore } from '@/stores/auth'
import { safeRedirect } from '@/utils/redirect'

// Sama dengan validasi backend (app/schemas/user.py: UserCreate)
const PASSWORD_MIN = 8
const PASSWORD_MAX = 72

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const form = reactive({ full_name: '', email: '', password: '', confirm: '' })
const errors = ref({})
const serverError = ref('')
const submitting = ref(false)

function validate() {
  const e = {}
  if (!form.full_name.trim()) e.full_name = 'Nama wajib diisi.'
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Masukkan email yang valid.'
  if (form.password.length < PASSWORD_MIN) e.password = `Password minimal ${PASSWORD_MIN} karakter.`
  else if (new TextEncoder().encode(form.password).length > PASSWORD_MAX) e.password = `Password maksimal ${PASSWORD_MAX} karakter.`
  if (form.confirm !== form.password) e.confirm = 'Konfirmasi password tidak sama.'
  errors.value = e
  return !Object.keys(e).length
}

async function onSubmit() {
  serverError.value = ''
  if (!validate()) return
  submitting.value = true
  try {
    await auth.register(form)
    router.replace(safeRedirect(route.query.redirect) ?? { name: 'home' })
  } catch (e) {
    serverError.value = e.message || 'Gagal mendaftar. Coba lagi.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthCard title="Buat akun" subtitle="Daftar sebagai pelanggan untuk mulai berbelanja.">
    <form class="form" novalidate @submit.prevent="onSubmit">
      <BaseInput v-model="form.full_name" label="Nama lengkap" required :maxlength="100" :error="errors.full_name" />
      <BaseInput v-model="form.email" label="Email" type="email" required :error="errors.email" placeholder="nama@email.com" />
      <BaseInput
        v-model="form.password"
        label="Password"
        type="password"
        required
        :error="errors.password"
        :hint="`Minimal ${PASSWORD_MIN} karakter.`"
      />
      <BaseInput v-model="form.confirm" label="Ulangi password" type="password" required :error="errors.confirm" />
      <p v-if="serverError" class="form__error" role="alert">{{ serverError }}</p>
      <BaseButton type="submit" block :disabled="submitting">{{ submitting ? 'Memproses…' : 'Daftar' }}</BaseButton>
    </form>

    <template #footer>
      Sudah punya akun?
      <RouterLink :to="{ name: 'login', query: route.query.redirect ? { redirect: route.query.redirect } : {} }">Masuk</RouterLink>
    </template>
  </AuthCard>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: var(--space-4); }
.form__error { padding: var(--space-3); background: var(--color-danger-bg); color: var(--color-danger); border-radius: var(--radius-sm); font-size: 13.5px; }
</style>
