// src/composables/useAuth.js
import axios from 'axios'
import { ref } from 'vue'

// Logout function using axios directly
export async function logout() {
  try {
    // await axios.get('/sanctum/csrf-cookie', { withCredentials: true })
    await axios.post('/logout')
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('account_type')
    return true
  }
}

// Reactive user reference
export function useAuth() {
  const currentUser = ref(JSON.parse(localStorage.getItem('user')))
  return { currentUser }
}