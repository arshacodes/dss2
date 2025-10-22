<script setup>
import SellerNavbar from '../components/SellerNavbar.vue'
import DashboardView from './DashboardView.vue'
import ProductsView from './ProductsView.vue'
import OrdersView from './OrdersView.vue'

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const router = useRouter()
const selectedView = ref('dashboard')
const currentUser = ref(null)

onMounted(() => {
  const storedUser = localStorage.getItem('user')
  const role = localStorage.getItem('account_type')

  if (!storedUser || role?.toLowerCase() !== 'seller') {
    toast.error('Unauthorized access')
    router.push('/unauthorized')
  } else {
    currentUser.value = JSON.parse(storedUser)
  }
})

// console.log('Current User:', currentUser)
// console.log('Selected View:', selectedView)
// console.log('Account Type:', localStorage.getItem('account_type'))
// console.log('User from Local Storage:', localStorage.getItem('user'))
// console.log('Token from Local Storage:', localStorage.getItem('token'))
// console.log
</script>

<template>
  <div class="bg-gray-800 min-h-screen">
    <SellerNavbar @change-view="selectedView = $event" />

    <div class="pe-30 py-4 ps-30">
      <component
        v-if="currentUser"
        :is="{
          dashboard: DashboardView,
          products: ProductsView,
          orders: OrdersView
        }[selectedView]"
        :user="currentUser"
      />
    </div>
  </div>
</template>