// src/composables/useCart.js
import { ref } from 'vue'
import axios from 'axios'

export function useCart() {
  const cart = ref([])

  const fetchCart = async () => {
    try {
      await axios.get('/sanctum/csrf-cookie', { withCredentials: true })
      const res = await axios.get('/cart')
      cart.value = res.data.items.map(item => ({
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
      await axios.get('/sanctum/csrf-cookie', { withCredentials: true })
      await axios.post('/cart/items', {
        product_id: product.id,
        quantity: 1,
      })
      await fetchCart()
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      await axios.get('/sanctum/csrf-cookie', { withCredentials: true })
      await axios.delete(`/cart/items/${itemId}`)
      await fetchCart()
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  return { cart, fetchCart, addToCart, removeFromCart }
}