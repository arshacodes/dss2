// src/composables/useCart.js
import { ref } from 'vue'

const API_BASE_URL = 'http://127.0.0.1:8000'

// Helper function to get auth headers
const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

export function useCart() {
  const cart = ref([])

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'GET',
        headers: getHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      cart.value = data.items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image_url: item.product.image_url,
        quantity: item.quantity,
        stock: item.product.stock,
      }))
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    }
  }

  const addToCart = async (product) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await fetchCart()
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: getHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await fetchCart()
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  return { cart, fetchCart, addToCart, removeFromCart }
}