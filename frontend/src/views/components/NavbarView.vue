<script setup>
import { ref } from 'vue'

// Replace this with your actual auth logic
const isAuthenticated = ref(false) // e.g., useAuth().isAuthenticated
</script>

<template>
  <div class="bg-gray-900/60 py-4 px-30 flex flex-row justify-between items-center shadow-lg">
    <h1 class="font-bold text-xl text-pink-400">Neon<span class="text-white">Market</span></h1>
    
    <div class="text-end space-x-4">
      <!-- <router-link to="/shop" class="text-white link">Shop</router-link> -->
      <router-link to="/login" class="text-white link">Login</router-link>
      <router-link to="/register"><button class="bg-purple-500 text-white rounded-lg p-2 shadow-lg">Register</button></router-link>
    </div>
  </div>
</template>