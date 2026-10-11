<script setup>
import { useId } from 'vue'

const model = defineModel({ type: String, default: '' })
defineProps({
  label: { type: String, default: '' },
  /** [{ value, label }] */
  options: { type: Array, default: () => [] },
})
const id = useId()
</script>

<template>
  <div class="select">
    <label v-if="label" :for="id" class="select__label">{{ label }}</label>
    <select :id="id" v-model="model" class="select__control">
      <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
  </div>
</template>

<style scoped>
.select { display: flex; align-items: center; gap: var(--space-2); }
.select__label { font-size: 13.5px; color: var(--color-ink-soft); white-space: nowrap; }
.select__control {
  padding: 10px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  font-size: 14px;
  cursor: pointer;
}
.select__control:hover { border-color: var(--color-ink-soft); }
</style>
