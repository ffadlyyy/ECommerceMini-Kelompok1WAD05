<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import SearchBar from '@/components/product/SearchBar.vue'
import CategoryFilter from '@/components/product/CategoryFilter.vue'
import ProductGrid from '@/components/product/ProductGrid.vue'
import PaginationBar from '@/components/product/PaginationBar.vue'
import { useProductStore } from '@/stores/product'

const route = useRoute()
const router = useRouter()
const store = useProductStore()

// Sumber kebenaran filter = query string URL (?q=&category=&sort=&page=)
// sehingga bisa dibagikan, tahan refresh, dan tombol Back berfungsi.
const q = computed(() => String(route.query.q ?? ''))
const category = computed(() => String(route.query.category ?? ''))
const sort = computed(() => String(route.query.sort ?? 'newest'))
const page = computed(() => Math.max(1, parseInt(route.query.page, 10) || 1))

const sortOptions = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga termurah' },
  { value: 'price_desc', label: 'Harga termahal' },
  { value: 'name', label: 'Nama A–Z' },
]

const activeCategoryName = computed(() => store.categories.find((c) => c.slug === category.value)?.name ?? '')
const hasFilter = computed(() => !!(q.value || category.value))

function load() {
  if (route.name !== 'catalog') return // route berubah ke halaman lain saat unmount
  store.fetchProducts({ q: q.value, category: category.value, sort: sort.value, page: page.value })
}
watch(() => route.query, load, { immediate: true })

function updateQuery(patch, { replace = false } = {}) {
  const next = { ...route.query, ...patch }
  for (const key of Object.keys(next)) {
    const v = next[key]
    const isDefault = (key === 'page' && Number(v) === 1) || (key === 'sort' && v === 'newest')
    if (v === '' || v == null || isDefault) delete next[key]
  }
  router[replace ? 'replace' : 'push']({ name: 'catalog', query: next })
}

const onSearch = (value) => updateQuery({ q: value.trim(), page: 1 }, { replace: true })
const onCategory = (slug) => updateQuery({ category: slug, page: 1 })
const onSort = (value) => updateQuery({ sort: value, page: 1 })
const onPage = (n) => {
  updateQuery({ page: n })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
const resetFilters = () => router.push({ name: 'catalog' })

const summary = computed(() => {
  if (store.loading) return 'Memuat produk…'
  let text = `${store.total} produk`
  if (activeCategoryName.value) text += ` di ${activeCategoryName.value}`
  if (q.value) text += ` untuk “${q.value}”`
  return text
})
</script>

<template>
  <section class="container catalog">
    <header class="catalog__head">
      <h1>Katalog</h1>
      <p>Semua perlengkapan rumah pilihan kami.</p>
    </header>

    <div class="catalog__tools">
      <SearchBar class="catalog__search" :model-value="q" :debounce="400" label="Cari di katalog" placeholder="Cari nama produk…" @search="onSearch" />
      <BaseSelect :model-value="sort" label="Urutkan" :options="sortOptions" @update:model-value="onSort" />
    </div>

    <CategoryFilter :categories="store.categories" :model-value="category" @update:model-value="onCategory" />

    <p class="catalog__count" role="status" aria-live="polite">{{ summary }}</p>

    <ProductGrid :products="store.products" :loading="store.loading" :error="store.error" :skeleton-count="9" @retry="load">
      <template v-if="hasFilter" #empty-action>
        <BaseButton variant="outline" @click="resetFilters">Hapus semua filter</BaseButton>
      </template>
    </ProductGrid>

    <PaginationBar v-if="!store.loading && !store.error && store.totalPages > 1" :page="store.page" :total-pages="store.totalPages" @update:page="onPage" />
  </section>
</template>

<style scoped>
.catalog { padding-top: var(--space-7); display: flex; flex-direction: column; gap: var(--space-5); }
.catalog__head h1 { font-size: clamp(30px, 4vw, 42px); }
.catalog__head p { color: var(--color-ink-soft); margin-top: var(--space-2); }
.catalog__tools { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; }
.catalog__search { flex: 1; min-width: 240px; max-width: 460px; }
.catalog__count { font-size: 13.5px; color: var(--color-ink-soft); }
</style>
