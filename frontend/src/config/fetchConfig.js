// src/config/fetchConfig.js
export const API_BASE_URL = 'http://127.0.0.1:8000'

export const getHeaders = (includeContentType = true) => {
  const token = localStorage.getItem('token')
  const headers = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }

  if (includeContentType) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

export const getMultipartHeaders = () => {
  const token = localStorage.getItem('token')
  const headers = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

export const apiFetch = async (endpoint, options = {}, isFormData = false) => {
  console.log("debugging message")
  const url = `${API_BASE_URL}${endpoint}`
  
  // Extract method and body from options to handle separately
  const { method = 'GET', body, headers: customHeaders, ...restOptions } = options
  
  const config = {
    ...restOptions,
    method,
    headers: {
      ...(isFormData ? getMultipartHeaders() : getHeaders()),
      ...customHeaders
    }
  }

  // Auto-stringify JSON body (unless it's FormData)
  if (body && !isFormData && typeof body !== 'string') {
    config.body = JSON.stringify(body)
  } else if (body) {
    config.body = body
  }
  
  console.log("URL: ", url)
  console.log("CONFIG:", config)

  try {
    const response = await fetch(url, config)
    
    console.log("Response status:", response.status)
    console.log("Response headers:", response.headers)

    // Check if response is ok (status 200-299)
    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      } else {
        const errorText = await response.text()
        console.error("Error response (text):", errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    }

    // Return parsed JSON if response has content
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      console.log("Response data:", data)
      return data
    }

    return response
  } catch (error) {
    console.error("Fetch error:", error)
    // If it's a network error (like ERR_CONNECTION_RESET)
    if (error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please check if the backend is running.')
    }
    throw error
  }
}

/**
 * Set or remove auth token
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token)
  } else {
    localStorage.removeItem('token')
  }
}