<script setup>
import { onMounted, ref } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useProducts } from '@/composables/useProducts'

import { Edit, Trash } from 'lucide-vue-next'

const search = ref('')
const showModal = ref(false)
const editingProductId = ref(null)

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const { products, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts()

const newProduct = ref({
  name: '',
  description: '',
  price: '',
  stock: '',
  image: null,
})

// const displayedProducts = products

import { computed } from 'vue'

const displayedProducts = computed(() => {
  if (!Array.isArray(products.value)) return []

  return products.value.filter(p =>
    p.seller_id === props.user.id &&
    p.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

onMounted(async () => {
  if (!props.user || !props.user.id) {
    toast.error('Unauthorized access')
    return
  }

  await fetchProducts()
})

const submit = async () => {
  if (
    !newProduct.value.name ||
    !newProduct.value.description ||
    !newProduct.value.price ||
    !newProduct.value.stock ||
    (!editingProductId.value && !newProduct.value.image) // only require image if creating
  ) {
    toast.error('All fields are required.')
    return
  }

  try {
    const formData = new FormData()
    formData.append('name', newProduct.value.name)
    formData.append('description', newProduct.value.description)
    formData.append('price', newProduct.value.price)
    formData.append('stock', newProduct.value.stock)
    formData.append('seller_id', props.user.id)

    if (newProduct.value.image) {
      formData.append('image', newProduct.value.image)
    }

    if (editingProductId.value) {
      await updateProduct(editingProductId.value, formData)
      toast.success('Product updated!')
      editingProductId.value = null
    } else {
      await createProduct(formData)
      toast.success('Product created successfully!')
    }

    newProduct.value = {
      name: '',
      description: '',
      price: '',
      stock: '',
      image: null,
    }

    showModal.value = false
    await fetchProducts()
  } catch (error) {
    toast.error('Failed to save product.')
  }
}

const confirmDelete = async (id) => {
  if (confirm('Are you sure you want to delete this product?')) {
    await deleteProduct(id)
    toast.success('Product deleted!')
    await fetchProducts()
  }
}

const editProduct = (product) => {
  editingProductId.value = product.id
  newProduct.value = {
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    image: null,
  }
  showModal.value = true
}
</script>

<template>
  <div class="mb-4">
    <h1 class="text-xl font-bold text-pink-400">Manage Products</h1>
  </div>

  <div class="flex flex-row gap-4 justify-content-between mb-4">
    <input
      v-model="search"
      type="text"
      placeholder="Search products..."
      class="border-2 border-purple-500 text-white rounded px-4 py-2 w-full"
    />

    <button
      @click="showModal = true"
      class="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
    >
      Add
    </button>
  </div>

  <!-- Product List -->
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
    <div
      v-for="product in displayedProducts"
      :key="product.id"
      :class="[
        'rounded-lg p-4 shadow hover:shadow-lg transition',
        product.stock <= 10 ? 'bg-red-900/60' : 'bg-gray-900'
      ]"
    >
      <img :src="product.image_url" :alt="product.name" class="w-full h-48 object-cover rounded mb-2">
      <h3 class="font-semibold text-lg text-white">{{ product.name }}</h3>
      <p class="text-sm text-gray-300">₱{{ product.price }}</p>
      <p class="text-xs text-gray-400">
        <span :class="product.stock <= 10 ? 'text-red-500 font-bold' : ''">
          Stock: {{ product.stock }}
        </span>
        | Sales: {{ product.sales }}
      </p>
      <div class="flex flex-row mt-2 justify-between">
        <button
          @click="confirmDelete(product.id)"
          class="text-red-500 hover:text-white"
        >
          <Trash />
        </button>
        <button
          @click="editProduct(product)"
          class="text-purple-500 hover:text-white"
        >
          <Edit class=""/>
        </button>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-white">
    <div class="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xl space-y-4 border-2 border-purple-500">
      <h2 class="text-xl font-bold">{{ editingProductId ? 'Edit Product' : 'New Product' }}</h2>

      <!-- <img
        v-if="newProduct.image"
        :src="URL.createObjectURL(newProduct.image)"
        class="w-full h-48 object-cover rounded mb-2"
      /> -->
      <form @submit.prevent="submit" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Product Name *</label>
            <input v-model="newProduct.name" required class="border-2 border-purple-500 px-4 py-2 rounded w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Price (₱) *</label>
            <input v-model="newProduct.price" type="number" step="0.01" required class="border-2 border-purple-500 px-4 py-2 rounded w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Stock *</label>
            <input v-model="newProduct.stock" type="number" required class="border-2 border-purple-500 px-4 py-2 rounded w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Image *</label>
            <input
              type="file"
              accept="image/*"
              required
              @change="e => newProduct.image = e.target.files[0]"
              class="border-2 border-purple-500 px-4 py-2 rounded w-full"
            />
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium mb-1">Description *</label>
            <textarea v-model="newProduct.description" required class="border-2 border-purple-500 px-4 py-2 rounded w-full" rows="3" />
          </div>
        </div>

        <div class="flex justify-end mt-4 space-x-2">
          <button type="button" @click="showModal = false" class="px-4 py-2 rounded border-2">Cancel</button>
          <button type="submit" class="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600">
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>