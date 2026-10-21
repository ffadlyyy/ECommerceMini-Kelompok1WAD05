<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ProductFormModal from '@/components/admin/ProductFormModal.vue'
import PaginationBar from '@/components/product/PaginationBar.vue'
import SearchBar from '@/components/product/SearchBar.vue'
import { useAdminStore } from '@/stores/admin'
import { useProductStore } from '@/stores/product'
import { formatDate, formatRupiah } from '@/utils/format'

const store = useAdminStore()
const productStore = useProductStore()

const q = ref('')
const page = ref(1)
const notice = ref('')

const formOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const formError = ref('')

const deleting = ref(null)
const deleteOpen = computed({
  get: () => !!deleting.value,
  set: (v) => {
    if (!v) deleting.value = null
  },
})
const deleteBusy = ref(false)
const deleteError = ref('')

function load() {
  store.fetchProducts({ q: q.value, page: page.value })
}
onMounted(() => {
  productStore.fetchCategories()
  load()
})

function onSearch(value) {
  q.value = value.trim()
  page.value = 1
  load()
}
function onPage(n) {
  page.value = n
  load()
}

function openCreate() {
  editing.value = null
  formError.value = ''
  formOpen.value = true
}
function openEdit(product) {
  editing.value = product
  formError.value = ''
  formOpen.value = true
}

async function onSubmit(payload) {
  saving.value = true
  formError.value = ''
  try {
    const saved = await store.saveProduct(payload, editing.value?.id)
    notice.value = editing.value ? `“${saved.name}” berhasil diperbarui.` : `“${saved.name}” berhasil ditambahkan.`
    formOpen.value = false
    load()
  } catch (e) {
    formError.value = e.message || 'Gagal menyimpan produk.'
  } finally {
    saving.value = false
  }
}

function askDelete(product) {
  deleteError.value = ''
  deleting.value = product
}

async function confirmDelete() {
  deleteBusy.value = true
  deleteError.value = ''
  try {
    const name = deleting.value.name
    await store.deleteProduct(deleting.value.id)
    notice.value = `“${name}” berhasil dihapus.`
    deleting.value = null
    // Mundur satu halaman bila item terakhir di halaman ini dihapus
    if (store.products.length === 1 && page.value > 1) page.value -= 1
    load()
  } catch (e) {
    deleteError.value = e.message || 'Gagal menghapus produk.'
  } finally {
    deleteBusy.value = false
  }
}
</script>

<template>
  <div class="admin-products">
    <header class="head">
      <div>
        <h1>Produk</h1>
        <p>{{ store.productsTotal }} produk di katalog.</p>
      </div>
      <BaseButton @click="openCreate">Tambah produk</BaseButton>
    </header>

    <SearchBar class="search" :model-value="q" :debounce="400" label="Cari produk" placeholder="Cari nama produk…" @search="onSearch" />

    <p v-if="notice" class="notice" role="status">{{ notice }}</p>

    <LoadingSpinner v-if="store.productsLoading" label="Memuat produk…" />
    <ErrorMessage v-else-if="store.productsError" :message="store.productsError" @retry="load" />
    <EmptyState v-else-if="!store.products.length" :title="q ? 'Produk tidak ditemukan' : 'Belum ada produk'" :description="q ? `Tidak ada produk yang cocok dengan “${q}”.` : 'Tambahkan produk pertama ke katalog.'" />

    <div v-else class="table-wrap">
      <table class="table">
        <caption class="sr-only">Daftar produk</caption>
        <thead>
          <tr>
            <th scope="col">Produk</th>
            <th scope="col">Kategori</th>
            <th scope="col" class="num">Harga</th>
            <th scope="col" class="num">Stok</th>
            <th scope="col">Ditambahkan</th>
            <th scope="col"><span class="sr-only">Aksi</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in store.products" :key="p.id">
            <td>
              <RouterLink :to="{ name: 'product-detail', params: { id: p.id } }" class="table__name">{{ p.name }}</RouterLink>
              <BaseBadge v-if="p.is_new" variant="muted" class="table__new">Baru</BaseBadge>
            </td>
            <td>{{ p.category?.name }}</td>
            <td class="num">{{ formatRupiah(p.price) }}</td>
            <td class="num">
              <BaseBadge v-if="p.stock === 0" variant="danger">Habis</BaseBadge>
              <span v-else>{{ p.stock }}</span>
            </td>
            <td>{{ formatDate(p.created_at) }}</td>
            <td>
              <div class="actions">
                <BaseButton variant="outline" size="sm" :aria-label="`Ubah ${p.name}`" @click="openEdit(p)">Ubah</BaseButton>
                <BaseButton variant="text" size="sm" :aria-label="`Hapus ${p.name}`" @click="askDelete(p)">Hapus</BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginationBar
      v-if="!store.productsLoading && !store.productsError && store.productsTotalPages > 1"
      :page="store.productsPage"
      :total-pages="store.productsTotalPages"
      @update:page="onPage"
    />

    <ProductFormModal
      v-model="formOpen"
      :product="editing"
      :categories="productStore.categories"
      :saving="saving"
      :error="formError"
      @submit="onSubmit"
    />

    <BaseModal v-model="deleteOpen" title="Hapus produk?">
      <p class="confirm">“{{ deleting?.name }}” akan dihapus dari katalog. Tindakan ini tidak bisa dibatalkan.</p>
      <p v-if="deleteError" class="confirm__error" role="alert">{{ deleteError }}</p>
      <template #footer>
        <BaseButton variant="outline" size="sm" @click="deleteOpen = false">Batal</BaseButton>
        <BaseButton size="sm" :disabled="deleteBusy" @click="confirmDelete">
          {{ deleteBusy ? 'Menghapus…' : 'Hapus' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.admin-products { display: flex; flex-direction: column; gap: var(--space-5); }
.head { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--space-4); flex-wrap: wrap; }
.head h1 { font-size: clamp(28px, 3.5vw, 36px); }
.head p { color: var(--color-ink-soft); margin-top: var(--space-1); font-size: 14px; }
.search { max-width: 420px; }
.notice { padding: var(--space-3) var(--space-4); background: var(--color-success-bg); color: var(--color-success); border-radius: var(--radius-sm); font-size: 14px; }

.table-wrap { overflow-x: auto; background: var(--color-surface); border: 1px solid var(--color-line); border-radius: var(--radius-md); }
.table { width: 100%; min-width: 720px; border-collapse: collapse; font-size: 14px; }
.table th { text-align: left; font-weight: 500; font-size: 12.5px; color: var(--color-ink-soft); background: var(--color-bg); }
.table th,
.table td { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-line); vertical-align: middle; }
.table tbody tr:last-child td { border-bottom: none; }
.table .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.table__name { font-weight: 500; }
.table__name:hover { text-decoration: underline; text-underline-offset: 3px; }
.table__new { margin-left: var(--space-2); }
.actions { display: flex; justify-content: flex-end; align-items: center; gap: var(--space-3); white-space: nowrap; }

.confirm { font-size: 14.5px; }
.confirm__error { margin-top: var(--space-3); padding: var(--space-3); background: var(--color-danger-bg); color: var(--color-danger); border-radius: var(--radius-sm); font-size: 13.5px; }
</style>
