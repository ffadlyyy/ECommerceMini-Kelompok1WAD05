<script setup>
import { onBeforeUnmount, watch } from 'vue'

const open = defineModel({ type: Boolean, default: false })
defineProps({ title: { type: String, default: '' } })

function close() {
  open.value = false
}
function onKey(e) {
  if (e.key === 'Escape') close()
}

watch(open, (isOpen) => {
  if (isOpen) document.addEventListener('keydown', onKey)
  else document.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal" @click.self="close">
      <div class="modal__panel" role="dialog" aria-modal="true" :aria-label="title || undefined">
        <header class="modal__head">
          <h2 v-if="title" class="modal__title">{{ title }}</h2>
          <button class="modal__close" type="button" aria-label="Tutup" @click="close">✕</button>
        </header>
        <div class="modal__body"><slot /></div>
        <footer v-if="$slots.footer" class="modal__foot"><slot name="footer" /></footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: rgba(34, 26, 21, 0.55);
}
.modal__panel {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: auto;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}
.modal__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4); }
.modal__title { font-size: 22px; }
.modal__close { width: 32px; height: 32px; border-radius: 50%; background: var(--color-muted); }
.modal__foot { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-5); }
</style>
