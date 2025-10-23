<script setup>
import SellerNavbar from '../components/SellerNavbar.vue'
import { ref, onMounted, watch, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const router = useRouter()
const selectedView = ref('dashboard')
const currentUser = ref(null)

// Lazy load these components to help identify which one is causing the error
const DashboardView = defineAsyncComponent(() => import('./DashboardView.vue'))
const ProductsView = defineAsyncComponent(() => import('./ProductsView.vue'))
const OrdersView = defineAsyncComponent(() => import('./OrdersView.vue'))

onMounted(() => {
  const rawUser = localStorage.getItem('user')
  const role = localStorage.getItem('account_type')

  if (!rawUser || rawUser === 'undefined' || role?.toLowerCase() !== 'seller') {
    toast.error('Unauthorized access')
    router.push('/unauthorized')
    return
  }

  try {
    const parsedUser = JSON.parse(rawUser)
    currentUser.value = parsedUser
  } catch (e) {
    console.error('Failed to parse user:', e)
    toast.error('Invalid user data')
    router.push('/unauthorized')
  }
})

watch(selectedView, (val) => {
  console.log('Selected view changed to:', val)
})
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