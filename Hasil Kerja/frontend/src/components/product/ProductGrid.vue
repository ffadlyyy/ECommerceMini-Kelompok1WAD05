<script setup>
import ProductCard from './ProductCard.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

defineProps({
  products: { type: Array, default: () => [] },
  loading: Boolean,
  error: { type: String, default: '' },
  skeletonCount: { type: Number, default: 6 },
  emptyTitle: { type: String, default: 'Produk tidak ditemukan' },
  emptyText: { type: String, default: 'Coba ubah kata kunci atau kategori.' },
})
defineEmits(['retry'])
</script>

<template>
  <!-- Tiga state wajib di semua halaman data: loading, error, kosong -->
  <div v-if="loading" class="grid" aria-busy="true" aria-live="polite">
    <span class="sr-only">Memuat produk…</span>
    <div v-for="n in skeletonCount" :key="n" class="skeleton" aria-hidden="true">
      <div class="skeleton__media" />
      <div class="skeleton__line skeleton__line--short" />
      <div class="skeleton__line" />
    </div>
  </div>

  <ErrorMessage v-else-if="error" :message="error" @retry="$emit('retry')" />

  <EmptyState v-else-if="!products.length" :title="emptyTitle" :description="emptyText">
    <slot name="empty-action" />
  </EmptyState>

  <ul v-else class="grid">
    <li v-for="p in products" :key="p.id"><ProductCard :product="p" /></li>
  </ul>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); }
.grid > li { display: flex; flex-direction: column; }
.grid > li > :deep(.card) { flex: 1; }

.skeleton { border: 1px solid var(--color-line); border-radius: 20px; padding-bottom: 20px; background: var(--color-surface); overflow: hidden; }
.skeleton__media { aspect-ratio: 4 / 3.4; background: var(--color-muted); animation: pulse 1.4s ease-in-out infinite; margin-bottom: 18px; }
.skeleton__line { height: 14px; margin: 0 20px 10px; border-radius: 7px; background: var(--color-muted); animation: pulse 1.4s ease-in-out infinite; }
.skeleton__line--short { width: 35%; }
@keyframes pulse { 50% { opacity: 0.5; } }

@media (max-width: 980px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
</style>
