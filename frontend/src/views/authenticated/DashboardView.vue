<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '@/config/fetchConfig'
import { toast } from 'vue3-toastify'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js'
import { Bar, Doughnut, Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const seller_name = computed(() => props.user?.name || '')
const dashboardData = ref({
  totalRevenue: 0,
  revenueChange: 0,
  topProducts: [],
  recentOrders: [],
  salesData: []
})
const loading = ref(true)

// Sales chart data
const salesChartData = computed(() => ({
  labels: dashboardData.value.salesData.map(item => {
    const date = new Date(item.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }),
  datasets: [{
    label: 'Daily Revenue',
    data: dashboardData.value.salesData.map(item => item.revenue),
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    tension: 0.4,
    fill: true
  }]
}))

const salesChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return '₱' + value.toLocaleString()
        }
      }
    }
  }
}

// Top products chart data
const topProductsChartData = computed(() => ({
  labels: dashboardData.value.topProducts.map(product => product.name),
  datasets: [{
    data: dashboardData.value.topProducts.map(product => product.sales),
    backgroundColor: [
      '#8b5cf6',
      '#ec4899',
      '#06b6d4',
      '#10b981',
      '#f59e0b'
    ],
    borderWidth: 0
  }]
}))

const topProductsChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true
      }
    }
  }
}

// Fetch dashboard data
const fetchDashboardData = async () => {
  loading.value = true
  try {
    const response = await apiFetch('/api/dashboard', {
      method: 'GET'
    })
    dashboardData.value = response
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    toast.error('Failed to load dashboard data')
  } finally {
    loading.value = false
  }
}

// Format currency
const formatCurrency = (amount) => {
  return '₱' + parseFloat(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="min-h-screen bg-gray-950 p-4 md:p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-xl shadow-lg mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">Welcome back, {{ seller_name }}!</h1>
        <p class="text-purple-100">Here's what's happening with your store today.</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-400">Loading dashboard data...</p>
      </div>

      <!-- Bento Grid Layout -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">
        
        <!-- Total Revenue Card - 1x1 -->
        <div class="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-purple-500 transition-all">
          <div class="flex flex-col h-full justify-between">
            <p class="text-sm text-gray-400 mb-2">Total Revenue</p>
            <div>
              <h3 class="text-3xl font-bold text-white mb-3">{{ formatCurrency(dashboardData.totalRevenue) }}</h3>
              <div class="flex items-center gap-2">
                <span :class="[
                  'text-sm px-2 py-1 rounded-full font-medium',
                  dashboardData.revenueChange >= 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                ]">
                  {{ dashboardData.revenueChange >= 0 ? '+' : '' }}{{ dashboardData.revenueChange }}%
                </span>
                <p class="text-xs text-gray-500">vs last month</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Orders Card - 1x1 -->
        <div class="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-pink-500 transition-all">
          <div class="flex flex-col h-full justify-between">
            <p class="text-sm text-gray-400 mb-2">Total Orders</p>
            <div>
              <h3 class="text-3xl font-bold text-white mb-3">{{ dashboardData.recentOrders.length }}</h3>
              <p class="text-xs text-gray-500">All time orders</p>
            </div>
          </div>
        </div>

        <!-- Top Products Chart - 2x2 -->
        <div class="bg-gray-900 rounded-xl p-6 border border-gray-800 md:col-span-2 md:row-span-3 hover:border-blue-500 transition-all">
          <h3 class="text-lg font-semibold mb-4 text-white">Top Products</h3>
          <div class="h-64 flex items-center justify-center">
            <Doughnut :data="topProductsChartData" :options="topProductsChartOptions" />
          </div>
        </div>

        <!-- Recent Orders - 2x2 -->
        <div class="bg-gray-900 rounded-xl p-6 border border-gray-800 md:col-span-2 md:row-span-2 hover:border-indigo-500 transition-all">
          <h3 class="text-lg font-semibold mb-4 text-white">Recent Orders</h3>
          <div class="space-y-3 overflow-y-auto pr-2" style="max-height: 280px;">
            <div
              v-for="order in dashboardData.recentOrders.slice(0, 6)"
              :key="order.id"
              class="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
            >
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-semibold text-white">Order #{{ order.id }}</p>
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  order.status === 'received' ? 'bg-green-900/50 text-green-400' :
                  order.status === 'to receive' ? 'bg-blue-900/50 text-blue-400' :
                  order.status === 'to ship' ? 'bg-yellow-900/50 text-yellow-400' :
                  'bg-red-900/50 text-red-400'
                ]">
                  {{ order.status }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-400">{{ order.buyer.name }}</p>
                <p class="text-sm font-semibold text-white">{{ formatCurrency(order.total_price) }}</p>
              </div>
            </div>
          </div>
          <div v-if="dashboardData.recentOrders.length === 0" class="text-center py-8">
            <p class="text-gray-400 text-sm">No orders yet</p>
          </div>
        </div>

        <!-- Sales Chart - Full Width -->
        <div class="bg-gray-900 rounded-xl p-6 border border-gray-800 col-span-1 md:col-span-2 lg:col-span-4 hover:border-cyan-500 transition-all">
          <h3 class="text-lg font-semibold mb-4 text-white">Sales Overview (Last 7 Days)</h3>
          <div class="h-64">
            <Line :data="salesChartData" :options="salesChartOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<!-- 
<script>
import { Doughnut, Line } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default {
  components: {
    Doughnut,
    Line
  },
  data() {
    return {
      loading: true,
      seller_name: 'Alex',
      dashboardData: {
        totalRevenue: 0,
        revenueChange: 0,
        recentOrders: [],
        topProducts: [],
        salesData: []
      },
      topProductsChartData: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#8B5CF6',
            '#EC4899',
            '#06B6D4',
            '#F59E0B',
            '#10B981'
          ],
          borderWidth: 0
        }]
      },
      topProductsChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#9CA3AF',
              padding: 15,
              font: {
                size: 11
              }
            }
          }
        }
      },
      salesChartData: {
        labels: [],
        datasets: [{
          label: 'Sales',
          data: [],
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      salesChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#374151'
            },
            ticks: {
              color: '#9CA3AF'
            }
          },
          x: {
            grid: {
              color: '#374151'
            },
            ticks: {
              color: '#9CA3AF'
            }
          }
        }
      }
    };
  },
  mounted() {
    this.loadDashboardData();
  },
  methods: {
    async loadDashboardData() {
      // Simulate loading data
      setTimeout(() => {
        this.dashboardData = {
          totalRevenue: 45678.90,
          revenueChange: 12.5,
          recentOrders: [
            { id: '1001', buyer: { name: 'John Doe' }, total_price: 299.99, status: 'received' },
            { id: '1002', buyer: { name: 'Jane Smith' }, total_price: 149.50, status: 'to ship' },
            { id: '1003', buyer: { name: 'Bob Johnson' }, total_price: 599.00, status: 'to receive' },
            { id: '1004', buyer: { name: 'Alice Brown' }, total_price: 89.99, status: 'received' },
            { id: '1005', buyer: { name: 'Charlie Wilson' }, total_price: 349.99, status: 'to ship' },
            { id: '1006', buyer: { name: 'Diana Lee' }, total_price: 199.99, status: 'received' }
          ],
          topProducts: [
            { name: 'Product A', sales: 450 },
            { name: 'Product B', sales: 320 },
            { name: 'Product C', sales: 280 },
            { name: 'Product D', sales: 210 },
            { name: 'Product E', sales: 150 }
          ],
          salesData: [
            { date: 'Mon', amount: 1200 },
            { date: 'Tue', amount: 1900 },
            { date: 'Wed', amount: 1500 },
            { date: 'Thu', amount: 2200 },
            { date: 'Fri', amount: 2800 },
            { date: 'Sat', amount: 2400 },
            { date: 'Sun', amount: 1800 }
          ]
        };

        // Update chart data
        this.topProductsChartData.labels = this.dashboardData.topProducts.map(p => p.name);
        this.topProductsChartData.datasets[0].data = this.dashboardData.topProducts.map(p => p.sales);

        this.salesChartData.labels = this.dashboardData.salesData.map(d => d.date);
        this.salesChartData.datasets[0].data = this.dashboardData.salesData.map(d => d.amount);

        this.loading = false;
      }, 500);
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    }
  }
};
</script> -->