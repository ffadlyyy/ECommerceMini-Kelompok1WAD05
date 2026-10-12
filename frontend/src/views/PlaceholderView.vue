<script setup>
import { useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const route = useRoute()
</script>

<template>
  <section class="container section">
    <EmptyState
      :title="`${route.meta.title} — segera hadir`"
      :description="`Halaman ini sedang dikerjakan oleh ${route.meta.owner}.`"
    >
      <BaseButton :to="{ name: 'home' }" variant="outline">Kembali ke beranda</BaseButton>
    </EmptyState>
  </section>
</template>
