// Thin compatibility layer over the Pinia auth store so existing views can
// keep using the familiar `user` / `setUser` / `clearUser` API while the
// actual session state (including the refresh-token flow) lives in
// stores/auth.js.
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { pinia } from '../stores/pinia.js'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore(pinia)
const { user, accessToken } = storeToRefs(authStore)

// Kept for backward compatibility with older call sites; prefer
// `authStore.accessToken` / `authStore.isAuthenticated` in new code.
const token = computed(() => accessToken.value)

const setUser = (newUser, newAccessToken) => {
  if (newUser) {
    authStore.setSession(newUser, newAccessToken)
  } else {
    authStore.clearSession()
  }
}

const clearUser = () => {
  authStore.logout()
}

export { user, token, setUser, clearUser, authStore }
