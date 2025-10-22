import { api } from '../config/axiosConfig'
import { ref } from 'vue'

export async function logout() {
  try {
    await api.post('/logout')
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('account_type')
    return true
  }
}

export function useAuth() {
  const currentUser = ref(JSON.parse(localStorage.getItem('user')))
  return { currentUser }
}
