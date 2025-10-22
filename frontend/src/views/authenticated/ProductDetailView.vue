<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'
import { useProducts } from '@/composables/useProducts'
import { api } from '@/config/axiosConfig'
import BuyerNavbar from '../components/BuyerNavbar.vue'
import { ShoppingCart } from 'lucide-vue-next'

const { getProductById } = useProducts()
const route = useRoute()
const product = ref(null)
const quantity = ref(1)

onMounted(async () => {
  try {
    product.value = await getProductById(route.params.id)
  } catch (error) {
    toast.error('Product not found')
  }
})

const addToCart = async () => {
  if (!product.value || product.value.stock === 0) {
    toast.error('This product is currently out of stock.')
    return
  }

  if (quantity.value > product.value.stock) {
    toast.error(`Only ${product.value.stock} item(s) available.`)
    return
  }

  try {
    await api.post('/cart/items', {
      product_id: product.value.id,
      quantity: quantity.value,
    })

    toast.success('Added to cart!')
  } catch (error) {
    console.error('Add to cart error:', error)
    toast.error('Failed to add to cart.')
  }
}
</script>

<template>
  <div class="bg-gray-800 min-h-screen">
    <BuyerNavbar viewMode="page" />

    <div v-if="product" class="p-6 text-white max-w-6xl mx-auto px-30">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <!-- Image Section -->
        <div>
          <img
            :src="product.image_url"
            alt="Product Image"
            class="w-full h-96 object-cover rounded"
          />
        </div>

        <!-- Details Section -->
        <div class="my-auto">
          <h1 class="text-3xl font-bold mb-4">{{ product.name }}</h1>
          <p class="text-gray-300 text-lg mb-2">₱{{ product.price }}</p>
          <p class="text-gray-400 mb-2">
            Stock: {{ product.stock }} | Sold: {{ product.sales }}
          </p>
          <p class="text-gray-400 mb-4">
            Seller: {{ product.seller?.name || 'Unknown' }}
          </p>
          <hr class="mb-4">
          <p class="mb-4">{{ product.description }}</p>

          <div class="flex items-center gap-2 mb-4">
            <label for="qty">Quantity:</label>
            <input
              id="qty"
              type="number"
              v-model.number="quantity"
              :max="product.stock"
              min="1"
              class="border-2 border-purple-500 rounded px-2 py-1 w-20 text-white bg-gray-900"
            />
          </div>

          <button
            @click="addToCart"
            :disabled="product.stock === 0 || quantity > product.stock"
            class="w-full bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 disabled:opacity-50"
          >
            <ShoppingCart class="inline" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>