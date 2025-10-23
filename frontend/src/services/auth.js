// src/services/auth.js
import { apiFetch, setAuthToken } from '@/config/fetchConfig'

export { setAuthToken } // Re-export for convenience

export const registerUser = async (data) => {
  try {
    console.log('Registering with data:', data)
    
    const response = await apiFetch('/api/register', {
      method: 'POST',
      body: data
    })

    console.log('Registration successful!')
    console.log(response)
    
    const { token, user, account_type } = response

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('account_type', account_type)

    setAuthToken(token)

    return { user, account_type }
  } catch (error) {
    console.error('Register error:', error.message)
    // Try to parse Laravel validation errors
    if (error.response) {
      try {
        const errorData = await error.response.json()
        console.error('Validation errors:', errorData)
        throw { message: 'Validation failed', errors: errorData }
      } catch (e) {
        throw error
      }
    }
    throw error
  }
}

export const loginUser = async (data) => {
  try {
    console.log('Logging in...')
    
    const response = await apiFetch('/api/login', {
      method: 'POST',
      body: data
    })

    console.log('Login successful!')
    const { token, user, account_type } = response

    localStorage.setItem('token', token)
    if (user) {
        localStorage.setItem('user', JSON.stringify(user))
    }
    localStorage.setItem('account_type', account_type)

    setAuthToken(token)

    return { user, account_type }
  } catch (error) {
    console.error('Login error:', error.message)
    throw error
  }
}

export const logoutUser = async () => {
  try {
    await apiFetch('/api/logout', {
      method: 'POST'
    })
  } catch (error) {
    console.error('Logout error:', error.message)
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('account_type')
    setAuthToken(null)
  }
}

// Initialize auth token on app startup
export const initializeAuth = () => {
  const token = localStorage.getItem('token')
  if (token) {
    setAuthToken(token)
  }
}