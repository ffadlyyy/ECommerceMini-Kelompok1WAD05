<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps({
  category: { type: Object, required: true }, // { id, name, slug }
})
</script>

<template>
  <RouterLink :to="{ name: 'catalog', query: { category: category.slug } }" class="tile">
    <span class="tile__icon"><AppIcon :name="category.slug" set="category" :size="22" :stroke-width="1.5" /></span>
    <span class="tile__name">{{ category.name }}</span>
  </RouterLink>
</template>

<style scoped>
.tile {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: 26px 10px; border: 1px solid var(--color-line); border-radius: 18px;
  background: var(--color-surface);
  transition: border-color var(--transition), transform var(--transition);
}
.tile:hover { border-color: var(--color-ink); transform: translateY(-3px); }
.tile__icon { width: 52px; height: 52px; border-radius: 50%; background: var(--color-muted); display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.tile__name { font-size: 13.5px; font-weight: 500; }
</style>
