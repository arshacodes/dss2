// src/composables/useProducts.js
import { ref } from 'vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const products = ref([])

export function useProducts() {
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products')

      console.log('Raw response:', response)

      const data = response?.data
      products.value = Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products.')
      products.value = []
    }
  }

  const createProduct = async (formData) => {
    try {
      await axios.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Failed to create product.')
    }
  }

  const updateProduct = async (id, formData) => {
    try {
      await axios.post(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product.')
    }
  }

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`/products/${id}`)
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product.')
    }
  }

  const getProductById = async (id) => {
    try {
      const response = await axios.get(`/products/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error)
      toast.error('Failed to load product details.')
      return null
    }
  }

  return {
    products,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
  }
}