<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { apiFetch } from '@/config/fetchConfig'
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-vue-next'

const router = useRouter()
const orders = ref([])
const loading = ref(true)
const selectedFilter = ref('all')

// Status configurations - matching backend migration enum
const statusConfig = {
  'to ship': { icon: Package, color: 'text-yellow-400', bg: 'bg-yellow-900/30', label: 'To Ship' },
  'to receive': { icon: Truck, color: 'text-blue-400', bg: 'bg-blue-900/30', label: 'To Receive' },
  received: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/30', label: 'Received' },
  cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-900/30', label: 'Cancelled' }
}

// Filter orders by status
const filteredOrders = computed(() => {
  if (selectedFilter.value === 'all') return orders.value
  return orders.value.filter(order => order.status === selectedFilter.value)
})

// Fetch all orders
const fetchOrders = async () => {
  loading.value = true
  try {
    const response = await apiFetch('/api/orders', {
      method: 'GET'
    })
    orders.value = response.orders || response || []
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    toast.error('Failed to load orders')
    orders.value = []
  } finally {
    loading.value = false
  }
}

// Mark order as received
const markAsReceived = async (orderId) => {
  if (!confirm('Confirm that you have received this order?')) return

  try {
    await apiFetch(`/api/orders/${orderId}/received`, {
      method: 'POST'
    })

    // Update local state
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'received'
    }

    toast.success('Order marked as received! Seller has been notified.')
  } catch (error) {
    console.error('Failed to mark order as received:', error)
    toast.error('Failed to update order status')
  }
}

// View order details
const viewOrderDetails = (orderId) => {
  console.log('Viewing order details for order:', orderId)
  router.push({ path: '/shop', query: { tab: 'orders', order: orderId } })
}

// Cancel order (only if to ship)
const cancelOrder = async (orderId) => {
  if (!confirm('Are you sure you want to cancel this order?')) return

  try {
    await apiFetch(`/api/orders/${orderId}/cancel`, {
      method: 'POST'
    })

    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'cancelled'
    }

    toast.success('Order cancelled successfully')
  } catch (error) {
    console.error('Failed to cancel order:', error)
    toast.error('Failed to cancel order')
  }
}

// Calculate total price for an order
const getOrderTotal = (order) => {
  if (order.items && order.items.length > 0) {
    return order.items.reduce((sum, item) => {
      return sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 0))
    }, 0)
  }
  return parseFloat(order.total_price || 0)
}

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="max-w-7xl mx-auto p-6 text-white">
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">My Orders</h1>
      <p class="text-gray-400">Track and manage your orders</p>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
      <button
        v-for="filter in ['all', 'to ship', 'to receive', 'received', 'cancelled']"
        :key="filter"
        @click="selectedFilter = filter"
        :class="[
          'px-4 py-2 rounded-lg whitespace-nowrap transition-colors',
          selectedFilter === filter
            ? 'bg-purple-600 text-white'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        ]"
      >
        {{ filter === 'all' ? 'All' : statusConfig[filter]?.label || filter }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-400">Loading orders...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
      <Package class="w-16 h-16 mx-auto mb-4 text-gray-600" />
      <p class="text-xl text-gray-400 mb-4">
        {{ selectedFilter === 'all' ? 'No orders yet' : `No ${selectedFilter} orders` }}
      </p>
      <button
        @click="router.push({ path: '/shop', query: { tab: 'home' } })"
        class="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded"
      >
        Start Shopping
      </button>
    </div>

    <!-- Orders List -->
    <div v-else class="space-y-4">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
      >
        <!-- Order Header -->
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div class="flex items-center gap-4">
            <div>
              <p class="text-sm text-gray-400">Order ID</p>
              <p class="font-mono font-bold text-lg">#{{ order.id }}</p>
            </div>
            <div
              :class="[
                'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold',
                statusConfig[order.status]?.bg,
                statusConfig[order.status]?.color
              ]"
            >
              <component :is="statusConfig[order.status]?.icon" class="w-4 h-4" />
              {{ statusConfig[order.status]?.label || order.status }}
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-400">Order Date</p>
            <p class="text-sm">{{ formatDate(order.created_at) }}</p>
          </div>
        </div>

        <!-- Order Items -->
        <div class="space-y-3 mb-4">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex gap-4 items-center bg-gray-800 rounded p-3"
          >
            <img
              v-if="item.product?.image_url"
              :src="item.product.image_url"
              :alt="item.product?.name || 'Product'"
              class="w-16 h-16 object-cover rounded"
            />
            <div class="flex-1">
              <p class="font-semibold">{{ item.product?.name || item.product_name }}</p>
              <p class="text-sm text-gray-400">
                Quantity: {{ item.quantity }} × ₱{{ item.price }}
              </p>
              <p class="text-sm text-gray-500" v-if="item.product?.seller">
                Seller: {{ item.product.seller.name }}
              </p>
            </div>
            <div class="text-right">
              <p class="font-bold text-purple-400">
                ₱{{ (item.price * item.quantity).toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Order Total -->
        <div class="flex justify-between items-center pt-4 border-t border-gray-800 mb-4">
          <span class="text-gray-400">Total Amount</span>
          <span class="text-2xl font-bold text-pink-400">
            ₱{{ getOrderTotal(order).toFixed(2) }}
          </span>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-3">
          <button
            v-if="order.status === 'to receive'"
            @click="markAsReceived(order.id)"
            class="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle class="w-4 h-4" />
            Order Received
          </button>

          <button
            v-if="order.status === 'to ship'"
            @click="cancelOrder(order.id)"
            class="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors flex items-center justify-center gap-2"
          >
            <XCircle class="w-4 h-4" />
            Cancel Order
          </button>

          <button
            v-if="order.status === 'received'"
            class="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors"
          >
            Reorder
          </button>
        </div>
      </div>
    </div>
  </div>
</template>