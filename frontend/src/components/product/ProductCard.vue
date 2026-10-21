<script setup>
import { onBeforeUnmount, ref } from 'vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PriceTag from '@/components/ui/PriceTag.vue'
import StarRating from '@/components/ui/StarRating.vue'
import ProductImage from './ProductImage.vue'
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  /** Objek produk sesuai kontrak API (id, name, price, stock, category, image_url, is_new, rating_avg, rating_count) */
  product: { type: Object, required: true },
})

const cart = useCartStore()
const added = ref(false)
const error = ref('')
let timer = null

async function add() {
  error.value = ''
  try {
    await cart.addItem(props.product, 1)
    added.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (added.value = false), 1600)
  } catch (e) {
    error.value = e.message || 'Gagal menambahkan ke keranjang.'
  }
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <article class="card">
    <RouterLink :to="{ name: 'product-detail', params: { id: product.id } }" class="card__media" :aria-label="`Lihat ${product.name}`" tabindex="-1">
      <ProductImage :src="product.image_url" :alt="product.name" :icon="product.icon" />
      <BaseBadge v-if="product.stock === 0" variant="danger" class="card__tag">Habis</BaseBadge>
      <BaseBadge v-else-if="product.is_new" class="card__tag">Baru</BaseBadge>
    </RouterLink>

    <div class="card__info">
      <p class="card__cat">{{ product.category?.name }}</p>
      <h3 class="card__name">
        <RouterLink :to="{ name: 'product-detail', params: { id: product.id } }">{{ product.name }}</RouterLink>
      </h3>
      <div v-if="product.rating_count" class="card__rating">
        <StarRating :model-value="product.rating_avg" readonly :size="14" />
        <span>({{ product.rating_count }})</span>
      </div>
      <div class="card__row">
        <PriceTag :value="product.price" />
        <BaseButton
          size="sm"
          :variant="added ? 'accent' : 'outline'"
          :disabled="product.stock === 0"
          :aria-label="`Tambah ${product.name} ke keranjang`"
          @click="add"
        >
          {{ product.stock === 0 ? 'Habis' : added ? 'Ditambahkan' : 'Tambah' }}
        </BaseButton>
      </div>
      <p v-if="error" class="card__error" role="alert">{{ error }}</p>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex; flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: 20px;
  overflow: hidden;
  transition: border-color var(--transition), transform var(--transition);
}
.card:hover { border-color: var(--color-ink); transform: translateY(-4px); }
.card__media { position: relative; display: block; aspect-ratio: 4 / 3.4; }
.card__tag { position: absolute; top: 14px; left: 14px; }
.card__info { padding: 18px 20px 20px; display: flex; flex-direction: column; flex: 1; }
.card__cat { font-size: 12px; color: var(--color-ink-soft); margin-bottom: 5px; }
.card__name { font-family: var(--font-body); font-weight: 600; font-size: 15.5px; margin-bottom: 8px; }
.card__name a:hover { text-decoration: underline; text-underline-offset: 3px; }
.card__rating { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-size: 12px; color: var(--color-ink-soft); }
.card__error { margin-top: var(--space-2); font-size: 12.5px; color: var(--color-danger); }
.card__row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); margin-top: auto; padding-top: var(--space-2); }
</style>
