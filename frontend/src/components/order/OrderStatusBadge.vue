<script setup>
import { computed } from 'vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { statusMeta } from '@/utils/orderStatus'

const props = defineProps({ status: { type: String, required: true } })
const meta = computed(() => statusMeta(props.status))
</script>

<template>
  <BaseBadge :variant="meta.badge">{{ meta.label }}</BaseBadge>
</template>
