
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { USE_MOCK } from '@/services/productService'

export const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'Beranda' },
  },
  {
    path: '/products',
    name: 'catalog',
    component: () => import('@/views/CatalogView.vue'),
    meta: { title: 'Katalog' },
  },
  {
    path: '/products/:id(\\d+)',
    name: 'product-detail',
    component: () => import('@/views/ProductDetailView.vue'),
    meta: { title: 'Detail Produk' },
  },

  // Autentikasi
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Masuk', guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { title: 'Daftar', guestOnly: true },
  },

  // Keranjang dan checkout
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/views/CartView.vue'),
    meta: { title: 'Keranjang' },
  },
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

  // Riwayat pesanan dan admin
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
    meta: {
      title: 'Dashboard Admin',
      layout: 'admin',
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: () => import('@/views/admin/AdminProductsView.vue'),
    meta: {
      title: 'Kelola Produk',
      layout: 'admin',
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: () => import('@/views/admin/AdminOrdersView.vue'),
    meta: {
      title: 'Kelola Pesanan',
      layout: 'admin',
      requiresAdmin: true,
    },
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Tidak ditemukan' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 80, behavior: 'smooth' }
    if (to.name === from.name && to.name === 'catalog') return false
    return { top: 0 }
  },
})

// Guard navigasi untuk kenyamanan pengguna.
// Backend tetap harus memvalidasi autentikasi dan hak akses.
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (auth.isAuthenticated && !auth.user) {
    try {
      await auth.fetchMe()
    } catch {
      // Sesi tidak valid dapat dibersihkan oleh auth store.
    }
  }

  if (to.meta.guestOnly && auth.user) {
    return { name: auth.isAdmin ? 'admin' : 'home' }
  }

  // Mode mock untuk demo tanpa backend.
  if (USE_MOCK) return true

  if (
    (to.meta.requiresAuth || to.meta.requiresAdmin) &&
    !auth.isAuthenticated
  ) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'home' }
  }

  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — Nook` : 'Nook'
})

export default router
