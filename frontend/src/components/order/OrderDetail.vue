<script setup>
// Rincian satu pesanan: daftar barang dan alamat kirim. Dipakai di riwayat customer
// dan di modal detail admin.
import { formatRupiah } from '@/utils/format'
import { PAYMENT_LABELS } from '@/utils/orderStatus'

defineProps({ order: { type: Object, required: true } })
</script>

<template>
  <div class="detail">
    <table class="detail__items">
      <caption class="sr-only">Barang dalam pesanan #{{ order.id }}</caption>
      <thead>
        <tr><th scope="col">Produk</th><th scope="col">Jumlah</th><th scope="col">Subtotal</th></tr>
      </thead>
      <tbody>
        <tr v-for="it in order.items" :key="it.id">
          <td>
            {{ it.name }}
            <span class="detail__unit">{{ formatRupiah(it.price) }} / barang</span>
          </td>
          <td>× {{ it.quantity }}</td>
          <td>{{ formatRupiah(it.line_total) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr><th scope="row" colspan="2">Total</th><td>{{ formatRupiah(order.total_amount) }}</td></tr>
      </tfoot>
    </table>

    <dl class="detail__meta">
      <div>
        <dt>Pembayaran</dt>
        <dd>{{ PAYMENT_LABELS[order.payment_status] ?? order.payment_status }}</dd>
      </div>
      <div v-if="order.shipping_name || order.shipping_address">
        <dt>Dikirim ke</dt>
        <dd>
          {{ order.shipping_name }}<template v-if="order.shipping_phone"> · {{ order.shipping_phone }}</template><br />
          {{ order.shipping_address }}<br />
          {{ order.shipping_city }} {{ order.shipping_postal_code }}
        </dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.detail { display: flex; flex-direction: column; gap: var(--space-4); }
.detail__items { width: 100%; border-collapse: collapse; font-size: 14px; font-variant-numeric: tabular-nums; }
.detail__items th { text-align: left; font-weight: 500; color: var(--color-ink-soft); font-size: 12.5px; }
.detail__items th,
.detail__items td { padding: var(--space-2) 0; border-bottom: 1px solid var(--color-line); vertical-align: top; }
.detail__items th:not(:first-child),
.detail__items td:not(:first-child) { text-align: right; padding-left: var(--space-3); white-space: nowrap; }
.detail__items tfoot th,
.detail__items tfoot td { border-bottom: none; font-weight: 600; color: var(--color-ink); font-size: 14px; }
.detail__unit { display: block; font-size: 12px; color: var(--color-ink-soft); }
.detail__meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-4); font-size: 13.5px; }
.detail__meta dt { color: var(--color-ink-soft); font-size: 12.5px; margin-bottom: var(--space-1); }
</style>
