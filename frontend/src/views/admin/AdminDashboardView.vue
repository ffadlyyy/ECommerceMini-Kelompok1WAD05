<script setup>
import { computed, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import CategorySalesBars from '@/components/admin/CategorySalesBars.vue'
import SalesChart from '@/components/admin/SalesChart.vue'
import StatTile from '@/components/admin/StatTile.vue'
import OrderStatusBadge from '@/components/order/OrderStatusBadge.vue'
import { useAdminStore } from '@/stores/admin'
import { formatDate, formatRupiah } from '@/utils/format'

const store = useAdminStore()

function load() {
  store.fetchSummary()
  store.fetchOrders()
}
onMounted(load)

const s = computed(() => store.summary)
const average = computed(() => (s.value?.total_orders ? Math.round(s.value.total_revenue / s.value.total_orders) : 0))
const needsAction = computed(() => store.orders.filter((o) => o.status === 'paid').length)
const pending = computed(() => store.orders.filter((o) => o.status === 'pending').length)
const recent = computed(() => store.orders.slice(0, 5))
</script>

<template>
  <div class="dash">
    <header class="dash__head">
      <div>
        <h1>Ringkasan</h1>
        <p>Penjualan dihitung dari pesanan yang sudah dibayar, dikirim, atau selesai.</p>
      </div>
    </header>

    <LoadingSpinner v-if="store.summaryLoading && !s" label="Memuat ringkasan…" />
    <ErrorMessage v-else-if="store.summaryError" :message="store.summaryError" @retry="load" />

    <template v-else-if="s">
      <div class="dash__stats">
        <StatTile hero label="Total pendapatan" :value="formatRupiah(s.total_revenue)" class="dash__hero" />
        <StatTile label="Pesanan terjual" :value="String(s.total_orders)" />
        <StatTile label="Rata-rata per pesanan" :value="formatRupiah(average)" />
        <StatTile
          label="Perlu dikirim"
          :value="String(needsAction)"
          :hint="pending ? `${pending} pesanan menunggu pembayaran` : 'Tidak ada yang menunggu pembayaran'"
        />
      </div>

      <div class="dash__grid">
        <section class="panel panel--wide" aria-labelledby="daily-title">
          <h2 id="daily-title" class="panel__title">Pendapatan harian</h2>
          <SalesChart :data="s.daily_sales" />
        </section>

        <section class="panel" aria-labelledby="cat-title">
          <h2 id="cat-title" class="panel__title">Pendapatan per kategori</h2>
          <CategorySalesBars :data="s.category_sales" />
        </section>

        <section class="panel" aria-labelledby="recent-title">
          <div class="panel__head">
            <h2 id="recent-title" class="panel__title">Pesanan terbaru</h2>
            <BaseButton variant="text" size="sm" :to="{ name: 'admin-orders' }">Kelola pesanan</BaseButton>
          </div>
          <LoadingSpinner v-if="store.ordersLoading" />
          <p v-else-if="store.ordersError" class="panel__muted">{{ store.ordersError }}</p>
          <p v-else-if="!recent.length" class="panel__muted">Belum ada pesanan.</p>
          <ul v-else class="recent">
            <li v-for="o in recent" :key="o.id" class="recent__row">
              <div>
                <p class="recent__id">#{{ o.id }} · {{ o.customer_name ?? 'Pelanggan' }}</p>
                <p class="recent__date">{{ formatDate(o.created_at) }}</p>
              </div>
              <div class="recent__right">
                <span class="recent__total">{{ formatRupiah(o.total_amount) }}</span>
                <OrderStatusBadge :status="o.status" />
              </div>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dash { display: flex; flex-direction: column; gap: var(--space-5); }
.dash__head h1 { font-size: clamp(28px, 3.5vw, 36px); }
.dash__head p { color: var(--color-ink-soft); margin-top: var(--space-1); font-size: 14px; }

.dash__stats { display: grid; grid-template-columns: minmax(0, 1.6fr) repeat(3, minmax(0, 1fr)); gap: var(--space-4); }

.dash__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4); }
.panel {
  min-width: 0;
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  display: flex; flex-direction: column; gap: var(--space-4);
}
.panel--wide { grid-column: 1 / -1; }
.panel__head { display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); }
.panel__title { font-size: 19px; }
.panel__muted { color: var(--color-ink-soft); font-size: 14px; }

.recent { display: flex; flex-direction: column; }
.recent__row { display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); padding: var(--space-3) 0; border-bottom: 1px solid var(--color-line); }
.recent__row:last-child { border-bottom: none; }
.recent__id { font-size: 14px; font-weight: 500; }
.recent__date { font-size: 12.5px; color: var(--color-ink-soft); }
.recent__right { display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-1); }
.recent__total { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }

@media (max-width: 1100px) {
  .dash__stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .dash__hero { grid-column: 1 / -1; }
}
@media (max-width: 900px) {
  .dash__grid { grid-template-columns: 1fr; }
}
@media (max-width: 520px) {
  .dash__stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); }
  .dash__stats > :last-child { grid-column: 1 / -1; }
}
</style>
