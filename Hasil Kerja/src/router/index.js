import { createRouter, createWebHistory } from 'vue-router'

// Halaman bertanda `owner` masih placeholder milik anggota lain.
// Saat sudah jadi, cukup ganti `component` — nama route (`name`) jangan diubah
// karena dipakai oleh navbar dan tombol di halaman lain.
const placeholder = () => import('@/views/PlaceholderView.vue')

export const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { title: 'Beranda' } },
  { path: '/products', name: 'catalog', component: () => import('@/views/CatalogView.vue'), meta: { title: 'Katalog' } },
  {
    path: '/products/:id(\\d+)',
    name: 'product-detail',
    component: () => import('@/views/ProductDetailView.vue'),
    meta: { title: 'Detail Produk' },
  },

  // --- placeholder anggota lain ---
  { path: '/login', name: 'login', component: placeholder, meta: { title: 'Masuk', owner: 'Fadly (Task 2)' } },
  { path: '/register', name: 'register', component: placeholder, meta: { title: 'Daftar', owner: 'Fadly (Task 2)' } },
  { path: '/cart', name: 'cart', component: placeholder, meta: { title: 'Keranjang', owner: 'Arico (Task 4)' } },
  { path: '/checkout', name: 'checkout', component: placeholder, meta: { title: 'Checkout', owner: 'Arico (Task 4)' } },
  { path: '/orders', name: 'orders', component: placeholder, meta: { title: 'Riwayat Pesanan', owner: 'Siwi (Task 5)' } },
  { path: '/admin', name: 'admin', component: placeholder, meta: { title: 'Dashboard Admin', owner: 'Siwi (Task 5)', layout: 'admin' } },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue'), meta: { title: 'Tidak ditemukan' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 80, behavior: 'smooth' }
    // Berpindah halaman di katalog (page/filter) tidak perlu loncat ke atas bila route sama
    if (to.name === from.name && to.name === 'catalog') return false
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — Nook` : 'Nook'
})

export default router
