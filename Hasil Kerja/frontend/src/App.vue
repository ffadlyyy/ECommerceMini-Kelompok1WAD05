<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useProductStore } from '@/stores/product'

const route = useRoute()
// Halaman memilih layout lewat route.meta.layout ('admin' atau default 'main')
const layout = computed(() => (route.meta.layout === 'admin' ? AdminLayout : MainLayout))

// Kategori dipakai di navbar, footer, homepage, dan katalog -> muat sekali di sini
onMounted(() => useProductStore().fetchCategories())
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
</template>
