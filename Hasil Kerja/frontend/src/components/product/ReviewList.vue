<script setup>
import StarRating from '@/components/ui/StarRating.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { formatDate } from '@/utils/format'

defineProps({
  reviews: { type: Array, default: () => [] },
  loading: Boolean,
})
</script>

<template>
  <LoadingSpinner v-if="loading" label="Memuat ulasan…" />
  <EmptyState v-else-if="!reviews.length" title="Belum ada ulasan" description="Jadilah yang pertama memberi ulasan untuk produk ini." />
  <ul v-else class="reviews">
    <li v-for="r in reviews" :key="r.id" class="review">
      <div class="review__head">
        <strong>{{ r.user_name }}</strong>
        <time :datetime="r.created_at">{{ formatDate(r.created_at) }}</time>
      </div>
      <StarRating :model-value="r.rating" readonly :size="15" />
      <!-- Mustache {{ }} meng-escape HTML otomatis. JANGAN diganti v-html (risiko XSS). -->
      <p class="review__text">{{ r.comment }}</p>
    </li>
  </ul>
</template>

<style scoped>
.reviews { display: flex; flex-direction: column; }
.review { padding: var(--space-4) 0; border-bottom: 1px solid var(--color-line); }
.review:last-child { border-bottom: none; }
.review__head { display: flex; justify-content: space-between; gap: var(--space-3); margin-bottom: 4px; font-size: 14px; }
.review__head time { color: var(--color-ink-soft); font-size: 12.5px; }
.review__text { margin-top: var(--space-2); font-size: 14.5px; line-height: 1.6; white-space: pre-line; overflow-wrap: anywhere; }
</style>
