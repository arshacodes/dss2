<script setup>
import { Home, ShoppingCart, Package, LogOut } from 'lucide-vue-next'
import { defineEmits, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '@/composables/useAuth'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const router = useRouter()
const emit = defineEmits(['change-view'])
const props = defineProps({
  viewMode: {
    type: String,
    default: 'shop', // 'shop' or 'page'
  },
})

const setView = (view) => {
  if (props.viewMode === 'shop') {
    emit('change-view', view)
  } else {
    // router.push(`/shop${view}`)
    router.push(`/shop`)
    // emit('change-view', view)
  }
}

const handleLogout = async () => {
  const success = await logout()
  if (success) {
    toast('Logged out successfully', { type: 'success', position: 'bottom-left' })
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  }
}
</script>

<template>
  <div class="bg-gray-900/60 py-4 px-30 flex justify-between items-center shadow-lg">
    <h1 class="font-bold text-xl text-pink-400 cursor-pointer" @click="setView('home')">
      Neon<span class="text-white">Market</span>
    </h1>

    <div class="flex items-center space-x-6">
      <div @click="setView('home')" class="text-white hover:text-pink-400 cursor-pointer">
        <Home />
      </div>

      <div @click="setView('cart')" class="text-white hover:text-pink-400 cursor-pointer">
        <ShoppingCart />
      </div>

      <div @click="setView('orders')" class="text-white hover:text-pink-400 cursor-pointer">
        <Package />
      </div>

      <div class="text-white/60 mx-6">|</div>

      <div @click="handleLogout" class="text-white hover:text-red-500 cursor-pointer">
        <LogOut />
      </div>
    </div>
  </div>
</template>