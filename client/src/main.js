import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import { pinia } from './stores/pinia.js'
import { useAuthStore } from './stores/auth.js'

const app = createApp(App)
app.use(pinia)
app.use(router)

// Silently attempt to restore a session from the httpOnly refresh cookie
// before the app starts navigating, so router guards see accurate state.
const authStore = useAuthStore(pinia)
authStore.bootstrap().finally(() => {
  app.mount('#app')
})
