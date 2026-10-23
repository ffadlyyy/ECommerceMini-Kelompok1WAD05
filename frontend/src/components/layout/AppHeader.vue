<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import SearchBar from '@/components/product/SearchBar.vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()

const menuOpen = ref(false)
const links = [
  { label: 'Beranda', to: { name: 'home' } },
  { label: 'Katalog', to: { name: 'catalog' } },
  { label: 'Kategori', to: { name: 'home', hash: '#kategori' } },
]

// Di halaman katalog sudah ada search bar sendiri, jadi header tidak menduplikasi.
const showSearch = computed(() => route.name !== 'catalog')

function onSearch(value) {
  const q = value.trim()
  router.push({ name: 'catalog', query: q ? { q } : {} })
}

function logout() {
  auth.logout()
  menuOpen.value = false
  router.push({ name: 'home' })
}

function onKey(e) {
  if (e.key === 'Escape') menuOpen.value = false
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
watch(() => route.fullPath, () => (menuOpen.value = false))
</script>

<template>
  <header class="header">
    <div class="header__row container">
      <RouterLink :to="{ name: 'home' }" class="logo" aria-label="Nook, ke beranda">no<span>o</span>k</RouterLink>

      <nav class="header__nav" aria-label="Navigasi utama">
        <RouterLink v-for="l in links" :key="l.label" :to="l.to" class="header__link">{{ l.label }}</RouterLink>
        <RouterLink v-if="auth.isAdmin" :to="{ name: 'admin' }" class="header__link">Admin</RouterLink>
      </nav>

      <div class="header__actions">
        <SearchBar v-if="showSearch" class="header__search" label="Cari produk" @search="onSearch" />

        <RouterLink
          :to="{ name: auth.isAuthenticated ? 'orders' : 'login' }"
          class="icon-btn"
          :aria-label="auth.isAuthenticated ? `Pesanan saya${auth.user ? ` (${auth.user.name})` : ''}` : 'Masuk'"
          :title="auth.user?.name"
        >
          <AppIcon name="user" :size="18" />
        </RouterLink>
        <button v-if="auth.isAuthenticated" type="button" class="icon-btn header__logout" aria-label="Keluar" title="Keluar" @click="logout">
          <AppIcon name="logout" :size="18" />
        </button>

        <RouterLink :to="{ name: 'cart' }" class="icon-btn" :aria-label="`Keranjang, ${cart.totalItems} barang`">
          <AppIcon name="bag" :size="18" />
          <span v-if="cart.totalItems" class="icon-btn__count" aria-hidden="true">{{ cart.totalItems }}</span>
        </RouterLink>

        <button class="icon-btn header__burger" type="button" aria-label="Buka menu" :aria-expanded="menuOpen" @click="menuOpen = true">
          <AppIcon name="menu" :size="18" />
        </button>
      </div>
    </div>

    <!-- Menu mobile -->
    <div v-if="menuOpen" class="mobile" role="dialog" aria-modal="true" aria-label="Menu">
      <div class="mobile__top">
        <span class="logo">no<span>o</span>k</span>
        <button class="icon-btn" type="button" aria-label="Tutup menu" @click="menuOpen = false">
          <AppIcon name="close" :size="16" />
        </button>
      </div>
      <SearchBar class="mobile__search" label="Cari produk" @search="onSearch" />
      <RouterLink v-for="l in links" :key="l.label" :to="l.to" class="mobile__link">{{ l.label }}</RouterLink>
      <RouterLink v-if="auth.isAuthenticated" :to="{ name: 'orders' }" class="mobile__link">Pesanan saya</RouterLink>
      <RouterLink v-if="auth.isAdmin" :to="{ name: 'admin' }" class="mobile__link">Admin</RouterLink>
      <button v-if="auth.isAuthenticated" type="button" class="mobile__link mobile__logout" @click="logout">Keluar</button>
      <RouterLink v-else :to="{ name: 'login' }" class="mobile__link">Masuk</RouterLink>
    </div>
  </header>
</template>

<style scoped>
.header { position: sticky; top: 0; z-index: 50; background: var(--color-bg); border-bottom: 1px solid var(--color-line); }
.header__row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-5); min-height: var(--header-h); }
.logo { font-family: var(--font-display); font-size: 24px; font-weight: 600; letter-spacing: -0.01em; white-space: nowrap; }
.logo span { color: var(--color-accent); font-style: italic; font-weight: 500; }

.header__nav { display: flex; gap: var(--space-6); }
.header__link { font-size: 14.5px; color: var(--color-ink-soft); transition: color var(--transition); }
.header__link:hover,
.header__link.router-link-exact-active { color: var(--color-ink); }

.header__actions { display: flex; align-items: center; gap: var(--space-3); }
.header__search { width: 220px; }
.header__burger { display: none; }

.icon-btn {
  position: relative; width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: var(--color-muted);
  display: flex; align-items: center; justify-content: center;
  transition: transform var(--transition);
}
.icon-btn:hover { transform: translateY(-2px); }
.icon-btn__count {
  position: absolute; top: -4px; right: -4px;
  min-width: 17px; height: 17px; padding: 0 4px; border-radius: 9px;
  background: var(--color-accent); color: var(--color-bg);
  font-size: 10px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}

.mobile { position: fixed; inset: 0; z-index: 100; background: var(--color-bg); padding: var(--space-5) var(--gutter); display: flex; flex-direction: column; overflow: auto; }
.mobile__top { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-5); }
.mobile__search { margin-bottom: var(--space-4); }
.mobile__link { font-family: var(--font-display); font-size: 26px; padding: 14px 0; border-bottom: 1px solid var(--color-line); }
.mobile__logout { text-align: left; }

@media (max-width: 820px) {
  .header__nav { display: none; }
  .header__search { display: none; }
  .header__burger { display: flex; }
  .header__logout { display: none; }
}
</style>
