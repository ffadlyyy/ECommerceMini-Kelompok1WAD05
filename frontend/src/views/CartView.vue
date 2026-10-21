<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import QuantityStepper from '@/components/ui/QuantityStepper.vue'
import ProductImage from '@/components/product/ProductImage.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { formatRupiah } from '@/utils/format'

const cart = useCartStore()
const auth = useAuthStore()
const router = useRouter()

const busy = ref(new Set()) // key item yang sedang diperbarui
const itemError = ref('')

onMounted(() => cart.fetchCart())

const keyOf = (item) => item.id ?? `p${item.product_id}`
const canCheckout = computed(() => cart.items.length && !cart.hasStockProblem)

async function run(item, action) {
  const key = keyOf(item)
  busy.value = new Set(busy.value).add(key)
  itemError.value = ''
  try {
    await action()
  } catch (e) {
    itemError.value = e.message || 'Gagal memperbarui keranjang.'
  } finally {
    const next = new Set(busy.value)
    next.delete(key)
    busy.value = next
  }
}

const setQuantity = (item, quantity) => run(item, () => cart.updateQuantity(item, quantity))
const remove = (item) => run(item, () => cart.removeItem(item))

function goCheckout() {
  if (auth.isAuthenticated) router.push({ name: 'checkout' })
  else router.push({ name: 'login', query: { redirect: '/checkout' } })
}
</script>

<template>
  <section class="container cart">
    <header class="cart__head">
      <h1>Keranjang</h1>
      <p v-if="cart.items.length">{{ cart.totalItems }} barang</p>
    </header>

    <p v-if="cart.mergeWarning" class="cart__warning" role="status">{{ cart.mergeWarning }}</p>

    <LoadingSpinner v-if="cart.loading && !cart.items.length" label="Memuat keranjang…" />
    <ErrorMessage v-else-if="cart.error" :message="cart.error" @retry="cart.fetchCart()" />
    <EmptyState v-else-if="!cart.items.length" title="Keranjangmu masih kosong" description="Yuk, cari barang yang cocok untuk rumahmu.">
      <BaseButton :to="{ name: 'catalog' }">Lihat katalog</BaseButton>
    </EmptyState>

    <div v-else class="cart__layout">
      <div>
        <p v-if="itemError" class="cart__error" role="alert">{{ itemError }}</p>
        <ul class="cart__list">
          <li v-for="item in cart.items" :key="keyOf(item)" class="line" :aria-busy="busy.has(keyOf(item))">
            <RouterLink :to="{ name: 'product-detail', params: { id: item.product_id } }" class="line__media" tabindex="-1" aria-hidden="true">
              <ProductImage :src="item.image_url ?? ''" :alt="item.name" />
            </RouterLink>
            <div class="line__info">
              <RouterLink :to="{ name: 'product-detail', params: { id: item.product_id } }" class="line__name">{{ item.name }}</RouterLink>
              <p class="line__price">{{ formatRupiah(item.price) }}</p>
              <p v-if="item.stock != null && item.quantity > item.stock" class="line__stock" role="alert">
                {{ item.stock === 0 ? 'Stok habis — hapus barang ini untuk lanjut.' : `Stok tersisa ${item.stock}. Kurangi jumlahnya.` }}
              </p>
            </div>
            <div class="line__qty">
              <QuantityStepper
                :model-value="item.quantity"
                :min="1"
                :max="Math.max(1, Math.min(99, item.stock ?? 99))"
                :aria-label="`Jumlah ${item.name}`"
                @update:model-value="(q) => setQuantity(item, q)"
              />
              <button type="button" class="line__remove" :disabled="busy.has(keyOf(item))" @click="remove(item)">Hapus</button>
            </div>
            <p class="line__total">{{ formatRupiah(item.price * item.quantity) }}</p>
          </li>
        </ul>
      </div>

      <aside class="summary" aria-labelledby="summary-title">
        <h2 id="summary-title">Ringkasan</h2>
        <dl>
          <div><dt>Subtotal ({{ cart.totalItems }} barang)</dt><dd>{{ formatRupiah(cart.subtotal) }}</dd></div>
          <div class="summary__total"><dt>Total</dt><dd>{{ formatRupiah(cart.subtotal) }}</dd></div>
        </dl>
        <p class="summary__note">Total akhir dihitung ulang oleh server saat checkout.</p>
        <BaseButton block :disabled="!canCheckout" @click="goCheckout">
          {{ auth.isAuthenticated ? 'Lanjut ke checkout' : 'Masuk untuk checkout' }}
        </BaseButton>
        <p v-if="cart.hasStockProblem" class="summary__note summary__note--warn">Perbaiki jumlah barang yang melebihi stok dulu.</p>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.cart { padding-top: var(--space-7); padding-bottom: var(--space-8); display: flex; flex-direction: column; gap: var(--space-5); }
.cart__head h1 { font-size: clamp(30px, 4vw, 42px); }
.cart__head p { color: var(--color-ink-soft); margin-top: var(--space-2); }
.cart__warning { padding: var(--space-3) var(--space-4); background: var(--color-muted); border-radius: var(--radius-sm); font-size: 14px; }
.cart__error { margin-bottom: var(--space-3); padding: var(--space-3) var(--space-4); background: var(--color-danger-bg); color: var(--color-danger); border-radius: var(--radius-sm); font-size: 14px; }

.cart__layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: var(--space-6); align-items: start; }
.cart__list { border-top: 1px solid var(--color-line); }
.line {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr) auto auto;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-line);
}
.line[aria-busy='true'] { opacity: 0.6; }
.line__media { width: 88px; height: 88px; border-radius: var(--radius-sm); overflow: hidden; }
.line__name { font-weight: 600; font-size: 15px; }
.line__name:hover { text-decoration: underline; text-underline-offset: 3px; }
.line__price { font-size: 13.5px; color: var(--color-ink-soft); margin-top: 2px; }
.line__stock { font-size: 13px; color: var(--color-danger); margin-top: var(--space-1); }
.line__qty { display: flex; flex-direction: column; align-items: center; gap: var(--space-1); }
.line__remove { font-size: 13px; color: var(--color-ink-soft); text-decoration: underline; text-underline-offset: 3px; }
.line__remove:hover { color: var(--color-ink); }
.line__total { font-weight: 600; min-width: 110px; text-align: right; font-variant-numeric: tabular-nums; }

.summary {
  position: sticky; top: calc(var(--header-h) + var(--space-4));
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  display: flex; flex-direction: column; gap: var(--space-4);
}
.summary h2 { font-size: 20px; }
.summary dl { display: flex; flex-direction: column; gap: var(--space-2); font-size: 14px; }
.summary dl div { display: flex; justify-content: space-between; gap: var(--space-3); }
.summary dd { font-variant-numeric: tabular-nums; }
.summary__total { padding-top: var(--space-3); border-top: 1px solid var(--color-line); font-weight: 600; font-size: 16px; }
.summary__note { font-size: 12.5px; color: var(--color-ink-soft); }
.summary__note--warn { color: var(--color-danger); }

@media (max-width: 900px) {
  .cart__layout { grid-template-columns: 1fr; }
  .summary { position: static; }
}
/* Layar sempit: gambar | nama + harga | total, lalu jumlah & hapus di baris kedua */
@media (max-width: 560px) {
  .line { grid-template-columns: 64px minmax(0, 1fr) auto; row-gap: var(--space-3); align-items: start; }
  .line__media { width: 64px; height: 64px; }
  .line__total { grid-column: 3; grid-row: 1; min-width: 0; }
  .line__qty { grid-column: 2 / -1; grid-row: 2; flex-direction: row; justify-content: space-between; }
}
</style>
