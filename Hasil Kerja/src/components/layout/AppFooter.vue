<script setup>
import { useProductStore } from '@/stores/product'

const store = useProductStore()
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <div class="footer__logo">no<span>o</span>k</div>
          <p>Perlengkapan rumah yang dipilih pelan-pelan, untuk ruang yang terasa lebih tenang dan lebih jujur pada penghuninya.</p>
        </div>

        <nav class="footer__col" aria-label="Jelajahi">
          <h2>Jelajahi</h2>
          <ul>
            <li><RouterLink :to="{ name: 'home' }">Beranda</RouterLink></li>
            <li><RouterLink :to="{ name: 'catalog' }">Semua produk</RouterLink></li>
            <li><RouterLink :to="{ name: 'orders' }">Pesanan saya</RouterLink></li>
          </ul>
        </nav>

        <nav class="footer__col" aria-label="Kategori">
          <h2>Kategori</h2>
          <ul>
            <li v-for="c in store.categories" :key="c.id">
              <RouterLink :to="{ name: 'catalog', query: { category: c.slug } }">{{ c.name }}</RouterLink>
            </li>
          </ul>
        </nav>
      </div>

      <div class="footer__bottom">
        <p>© 2026 Nook. Proyek kelompok mata kuliah Web Application Development.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer { background: var(--color-ink); color: var(--color-on-ink); padding: var(--space-8) 0 var(--space-5); margin-top: var(--space-8); }
.footer__grid { display: grid; grid-template-columns: 1.6fr 1fr 1fr; gap: var(--space-6); padding-bottom: var(--space-6); border-bottom: 1px solid rgba(255, 249, 242, 0.15); }
.footer__logo { font-family: var(--font-display); font-size: 24px; font-weight: 600; margin-bottom: var(--space-3); }
.footer__logo span { color: #e0b088; font-style: italic; font-weight: 500; }
.footer__brand p { font-size: 13.5px; opacity: 0.72; max-width: 34ch; line-height: 1.6; }
.footer__col h2 { font-family: var(--font-body); font-size: 13.5px; font-weight: 600; margin-bottom: var(--space-4); }
.footer__col li { margin-bottom: var(--space-3); }
.footer__col a { font-size: 13.5px; opacity: 0.75; transition: opacity var(--transition); }
.footer__col a:hover { opacity: 1; }
.footer__bottom { padding-top: var(--space-5); }
.footer__bottom p { font-size: 12.5px; opacity: 0.6; }

@media (max-width: 720px) {
  .footer__grid { grid-template-columns: 1fr 1fr; }
  .footer__brand { grid-column: span 2; }
}
</style>
