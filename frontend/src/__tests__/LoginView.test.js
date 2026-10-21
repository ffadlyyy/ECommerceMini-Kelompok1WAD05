import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { ApiError } from '@/services/api'

const service = { login: vi.fn(), register: vi.fn(), me: vi.fn() }
vi.mock('@/services/authService', () => ({
  login: (...a) => service.login(...a),
  register: (...a) => service.register(...a),
  me: (...a) => service.me(...a),
}))

const LoginView = (await import('@/views/LoginView.vue')).default
const stub = { template: '<div />' }

async function factory(path = '/login') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: stub },
      { path: '/login', name: 'login', component: LoginView },
      { path: '/register', name: 'register', component: stub },
      { path: '/admin', name: 'admin', component: stub },
      { path: '/orders', name: 'orders', component: stub },
    ],
  })
  router.push(path)
  await router.isReady()
  const w = mount(LoginView, { global: { plugins: [router] } })
  return { w, router }
}

async function fill(w, email, password) {
  const [emailInput, passwordInput] = w.findAll('input')
  await emailInput.setValue(email)
  await passwordInput.setValue(password)
  await w.get('form').trigger('submit')
  await flushPromises()
}

describe('LoginView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    Object.values(service).forEach((fn) => fn.mockReset())
  })

  it('validasi di klien sebelum memanggil server', async () => {
    const { w } = await factory()
    await fill(w, 'bukan-email', '')
    expect(w.text()).toContain('Masukkan email yang valid.')
    expect(w.text()).toContain('Password wajib diisi.')
    expect(service.login).not.toHaveBeenCalled()
  })

  it('admin diarahkan ke dashboard setelah login', async () => {
    service.login.mockResolvedValue({ access_token: 'jwt' })
    service.me.mockResolvedValue({ id: 1, full_name: 'Admin', email: 'admin@example.com', role: 'admin' })
    const { w, router } = await factory()
    await fill(w, 'admin@example.com', 'admin12345')
    expect(router.currentRoute.value.name).toBe('admin')
  })

  it('kembali ke halaman asal lewat ?redirect=', async () => {
    service.login.mockResolvedValue({ access_token: 'jwt' })
    service.me.mockResolvedValue({ id: 2, full_name: 'Budi', email: 'b@x.com', role: 'customer' })
    const { w, router } = await factory('/login?redirect=/orders')
    await fill(w, 'b@x.com', 'rahasia123')
    expect(router.currentRoute.value.fullPath).toBe('/orders')
  })

  it('menampilkan pesan error dari server', async () => {
    service.login.mockRejectedValue(new ApiError('Email atau password salah.', 401))
    const { w } = await factory()
    await fill(w, 'a@b.co', 'salah123')
    expect(w.get('[role="alert"]').text()).toBe('Email atau password salah.')
  })
})
