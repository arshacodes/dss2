<script setup>
import { computed, ref, onMounted } from 'vue'
import { useProducts } from '@/composables/useProducts'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { ShoppingCart } from 'lucide-vue-next'

const { products, fetchProducts } = useProducts()

const search = ref('')
const sortBySales = ref(false)
const priceRange = ref([0, 99999])
const currentPage = ref(1)
const itemsPerPage = 8

onMounted(async () => {
  try {
    await fetchProducts()
  } catch (error) {
    toast.error('Failed to load products')
  }
})

const filteredProducts = computed(() => {
  if (!Array.isArray(products.value)) return []

  let result = [...products.value]

  if (search.value.trim()) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(search.value.toLowerCase())
    )
  }

  result = result.filter(p =>
    p.price >= priceRange.value[0] && p.price <= priceRange.value[1]
  )

  if (sortBySales.value) {
    result.sort((a, b) => b.sales - a.sales)
  }

  return result
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredProducts.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() =>
  Math.ceil(filteredProducts.value.length / itemsPerPage)
)

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}


const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const seller_name = computed(() => props.user?.name || '')
</script>

<template>
  <div class="bg-gradient p-6 rounded shadow text-white mb-4">
    <h2 class="text-xl font-bold mb-4">Welcome, {{ seller_name }}!</h2>
    <p>Shop like a billionaire! Free shipping everywhere!</p>
  </div>
  <div class="flex flex-col sm:flex-row gap-4 mb-4">
    <input
      v-model="search"
      type="text"
      placeholder="Search products..."
      class="border-2 border-purple-500 text-white rounded px-4 py-2 w-full"
    />

    <label class="flex items-center gap-2 text-white w-40">
      <input type="checkbox" v-model="sortBySales" class="accent-pink-500"/>
      Top Sales
    </label>

    <div class="flex items-center gap-2 text-white flex-1">
      <label>₱</label>
      <input
        type="number"
        v-model.number="priceRange[0]"
        class="border-2 border-purple-500 rounded px-2 py-1 w-20"
      />
      <span class="text-white">–</span>
      <input
        type="number"
        v-model.number="priceRange[1]"
        class="border-2 border-purple-500 rounded px-2 py-1 w-20"
      />
    </div>
  </div>

  <!-- Product Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
    <div v-for="product in paginatedProducts" :key="product.id">
            <div class="rounded-lg p-4 shadow hover:shadow-lg transition bg-gray-900">
                <router-link :to="`/product/${product.id}`" class="block">
                    <img :src="product.image_url" :alt="product.name" class="w-full h-48 object-cover rounded mb-2" />
                    <h3 class="font-semibold text-lg text-white">{{ product.name }}</h3>
                    <p class="text-sm text-gray-300">₱{{ product.price }}</p>
                    <p class="text-xs text-gray-400">
                        <span :class="product.stock <= 10 ? 'text-red-500 font-bold' : ''">
                        {{ product.stock }} in stock
                        </span>
                        | Sold {{ product.sales }}
                    </p>
                </router-link>

                <!-- <button
                    @click="addToCart(product)"
                    :disabled="product.stock === 0"
                    class="mt-3 w-full bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 disabled:opacity-50 flex flex-row justify-center items-center"
                >
                    <ShoppingCart class="inline" />
                    <p class="inline ms-3">Add to Cart</p>
                </button> -->
            </div>

        </div>
  </div>

  <!-- Pagination -->
  <div v-if="totalPages > 1" class="flex justify-center mt-6 space-x-2">
    <button
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 1"
      class="px-3 py-1 rounded bg-purple-500 text-white disabled:opacity-50"
    >
      Prev
    </button>

    <button
      v-for="page in totalPages"
      :key="page"
      @click="goToPage(page)"
      :class="[
        'px-3 py-1 rounded',
        page === currentPage ? 'bg-pink-500 text-white' : 'bg-gray-700 text-white'
      ]"
    >
      {{ page }}
    </button>

    <button
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="px-3 py-1 rounded bg-purple-500 text-white disabled:opacity-50"
    >
      Next
    </button>
  </div>
</template>