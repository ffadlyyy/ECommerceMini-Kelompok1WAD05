<script setup>
import { onBeforeUnmount, ref, useId, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { debounce } from '@/utils/debounce'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Cari produk…' },
  label: { type: String, default: 'Cari produk' },
  /** ms. 0 = hanya cari saat Enter; >0 = cari otomatis setelah berhenti mengetik */
  debounce: { type: Number, default: 0 },
})
const emit = defineEmits(['update:modelValue', 'search'])

const inputId = useId()
const text = ref(props.modelValue)
let lastEmitted = props.modelValue

// Sinkron bila nilai berubah dari luar (mis. URL), tapi jangan menimpa ketikan user.
watch(
  () => props.modelValue,
  (v) => {
    if (v !== lastEmitted) text.value = v
  },
)

const emitSearch = debounce((value) => {
  lastEmitted = value
  emit('search', value)
}, props.debounce)

function onInput() {
  emit('update:modelValue', text.value)
  if (props.debounce > 0) emitSearch(text.value)
}
function submit() {
  emitSearch.cancel()
  lastEmitted = text.value
  emit('search', text.value)
}
function clear() {
  text.value = ''
  emit('update:modelValue', '')
  emitSearch.cancel()
  lastEmitted = ''
  emit('search', '')
}

onBeforeUnmount(() => emitSearch.cancel())
</script>

<template>
  <form class="search" role="search" @submit.prevent="submit">
    <label class="sr-only" :for="inputId">{{ label }}</label>
    <AppIcon name="search" :size="18" class="search__icon" />
    <input
      :id="inputId"
      v-model="text"
      class="search__input"
      type="search"
      :placeholder="placeholder"
      autocomplete="off"
      maxlength="100"
      @input="onInput"
    />
    <button v-if="text" type="button" class="search__clear" aria-label="Hapus pencarian" @click="clear">
      <AppIcon name="close" :size="14" />
    </button>
  </form>
</template>

<style scoped>
.search {
  position: relative; display: flex; align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  transition: border-color var(--transition);
}
.search:hover { border-color: var(--color-ink-soft); }
.search:focus-within { border-color: var(--color-ink); }
.search__icon { margin-left: 14px; color: var(--color-ink-soft); }
.search__input {
  flex: 1; min-width: 0; padding: 11px 12px;
  background: none; border: none; font-size: 14px;
}
.search__input:focus { outline: none; }
.search__input::placeholder { color: var(--color-ink-soft); }
.search__input::-webkit-search-cancel-button { display: none; }
.search__clear { margin-right: 8px; width: 26px; height: 26px; border-radius: 50%; background: var(--color-muted); display: flex; align-items: center; justify-content: center; }
</style>
