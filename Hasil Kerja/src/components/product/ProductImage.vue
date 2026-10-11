<script setup>
import { computed, ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  /** URL gambar dari backend (product.image_url). Bila kosong/gagal dimuat -> ikon placeholder. */
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  /** Kunci ikon placeholder (mock) */
  icon: { type: String, default: '' },
})

const failed = ref(false)
watch(() => props.src, () => (failed.value = false))

const showImage = computed(() => !!props.src && !failed.value)
const iconName = computed(() => props.icon || 'box')
</script>

<template>
  <div class="media">
    <img v-if="showImage" :src="src" :alt="alt" loading="lazy" class="media__img" @error="failed = true" />
    <AppIcon v-else :name="iconName" set="product" size="44%" :stroke-width="1.4" class="media__icon" />
  </div>
</template>

<style scoped>
.media { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--color-muted); }
.media__img { width: 100%; height: 100%; object-fit: cover; }
.media__icon { color: var(--color-ink); }
</style>
