<script setup>
import { ChartColumn, Blocks, Package, LogOut } from 'lucide-vue-next'
import { defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '@/composables/useAuth'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
const router = useRouter()

const handleLogout = async () => {
  const success = await logout()
  if (success) {
    toast('Logged out successfully', { type: 'success', position: 'bottom-left' })
    setTimeout(() => {
      router.push('/login')
    }, 1500) // 1.5 second delay
  }
}


const emit = defineEmits(['change-view'])

const setView = (view) => emit('change-view', view)
</script>

<template>
  <div class="bg-gray-900/60 py-4 px-30 flex justify-between items-center shadow-lg">
    <h1 class="font-bold text-xl text-pink-400">Neon<span class="text-white">Market</span></h1>

    <div class="flex items-center space-x-6">
      <div @click="setView('dashboard')" class="text-white hover:text-pink-400 cursor-pointer">
        <ChartColumn />
      </div>
      <div @click="setView('products')" class="text-white hover:text-pink-400 cursor-pointer">
        <Blocks />
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