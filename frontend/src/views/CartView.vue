
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'

const cart = useCartStore()
const auth = useAuthStore()
const router = useRouter()

const errorMessage = ref('')
const busyItem = ref(null)

const formatPrice = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value ?? 0)

const items = computed(() => cart.items)

async function loadCart() {
  errorMessage.value = ''

  if (!auth.token) {
    await router.replace({
      name: 'login',
      query: { redirect: '/cart' },
    })
    return
  }

  try {
    await cart.fetchCart()
  } catch (error) {
    errorMessage.value = error.message || 'Gagal memuat keranjang.'
  }
}

async function changeQuantity(item, quantity) {
  if (quantity < 1) return

  busyItem.value = item.id
  errorMessage.value = ''

  try {
    await cart.updateItem(item.id, quantity)
  } catch (error) {
    errorMessage.value = error.message || 'Gagal mengubah jumlah produk.'
  } finally {
    busyItem.value = null
  }
}

async function removeItem(item) {
  busyItem.value = item.id
  errorMessage.value = ''

  try {
    await cart.removeItem(item.id)
  } catch (error) {
    errorMessage.value = error.message || 'Gagal menghapus produk.'
  } finally {
    busyItem.value = null
  }
}

onMounted(loadCart)
</script>

<template>
  <section class="container cart-page">
    <h1>Keranjang Belanja</h1>

    <p v-if="cart.loading">Memuat keranjang...</p>

    <p v-if="errorMessage" class="error" role="alert">
      {{ errorMessage }}
    </p>

    <template v-if="!cart.loading && items.length">
      <div class="cart-layout">
        <div class="cart-items">
          <article v-for="item in items" :key="item.id" class="cart-item">
            <div class="item-info">
              <h2>{{ item.name }}</h2>
              <p>{{ formatPrice(item.price) }}</p>
              <p class="stock">Stok tersedia: {{ item.stock }}</p>
            </div>

            <div class="item-actions">
              <div class="quantity">
                <button
                  type="button"
                  :disabled="busyItem === item.id || item.quantity <= 1"
                  aria-label="Kurangi jumlah"
                  @click="changeQuantity(item, item.quantity - 1)"
                >−</button>

                <span>{{ item.quantity }}</span>

                <button
                  type="button"
                  :disabled="busyItem === item.id || item.quantity >= item.stock"
                  aria-label="Tambah jumlah"
                  @click="changeQuantity(item, item.quantity + 1)"
                >+</button>
              </div>

              <strong>{{ formatPrice(item.line_total) }}</strong>

              <button
                type="button"
                class="remove"
                :disabled="busyItem === item.id"
                @click="removeItem(item)"
              >
                Hapus
              </button>
            </div>
          </article>
        </div>

        <aside class="summary">
          <h2>Ringkasan Belanja</h2>
          <div class="summary-row">
            <span>Total barang</span>
            <span>{{ cart.totalItems }}</span>
          </div>
          <div class="summary-row total">
            <span>Subtotal</span>
            <strong>{{ formatPrice(cart.subtotal) }}</strong>
          </div>

          <BaseButton block @click="router.push({ name: 'checkout' })">
            Lanjut ke checkout
          </BaseButton>

          <button class="continue" @click="router.push({ name: 'catalog' })">
            Lanjut belanja
          </button>
        </aside>
      </div>
    </template>

    <div v-else-if="!cart.loading && !errorMessage" class="empty-cart">
      <h2>Keranjang masih kosong</h2>
      <p>Yuk, temukan produk favoritmu di katalog Nook.</p>
      <BaseButton @click="router.push({ name: 'catalog' })">
        Lihat katalog
      </BaseButton>
    </div>
  </section>
</template>

<style scoped>
.cart-page {
  padding-top: var(--space-6);
  padding-bottom: var(--space-8);
}

.cart-page > h1 {
  margin-bottom: var(--space-5);
  font-size: 32px;
}

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(260px, 1fr);
  gap: var(--space-6);
  align-items: start;
}

.cart-items {
  display: grid;
  gap: 14px;
}

.cart-item,
.summary {
  padding: 22px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.cart-item {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.item-info h2,
.summary h2 {
  margin-bottom: 10px;
  font-size: 18px;
}

.item-info p {
  margin-top: 6px;
}

.stock {
  color: var(--color-ink-soft);
  font-size: 13px;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.quantity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity button {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-line);
  border-radius: 7px;
  background: white;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.remove,
.continue {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-ink-soft);
  text-decoration: underline;
  cursor: pointer;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 18px 0;
}

.total {
  padding-top: 18px;
  border-top: 1px solid var(--color-line);
}

.continue {
  display: block;
  margin: 18px auto 0;
}

.empty-cart {
  padding: 48px 20px;
  text-align: center;
}

.empty-cart p {
  margin: 12px 0 24px;
  color: var(--color-ink-soft);
}

.error {
  margin-bottom: 18px;
  color: #b42318;
}

@media (max-width: 760px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .cart-item {
    flex-direction: column;
  }

  .item-actions {
    align-items: flex-start;
  }
}
</style>
