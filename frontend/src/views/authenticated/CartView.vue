<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { apiFetch } from '@/config/fetchConfig'
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag } from 'lucide-vue-next'

const router = useRouter()
const cartItems = ref([])
const loading = ref(true)
const processingCheckout = ref(false)
const selectedItems = ref(new Set())

// Computed total price
const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0
    return sum + (price * item.quantity)
  }, 0)
})

// Computed total items count
const totalItems = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

// Fetch cart items from backend
const fetchCart = async () => {
  loading.value = true
  try {
    console.log("this works!")
    const response = await apiFetch('/api/cart/items', {
      method: 'GET'
    })
    console.log('Cart API Response:', JSON.stringify(response))
    
    // Handle different response structures
    if (Array.isArray(response)) {
      cartItems.value = response
    } else if (response.items && Array.isArray(response.items)) {
      cartItems.value = response.items
    } else if (response.data && Array.isArray(response.data)) {
      cartItems.value = response.data
    } else {
      //console.warn('Unexpected response format:', response)
      cartItems.value = []
    }
    
    console.log('Parsed cart items:', cartItems.value)
  } catch (error) {
    console.error('Failed to fetch cart:', error)
    toast.error('Failed to load cart items')
    cartItems.value = []
  } finally {
    loading.value = false
  }
}

// Update item quantity
const updateQuantity = async (itemId, newQuantity) => {
  if (newQuantity < 1) {
    toast.error('Quantity must be at least 1')
    return
  }

  const item = cartItems.value.find(i => i.id === itemId)
  if (!item) return

  const stock = item.product?.stock || item.stock || 0
  if (newQuantity > stock) {
    toast.error(`Only ${stock} item(s) available`)
    return
  }

  try {
    await apiFetch(`/api/cart/items/${itemId}`, {
      method: 'PUT',
      body: { quantity: newQuantity }
    })

    item.quantity = newQuantity
    toast.success('Quantity updated')
  } catch (error) {
    console.error('Failed to update quantity:', error)
    toast.error('Failed to update quantity')
  }
}

// Increase quantity
const increaseQuantity = (item) => {
  updateQuantity(item.id, item.quantity + 1)
}

// Decrease quantity
const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    updateQuantity(item.id, item.quantity - 1)
  }
}

// Remove item from cart
const removeItem = async (itemId) => {
  try {
    await apiFetch(`/api/cart/items/${itemId}`, {
      method: 'DELETE'
    })

    cartItems.value = cartItems.value.filter(item => item.id !== itemId)
    toast.success('Item removed from cart')
  } catch (error) {
    console.error('Failed to remove item:', error)
    toast.error('Failed to remove item')
  }
}

// Clear entire cart
const clearCart = async () => {
  if (!confirm('Are you sure you want to clear your cart?')) return

  try {
    await apiFetch('/api/cart/clear', {
      method: 'DELETE'
    })

    cartItems.value = []
    toast.success('Cart cleared')
  } catch (error) {
    console.error('Failed to clear cart:', error)
    toast.error('Failed to clear cart')
  }
}

// Checkout
const checkout = async () => {
  if (cartItems.value.length === 0) {
    toast.error('Your cart is empty')
    return
  }

  processingCheckout.value = true

  try {
    const response = await apiFetch('/api/orders/checkout', {
      method: 'POST',
      body: {
        items: cartItems.value.map(item => ({
          product_id: item.product?.id || item.product_id,
          quantity: item.quantity,
          price: item.product?.price || item.price
        }))
      }
    })

    toast.success('Order placed successfully!')
    cartItems.value = []
    
    // Redirect to order confirmation or orders page
    if (response.order_id) {
      router.push(`/orders/${response.order_id}`)
    } else {
      router.push('/orders')
    }
  } catch (error) {
    console.error('Checkout failed:', error)
    toast.error('Checkout failed. Please try again.')
  } finally {
    processingCheckout.value = false
  }
}

onMounted(() => {
  fetchCart()
})
</script>

<template>
  <div class="max-w-6xl mx-auto p-6 text-white">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold flex items-center gap-2">
          <ShoppingCart class="w-8 h-8" />
          Shopping Cart
        </h1>
        <button
          v-if="cartItems.length > 0"
          @click="clearCart"
          class="text-red-400 hover:text-red-300 text-sm"
        >
          Clear Cart
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-400">Loading cart...</p>
      </div>

      <!-- Empty Cart -->
      <div v-else-if="cartItems.length === 0" class="text-center py-12">
        <ShoppingCart class="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <p class="text-xl text-gray-400 mb-4">Your cart is empty</p>
        <button
          @click="router.push('/products')"
          class="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded"
        >
          Continue Shopping
        </button>
      </div>

      <!-- Cart Items -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Items List -->
        <div class="lg:col-span-2 space-y-4">
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="bg-gray-900 rounded-lg p-4 flex gap-4"
          >
            <!-- Product Image -->
            <img
              v-if="item.product?.image_url || item.image_url"
              :src="item.product?.image_url || item.image_url"
              :alt="item.product?.name || item.product_name || 'Product'"
              class="w-24 h-24 object-cover rounded"
            />
            <div 
              v-else
              class="w-24 h-24 bg-gray-800 rounded flex items-center justify-center"
            >
              <ShoppingCart class="w-8 h-8 text-gray-600" />
            </div>

            <!-- Product Details -->
            <div class="flex-1">
              <h3 class="font-semibold text-lg mb-1">
                {{ item.product?.name || item.product_name || 'Product' }}
              </h3>
              <p class="text-gray-400 text-sm mb-2">
                Seller: {{ item.product?.seller?.name || item.seller_name || 'Unknown' }}
              </p>
              <p class="text-purple-400 font-bold">
                ₱{{ item.product?.price || item.price || 0 }}
              </p>
              <p class="text-gray-500 text-xs">
                Stock: {{ item.product?.stock || item.stock || 0 }}
              </p>
            </div>

            <!-- Quantity Controls -->
            <div class="flex flex-col items-end justify-between">
              <button
                @click="removeItem(item.id)"
                class="text-red-400 hover:text-red-300"
                title="Remove item"
              >
                <Trash2 class="w-5 h-5" />
              </button>

              <div class="flex items-center gap-2 bg-gray-800 rounded px-2 py-1">
                <button
                  @click="decreaseQuantity(item)"
                  :disabled="item.quantity <= 1"
                  class="text-gray-400 hover:text-white disabled:opacity-30"
                >
                  <Minus class="w-4 h-4" />
                </button>
                <span class="w-8 text-center">{{ item.quantity }}</span>
                <button
                  @click="increaseQuantity(item)"
                  :disabled="item.quantity >= (item.product?.stock || item.stock || 0)"
                  class="text-gray-400 hover:text-white disabled:opacity-30"
                >
                  <Plus class="w-4 h-4" />
                </button>
              </div>

              <p class="text-pink-400 font-bold">
                ₱{{ ((item.product?.price || item.price || 0) * item.quantity).toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-gray-900 rounded-lg p-6 sticky top-6">
            <h2 class="text-xl font-bold mb-4">Order Summary</h2>

            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-gray-400">
                <span>Items ({{ totalItems }})</span>
                <span>₱{{ totalPrice.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <hr class="border-gray-700 my-3" />
              <div class="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span class="text-pink-400">₱{{ totalPrice.toFixed(2) }}</span>
              </div>
            </div>

            <button
              @click="checkout"
              :disabled="processingCheckout || cartItems.length === 0"
              class="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingBag class="w-5 h-5" />
              {{ processingCheckout ? 'Processing...' : 'Checkout' }}
            </button>

            <button
              @click="router.push('/products')"
              class="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
</template>