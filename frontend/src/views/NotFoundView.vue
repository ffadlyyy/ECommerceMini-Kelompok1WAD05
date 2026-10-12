<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
</script>

<template>
  <section class="container section">
    <EmptyState title="Halaman tidak ditemukan" description="Alamat yang kamu buka tidak ada atau sudah dipindahkan.">
      <BaseButton :to="{ name: 'home' }">Ke beranda</BaseButton>
    </EmptyState>
  </section>
</template>
