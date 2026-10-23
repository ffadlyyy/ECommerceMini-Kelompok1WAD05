import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { USE_MOCK } from '@/services/productService'

// Nama route (`name`) jangan diubah karena dipakai oleh navbar dan tombol di halaman lain.
export const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { title: 'Beranda' } },
  { path: '/products', name: 'catalog', component: () => import('@/views/CatalogView.vue'), meta: { title: 'Katalog' } },
  {
    path: '/products/:id(\\d+)',
    name: 'product-detail',
    component: () => import('@/views/ProductDetailView.vue'),
    meta: { title: 'Detail Produk' },
  },

  // --- Task 2: autentikasi ---
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { title: 'Masuk', guestOnly: true } },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { title: 'Daftar', guestOnly: true },
  },

  // --- Task 4: keranjang, checkout, simulasi pembayaran ---
  // Keranjang boleh dibuka tamu (disimpan lokal); checkout & bayar butuh login.
  { path: '/cart', name: 'cart', component: () => import('@/views/CartView.vue'), meta: { title: 'Keranjang' } },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/views/CheckoutView.vue'),
    meta: { title: 'Checkout', requiresAuth: true },
  },
  {
    path: '/orders/:id(\\d+)/payment',
    name: 'order-payment',
    component: () => import('@/views/PaymentView.vue'),
    meta: { title: 'Pembayaran', requiresAuth: true },
  },

  // --- Task 5: riwayat pesanan & dashboard admin ---
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@/views/OrdersView.vue'),
    meta: { title: 'Riwayat Pesanan', requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/AdminDashboardView.vue'),
    meta: { title: 'Dashboard Admin', layout: 'admin', requiresAdmin: true },
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: () => import('@/views/admin/AdminProductsView.vue'),
    meta: { title: 'Kelola Produk', layout: 'admin', requiresAdmin: true },
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: () => import('@/views/admin/AdminOrdersView.vue'),
    meta: { title: 'Kelola Pesanan', layout: 'admin', requiresAdmin: true },
  },

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

// Guard ini hanya untuk UX; keamanan sebenarnya ada di backend (401/403).
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  // Token tersimpan (mis. setelah refresh) -> muat data akun sekali sebelum cek role.
  if (auth.isAuthenticated && !auth.user) {
    try {
      await auth.fetchMe()
    } catch {
      /* 401 -> sesi sudah dibersihkan; error jaringan -> dianggap belum diketahui */
    }
  }

  if (to.meta.guestOnly && auth.user) return { name: auth.isAdmin ? 'admin' : 'home' }

  // Mode mock (data produk/pesanan palsu) dipakai untuk demo tanpa backend: halaman dibiarkan terbuka.
  if (USE_MOCK) return true

  if ((to.meta.requiresAuth || to.meta.requiresAdmin) && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) return { name: 'home' }
  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — Nook` : 'Nook'
})

export default router
