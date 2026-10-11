<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps({
  categories: { type: Array, default: () => [] },
  /** slug kategori aktif, '' = semua */
  modelValue: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="filter" role="group" aria-label="Filter kategori">
    <button
      type="button"
      :class="['chip', { 'chip--active': modelValue === '' }]"
      :aria-pressed="modelValue === ''"
      @click="$emit('update:modelValue', '')"
    >
      Semua
    </button>
    <button
      v-for="c in categories"
      :key="c.id"
      type="button"
      :class="['chip', { 'chip--active': modelValue === c.slug }]"
      :aria-pressed="modelValue === c.slug"
      @click="$emit('update:modelValue', modelValue === c.slug ? '' : c.slug)"
    >
      <AppIcon :name="c.slug" set="category" :size="16" />
      {{ c.name }}
    </button>
  </div>
</template>

<style scoped>
.filter { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 16px; border-radius: var(--radius-pill);
  border: 1px solid var(--color-line); background: var(--color-surface);
  font-size: 13.5px; font-weight: 500;
  transition: border-color var(--transition), background var(--transition), color var(--transition);
}
.chip:hover { border-color: var(--color-ink); }
.chip--active { background: var(--color-ink); border-color: var(--color-ink); color: var(--color-on-ink); }
</style>
