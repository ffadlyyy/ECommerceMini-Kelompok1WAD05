<script setup>
defineProps({
  hoverable: Boolean,
  padded: { type: Boolean, default: true },
})
</script>

<template>
  <div :class="['card', { 'card--hover': hoverable, 'card--padded': padded }]">
    <slot />
  </div>
</template>

<style scoped>
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.card--padded { padding: var(--space-5); }
.card--hover { transition: border-color var(--transition), transform var(--transition); }
.card--hover:hover { border-color: var(--color-ink); transform: translateY(-3px); }
</style>
