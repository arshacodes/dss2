// src/services/auth.js
import { api, setAuthToken } from '../config/axiosConfig.js'

export const registerUser = async (data) => {
  try {
    await api.get('/sanctum/csrf-cookie') // Required before auth

    const response = await api.post('/register', data)
    const { token, user, account_type } = response.data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('account_type', account_type)

    // Set token for future requests
    setAuthToken(token)

    return { user, account_type }
  } catch (error) {
    console.error('Register error:', error)
    throw error
  }
}

export const loginUser = async (data) => {
  try {
    await api.get('/sanctum/csrf-cookie') // Required before login

    const response = await api.post('/login', data)
    const { token, user, account_type } = response.data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('account_type', account_type)

    // Set token for future requests
    setAuthToken(token)

    return { user, account_type }
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}
