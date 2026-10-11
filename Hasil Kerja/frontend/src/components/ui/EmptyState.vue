<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  title: { type: String, default: 'Belum ada data' },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="empty">
    <span class="empty__icon"><AppIcon name="box" :size="26" /></span>
    <h3 class="empty__title">{{ title }}</h3>
    <p v-if="description" class="empty__text">{{ description }}</p>
    <div v-if="$slots.default" class="empty__action"><slot /></div>
  </div>
</template>

<style scoped>
.empty { display: flex; flex-direction: column; align-items: center; text-align: center; padding: var(--space-7) var(--space-4); }
.empty__icon { width: 56px; height: 56px; border-radius: 50%; background: var(--color-muted); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-4); }
.empty__title { font-size: 22px; margin-bottom: var(--space-2); }
.empty__text { color: var(--color-ink-soft); font-size: 14.5px; max-width: 42ch; }
.empty__action { margin-top: var(--space-5); }
</style>
