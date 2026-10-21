<script setup>
// Form tambah / ubah produk. Validasi di sini hanya untuk kenyamanan pengguna;
// backend tetap memvalidasi ulang (Pydantic).
import { computed, reactive, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const open = defineModel({ type: Boolean, default: false })
const props = defineProps({
  /** null = produk baru */
  product: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
  saving: Boolean,
  /** Pesan error dari server */
  error: { type: String, default: '' },
})
const emit = defineEmits(['submit'])

const empty = () => ({ name: '', category_id: '', price: '', stock: '', description: '', image_url: '', is_new: true })
const form = reactive(empty())
const errors = ref({})

const title = computed(() => (props.product ? 'Ubah produk' : 'Tambah produk'))
const categoryOptions = computed(() => [
  { value: '', label: 'Pilih kategori' },
  ...props.categories.map((c) => ({ value: String(c.id), label: c.name })),
])

watch(open, (isOpen) => {
  if (!isOpen) return
  errors.value = {}
  const p = props.product
  Object.assign(
    form,
    p
      ? {
          name: p.name,
          category_id: String(p.category?.id ?? ''),
          price: String(p.price),
          stock: String(p.stock),
          description: p.description ?? '',
          image_url: p.image_url ?? '',
          is_new: !!p.is_new,
        }
      : empty(),
  )
})

const isWholeNumber = (v) => /^\d+$/.test(String(v).trim())

function validate() {
  const e = {}
  if (!form.name.trim()) e.name = 'Nama produk wajib diisi.'
  if (!form.category_id) e.category_id = 'Pilih kategori.'
  if (!isWholeNumber(form.price)) e.price = 'Harga harus bilangan bulat ≥ 0 (tanpa titik).'
  if (!isWholeNumber(form.stock)) e.stock = 'Stok harus bilangan bulat ≥ 0.'
  errors.value = e
  return !Object.keys(e).length
}

function onSubmit() {
  if (!validate()) return
  emit('submit', {
    name: form.name.trim(),
    category_id: Number(form.category_id),
    price: Number(form.price),
    stock: Number(form.stock),
    description: form.description.trim() || null,
    image_url: form.image_url.trim() || null,
    is_new: form.is_new,
  })
}
</script>

<template>
  <BaseModal v-model="open" :title="title">
    <form id="product-form" class="form" novalidate @submit.prevent="onSubmit">
      <BaseInput v-model="form.name" label="Nama produk" required :maxlength="200" :error="errors.name" />
      <div class="form__field">
        <BaseSelect v-model="form.category_id" label="Kategori" :options="categoryOptions" />
        <p v-if="errors.category_id" class="form__error" role="alert">{{ errors.category_id }}</p>
      </div>
      <div class="form__row">
        <BaseInput v-model="form.price" label="Harga (Rp)" type="number" required :error="errors.price" />
        <BaseInput v-model="form.stock" label="Stok" type="number" required :error="errors.stock" />
      </div>
      <BaseInput v-model="form.description" label="Deskripsi" multiline :rows="3" />
      <BaseInput v-model="form.image_url" label="URL gambar" type="url" hint="Opsional. Kosongkan untuk memakai ikon bawaan." />
      <label class="form__check">
        <input v-model="form.is_new" type="checkbox" />
        Tandai sebagai produk baru
      </label>
      <p v-if="error" class="form__error form__error--server" role="alert">{{ error }}</p>
    </form>

    <template #footer>
      <BaseButton variant="outline" size="sm" @click="open = false">Batal</BaseButton>
      <BaseButton type="submit" size="sm" form="product-form" :disabled="saving">
        {{ saving ? 'Menyimpan…' : 'Simpan' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: var(--space-4); }
.form__row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.form__field { display: flex; flex-direction: column; gap: var(--space-2); }
.form__check { display: flex; align-items: center; gap: var(--space-2); font-size: 14px; cursor: pointer; }
.form__check input { width: 16px; height: 16px; accent-color: var(--color-ink); }
.form__error { font-size: 12.5px; color: var(--color-danger); }
.form__error--server { padding: var(--space-3); background: var(--color-danger-bg); border-radius: var(--radius-sm); }

@media (max-width: 480px) {
  .form__row { grid-template-columns: 1fr; }
}
</style>
