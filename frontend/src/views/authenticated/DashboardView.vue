<script setup>
import { computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const seller_name = computed(() => props.user?.name || '')
</script>

<template>
  <div class="bg-gradient p-6 rounded shadow text-white">
    <h2 class="text-xl font-bold mb-4">Welcome, {{ seller_name }}</h2>
    <p>This is your dashboard. DSS charts and insights will appear here.</p>
  </div>
</template>