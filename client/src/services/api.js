import axios from 'axios'
import { pinia } from '../stores/pinia.js'
import { useAuthStore } from '../stores/auth.js'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Required so the httpOnly refresh-token cookie is sent with requests.
  withCredentials: true,
})

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore(pinia)
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

let refreshInFlight = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore(pinia)
    const originalRequest = error.config

    const isAuthEndpoint = originalRequest?.url?.includes('/account/login') ||
      originalRequest?.url?.includes('/account/register') ||
      originalRequest?.url?.includes('/account/refresh')

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true
      try {
        refreshInFlight = refreshInFlight || authStore.refresh()
        await refreshInFlight
        refreshInFlight = null
        originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        refreshInFlight = null
        authStore.clearSession()
        if (typeof window !== 'undefined') {
          window.location.href = '/user-auth'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
