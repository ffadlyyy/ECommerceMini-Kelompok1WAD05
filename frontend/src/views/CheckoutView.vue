
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { request } from '@/services/api'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()

const loading = ref(false)
const loadingCart = ref(true)
const errorMessage = ref('')
const order = ref(null)

const form = ref({
  shipping_name: auth.user?.full_name || '',
  shipping_phone: '',
  shipping_address: '',
  shipping_city: '',
  shipping_postal_code: '',
})

const formatPrice = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value ?? 0)

const items = computed(() => cart.items)

onMounted(async () => {
  if (!auth.token) {
    await router.replace({
      name: 'login',
      query: { redirect: '/checkout' },
    })
    return
  }

  try {
    await cart.fetchCart()
  } catch (error) {
    errorMessage.value = error.message || 'Gagal memuat keranjang.'
  } finally {
    loadingCart.value = false
  }
})

async function submitCheckout() {
  errorMessage.value = ''

  if (!items.value.length) {
    errorMessage.value = 'Keranjang kamu masih kosong.'
    return
  }

  if (!/^\d{5}$/.test(form.value.shipping_postal_code)) {
    errorMessage.value = 'Kode pos harus terdiri dari tepat 5 angka.'
    return
  }

  loading.value = true

  try {
    order.value = await request('/orders/checkout', {
      method: 'POST',
      body: {
        shipping_name: form.value.shipping_name.trim(),
        shipping_phone: form.value.shipping_phone.trim(),
        shipping_address: form.value.shipping_address.trim(),
        shipping_city: form.value.shipping_city.trim(),
        shipping_postal_code: form.value.shipping_postal_code,
      },
    })

    await cart.fetchCart()
  } catch (error) {
    errorMessage.value = error.message || 'Checkout gagal. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}

async function payDemo(result) {
  if (!order.value) return

  errorMessage.value = ''
  loading.value = true

  try {
    order.value = await request(`/orders/${order.value.id}/pay`, {
      method: 'POST',
      body: { result },
    })

    if (result === 'success') {
      await router.push({ name: 'orders' })
    } else {
      errorMessage.value = 'Pembayaran demo gagal. Pesanan masih dapat diperiksa.'
    }
  } catch (error) {
    errorMessage.value = error.message || 'Proses pembayaran gagal.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="container checkout-page">
    <h1>Checkout</h1>

    <p v-if="loadingCart">Memuat keranjang...</p>

    <p v-if="errorMessage" class="error" role="alert">
      {{ errorMessage }}
    </p>

    <template v-if="order">
      <div class="success-panel">
        <h2>Pesanan berhasil dibuat!</h2>
        <p>Nomor pesanan: <strong>#{{ order.id }}</strong></p>
        <p>Total: <strong>{{ formatPrice(order.total_amount) }}</strong></p>
        <p>Status pesanan: {{ order.status }}</p>
        <p>Status pembayaran: {{ order.payment_status }}</p>

        <template v-if="order.payment_status !== 'paid'">
          <p class="demo-note">
            Ini adalah simulasi pembayaran untuk pengujian aplikasi.
          </p>
          <button
            class="primary"
            :disabled="loading"
            @click="payDemo('success')"
          >
            {{ loading ? 'Memproses...' : 'Simulasikan pembayaran berhasil' }}
          </button>

          <button
            class="secondary"
            :disabled="loading"
            @click="payDemo('failed')"
          >
            Simulasikan pembayaran gagal
          </button>
        </template>

        <button class="secondary" @click="router.push({ name: 'orders' })">
          Lihat riwayat pesanan
        </button>
      </div>
    </template>

    <template v-else-if="!loadingCart && items.length">
      <div class="checkout-layout">
        <form class="checkout-form" @submit.prevent="submitCheckout">
          <h2>Informasi Pengiriman</h2>

          <label for="shipping_name">Nama penerima</label>
          <input
            id="shipping_name"
            v-model="form.shipping_name"
            maxlength="100"
            autocomplete="name"
            required
          />

          <label for="shipping_phone">Nomor telepon</label>
          <input
            id="shipping_phone"
            v-model="form.shipping_phone"
            type="tel"
            maxlength="30"
            autocomplete="tel"
            required
          />

          <label for="shipping_address">Alamat lengkap</label>
          <textarea
            id="shipping_address"
            v-model="form.shipping_address"
            minlength="5"
            maxlength="500"
            autocomplete="street-address"
            rows="4"
            required
          />

          <label for="shipping_city">Kota/Kabupaten</label>
          <input
            id="shipping_city"
            v-model="form.shipping_city"
            maxlength="100"
            autocomplete="address-level2"
            required
          />

          <label for="shipping_postal_code">Kode pos</label>
          <input
            id="shipping_postal_code"
            v-model="form.shipping_postal_code"
            type="text"
            inputmode="numeric"
            pattern="[0-9]{5}"
            minlength="5"
            maxlength="5"
            autocomplete="postal-code"
            placeholder="Contoh: 12345"
            required
          />

          <button class="primary" type="submit" :disabled="loading">
            {{ loading ? 'Memproses pesanan...' : 'Buat Pesanan' }}
          </button>
        </form>

        <aside class="order-summary">
          <h2>Ringkasan Pesanan</h2>

          <div v-for="item in items" :key="item.id" class="summary-item">
            <div>
              <strong>{{ item.name }}</strong>
              <p>{{ item.quantity }} × {{ formatPrice(item.price) }}</p>
            </div>
            <strong>{{ formatPrice(item.line_total) }}</strong>
          </div>

          <div class="total">
            <span>Subtotal</span>
            <strong>{{ formatPrice(cart.subtotal) }}</strong>
          </div>

          <p class="note">
            Total akhir divalidasi oleh server. Biaya pengiriman belum dihitung
            oleh backend saat ini.
          </p>
        </aside>
      </div>
    </template>

    <div v-else-if="!loadingCart && !errorMessage && !order" class="empty">
      <h2>Keranjang masih kosong</h2>
      <p>Tambahkan produk sebelum melanjutkan checkout.</p>
      <button class="primary" @click="router.push({ name: 'catalog' })">
        Lihat katalog
      </button>
    </div>
  </section>
</template>

<style scoped>
.checkout-page {
  padding-top: var(--space-6);
  padding-bottom: var(--space-8);
}

.checkout-page > h1 {
  margin-bottom: var(--space-5);
  font-size: 32px;
}

.checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(280px, 1fr);
  gap: var(--space-6);
  align-items: start;
}

.checkout-form,
.order-summary,
.success-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.checkout-form h2,
.order-summary h2,
.success-panel h2 {
  margin-bottom: 10px;
  font-size: 21px;
}

.checkout-form label {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
}

.checkout-form input,
.checkout-form textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-line);
  border-radius: 8px;
  font: inherit;
  background: white;
}

.checkout-form textarea {
  resize: vertical;
}

.primary,
.secondary {
  padding: 12px 16px;
  border: 0;
  border-radius: 8px;
  font: inherit;
  cursor: pointer;
}

.primary {
  margin-top: 12px;
  background: #39372e;
  color: white;
}

.secondary {
  background: #eeeae1;
  color: #39372e;
}

button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.summary-item,
.total {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
}

.summary-item {
  border-bottom: 1px solid var(--color-line);
}

.summary-item p,
.note,
.demo-note {
  margin-top: 6px;
  color: var(--color-ink-soft);
  font-size: 13px;
  line-height: 1.6;
}

.total {
  margin-top: 6px;
  border-top: 1px solid var(--color-line);
  font-size: 17px;
}

.error {
  margin-bottom: 18px;
  color: #b42318;
}

.success-panel {
  max-width: 600px;
}

.success-panel p {
  line-height: 1.6;
}

.empty {
  padding: 48px 20px;
  text-align: center;
}

.empty p {
  margin: 12px 0;
}

@media (max-width: 760px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
}
</style>
