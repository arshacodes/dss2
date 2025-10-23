<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { apiFetch } from '@/config/fetchConfig'
import { Package, Clock, Truck, CheckCircle, XCircle, AlertCircle } from 'lucide-vue-next'

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

// Count orders by status
const orderCounts = computed(() => {
  const counts = {
    all: orders.value.length,
    'to ship': 0,
    'to receive': 0,
    received: 0,
    cancelled: 0
  }
  orders.value.forEach(order => {
    if (counts[order.status] !== undefined) {
      counts[order.status]++
    }
  })
  return counts
})

// Fetch all seller orders
const fetchOrders = async () => {
  loading.value = true
  try {
    // Adjust this endpoint based on your API structure
    const response = await apiFetch('/api/seller/orders', {
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

// Update order status
const updateOrderStatus = async (orderId, newStatus) => {
  const statusMessages = {
    'to receive': 'Mark as to receive?',
    received: 'Mark as received?',
    cancelled: 'Are you sure you want to cancel this order?'
  }

  if (!confirm(statusMessages[newStatus] || 'Update order status?')) return

  try {
    await apiFetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    })

    // Update local state
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = newStatus
    }

    const successMessages = {
      'to receive': 'Order marked as to receive',
      received: 'Order marked as received',
      cancelled: 'Order cancelled successfully'
    }

    toast.success(successMessages[newStatus] || 'Order status updated')
  } catch (error) {
    console.error('Failed to update order status:', error)
    toast.error('Failed to update order status')
  }
}

// Cancel order
const cancelOrder = async (orderId) => {
  await updateOrderStatus(orderId, 'cancelled')
}

// Get next available status - matching backend enum
const getNextStatus = (currentStatus) => {
  const statusFlow = {
    'to ship': 'to receive',
    'to receive': 'received'
  }
  return statusFlow[currentStatus]
}

// Calculate total price for an order
const getOrderTotal = (order) => {
  return order.items?.reduce((sum, item) => {
    return sum + (item.price * item.quantity)
  }, 0) || order.total_price || 0
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

// Get buyer information
const getBuyerInfo = (order) => {
  return order.buyer || order.user || { name: 'Customer', email: '' }
}

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="max-w-7xl mx-auto p-6 text-white">
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">Seller Orders</h1>
      <p class="text-gray-400">Manage orders from your customers</p>
    </div>

    <!-- Order Statistics -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <p class="text-gray-400 text-sm mb-1">Total Orders</p>
        <p class="text-2xl font-bold text-purple-400">{{ orderCounts.all }}</p>
      </div>
      <div class="bg-gray-900 rounded-lg p-4 border border-yellow-900/30">
        <p class="text-gray-400 text-sm mb-1">To Ship</p>
        <p class="text-2xl font-bold text-yellow-400">{{ orderCounts['to ship'] }}</p>
      </div>
      <div class="bg-gray-900 rounded-lg p-4 border border-blue-900/30">
        <p class="text-gray-400 text-sm mb-1">To Receive</p>
        <p class="text-2xl font-bold text-blue-400">{{ orderCounts['to receive'] }}</p>
      </div>
      <div class="bg-gray-900 rounded-lg p-4 border border-green-900/30">
        <p class="text-gray-400 text-sm mb-1">Received</p>
        <p class="text-2xl font-bold text-green-400">{{ orderCounts.received }}</p>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
      <button
        v-for="filter in ['all', 'to ship', 'to receive', 'received', 'cancelled']"
        :key="filter"
        @click="selectedFilter = filter"
        :class="[
          'px-4 py-2 rounded-lg whitespace-nowrap transition-colors relative',
          selectedFilter === filter
            ? 'bg-purple-600 text-white'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        ]"
      >
        {{ filter === 'all' ? 'All' : statusConfig[filter]?.label || filter }}
        <span
          v-if="orderCounts[filter] > 0"
          class="ml-2 px-2 py-0.5 bg-gray-700 rounded-full text-xs"
        >
          {{ orderCounts[filter] }}
        </span>
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
      <p class="text-gray-500 mb-4">Orders from customers will appear here</p>
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

        <!-- Buyer Information -->
        <div class="bg-gray-800 rounded p-3 mb-4">
          <p class="text-sm text-gray-400 mb-1">Customer</p>
          <p class="font-semibold">{{ getBuyerInfo(order).name }}</p>
          <p class="text-sm text-gray-400" v-if="getBuyerInfo(order).email">
            {{ getBuyerInfo(order).email }}
          </p>
          <div v-if="order.shipping_address" class="mt-2 text-sm text-gray-400">
            <p class="font-semibold text-gray-300">Shipping Address:</p>
            <p>{{ order.shipping_address }}</p>
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
          <!-- Update Status Button -->
          <button
            v-if="getNextStatus(order.status)"
            @click="updateOrderStatus(order.id, getNextStatus(order.status))"
            class="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <component :is="statusConfig[getNextStatus(order.status)]?.icon" class="w-4 h-4" />
            Mark as {{ statusConfig[getNextStatus(order.status)]?.label }}
          </button>

          <!-- Cancel Order Button (only for to ship) -->
          <button
            v-if="order.status === 'to ship'"
            @click="cancelOrder(order.id)"
            class="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors flex items-center justify-center gap-2"
          >
            <XCircle class="w-4 h-4" />
            Cancel Order
          </button>
        </div>

        <!-- Alert for delivered orders -->
        <div 
          v-if="order.status === 'delivered'"
          class="mt-4 flex items-start gap-2 bg-blue-900/20 border border-blue-800 rounded p-3 text-sm"
        >
          <AlertCircle class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-blue-400 font-semibold">Waiting for buyer confirmation</p>
            <p class="text-gray-400">Order will be completed once the buyer confirms receipt</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>