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
  <div>
    <div class="bg-gradient p-6 rounded shadow text-white">
      <h2 class="text-xl font-bold mb-4">Welcome, {{ seller_name }}</h2>
      <p>This is your dashboard. DSS charts and insights will appear here.</p>
    </div>

    <div class="grid grid-cols-2 gap-8">
      <div class="rounded-lg bg-gradient p-8 w-full">
        <p class="text-md text-white mb-4">Total Revenue</p>
        <h1 class="text-xl text-white">$123,456.78</h1>
        <div class="flex flex-row space-x-2 justify-center items-center">
          <div class="text-sm text-white rounded-lg bg-gray-900/60 p-2">+ 10%</div>
        </div>
      </div>
      <div class="rounded-lg border-2 border-pink-500 p-8 w-full">
        <p class="text-md text-white mb-4">Total Revenue</p>
        <h1 class="text-xl text-white">$123,456.78</h1>
        <div class="flex flex-row space-x-8 justify-center items-center">
          <div class="text-sm text-white rounded-lg bg-gray-900/60 p-2">+ 10%</div>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-3 gap-8 mt-8">
      <div class="rounded-lg bg-gray-800 shadow-md p-8 w-full">
        <div>
          <!--<canvas id="Daily Sales"></canvas>-->
        </div>
      </div>
    </div>
  </div>
</template>