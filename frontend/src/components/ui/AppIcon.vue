<script setup>
import { computed } from 'vue'
import { resolveIcon } from './icons'

const props = defineProps({
  name: { type: String, required: true },
  /** Batasi pencarian ke 'ui' | 'category' | 'product' */
  set: { type: String, default: '' },
  size: { type: [Number, String], default: 20 },
  strokeWidth: { type: [Number, String], default: 1.6 },
  filled: Boolean,
})

const icon = computed(() => resolveIcon(props.name, props.set || undefined))
</script>

<template>
  <svg
    v-if="icon"
    class="app-icon"
    :viewBox="icon.viewBox"
    :width="size"
    :height="size"
    :fill="filled ? 'currentColor' : 'none'"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <component :is="shape[0]" v-for="(shape, i) in icon.shapes" :key="i" v-bind="shape[1]" />
  </svg>
</template>

<style scoped>
.app-icon {
  flex-shrink: 0;
}
</style>
