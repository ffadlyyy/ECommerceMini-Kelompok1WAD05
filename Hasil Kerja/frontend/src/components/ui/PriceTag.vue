<script setup>
import { formatRupiah } from '@/utils/format'

defineProps({
  value: { type: Number, required: true },
  large: Boolean,
})
</script>

<template>
  <span :class="['price', { 'price--large': large }]">{{ formatRupiah(value) }}</span>
</template>

<style scoped>
.price { font-weight: 600; font-size: 15px; }
.price--large { font-size: 26px; font-family: var(--font-display); font-weight: 500; }
</style>
