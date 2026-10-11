<script setup>
import { computed, ref } from 'vue'
import AppIcon from './AppIcon.vue'

/** Dipakai dua mode: tampilan saja (readonly) atau input (v-model 1–5). */
const model = defineModel({ type: Number, default: 0 })
const props = defineProps({
  readonly: Boolean,
  size: { type: Number, default: 18 },
})

const hover = ref(0)
const shown = computed(() => (props.readonly ? Math.round(model.value) : hover.value || model.value))
const label = computed(() => `Rating ${model.value} dari 5`)
</script>

<template>
  <span v-if="readonly" class="stars" role="img" :aria-label="label">
    <AppIcon
      v-for="n in 5"
      :key="n"
      name="star"
      :size="size"
      :filled="n <= shown"
      :class="['star', { 'star--on': n <= shown }]"
    />
  </span>

  <span v-else class="stars" role="radiogroup" aria-label="Beri rating" @mouseleave="hover = 0">
    <button
      v-for="n in 5"
      :key="n"
      type="button"
      class="star-btn"
      role="radio"
      :aria-checked="model === n"
      :aria-label="`${n} bintang`"
      @click="model = n"
      @mouseenter="hover = n"
    >
      <AppIcon name="star" :size="size" :filled="n <= shown" :class="['star', { 'star--on': n <= shown }]" />
    </button>
  </span>
</template>

<style scoped>
.stars { display: inline-flex; align-items: center; gap: 2px; }
.star { color: var(--color-line); }
.star--on { color: var(--color-star); }
.star-btn { display: inline-flex; padding: 2px; border-radius: 4px; }
</style>
