import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ApiError, TOKEN_KEY } from '@/services/api'
import { safeRedirect } from '@/utils/redirect'

const service = { login: vi.fn(), register: vi.fn(), me: vi.fn() }
vi.mock('@/services/authService', () => ({
  login: (...a) => service.login(...a),
  register: (...a) => service.register(...a),
  me: (...a) => service.me(...a),
}))

const { useAuthStore } = await import('@/stores/auth')

const admin = { id: 1, full_name: 'Admin Demo', email: 'admin@example.com', role: 'admin', created_at: '2026-10-01T00:00:00Z' }

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    Object.values(service).forEach((fn) => fn.mockReset())
  })

  it('login menyimpan token dan memuat data akun', async () => {
    service.login.mockResolvedValue({ access_token: 'jwt-123', token_type: 'bearer' })
    service.me.mockResolvedValue(admin)
    const auth = useAuthStore()

    await auth.login(' Admin@Example.com ', 'admin12345')

    expect(service.login).toHaveBeenCalledWith('admin@example.com', 'admin12345')
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-123')
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.isAdmin).toBe(true)
    expect(auth.user.name).toBe('Admin Demo')
  })

  it('login gagal tidak menyimpan sesi', async () => {
    service.login.mockRejectedValue(new ApiError('Email atau password salah.', 401))
    const auth = useAuthStore()
    await expect(auth.login('a@b.co', 'salah')).rejects.toThrow('Email atau password salah.')
    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('token tersimpan yang ditolak server membersihkan sesi', async () => {
    localStorage.setItem(TOKEN_KEY, 'kedaluwarsa')
    service.me.mockRejectedValue(new ApiError('Token tidak valid atau sudah kedaluwarsa.', 401))
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(true)

    await expect(auth.fetchMe()).rejects.toThrow()
    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('fetchMe hanya memanggil server sekali walau dipanggil bersamaan', async () => {
    localStorage.setItem(TOKEN_KEY, 'jwt')
    service.me.mockResolvedValue({ ...admin, role: 'customer' })
    const auth = useAuthStore()
    await Promise.all([auth.fetchMe(), auth.fetchMe()])
    expect(service.me).toHaveBeenCalledTimes(1)
    expect(auth.isAdmin).toBe(false)
  })

  it('register lalu otomatis login', async () => {
    service.register.mockResolvedValue({ ...admin, id: 2, role: 'customer' })
    service.login.mockResolvedValue({ access_token: 'jwt-new' })
    service.me.mockResolvedValue({ ...admin, id: 2, full_name: 'Budi', role: 'customer' })
    const auth = useAuthStore()

    await auth.register({ full_name: ' Budi ', email: 'Budi@Mail.com', password: 'rahasia123' })

    expect(service.register).toHaveBeenCalledWith({ full_name: 'Budi', email: 'budi@mail.com', password: 'rahasia123' })
    expect(auth.user.name).toBe('Budi')
  })

  it('logout menghapus token', () => {
    const auth = useAuthStore()
    auth.setSession('jwt')
    auth.logout()
    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })
})

describe('safeRedirect', () => {
  it('hanya menerima path internal', () => {
    expect(safeRedirect('/orders')).toBe('/orders')
    expect(safeRedirect('//evil.com')).toBeNull()
    expect(safeRedirect('https://evil.com')).toBeNull()
    expect(safeRedirect(undefined)).toBeNull()
  })
})
