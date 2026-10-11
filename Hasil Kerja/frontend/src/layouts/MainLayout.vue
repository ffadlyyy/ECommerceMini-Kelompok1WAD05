<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<template>
  <div class="shell">
    <a href="#main" class="skip-link">Lewati ke konten utama</a>
    <AppHeader />
    <main id="main" class="shell__main">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.shell { min-height: 100vh; display: flex; flex-direction: column; }
.shell__main { flex: 1; }
</style>
