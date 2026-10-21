<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import OrderDetail from '@/components/order/OrderDetail.vue'
import OrderStatusBadge from '@/components/order/OrderStatusBadge.vue'
import { useOrderStore } from '@/stores/order'
import { formatDateTime, formatRupiah } from '@/utils/format'
import { ORDER_STATUSES } from '@/utils/orderStatus'

const store = useOrderStore()
const filter = ref('')
const expanded = ref(new Set())

onMounted(() => store.fetchOrders())

// Tab filter hanya untuk status yang benar-benar ada di riwayat user
const tabs = computed(() => [
  { value: '', label: 'Semua', count: store.orders.length },
  ...ORDER_STATUSES.map((s) => ({ ...s, count: store.orders.filter((o) => o.status === s.value).length })).filter((t) => t.count),
])
const visible = computed(() => (filter.value ? store.orders.filter((o) => o.status === filter.value) : store.orders))

function toggle(id) {
  const next = new Set(expanded.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expanded.value = next
}

const itemSummary = (order) => {
  const [first, ...rest] = order.items
  if (!first) return ''
  return rest.length ? `${first.name} dan ${rest.length} barang lain` : first.name
}
</script>

<template>
  <section class="container orders">
    <header class="orders__head">
      <h1>Riwayat pesanan</h1>
      <p>Semua transaksi yang pernah kamu lakukan, terbaru di atas.</p>
    </header>

    <LoadingSpinner v-if="store.loading" label="Memuat pesanan…" />
    <ErrorMessage v-else-if="store.error" :message="store.error" @retry="store.fetchOrders()" />
    <EmptyState v-else-if="!store.orders.length" title="Belum ada pesanan" description="Pesanan yang kamu buat setelah checkout akan muncul di sini.">
      <BaseButton :to="{ name: 'catalog' }">Mulai belanja</BaseButton>
    </EmptyState>

    <template v-else>
      <div class="orders__tabs" role="group" aria-label="Filter status pesanan">
        <button
          v-for="t in tabs"
          :key="t.value"
          type="button"
          class="orders__tab"
          :aria-pressed="filter === t.value"
          @click="filter = t.value"
        >
          {{ t.label }} <span class="orders__tab-count">{{ t.count }}</span>
        </button>
      </div>

      <ul class="orders__list">
        <li v-for="o in visible" :key="o.id" class="order">
          <div class="order__head">
            <div class="order__id">
              <h2>Pesanan #{{ o.id }}</h2>
              <time :datetime="o.created_at">{{ formatDateTime(o.created_at) }}</time>
            </div>
            <OrderStatusBadge :status="o.status" />
          </div>

          <div class="order__summary">
            <p class="order__items">{{ itemSummary(o) }}</p>
            <p class="order__total">{{ formatRupiah(o.total_amount) }}</p>
          </div>

          <p v-if="o.status === 'pending'" class="order__note">
            {{ o.payment_status === 'failed' ? 'Pembayaran sebelumnya gagal. Silakan coba bayar lagi.' : 'Pesanan menunggu pembayaran.' }}
          </p>

          <button
            type="button"
            class="order__toggle"
            :aria-expanded="expanded.has(o.id)"
            :aria-controls="`order-${o.id}`"
            @click="toggle(o.id)"
          >
            {{ expanded.has(o.id) ? 'Sembunyikan rincian' : 'Lihat rincian' }}
          </button>
          <div v-if="expanded.has(o.id)" :id="`order-${o.id}`" class="order__detail">
            <OrderDetail :order="o" />
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.orders { padding-top: var(--space-7); padding-bottom: var(--space-8); display: flex; flex-direction: column; gap: var(--space-5); max-width: 860px; }
.orders__head h1 { font-size: clamp(30px, 4vw, 42px); }
.orders__head p { color: var(--color-ink-soft); margin-top: var(--space-2); }

.orders__tabs { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.orders__tab {
  padding: 8px 14px; border-radius: var(--radius-pill);
  border: 1px solid var(--color-line); background: var(--color-surface);
  font-size: 13.5px; transition: border-color var(--transition);
}
.orders__tab:hover { border-color: var(--color-ink-soft); }
.orders__tab[aria-pressed='true'] { background: var(--color-ink); border-color: var(--color-ink); color: var(--color-on-ink); }
.orders__tab-count { opacity: 0.7; font-variant-numeric: tabular-nums; }

.orders__list { display: flex; flex-direction: column; gap: var(--space-4); }
.order {
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  display: flex; flex-direction: column; gap: var(--space-3);
}
.order__head { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-3); }
.order__id h2 { font-size: 20px; }
.order__id time { font-size: 13px; color: var(--color-ink-soft); }
.order__summary { display: flex; justify-content: space-between; align-items: baseline; gap: var(--space-4); }
.order__items { color: var(--color-ink-soft); font-size: 14px; min-width: 0; }
.order__total { font-weight: 600; font-size: 16px; white-space: nowrap; }
.order__note { font-size: 13px; color: var(--color-accent); }
.order__toggle { align-self: flex-start; font-size: 13.5px; text-decoration: underline; text-underline-offset: 3px; }
.order__detail { padding-top: var(--space-3); border-top: 1px solid var(--color-line); }
</style>
