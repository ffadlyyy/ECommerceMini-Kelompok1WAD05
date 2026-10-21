<script setup>
// Grafik kolom pendapatan harian (satu seri). Hari tanpa penjualan tetap tampil sebagai 0
// supaya sumbu waktu jujur. Nilai per hari tersedia lewat tooltip (hover/fokus) dan tabel.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { formatCompactRupiah, formatDate, formatDayMonth, formatRupiah } from '@/utils/format'

const props = defineProps({
  /** [{ date: 'YYYY-MM-DD', revenue, orders }] */
  data: { type: Array, default: () => [] },
  /** Jumlah hari maksimal yang ditampilkan (diambil dari hari terakhir) */
  maxDays: { type: Number, default: 30 },
})

const HEIGHT = 240
const PAD = { top: 24, right: 8, bottom: 28, left: 64 }
const DAY = 86_400_000

const wrapper = ref(null)
const width = ref(640)
const active = ref(null) // index hari yang di-hover / fokus
const showTable = ref(false)

let observer
onMounted(() => {
  if (typeof ResizeObserver === 'undefined' || !wrapper.value) return
  observer = new ResizeObserver(([entry]) => (width.value = Math.max(280, entry.contentRect.width)))
  observer.observe(wrapper.value)
})
onBeforeUnmount(() => observer?.disconnect())

const days = computed(() => {
  if (!props.data.length) return []
  const byDate = new Map(props.data.map((d) => [d.date, d]))
  const dates = [...byDate.keys()].sort()
  const last = Date.parse(`${dates.at(-1)}T00:00:00Z`)
  const first = Math.max(Date.parse(`${dates[0]}T00:00:00Z`), last - (props.maxDays - 1) * DAY)
  const result = []
  for (let t = first; t <= last; t += DAY) {
    const date = new Date(t).toISOString().slice(0, 10)
    const row = byDate.get(date)
    result.push({ date, revenue: row?.revenue ?? 0, orders: row?.orders ?? 0 })
  }
  return result
})

// Batas atas sumbu Y dibulatkan ke angka "bersih" (1, 2, 2,5, 5 × 10^n)
const scale = computed(() => {
  const max = Math.max(0, ...days.value.map((d) => d.revenue))
  if (!max) return { max: 1, ticks: [0] }
  const rough = max / 4
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough)
  const top = Math.ceil(max / step) * step
  const ticks = []
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(v)
  return { max: top, ticks }
})

const plotW = computed(() => width.value - PAD.left - PAD.right)
const plotH = HEIGHT - PAD.top - PAD.bottom
const band = computed(() => plotW.value / Math.max(1, days.value.length))
const barW = computed(() => Math.min(24, band.value * 0.6))
const y = (v) => PAD.top + plotH - (v / scale.value.max) * plotH

// Kolom dengan ujung atas membulat 4px, dasar tetap siku
function barPath(i) {
  const d = days.value[i]
  const h = (d.revenue / scale.value.max) * plotH
  if (h <= 0) return ''
  const x = PAD.left + band.value * i + (band.value - barW.value) / 2
  const base = PAD.top + plotH
  const r = Math.min(4, h, barW.value / 2)
  const top = base - h
  return `M${x},${base}V${top + r}Q${x},${top} ${x + r},${top}H${x + barW.value - r}Q${x + barW.value},${top} ${x + barW.value},${top + r}V${base}Z`
}

const peakIndex = computed(() => {
  let best = -1
  days.value.forEach((d, i) => {
    if (d.revenue > 0 && (best === -1 || d.revenue > days.value[best].revenue)) best = i
  })
  return best
})

// Label tanggal secukupnya supaya tidak bertabrakan (±48px per label)
const labelEvery = computed(() => Math.max(1, Math.ceil(days.value.length / Math.max(1, Math.floor(plotW.value / 48)))))
const showLabel = (i) => (days.value.length - 1 - i) % labelEvery.value === 0

const tooltip = computed(() => {
  if (active.value === null) return null
  const d = days.value[active.value]
  const center = PAD.left + band.value * active.value + band.value / 2
  return { ...d, left: Math.min(Math.max(center, 80), width.value - 80), top: y(d.revenue) }
})

// 'YYYY-MM-DD' dibaca sebagai tengah hari waktu lokal supaya tanggal tidak bergeser karena zona waktu
const day = (date) => `${date}T12:00:00`
const describe = (d) => `${formatDate(day(d.date))}: ${formatRupiah(d.revenue)}, ${d.orders} pesanan`
</script>

<template>
  <div class="chart">
    <div v-if="!days.length" class="chart__empty">Belum ada penjualan untuk ditampilkan.</div>

    <template v-else>
      <div ref="wrapper" class="chart__plot" @mouseleave="active = null">
        <svg :width="width" :height="HEIGHT" :viewBox="`0 0 ${width} ${HEIGHT}`" role="group" aria-label="Pendapatan harian">
          <g aria-hidden="true">
            <g v-for="t in scale.ticks" :key="t">
              <line :x1="PAD.left" :x2="width - PAD.right" :y1="y(t)" :y2="y(t)" class="chart__grid" />
              <text :x="PAD.left - 8" :y="y(t)" class="chart__tick" text-anchor="end" dominant-baseline="middle">
                {{ formatCompactRupiah(t) }}
              </text>
            </g>
            <template v-for="(d, i) in days" :key="d.date">
              <text v-if="showLabel(i)" :x="PAD.left + band * i + band / 2" :y="HEIGHT - 8" class="chart__tick" text-anchor="middle">
                {{ formatDayMonth(day(d.date)) }}
              </text>
            </template>
          </g>

          <path v-for="(d, i) in days" :key="`bar-${d.date}`" :d="barPath(i)" class="chart__bar" :class="{ 'chart__bar--active': active === i }" />

          <text
            v-if="peakIndex !== -1"
            :x="PAD.left + band * peakIndex + band / 2"
            :y="y(days[peakIndex].revenue) - 8"
            class="chart__peak"
            text-anchor="middle"
            aria-hidden="true"
          >
            {{ formatCompactRupiah(days[peakIndex].revenue) }}
          </text>

          <!-- Area hover/fokus selebar satu kolom penuh, lebih besar dari batangnya -->
          <rect
            v-for="(d, i) in days"
            :key="`hit-${d.date}`"
            :x="PAD.left + band * i"
            :y="PAD.top"
            :width="band"
            :height="plotH"
            class="chart__hit"
            tabindex="0"
            role="img"
            :aria-label="describe(d)"
            @mouseenter="active = i"
            @focus="active = i"
            @blur="active = null"
          />
        </svg>

        <div v-if="tooltip" class="chart__tooltip" :style="{ left: `${tooltip.left}px`, top: `${tooltip.top}px` }" aria-hidden="true">
          <strong>{{ formatRupiah(tooltip.revenue) }}</strong>
          <span>{{ formatDate(day(tooltip.date)) }} · {{ tooltip.orders }} pesanan</span>
        </div>
      </div>

      <button type="button" class="chart__toggle" :aria-expanded="showTable" @click="showTable = !showTable">
        {{ showTable ? 'Sembunyikan tabel' : 'Lihat sebagai tabel' }}
      </button>

      <table v-if="showTable" class="chart__table">
        <caption class="sr-only">Pendapatan harian</caption>
        <thead>
          <tr><th scope="col">Tanggal</th><th scope="col">Pendapatan</th><th scope="col">Pesanan</th></tr>
        </thead>
        <tbody>
          <tr v-for="d in days" :key="`row-${d.date}`">
            <td>{{ formatDate(day(d.date)) }}</td>
            <td>{{ formatRupiah(d.revenue) }}</td>
            <td>{{ d.orders }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<style scoped>
.chart__plot { position: relative; width: 100%; overflow: hidden; }
.chart__plot svg { display: block; }
.chart__grid { stroke: var(--color-line); stroke-width: 1; }
.chart__tick { fill: var(--color-ink-soft); font-size: 11px; font-variant-numeric: tabular-nums; }
.chart__peak { fill: var(--color-ink); font-size: 11.5px; font-weight: 600; }
.chart__bar { fill: var(--color-accent); transition: opacity var(--transition); }
.chart__bar--active { opacity: 0.75; }
.chart__hit { fill: transparent; cursor: default; outline: none; }
.chart__hit:focus-visible { stroke: var(--color-accent); stroke-width: 2; }

.chart__tooltip {
  position: absolute;
  transform: translate(-50%, calc(-100% - 10px));
  pointer-events: none;
  display: flex; flex-direction: column; gap: 2px;
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-soft);
  white-space: nowrap;
}
.chart__tooltip strong { font-size: 14px; }
.chart__tooltip span { font-size: 12px; color: var(--color-ink-soft); }

.chart__empty { padding: var(--space-7) 0; text-align: center; color: var(--color-ink-soft); font-size: 14px; }
.chart__toggle { margin-top: var(--space-3); font-size: 13px; color: var(--color-ink-soft); text-decoration: underline; text-underline-offset: 3px; }
.chart__toggle:hover { color: var(--color-ink); }

.chart__table { width: 100%; margin-top: var(--space-3); border-collapse: collapse; font-size: 13.5px; font-variant-numeric: tabular-nums; }
.chart__table th { text-align: left; font-weight: 500; color: var(--color-ink-soft); }
.chart__table th,
.chart__table td { padding: var(--space-2) 0; border-bottom: 1px solid var(--color-line); }
.chart__table th:not(:first-child),
.chart__table td:not(:first-child) { text-align: right; }
</style>
