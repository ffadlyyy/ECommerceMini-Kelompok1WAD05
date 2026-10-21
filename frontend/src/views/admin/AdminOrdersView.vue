<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import OrderDetail from '@/components/order/OrderDetail.vue'
import OrderStatusBadge from '@/components/order/OrderStatusBadge.vue'
import { useAdminStore } from '@/stores/admin'
import { formatDateTime, formatRupiah } from '@/utils/format'
import { ORDER_STATUSES, PAYMENT_LABELS, STATUS_ACTIONS, nextStatuses, statusMeta } from '@/utils/orderStatus'

const store = useAdminStore()
onMounted(() => store.fetchOrders())

const filter = ref('')
const keyword = ref('')
const busyId = ref(null)
const notice = ref({ type: '', text: '' })

const detail = ref(null)
const detailOpen = computed({ get: () => !!detail.value, set: (v) => !v && (detail.value = null) })

const cancelling = ref(null)
const cancelOpen = computed({ get: () => !!cancelling.value, set: (v) => !v && (cancelling.value = null) })

const tabs = computed(() => [
  { value: '', label: 'Semua', count: store.orders.length },
  ...ORDER_STATUSES.map((s) => ({ value: s.value, label: s.label, count: store.orders.filter((o) => o.status === s.value).length })),
])

const visible = computed(() => {
  const k = keyword.value.trim().toLowerCase().replace(/^#/, '')
  return store.orders.filter((o) => {
    if (filter.value && o.status !== filter.value) return false
    if (!k) return true
    return String(o.id) === k || [o.customer_name, o.customer_email].some((v) => v?.toLowerCase().includes(k))
  })
})

async function changeStatus(order, status) {
  busyId.value = order.id
  notice.value = { type: '', text: '' }
  try {
    await store.updateOrderStatus(order.id, status)
    notice.value = { type: 'success', text: `Pesanan #${order.id} sekarang “${statusMeta(status).label}”.` }
  } catch (e) {
    notice.value = { type: 'error', text: e.message || 'Gagal mengubah status pesanan.' }
  } finally {
    busyId.value = null
  }
}

function onAction(order, status) {
  if (status === 'cancelled') cancelling.value = order
  else changeStatus(order, status)
}

async function confirmCancel() {
  const order = cancelling.value
  cancelling.value = null
  await changeStatus(order, 'cancelled')
}
</script>

<template>
  <div class="admin-orders">
    <header class="head">
      <h1>Pesanan</h1>
      <p>Ubah status pesanan pelanggan sesuai alur: menunggu pembayaran → dibayar → dikirim → selesai.</p>
    </header>

    <LoadingSpinner v-if="store.ordersLoading && !store.orders.length" label="Memuat pesanan…" />
    <ErrorMessage v-else-if="store.ordersError" :message="store.ordersError" @retry="store.fetchOrders()" />
    <EmptyState v-else-if="!store.orders.length" title="Belum ada pesanan" description="Pesanan pelanggan akan muncul di sini setelah checkout." />

    <template v-else>
      <div class="tools">
        <div class="tabs" role="group" aria-label="Filter status pesanan">
          <button v-for="t in tabs" :key="t.value" type="button" class="tab" :aria-pressed="filter === t.value" @click="filter = t.value">
            {{ t.label }} <span class="tab__count">{{ t.count }}</span>
          </button>
        </div>
        <label class="find">
          <span class="sr-only">Cari pesanan</span>
          <input v-model="keyword" type="search" placeholder="Cari #id, nama, atau email…" />
        </label>
      </div>

      <p v-if="notice.text" :class="['notice', `notice--${notice.type}`]" :role="notice.type === 'error' ? 'alert' : 'status'">
        {{ notice.text }}
      </p>

      <p v-if="!visible.length" class="muted">Tidak ada pesanan yang cocok dengan filter ini.</p>

      <div v-else class="table-wrap">
        <table class="table">
          <caption class="sr-only">Daftar pesanan pelanggan</caption>
          <thead>
            <tr>
              <th scope="col">Pesanan</th>
              <th scope="col">Pelanggan</th>
              <th scope="col" class="num">Total</th>
              <th scope="col">Pembayaran</th>
              <th scope="col">Status</th>
              <th scope="col"><span class="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in visible" :key="o.id" :aria-busy="busyId === o.id">
              <td>
                <span class="strong">#{{ o.id }}</span>
                <span class="sub">{{ formatDateTime(o.created_at) }}</span>
              </td>
              <td>
                <span>{{ o.customer_name ?? 'Akun dihapus' }}</span>
                <span class="sub">{{ o.customer_email }}</span>
              </td>
              <td class="num">{{ formatRupiah(o.total_amount) }}</td>
              <td>{{ PAYMENT_LABELS[o.payment_status] ?? o.payment_status }}</td>
              <td class="nowrap"><OrderStatusBadge :status="o.status" /></td>
              <td>
                <div class="actions">
                  <BaseButton
                    v-for="next in nextStatuses(o.status)"
                    :key="next"
                    :variant="next === 'cancelled' ? 'text' : 'outline'"
                    size="sm"
                    :disabled="busyId === o.id"
                    :aria-label="`${STATUS_ACTIONS[next]} pesanan #${o.id}`"
                    @click="onAction(o, next)"
                  >
                    {{ STATUS_ACTIONS[next] }}
                  </BaseButton>
                  <BaseButton variant="text" size="sm" :aria-label="`Rincian pesanan #${o.id}`" @click="detail = o">Rincian</BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <BaseModal v-model="detailOpen" :title="detail ? `Pesanan #${detail.id}` : ''">
      <template v-if="detail">
        <div class="detail-head">
          <OrderStatusBadge :status="detail.status" />
          <span class="sub">{{ detail.customer_name }} · {{ formatDateTime(detail.created_at) }}</span>
        </div>
        <OrderDetail :order="detail" />
      </template>
    </BaseModal>

    <BaseModal v-model="cancelOpen" title="Batalkan pesanan?">
      <p class="confirm">
        Pesanan #{{ cancelling?.id }} akan dibatalkan dan stok barangnya dikembalikan.
        <template v-if="cancelling?.payment_status === 'paid'">Pembayaran ditandai sebagai dana dikembalikan.</template>
        Status akhir ini tidak bisa diubah lagi.
      </p>
      <template #footer>
        <BaseButton variant="outline" size="sm" @click="cancelOpen = false">Kembali</BaseButton>
        <BaseButton size="sm" @click="confirmCancel">Batalkan pesanan</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.admin-orders { display: flex; flex-direction: column; gap: var(--space-5); }
.head h1 { font-size: clamp(28px, 3.5vw, 36px); }
.head p { color: var(--color-ink-soft); margin-top: var(--space-1); font-size: 14px; }

.tools { display: flex; justify-content: space-between; align-items: center; gap: var(--space-4); flex-wrap: wrap; }
.tabs { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.tab {
  padding: 8px 14px; border-radius: var(--radius-pill);
  border: 1px solid var(--color-line); background: var(--color-surface);
  font-size: 13px; transition: border-color var(--transition);
}
.tab:hover { border-color: var(--color-ink-soft); }
.tab[aria-pressed='true'] { background: var(--color-ink); border-color: var(--color-ink); color: var(--color-on-ink); }
.tab__count { opacity: 0.7; font-variant-numeric: tabular-nums; }
.find input {
  width: 260px; max-width: 100%;
  padding: 10px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  font-size: 14px;
}
.find input:focus { outline: none; border-color: var(--color-ink); }

.notice { padding: var(--space-3) var(--space-4); border-radius: var(--radius-sm); font-size: 14px; }
.notice--success { background: var(--color-success-bg); color: var(--color-success); }
.notice--error { background: var(--color-danger-bg); color: var(--color-danger); }
.muted { color: var(--color-ink-soft); font-size: 14px; }

.table-wrap { overflow-x: auto; background: var(--color-surface); border: 1px solid var(--color-line); border-radius: var(--radius-md); }
.table { width: 100%; min-width: 860px; border-collapse: collapse; font-size: 14px; }
.table th { text-align: left; font-weight: 500; font-size: 12.5px; color: var(--color-ink-soft); background: var(--color-bg); }
.table th,
.table td { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-line); vertical-align: middle; }
.table tbody tr:last-child td { border-bottom: none; }
.table .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.strong { font-weight: 600; }
.nowrap { white-space: nowrap; }
.sub { display: block; font-size: 12.5px; color: var(--color-ink-soft); }
.actions { display: flex; justify-content: flex-end; align-items: center; gap: var(--space-3); white-space: nowrap; }

.detail-head { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4); flex-wrap: wrap; }
.detail-head .sub { display: inline; }
.confirm { font-size: 14.5px; }

@media (max-width: 560px) {
  .find, .find input { width: 100%; }
}
</style>
