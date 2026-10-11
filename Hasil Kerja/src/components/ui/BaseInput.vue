<script setup>
import { useId } from 'vue'

const model = defineModel({ type: [String, Number], default: '' })
defineProps({
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  required: Boolean,
  /** Jika true, dirender sebagai <textarea> */
  multiline: Boolean,
  rows: { type: Number, default: 4 },
  maxlength: { type: Number, default: undefined },
})

const id = useId()
</script>

<template>
  <div class="field">
    <label v-if="label" :for="id" class="field__label">
      {{ label }}<span v-if="required" aria-hidden="true"> *</span>
    </label>
    <textarea
      v-if="multiline"
      :id="id"
      v-model="model"
      class="field__control"
      :class="{ 'field__control--error': error }"
      :rows="rows"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :required="required"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${id}-msg` : hint ? `${id}-msg` : undefined"
    />
    <input
      v-else
      :id="id"
      v-model="model"
      class="field__control"
      :class="{ 'field__control--error': error }"
      :type="type"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :required="required"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${id}-msg` : hint ? `${id}-msg` : undefined"
    />
    <p v-if="error" :id="`${id}-msg`" class="field__msg field__msg--error" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-msg`" class="field__msg">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: var(--space-2); }
.field__label { font-size: 13.5px; font-weight: 500; }
.field__control {
  width: 100%;
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  font-size: 14.5px;
  transition: border-color var(--transition);
  resize: vertical;
}
.field__control::placeholder { color: var(--color-ink-soft); }
.field__control:hover { border-color: var(--color-ink-soft); }
.field__control:focus { outline: none; border-color: var(--color-ink); }
.field__control--error { border-color: var(--color-danger); }
.field__msg { font-size: 12.5px; color: var(--color-ink-soft); }
.field__msg--error { color: var(--color-danger); }
</style>
