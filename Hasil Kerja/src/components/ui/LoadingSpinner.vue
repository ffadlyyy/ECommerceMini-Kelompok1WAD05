<script setup>
defineProps({ label: { type: String, default: 'Memuat…' } })
</script>

<template>
  <div class="spinner" role="status">
    <span class="spinner__ring" aria-hidden="true" />
    <span class="spinner__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.spinner { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-7) 0; color: var(--color-ink-soft); font-size: 14px; }
.spinner__ring {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2px solid var(--color-line); border-top-color: var(--color-ink);
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
