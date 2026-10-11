<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
})
const emit = defineEmits(['update:page'])

// Jendela maksimal 5 nomor di sekitar halaman aktif
const pages = computed(() => {
  const start = Math.max(1, Math.min(props.page - 2, props.totalPages - 4))
  const end = Math.min(props.totalPages, start + 4)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

function go(n) {
  if (n >= 1 && n <= props.totalPages && n !== props.page) emit('update:page', n)
}
</script>

<template>
  <nav class="pager" aria-label="Halaman">
    <button type="button" class="pager__btn" aria-label="Halaman sebelumnya" :disabled="page <= 1" @click="go(page - 1)">
      <AppIcon name="chevronLeft" :size="16" />
    </button>
    <button
      v-for="n in pages"
      :key="n"
      type="button"
      :class="['pager__btn', { 'pager__btn--active': n === page }]"
      :aria-current="n === page ? 'page' : undefined"
      :aria-label="`Halaman ${n}`"
      @click="go(n)"
    >
      {{ n }}
    </button>
    <button type="button" class="pager__btn" aria-label="Halaman berikutnya" :disabled="page >= totalPages" @click="go(page + 1)">
      <AppIcon name="chevronRight" :size="16" />
    </button>
  </nav>
</template>

<style scoped>
.pager { display: flex; justify-content: center; gap: var(--space-2); margin-top: var(--space-6); }
.pager__btn {
  min-width: 40px; height: 40px; padding: 0 10px; border-radius: 50%;
  border: 1px solid var(--color-line); background: var(--color-surface);
  display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 500;
}
.pager__btn:hover:not(:disabled) { border-color: var(--color-ink); }
.pager__btn:disabled { opacity: 0.35; cursor: not-allowed; }
.pager__btn--active { background: var(--color-ink); border-color: var(--color-ink); color: var(--color-on-ink); }
</style>
