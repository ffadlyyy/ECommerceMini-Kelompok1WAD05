<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import * as cartService from '@/services/cartService'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { formatRupiah } from '@/utils/format'

const cart = useCartStore()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({
  shipping_name: auth.user?.name ?? '',
  shipping_phone: '',
  shipping_address: '',
  shipping_city: '',
  shipping_postal_code: '',
})
const errors = ref({})
const serverError = ref('')
const submitting = ref(false)

// Pesan error per kolom hilang begitu kolom itu diperbaiki
for (const key of Object.keys(form)) {
  watch(
    () => form[key],
    () => {
      if (errors.value[key]) errors.value = { ...errors.value, [key]: '' }
    },
  )
}

onMounted(async () => {
  await auth.fetchMe().catch(() => {})
  if (!form.shipping_name && auth.user) form.shipping_name = auth.user.name
  cart.fetchCart()
})

// Aturan sama dengan backend (app/schemas/order.py: CheckoutRequest)
function validate() {
  const f = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]))
  const e = {}
  if (!f.shipping_name) e.shipping_name = 'Nama penerima wajib diisi.'
  if (!/^\+?[\d\s-]{6,30}$/.test(f.shipping_phone)) e.shipping_phone = 'Masukkan nomor telepon yang valid.'
  if (f.shipping_address.length < 5) e.shipping_address = 'Alamat minimal 5 karakter.'
  if (!f.shipping_city) e.shipping_city = 'Kota wajib diisi.'
  if (!/^\d{5}$/.test(f.shipping_postal_code)) e.shipping_postal_code = 'Kode pos harus 5 angka.'
  errors.value = e
  return Object.keys(e).length ? null : f
}

async function onSubmit() {
  serverError.value = ''
  const payload = validate()
  if (!payload) return
  submitting.value = true
  try {
    const order = await cartService.checkout(payload)
    cart.clear()
    router.replace({ name: 'order-payment', params: { id: order.id } })
  } catch (e) {
    serverError.value = e.message || 'Checkout gagal. Coba lagi.'
    cart.fetchCart() // stok/harga mungkin berubah
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="container checkout">
    <header class="checkout__head">
      <h1>Checkout</h1>
      <p>Isi alamat pengiriman, lalu lanjut ke pembayaran.</p>
    </header>

    <EmptyState v-if="!auth.isAuthenticated" title="Masuk dulu, ya" description="Checkout membutuhkan akun supaya pesananmu tersimpan.">
      <BaseButton :to="{ name: 'login', query: { redirect: route.fullPath } }">Masuk</BaseButton>
    </EmptyState>
    <LoadingSpinner v-else-if="cart.loading && !cart.items.length" label="Memuat keranjang…" />
    <ErrorMessage v-else-if="cart.error" :message="cart.error" @retry="cart.fetchCart()" />
    <EmptyState v-else-if="!cart.items.length" title="Keranjangmu kosong" description="Tambahkan barang dulu sebelum checkout.">
      <BaseButton :to="{ name: 'catalog' }">Lihat katalog</BaseButton>
    </EmptyState>

    <div v-else class="checkout__layout">
      <form id="checkout-form" class="form" novalidate @submit.prevent="onSubmit">
        <h2>Alamat pengiriman</h2>
        <BaseInput v-model="form.shipping_name" label="Nama penerima" required :maxlength="100" :error="errors.shipping_name" />
        <BaseInput v-model="form.shipping_phone" label="Nomor telepon" type="tel" required :maxlength="30" placeholder="08xxxxxxxxxx" :error="errors.shipping_phone" />
        <BaseInput v-model="form.shipping_address" label="Alamat lengkap" multiline :rows="3" required :maxlength="500" placeholder="Nama jalan, nomor rumah, RT/RW" :error="errors.shipping_address" />
        <div class="form__row">
          <BaseInput v-model="form.shipping_city" label="Kota" required :maxlength="100" :error="errors.shipping_city" />
          <BaseInput v-model="form.shipping_postal_code" label="Kode pos" required :maxlength="5" :error="errors.shipping_postal_code" />
        </div>
      </form>

      <aside class="summary" aria-labelledby="order-summary">
        <h2 id="order-summary">Pesananmu</h2>
        <ul class="summary__items">
          <li v-for="item in cart.items" :key="item.id ?? item.product_id">
            <span>{{ item.name }} <span class="summary__qty">× {{ item.quantity }}</span></span>
            <span>{{ formatRupiah(item.price * item.quantity) }}</span>
          </li>
        </ul>
        <div class="summary__total"><span>Total</span><span>{{ formatRupiah(cart.subtotal) }}</span></div>
        <p v-if="cart.hasStockProblem" class="summary__error" role="alert">
          Ada barang yang melebihi stok. <RouterLink :to="{ name: 'cart' }">Perbaiki di keranjang</RouterLink>.
        </p>
        <p v-if="serverError" class="summary__error" role="alert">{{ serverError }}</p>
        <BaseButton type="submit" form="checkout-form" block :disabled="submitting || cart.hasStockProblem">
          {{ submitting ? 'Memproses…' : 'Buat pesanan' }}
        </BaseButton>
        <RouterLink :to="{ name: 'cart' }" class="summary__back">← Kembali ke keranjang</RouterLink>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.checkout { padding-top: var(--space-7); padding-bottom: var(--space-8); display: flex; flex-direction: column; gap: var(--space-5); }
.checkout__head h1 { font-size: clamp(30px, 4vw, 42px); }
.checkout__head p { color: var(--color-ink-soft); margin-top: var(--space-2); }
.checkout__layout { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: var(--space-6); align-items: start; }

.form { display: flex; flex-direction: column; gap: var(--space-4); }
.form h2 { font-size: 22px; }
.form__row { display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-3); }

.summary {
  position: sticky; top: calc(var(--header-h) + var(--space-4));
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  display: flex; flex-direction: column; gap: var(--space-4);
}
.summary h2 { font-size: 20px; }
.summary__items { display: flex; flex-direction: column; gap: var(--space-2); font-size: 14px; }
.summary__items li { display: flex; justify-content: space-between; gap: var(--space-3); }
.summary__items li > span:last-child { white-space: nowrap; font-variant-numeric: tabular-nums; }
.summary__qty { color: var(--color-ink-soft); }
.summary__total { display: flex; justify-content: space-between; padding-top: var(--space-3); border-top: 1px solid var(--color-line); font-weight: 600; font-size: 16px; }
.summary__error { padding: var(--space-3); background: var(--color-danger-bg); color: var(--color-danger); border-radius: var(--radius-sm); font-size: 13.5px; }
.summary__error a { text-decoration: underline; }
.summary__back { font-size: 13.5px; color: var(--color-ink-soft); text-align: center; }
.summary__back:hover { color: var(--color-ink); }

@media (max-width: 900px) {
  .checkout__layout { grid-template-columns: 1fr; }
  .summary { position: static; }
}
@media (max-width: 480px) {
  .form__row { grid-template-columns: 1fr; }
}
</style>
