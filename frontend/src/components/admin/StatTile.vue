<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  hint: { type: String, default: '' },
  /** Angka utama dashboard (hanya satu per halaman) */
  hero: Boolean,
})
</script>

<template>
  <div :class="['stat', { 'stat--hero': hero }]">
    <p class="stat__label">{{ label }}</p>
    <p class="stat__value">{{ value }}</p>
    <p v-if="hint" class="stat__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.stat {
  min-width: 0;
  overflow-wrap: anywhere;
  display: flex; flex-direction: column; gap: var(--space-1);
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
}
.stat__label { font-size: 13px; color: var(--color-ink-soft); }
.stat__value { font-size: 26px; font-weight: 600; letter-spacing: -0.01em; }
.stat--hero .stat__value { font-size: clamp(30px, 3vw, 44px); line-height: 1.1; }
.stat__hint { font-size: 12.5px; color: var(--color-ink-soft); }
</style>
