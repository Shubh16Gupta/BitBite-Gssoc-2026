// src/services/api.js
import axios from 'axios'
import toast from 'react-hot-toast'

// Same-origin '/api' is proxied to the Express backend by Vite (see vite.config.js).
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Attach the JWT to every request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Global error handling. On 401 clear the session and bounce to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (!window.location.pathname.includes('login')) {
          window.location.href = '/login'
        }
      } else if (status === 500) {
        toast.error('Server error. Please try again later.')
      }
      // 400/403/404/409 messages are surfaced by the calling component via getErrorMessage.
    } else if (error.request) {
      toast.error('Network error — is the backend running on :5050?')
    }
    return Promise.reject(error)
  }
)

// The backend wraps every response as { success, message, data }.
export const unwrap = (response) => response.data.data

export const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.errors?.[0]?.message ||
  error?.message ||
  'Something went wrong.'

export default api
