import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

// A bare axios instance (not the one in services/api.js) so that auth
// bootstrap/refresh calls never get caught in the 401-retry interceptor loop.
const authApi = axios.create({ baseURL: API_BASE_URL, withCredentials: true })

const getDashboardForRole = (role) => {
  if (role === 'station_owner') return '/station/dashboard'
  if (role === 'admin') return '/admin/dashboard'
  return '/user/dashboard'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    // Access tokens are short-lived (15 min) and only ever kept in memory —
    // never in localStorage — to reduce XSS token-theft exposure.
    accessToken: null,
    ready: false,
    bootstrapPromise: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.accessToken,
    dashboardPath: (state) => getDashboardForRole(state.user?.role),
  },

  actions: {
    setSession(user, accessToken) {
      this.user = user
      this.accessToken = accessToken
      localStorage.setItem('user', JSON.stringify(user))
    },

    clearSession() {
      this.user = null
      this.accessToken = null
      localStorage.removeItem('user')
    },

    async register(payload) {
      const res = await authApi.post('/account/register', payload)
      const { user, accessToken } = res.data.data
      this.setSession(user, accessToken)
      return user
    },

    async login(email, password) {
      const res = await authApi.post('/account/login', { email, password })
      const { user, accessToken } = res.data.data
      this.setSession(user, accessToken)
      return user
    },

    async logout() {
      try {
        await authApi.post('/account/logout')
      } catch {
        // Ignore network errors on logout — clear local session regardless.
      }
      this.clearSession()
    },

    // Silently re-issues an access token using the httpOnly refresh cookie.
    // Called once on app boot and again by the response interceptor on 401s.
    async refresh() {
      try {
        const res = await authApi.post('/account/refresh')
        const { user, accessToken } = res.data.data
        this.setSession(user, accessToken)
        return accessToken
      } catch (err) {
        this.clearSession()
        throw err
      }
    },

    // Runs once when the app starts: tries to silently restore a session.
    bootstrap() {
      if (this.bootstrapPromise) return this.bootstrapPromise
      this.bootstrapPromise = this.refresh()
        .catch(() => {})
        .finally(() => {
          this.ready = true
        })
      return this.bootstrapPromise
    },
  },
})

export default useAuthStore
