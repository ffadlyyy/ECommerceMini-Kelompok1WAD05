<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  /** 'primary' | 'outline' | 'accent' | 'text' */
  variant: { type: String, default: 'primary' },
  /** 'md' | 'sm' */
  size: { type: String, default: 'md' },
  /** Jika diisi, dirender sebagai <RouterLink> */
  to: { type: [String, Object], default: null },
  type: { type: String, default: 'button' },
  block: Boolean,
  disabled: Boolean,
})

const tag = computed(() => (props.to ? RouterLink : 'button'))
</script>

<template>
  <component
    :is="tag"
    :to="to || undefined"
    :type="to ? undefined : type"
    :disabled="to ? undefined : disabled"
    :class="['btn', `btn--${variant}`, `btn--${size}`, { 'btn--block': block }]"
  >
    <slot />
  </component>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-weight: 500;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  white-space: nowrap;
  transition: opacity var(--transition), transform var(--transition),
    background var(--transition), color var(--transition);
}
.btn--md { padding: 13px 26px; font-size: 14.5px; }
.btn--sm { padding: 8px 14px; font-size: 12.5px; }
.btn--block { width: 100%; }

.btn--primary { background: var(--color-ink); color: var(--color-on-ink); }
.btn--primary:hover:not(:disabled) { opacity: 0.86; transform: translateY(-1px); }

.btn--outline { border-color: var(--color-ink); color: var(--color-ink); }
.btn--outline:hover:not(:disabled) { background: var(--color-ink); color: var(--color-on-ink); }

.btn--accent { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-bg); }

.btn--text {
  padding: 0 0 2px;
  border-radius: 0;
  border-bottom-color: var(--color-ink);
  color: var(--color-ink);
}

.btn:disabled,
.btn[aria-disabled='true'] {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
