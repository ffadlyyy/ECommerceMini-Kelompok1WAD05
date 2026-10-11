<script setup>
defineProps({
  /** 'dark' | 'accent' | 'muted' | 'success' | 'danger' */
  variant: { type: String, default: 'dark' },
})
</script>

<template>
  <span :class="['badge', `badge--${variant}`]"><slot /></span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
}
.badge--dark { background: var(--color-ink); color: var(--color-on-ink); }
.badge--accent { background: var(--color-accent); color: var(--color-bg); }
.badge--muted { background: var(--color-muted); color: var(--color-ink); }
.badge--success { background: var(--color-success-bg); color: var(--color-success); }
.badge--danger { background: var(--color-danger-bg); color: var(--color-danger); }
</style>
