// src/config/axiosConfig.js
import axios from 'axios'

// Set global defaults directly on axios
axios.defaults.baseURL = 'http://127.0.0.1:8000'
axios.defaults.withCredentials = true
axios.defaults.headers.common['Accept'] = 'application/json'
// axios.defaults.headers.common['Content-Type'] = 'multipart/form-data'

// Token setter function
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}