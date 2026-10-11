<script setup>
import AppIcon from './AppIcon.vue'
import BaseButton from './BaseButton.vue'

defineProps({
  message: { type: String, default: 'Terjadi kesalahan.' },
  retryable: { type: Boolean, default: true },
})
defineEmits(['retry'])
</script>

<template>
  <div class="error" role="alert">
    <AppIcon name="alert" :size="22" />
    <p class="error__text">{{ message }}</p>
    <BaseButton v-if="retryable" variant="outline" size="sm" @click="$emit('retry')">Coba lagi</BaseButton>
  </div>
</template>

<style scoped>
.error {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-3);
  padding: var(--space-6) var(--space-4); text-align: center;
  background: var(--color-danger-bg); color: var(--color-danger);
  border-radius: var(--radius-md);
}
.error__text { font-size: 14.5px; }
</style>
