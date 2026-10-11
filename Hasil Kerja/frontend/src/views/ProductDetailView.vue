<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import PriceTag from '@/components/ui/PriceTag.vue'
import QuantityStepper from '@/components/ui/QuantityStepper.vue'
import StarRating from '@/components/ui/StarRating.vue'
import ProductImage from '@/components/product/ProductImage.vue'
import ReviewForm from '@/components/product/ReviewForm.vue'
import ReviewList from '@/components/product/ReviewList.vue'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { USE_MOCK } from '@/services/productService'

const route = useRoute()
const store = useProductStore()
const cart = useCartStore()
const auth = useAuthStore()

const product = computed(() => store.current)
const quantity = ref(1)
const added = ref(false)
const reviewError = ref('')
let timer = null

// Mode mock: form tampil walau belum login supaya bisa didemokan.
const canReview = computed(() => auth.isAuthenticated || USE_MOCK)

const stockInfo = computed(() => {
  const s = product.value?.stock ?? 0
  if (s === 0) return { text: 'Stok habis', variant: 'danger' }
  if (s <= 5) return { text: `Tersisa ${s}`, variant: 'accent' }
  return { text: `Stok tersedia (${s})`, variant: 'success' }
})

function load() {
  quantity.value = 1
  added.value = false
  store.fetchProduct(route.params.id)
  store.fetchReviews(route.params.id)
}
watch(() => route.params.id, load, { immediate: true })

watch(product, (p) => {
  document.title = p ? `${p.name} — Nook` : 'Detail Produk — Nook'
})

function addToCart() {
  cart.addItem(product.value, quantity.value)
  added.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (added.value = false), 2500)
}
onBeforeUnmount(() => clearTimeout(timer))

async function submitReview(payload, done) {
  reviewError.value = ''
  try {
    await store.submitReview(route.params.id, payload)
    done()
  } catch (e) {
    reviewError.value = e.status === 401 ? 'Silakan masuk terlebih dahulu untuk menulis ulasan.' : e.message || 'Gagal mengirim ulasan.'
  }
}
</script>

<template>
  <section class="container detail">
    <nav class="crumbs" aria-label="Breadcrumb">
      <RouterLink :to="{ name: 'home' }">Beranda</RouterLink>
      <span aria-hidden="true">/</span>
      <RouterLink :to="{ name: 'catalog' }">Katalog</RouterLink>
      <template v-if="product">
        <span aria-hidden="true">/</span>
        <RouterLink :to="{ name: 'catalog', query: { category: product.category.slug } }">{{ product.category.name }}</RouterLink>
      </template>
    </nav>

    <LoadingSpinner v-if="store.currentLoading" label="Memuat produk…" />
    <ErrorMessage
      v-else-if="store.currentError"
      :message="store.currentError"
      :retryable="store.currentError !== 'Produk tidak ditemukan.'"
      @retry="load"
    />

    <template v-else-if="product">
      <div class="detail__main">
        <div class="detail__media">
          <ProductImage :src="product.image_url" :alt="product.name" :icon="product.icon" />
        </div>

        <div class="detail__info">
          <div class="detail__badges">
            <BaseBadge variant="muted">{{ product.category.name }}</BaseBadge>
            <BaseBadge v-if="product.is_new">Baru</BaseBadge>
          </div>
          <h1>{{ product.name }}</h1>

          <div v-if="product.rating_count" class="detail__rating">
            <StarRating :model-value="product.rating_avg" readonly :size="18" />
            <a href="#ulasan">{{ product.rating_avg }} · {{ product.rating_count }} ulasan</a>
          </div>
          <a v-else href="#ulasan" class="detail__rating detail__rating--none">Belum ada ulasan</a>

          <PriceTag :value="product.price" large />
          <BaseBadge :variant="stockInfo.variant">{{ stockInfo.text }}</BaseBadge>

          <p class="detail__desc">{{ product.description }}</p>

          <div class="detail__buy">
            <QuantityStepper v-model="quantity" :min="1" :max="Math.max(1, product.stock)" />
            <BaseButton :disabled="product.stock === 0" @click="addToCart">
              {{ product.stock === 0 ? 'Stok habis' : 'Tambah ke keranjang' }}
            </BaseButton>
          </div>
          <p v-if="added" class="detail__added" role="status">
            Ditambahkan ke keranjang.
            <RouterLink :to="{ name: 'cart' }">Lihat keranjang</RouterLink>
          </p>
        </div>
      </div>

      <section id="ulasan" class="reviews" aria-labelledby="reviews-title">
        <h2 id="reviews-title">Ulasan pelanggan</h2>
        <div class="reviews__grid">
          <ReviewList :reviews="store.reviews" :loading="store.reviewsLoading" />
          <div class="reviews__form">
            <ReviewForm
              v-if="canReview"
              :submitting="store.reviewSubmitting"
              :server-error="reviewError"
              @submit="submitReview"
            />
            <p v-else class="reviews__login">
              <RouterLink :to="{ name: 'login' }">Masuk</RouterLink> untuk menulis ulasan.
            </p>
          </div>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.detail { padding-top: var(--space-5); }
.crumbs { display: flex; flex-wrap: wrap; gap: var(--space-2); font-size: 13px; color: var(--color-ink-soft); margin-bottom: var(--space-5); }
.crumbs a:hover { color: var(--color-ink); text-decoration: underline; text-underline-offset: 3px; }

.detail__main { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-7); align-items: start; }
.detail__media { aspect-ratio: 1 / 1; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--color-line); }
.detail__info { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-4); }
.detail__badges { display: flex; gap: var(--space-2); }
.detail__info h1 { font-size: clamp(30px, 4vw, 42px); }
.detail__rating { display: flex; align-items: center; gap: var(--space-2); font-size: 13.5px; color: var(--color-ink-soft); }
.detail__rating a:hover,
a.detail__rating:hover { text-decoration: underline; text-underline-offset: 3px; }
.detail__desc { color: var(--color-ink-soft); line-height: 1.7; max-width: 52ch; }
.detail__buy { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-4); margin-top: var(--space-2); }
.detail__added { font-size: 14px; color: var(--color-success); }
.detail__added a { text-decoration: underline; text-underline-offset: 3px; font-weight: 500; }

.reviews { margin-top: var(--space-8); padding-top: var(--space-6); border-top: 1px solid var(--color-line); scroll-margin-top: calc(var(--header-h) + 16px); }
.reviews h2 { font-size: 28px; margin-bottom: var(--space-5); }
.reviews__grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: var(--space-7); align-items: start; }
.reviews__form { background: var(--color-surface); border: 1px solid var(--color-line); border-radius: var(--radius-md); padding: var(--space-5); }
.reviews__login a { text-decoration: underline; text-underline-offset: 3px; font-weight: 500; }

@media (max-width: 900px) {
  .detail__main,
  .reviews__grid { grid-template-columns: 1fr; gap: var(--space-5); }
}
</style>
