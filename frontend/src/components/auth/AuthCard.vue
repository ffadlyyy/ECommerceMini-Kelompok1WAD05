<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <section class="container auth">
    <div class="auth__card">
      <header class="auth__head">
        <h1>{{ title }}</h1>
        <p v-if="subtitle">{{ subtitle }}</p>
      </header>
      <slot />
      <footer v-if="$slots.footer" class="auth__foot"><slot name="footer" /></footer>
    </div>
  </section>
</template>

<style scoped>
.auth { padding-top: var(--space-8); padding-bottom: var(--space-8); display: flex; justify-content: center; }
.auth__card {
  width: 100%;
  max-width: 420px;
  padding: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  display: flex; flex-direction: column; gap: var(--space-5);
}
.auth__head h1 { font-size: clamp(28px, 4vw, 34px); }
.auth__head p { color: var(--color-ink-soft); margin-top: var(--space-2); font-size: 14.5px; }
.auth__foot { font-size: 14px; color: var(--color-ink-soft); text-align: center; }
.auth__foot :deep(a) { color: var(--color-ink); font-weight: 500; text-decoration: underline; text-underline-offset: 3px; }

@media (max-width: 480px) {
  .auth { padding-top: var(--space-6); }
  .auth__card { padding: var(--space-5); }
}
</style>
