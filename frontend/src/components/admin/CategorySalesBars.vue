<script setup>
// Batang horizontal pendapatan per kategori, diurutkan dari terbesar. Setiap batang
// diberi label nilai di ujungnya, jadi tidak perlu tooltip.
import { computed } from 'vue'
import { formatCompactRupiah, formatRupiah } from '@/utils/format'

const props = defineProps({
  /** [{ category_id, category_name, revenue, quantity_sold }] */
  data: { type: Array, default: () => [] },
})

const rows = computed(() => [...props.data].sort((a, b) => b.revenue - a.revenue))
const max = computed(() => Math.max(1, ...rows.value.map((r) => r.revenue)))
</script>

<template>
  <p v-if="!rows.length" class="bars__empty">Belum ada penjualan per kategori.</p>
  <ul v-else class="bars">
    <li v-for="r in rows" :key="r.category_id" class="bars__row">
      <span class="bars__name">{{ r.category_name }}</span>
      <!-- Ruang kanan disisihkan untuk label nilai, jadi panjang batang tetap proporsional -->
      <span class="bars__track">
        <span class="bars__fill" :style="{ width: `${(r.revenue / max) * 100}%` }" />
        <span class="bars__value" :style="{ left: `${(r.revenue / max) * 100}%` }" :title="formatRupiah(r.revenue)">
          {{ formatCompactRupiah(r.revenue) }}
        </span>
      </span>
      <span class="bars__qty">{{ r.quantity_sold }} terjual</span>
    </li>
  </ul>
</template>

<style scoped>
.bars { display: flex; flex-direction: column; gap: var(--space-3); }
.bars__row { display: grid; grid-template-columns: minmax(90px, 130px) 1fr auto; align-items: center; gap: var(--space-3); font-size: 13.5px; }
.bars__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bars__track { position: relative; height: 20px; margin-right: 72px; min-width: 0; }
.bars__fill { position: absolute; left: 0; top: 3px; height: 14px; min-width: 2px; background: var(--color-accent); border-radius: 0 4px 4px 0; }
.bars__value { position: absolute; top: 0; padding-left: var(--space-2); line-height: 20px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
.bars__qty { color: var(--color-ink-soft); font-size: 12.5px; font-variant-numeric: tabular-nums; white-space: nowrap; }

/* Layar sempit: nama + jumlah di baris atas, batang selebar penuh di bawahnya */
@media (max-width: 480px) {
  .bars__row { grid-template-columns: 1fr auto; row-gap: var(--space-1); }
  .bars__track { grid-column: 1 / -1; grid-row: 2; }
}
.bars__empty { padding: var(--space-6) 0; text-align: center; color: var(--color-ink-soft); font-size: 14px; }
</style>
