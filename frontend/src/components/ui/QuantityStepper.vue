<script setup>
import AppIcon from './AppIcon.vue'

/** Pengatur jumlah. Juga bisa dipakai anggota 4 di halaman keranjang. */
const model = defineModel({ type: Number, default: 1 })
const props = defineProps({
  min: { type: Number, default: 1 },
  max: { type: Number, default: 99 },
})

function change(delta) {
  model.value = Math.min(props.max, Math.max(props.min, model.value + delta))
}
</script>

<template>
  <div class="stepper" role="group" aria-label="Jumlah">
    <button type="button" class="stepper__btn" aria-label="Kurangi" :disabled="model <= min" @click="change(-1)">
      <AppIcon name="minus" :size="16" />
    </button>
    <output class="stepper__value" aria-live="polite">{{ model }}</output>
    <button type="button" class="stepper__btn" aria-label="Tambah" :disabled="model >= max" @click="change(1)">
      <AppIcon name="plus" :size="16" />
    </button>
  </div>
</template>

<style scoped>
.stepper { display: inline-flex; align-items: center; border: 1px solid var(--color-line); border-radius: var(--radius-pill); background: var(--color-surface); }
.stepper__btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.stepper__btn:hover:not(:disabled) { background: var(--color-muted); }
.stepper__btn:disabled { opacity: 0.35; cursor: not-allowed; }
.stepper__value { min-width: 32px; text-align: center; font-weight: 600; font-size: 15px; }
</style>
