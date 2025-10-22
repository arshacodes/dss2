<script setup>
import BuyerNavbar from '../components/BuyerNavbar.vue'
import HomeView from './HomeView.vue'
import CartView from './CartView.vue'
import BuyerOrders from './BuyerOrders.vue'
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { currentUser } = useAuth()
const selectedView = ref('home')
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