<script setup>
import { onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import CategoryTile from '@/components/product/CategoryTile.vue'
import ProductGrid from '@/components/product/ProductGrid.vue'
import { useProductStore } from '@/stores/product'

const store = useProductStore()
onMounted(() => store.fetchFeatured(6))

const values = [
  { icon: 'check', title: 'Dipilih satu per satu', text: 'Setiap produk dikurasi, bukan sekadar mengisi rak.' },
  { icon: 'box', title: 'Stok yang jelas', text: 'Ketersediaan tampil langsung di halaman produk.' },
  { icon: 'bag', title: 'Checkout sederhana', text: 'Dari keranjang sampai pesanan dalam beberapa langkah.' },
]
</script>

<template>
  <!-- HERO -->
  <section class="hero">
    <div class="container hero__grid">
      <div class="hero__copy">
        <h1>Ruang yang terasa seperti napas lega.</h1>
        <p class="hero__lede">
          Furnitur dan perlengkapan sehari-hari untuk rumah yang lebih tenang, hangat, dan terasa lebih “kamu”.
          Dipilih satu per satu, bukan sekadar mengisi rak.
        </p>
        <div class="hero__ctas">
          <BaseButton :to="{ name: 'catalog', query: { sort: 'newest' } }">Lihat koleksi baru</BaseButton>
          <RouterLink :to="{ name: 'catalog' }" class="link-underline">Jelajahi semua produk</RouterLink>
        </div>
      </div>

      <div class="hero__visual" aria-hidden="true">
        <div class="hero__illo">
          <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-linecap="round">
            <path d="M20 170 Q100 150 180 170" stroke-width="1.4" opacity="0.35" />
            <path d="M55 170 V110 Q55 90 78 90 H110 Q130 90 130 110 V170" stroke-width="1.6" />
            <path d="M55 130 H130" stroke-width="1.6" />
            <path d="M48 170 V150 M137 170 V150" stroke-width="1.6" />
            <line x1="150" y1="60" x2="150" y2="170" stroke-width="1.6" />
            <path class="accent" d="M150 60 Q135 40 150 25 Q165 40 150 60Z" stroke-width="1.6" />
            <circle cx="150" cy="170" r="5" stroke-width="1.4" />
            <path d="M30 100 C 20 80 28 55 45 50 C 55 40 72 48 68 65 C 80 62 85 82 68 90 C 66 105 40 108 30 100Z" stroke-width="1.5" />
            <line x1="45" y1="90" x2="45" y2="150" stroke-width="1.5" />
          </svg>
        </div>
        <div class="hero__chip">
          <span class="hero__dot" />
          <div>
            <div class="hero__chip-1">Koleksi pilihan</div>
            <div class="hero__chip-2">Untuk rumah yang tenang</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- KATEGORI -->
  <section id="kategori" class="section">
    <div class="container">
      <div class="section-head">
        <div>
          <h2>Belanja per kategori</h2>
          <p>Mulai dari satu sudut, atau lengkapi seluruh rumah.</p>
        </div>
      </div>
      <div class="cat-grid">
        <CategoryTile v-for="c in store.categories" :key="c.id" :category="c" />
      </div>
    </div>
  </section>

  <!-- PRODUK TERBARU -->
  <section class="section">
    <div class="container">
      <div class="section-head">
        <div>
          <h2>Baru datang</h2>
          <p>Barang-barang yang baru kami tambahkan ke koleksi.</p>
        </div>
        <RouterLink :to="{ name: 'catalog' }" class="link-underline">Lihat semua</RouterLink>
      </div>
      <ProductGrid
        :products="store.featured"
        :loading="store.featuredLoading"
        :error="store.featuredError"
        @retry="store.fetchFeatured(6)"
      />
    </div>
  </section>

  <!-- NILAI TOKO -->
  <section class="values">
    <div class="container values__grid">
      <div v-for="v in values" :key="v.title" class="value">
        <span class="value__icon"><AppIcon :name="v.icon" :size="19" :stroke-width="1.5" /></span>
        <div>
          <h3 class="value__title">{{ v.title }}</h3>
          <p class="value__text">{{ v.text }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta">
    <div class="container cta__inner">
      <h2>Temukan yang cocok untuk rumahmu</h2>
      <p>Cari berdasarkan nama atau saring per kategori di katalog.</p>
      <BaseButton :to="{ name: 'catalog' }">Buka katalog</BaseButton>
    </div>
  </section>
</template>

<style scoped>
.hero { padding: 76px 0 88px; overflow: hidden; }
.hero__grid { display: grid; grid-template-columns: 1fr 0.92fr; gap: 64px; align-items: center; }
.hero__copy { animation: rise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
@keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
.hero h1 { font-size: clamp(36px, 5vw, 58px); max-width: 12ch; margin-bottom: 22px; }
.hero__lede { font-size: 17px; color: var(--color-ink-soft); max-width: 46ch; line-height: 1.6; margin-bottom: 32px; }
.hero__ctas { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }
.link-underline { font-size: 14.5px; font-weight: 500; border-bottom: 1px solid var(--color-ink); padding-bottom: 2px; white-space: nowrap; }

.hero__visual { position: relative; }
.hero__illo { background: var(--color-muted); border-radius: 28px; aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center; color: var(--color-ink); }
.hero__illo svg { width: 78%; height: 78%; }
.hero__illo .accent { stroke: var(--color-accent); }
.hero__chip {
  position: absolute; bottom: -18px; left: -18px;
  background: var(--color-surface); border: 1px solid var(--color-line); border-radius: 16px;
  padding: 14px 18px; display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow-soft);
}
.hero__dot { width: 34px; height: 34px; border-radius: 50%; background: var(--color-accent); flex-shrink: 0; }
.hero__chip-1 { font-size: 12.5px; color: var(--color-ink-soft); }
.hero__chip-2 { font-size: 14px; font-weight: 600; }

.section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 36px; flex-wrap: wrap; }
.section-head h2 { font-size: clamp(26px, 3vw, 34px); }
.section-head p { color: var(--color-ink-soft); font-size: 14.5px; margin-top: 6px; max-width: 42ch; }

.cat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: var(--space-4); }

.values { border-top: 1px solid var(--color-line); border-bottom: 1px solid var(--color-line); padding: 44px 0; margin-top: var(--space-6); }
.values__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); }
.value { display: flex; gap: var(--space-4); align-items: flex-start; }
.value__icon { width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; background: var(--color-muted); display: flex; align-items: center; justify-content: center; }
.value__title { font-family: var(--font-body); font-size: 14.5px; font-weight: 600; margin-bottom: 4px; }
.value__text { font-size: 13px; color: var(--color-ink-soft); line-height: 1.5; }

.cta { padding: 70px 0 0; text-align: center; }
.cta__inner { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); }
.cta h2 { font-size: clamp(26px, 3.4vw, 36px); max-width: 20ch; }
.cta p { color: var(--color-ink-soft); font-size: 14.5px; margin-bottom: var(--space-3); }

@media (max-width: 980px) {
  .hero__grid { grid-template-columns: 1fr; gap: 44px; }
  .hero__visual { order: -1; max-width: 420px; margin: 0 auto; width: 100%; }
  .cat-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 720px) {
  .hero { padding: 40px 0 56px; }
  .values__grid { grid-template-columns: 1fr; gap: var(--space-5); }
  .cat-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
