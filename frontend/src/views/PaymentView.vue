<script setup>
// Simulasi pembayaran: tidak ada gateway sungguhan, user memilih hasil berhasil/gagal.
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import OrderDetail from '@/components/order/OrderDetail.vue'
import OrderStatusBadge from '@/components/order/OrderStatusBadge.vue'
import * as cartService from '@/services/cartService'
import { formatRupiah } from '@/utils/format'

const route = useRoute()
const order = ref(null)
const loading = ref(false)
const error = ref('')
const paying = ref(false)
const payError = ref('')
const lastResult = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    order.value = await cartService.getOrder(route.params.id)
  } catch (e) {
    error.value = e.message || 'Gagal memuat pesanan.'
  } finally {
    loading.value = false
  }
}
watch(() => route.params.id, load, { immediate: true })

const payable = computed(() => order.value?.status === 'pending' && order.value.payment_status !== 'paid')

async function pay(result) {
  paying.value = true
  payError.value = ''
  try {
    order.value = await cartService.payOrder(order.value.id, result)
    lastResult.value = order.value.payment_status
  } catch (e) {
    payError.value = e.message || 'Pembayaran gagal diproses.'
  } finally {
    paying.value = false
  }
}
</script>

<template>
  <section class="container pay">
    <LoadingSpinner v-if="loading" label="Memuat pesanan…" />
    <ErrorMessage v-else-if="error" :message="error" @retry="load" />

    <template v-else-if="order">
      <header class="pay__head">
        <p class="pay__eyebrow">Pesanan #{{ order.id }}</p>
        <h1 v-if="order.payment_status === 'paid'">Pembayaran berhasil</h1>
        <h1 v-else-if="payable">Selesaikan pembayaran</h1>
        <h1 v-else>Status pesanan</h1>
        <OrderStatusBadge :status="order.status" />
      </header>

      <div v-if="order.payment_status === 'paid'" class="pay__notice pay__notice--success" role="status">
        Terima kasih! Pembayaranmu sudah kami terima dan pesanan akan segera dikirim.
      </div>
      <div v-else-if="lastResult === 'failed' || order.payment_status === 'failed'" class="pay__notice pay__notice--error" role="alert">
        Pembayaran gagal. Kamu bisa mencoba lagi.
      </div>

      <div class="pay__layout">
        <div class="pay__card">
          <OrderDetail :order="order" />
        </div>

        <aside class="pay__box">
          <p class="pay__label">Total tagihan</p>
          <p class="pay__amount">{{ formatRupiah(order.total_amount) }}</p>

          <template v-if="payable">
            <p class="pay__hint">Ini simulasi — tidak ada uang yang ditarik. Pilih hasil pembayaran:</p>
            <BaseButton block :disabled="paying" @click="pay('success')">{{ paying ? 'Memproses…' : 'Bayar sekarang' }}</BaseButton>
            <BaseButton block variant="outline" :disabled="paying" @click="pay('failed')">Simulasikan gagal</BaseButton>
            <p v-if="payError" class="pay__error" role="alert">{{ payError }}</p>
          </template>

          <BaseButton block :variant="payable ? 'text' : 'primary'" :to="{ name: 'orders' }">Lihat riwayat pesanan</BaseButton>
        </aside>
      </div>
    </template>
  </section>
</template>

<style scoped>
.pay { padding-top: var(--space-7); padding-bottom: var(--space-8); display: flex; flex-direction: column; gap: var(--space-5); max-width: 980px; }
.pay__head { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-2); }
.pay__eyebrow { font-size: 13px; color: var(--color-ink-soft); }
.pay__head h1 { font-size: clamp(30px, 4vw, 40px); }
.pay__notice { padding: var(--space-3) var(--space-4); border-radius: var(--radius-sm); font-size: 14.5px; }
.pay__notice--success { background: var(--color-success-bg); color: var(--color-success); }
.pay__notice--error { background: var(--color-danger-bg); color: var(--color-danger); }

.pay__layout { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: var(--space-5); align-items: start; }
.pay__card,
.pay__box {
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
}
.pay__box { display: flex; flex-direction: column; gap: var(--space-3); }
.pay__label { font-size: 13px; color: var(--color-ink-soft); }
.pay__amount { font-size: 30px; font-weight: 600; letter-spacing: -0.01em; margin-bottom: var(--space-2); }
.pay__hint { font-size: 13px; color: var(--color-ink-soft); }
.pay__error { font-size: 13.5px; color: var(--color-danger); }

@media (max-width: 820px) {
  .pay__layout { grid-template-columns: 1fr; }
}
</style>
