
<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { request } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const orders = ref([])
const loading = ref(true)
const errorMessage = ref('')

const formatPrice = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value ?? 0)

const formatDate = (value) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const statusLabel = (status) => ({
  pending: 'Menunggu pembayaran',
  paid: 'Sudah dibayar',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}[status] || status)

const paymentLabel = (status) => ({
  unpaid: 'Belum dibayar',
  paid: 'Lunas',
  failed: 'Pembayaran gagal',
}[status] || status)

const statusClass = (status) => ({
  pending: 'pending',
  paid: 'paid',
  completed: 'completed',
  cancelled: 'cancelled',
}[status] || 'default')

async function loadOrders() {
  errorMessage.value = ''
  loading.value = true

  if (!auth.token) {
    await router.replace({
      name: 'login',
      query: { redirect: '/orders' },
    })
    loading.value = false
    return
  }

  try {
    const result = await request('/orders')
    orders.value = Array.isArray(result) ? result : []
  } catch (error) {
    errorMessage.value = error.message || 'Gagal memuat riwayat pesanan.'
  } finally {
    loading.value = false
  }
}

onMounted(loadOrders)
</script>

<template>
  <section class="container orders-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">AKUN SAYA</p>
        <h1>Riwayat Pesanan</h1>
        <p class="subtitle">
          Lihat pesanan dan status pembayaranmu di Nook.
        </p>
      </div>

      <button class="outline-button" @click="loadOrders" :disabled="loading">
        {{ loading ? 'Memuat...' : 'Muat ulang' }}
      </button>
    </div>

    <div v-if="loading" class="state-panel">
      Memuat riwayat pesanan...
    </div>

    <div v-else-if="errorMessage" class="state-panel error" role="alert">
      <p>{{ errorMessage }}</p>
      <button class="outline-button" @click="loadOrders">Coba lagi</button>
    </div>

    <div v-else-if="orders.length === 0" class="state-panel empty">
      <h2>Belum ada pesanan</h2>
      <p>Pesanan yang kamu buat akan muncul di halaman ini.</p>
      <button class="primary-button" @click="router.push({ name: 'catalog' })">
        Jelajahi katalog
      </button>
    </div>

    <div v-else class="orders-list">
      <article v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div>
            <p class="order-number">Pesanan #{{ order.id }}</p>
            <p class="order-date">{{ formatDate(order.created_at) }}</p>
          </div>

          <span class="status-badge" :class="statusClass(order.status)">
            {{ statusLabel(order.status) }}
          </span>
        </div>

        <div class="order-items">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="order-item"
          >
            <div>
              <h3>{{ item.name }}</h3>
              <p>{{ item.quantity }} × {{ formatPrice(item.price) }}</p>
            </div>
            <strong>{{ formatPrice(item.line_total) }}</strong>
          </div>
        </div>

        <div class="order-footer">
          <div>
            <p class="payment-label">Pembayaran</p>
            <strong>{{ paymentLabel(order.payment_status) }}</strong>
          </div>

          <div class="order-total">
            <p>Total pesanan</p>
            <strong>{{ formatPrice(order.total_amount) }}</strong>
          </div>
        </div>

        <div v-if="order.shipping_address" class="shipping-info">
          <h3>Alamat pengiriman</h3>
          <p>{{ order.shipping_name }} · {{ order.shipping_phone }}</p>
          <p>{{ order.shipping_address }}</p>
          <p>{{ order.shipping_city }}, {{ order.shipping_postal_code }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.orders-page {
  padding-top: var(--space-6);
  padding-bottom: var(--space-8);
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: var(--space-6);
}

.eyebrow {
  margin-bottom: 8px;
  color: #81745e;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

h1 {
  font-size: 32px;
}

.subtitle {
  margin-top: 10px;
  color: var(--color-ink-soft);
  line-height: 1.6;
}

.orders-list {
  display: grid;
  gap: 20px;
}

.order-card,
.state-panel {
  padding: 24px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.order-header,
.order-footer,
.order-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.order-header {
  padding-bottom: 18px;
  border-bottom: 1px solid var(--color-line);
}

.order-number {
  font-size: 17px;
  font-weight: 700;
}

.order-date,
.order-item p,
.payment-label,
.order-total p {
  margin-top: 6px;
  color: var(--color-ink-soft);
  font-size: 13px;
}

.status-badge {
  display: inline-block;
  padding: 7px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: #eeeae1;
  color: #514b3d;
}

.status-badge.pending {
  background: #fff0cf;
  color: #805600;
}

.status-badge.paid,
.status-badge.completed {
  background: #e2f4e8;
  color: #24663b;
}

.status-badge.cancelled {
  background: #fce7e7;
  color: #9d2525;
}

.order-items {
  display: grid;
  gap: 16px;
  padding: 20px 0;
}

.order-item h3 {
  font-size: 15px;
  font-weight: 600;
}

.order-footer {
  align-items: center;
  padding-top: 18px;
  border-top: 1px solid var(--color-line);
}

.order-total {
  text-align: right;
}

.order-total strong {
  display: inline-block;
  margin-top: 6px;
  font-size: 20px;
}

.shipping-info {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--color-line);
  line-height: 1.7;
}

.shipping-info h3 {
  margin-bottom: 8px;
  font-size: 14px;
}

.shipping-info p {
  color: var(--color-ink-soft);
  font-size: 13px;
}

.state-panel {
  text-align: center;
  padding: 40px 20px;
}

.state-panel h2 {
  margin-bottom: 10px;
}

.state-panel p {
  margin-bottom: 18px;
  line-height: 1.6;
}

.error {
  color: #b42318;
}

.primary-button,
.outline-button {
  padding: 11px 16px;
  border-radius: 8px;
  font: inherit;
  cursor: pointer;
}

.primary-button {
  margin-top: 18px;
  border: 0;
  background: #39372e;
  color: white;
}

.outline-button {
  border: 1px solid var(--color-line);
  background: transparent;
}

button:disabled {
  opacity: 0.6;
  cursor: wait;
}

@media (max-width: 600px) {
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .order-card {
    padding: 18px;
  }

  .order-header,
  .order-footer,
  .order-item {
    gap: 12px;
  }

  .status-badge {
    max-width: 130px;
    text-align: center;
  }
}
</style>
