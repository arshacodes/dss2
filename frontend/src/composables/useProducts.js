// src/composables/useProducts.js
import { ref, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const API_BASE_URL = 'http://127.0.0.1:8000'

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

const getMultipartHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

export function useProducts() {
  const products = ref([])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      products.value = await response.json()
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products.')
    }
  }

  const createProduct = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: getMultipartHeaders(),
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Failed to create product.')
      throw error
    }
  }

  const updateProduct = async (id, formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'POST',
        headers: getMultipartHeaders(),
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product.')
      throw error
    }
  }

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product.')
      throw error
    }
  }

  const getProductById = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'GET',
        headers: getHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error)
      toast.error('Failed to load product details.')
      return null
    }
  }

  onMounted(fetchProducts)

  return {
    products,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById
  }
}