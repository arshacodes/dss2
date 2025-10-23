// src/composables/useAuth.js
import axios from 'axios'
import { ref } from 'vue'


const API_BASE_URL = 'http://127.0.0.1:8000'


// // Logout function using axios directly
// export async function logout() {
//   try {
//     // await axios.get('/sanctum/csrf-cookie', { withCredentials: true })
//     await axios.post('/logout')
//   } catch (error) {
//     console.error('Logout failed:', error)
//   } finally {
//     localStorage.removeItem('token')
//     localStorage.removeItem('user')
//     localStorage.removeItem('account_type')
//     return true
//   }
// }

// // Reactive user reference
// export function useAuth() {
//   const currentUser = ref(JSON.parse(localStorage.getItem('user')))
//   return { currentUser }
// }

export async function logout() {
  try {
    const token = localStorage.getItem('token')
    
    await fetch(`${API_BASE_URL}/api/logout`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    })
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('account_type')
    return true
  }
}

// import { ref } from 'vue'

export function useAuth() {
  const currentUser = ref(null)

  try {
    const raw = localStorage.getItem('user')
    if (raw && raw !== 'undefined') {
      currentUser.value = JSON.parse(raw)
    } else {
      currentUser.value = null
    }
  } catch (e) {
    console.error('Failed to parse user:', e)
    currentUser.value = null
  }

  return { currentUser }
}
