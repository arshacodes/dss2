// src/services/auth.js
import axios from 'axios'

// Token setter using global axios
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

export const registerUser = async (data) => {
  try {
    await axios.get('/sanctum/csrf-cookie') // Required before auth

    // console.log(data)
    console.log('Axios baseURL:', axios.defaults.baseURL)
    const response = await axios.post('api/register', data)

    console.log("hello")
    console.log(response.data)
    const { token, user, account_type } = response.data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('account_type', account_type)

    setAuthToken(token)

    return { user, account_type }
  } catch (error) {
    console.error('Register error:', error)
    throw error
  }
}

export const loginUser = async (data) => {
  try {
    await axios.get('/sanctum/csrf-cookie') // Required before login

    const response = await axios.post('/api/login', data)
    const { token, user, account_type } = response.data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('account_type', account_type)

    setAuthToken(token)

    return { user, account_type }
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}