import { ref } from 'vue'
import { api } from '../config/axiosConfig'

export function useCart() {
  const cart = ref([])

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart')
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
      await api.post('/cart/items', {
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
      await api.delete(`/cart/items/${itemId}`)
      await fetchCart()
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  return { cart, fetchCart, addToCart, removeFromCart }
}
