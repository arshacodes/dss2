<script setup>
import BuyerNavbar from '../components/BuyerNavbar.vue'
import HomeView from './HomeView.vue'
import CartView from './CartView.vue'
import BuyerOrders from './BuyerOrders.vue'
import { ref, onMounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRoute } from 'vue-router'

const { currentUser } = useAuth()
const route = useRoute()
const selectedView = ref('home')

// Handle URL query parameters for tab switching
const handleRouteChange = () => {
  const tab = route.query.tab
  const order = route.query.order

  if (tab === 'orders') {
    selectedView.value = 'orders'
  } else if (tab === 'cart') {
    selectedView.value = 'cart'
  } else {
    selectedView.value = 'home'
  }

  // If order parameter is present, we could highlight or scroll to that order
  if (order && tab === 'orders') {
    // Could add logic to highlight specific order
  }
}

onMounted(() => {
  handleRouteChange()
})

// Watch for route changes to handle navigation from within the app
watch(() => route.query, handleRouteChange, { deep: true })
</script>

<template>
  <div class="bg-gray-800 min-h-screen">
    <BuyerNavbar viewMode="shop" @change-view="selectedView = $event" />

    <div class="pe-30 py-4 ps-30">
      <component
        v-if="currentUser"
        :is="{
          home: HomeView,
          cart: CartView,
          orders: BuyerOrders
        }[selectedView]"
        :user="currentUser"
      />
    </div>
  </div>
</template>