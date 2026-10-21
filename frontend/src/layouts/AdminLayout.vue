<script setup>
// Kerangka dashboard admin (Task 5). Konten halaman masuk lewat <slot />.
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}

const links = [
  { label: 'Ringkasan', to: { name: 'admin' } },
  { label: 'Produk', to: { name: 'admin-products' } },
  { label: 'Pesanan', to: { name: 'admin-orders' } },
]
</script>

<template>
  <div class="admin">
    <a href="#main" class="skip-link">Lewati ke konten utama</a>
    <aside class="admin__side">
      <RouterLink :to="{ name: 'home' }" class="admin__logo">no<span>o</span>k <small>admin</small></RouterLink>
      <nav aria-label="Menu admin">
        <RouterLink v-for="l in links" :key="l.label" :to="l.to" class="admin__link">{{ l.label }}</RouterLink>
      </nav>
      <div class="admin__foot">
        <p v-if="auth.user" class="admin__user">{{ auth.user.name }}</p>
        <RouterLink :to="{ name: 'home' }" class="admin__link admin__link--back">← Kembali ke toko</RouterLink>
        <button v-if="auth.isAuthenticated" type="button" class="admin__link admin__link--back" @click="logout">Keluar</button>
      </div>
    </aside>
    <main id="main" class="admin__main"><slot /></main>
  </div>
</template>

<style scoped>
.admin { min-height: 100vh; display: grid; grid-template-columns: 220px 1fr; }
.admin__side {
  background: var(--color-ink);
  color: var(--color-on-ink);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.admin__logo { font-family: var(--font-display); font-size: 24px; font-weight: 600; }
.admin__logo span { color: var(--color-accent); font-style: italic; font-weight: 500; }
.admin__logo small { font-family: var(--font-body); font-size: 11px; opacity: 0.7; letter-spacing: 0.08em; text-transform: uppercase; }
.admin__side nav { display: flex; flex-direction: column; gap: var(--space-1); flex: 1; }
.admin__link { padding: 10px 12px; border-radius: var(--radius-sm); font-size: 14.5px; opacity: 0.8; }
.admin__link:hover,
.admin__link.router-link-exact-active { background: rgba(255, 255, 255, 0.1); opacity: 1; }
.admin__link--back { font-size: 13px; text-align: left; }
.admin__foot { display: flex; flex-direction: column; gap: var(--space-1); }
.admin__user { padding: 0 12px var(--space-2); font-size: 12.5px; opacity: 0.7; overflow-wrap: anywhere; }
.admin__main { padding: var(--space-6); min-width: 0; }

@media (max-width: 820px) {
  .admin { grid-template-columns: 1fr; }
  .admin__side { flex-direction: row; align-items: center; flex-wrap: wrap; padding: var(--space-3) var(--space-4); }
  .admin__side nav { flex-direction: row; flex: 1; }
  .admin__foot { flex-direction: row; align-items: center; }
  .admin__user { display: none; }
  .admin__main { padding: var(--space-4); }
}
</style>
