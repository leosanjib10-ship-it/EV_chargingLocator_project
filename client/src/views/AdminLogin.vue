<template>
  <div class="admin-login-page">
    <div class="login-card">
      <div class="brand">
        <span class="brand-mark">⚡</span>
        <span>ChargeNP <strong>Admin</strong></span>
      </div>
      <p class="sub">Restricted access — administrators only.</p>

      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label>Admin Email</label>
          <input v-model="email" type="email" placeholder="admin@chargenp.com" required autocomplete="username" />
        </div>
        <div class="input-group">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="••••••••" required autocomplete="current-password" />
        </div>

        <div v-if="error" class="alert-error">{{ error }}</div>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <RouterLink to="/" class="back-link">← Back to ChargeNP</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    const user = await authStore.login(email.value, password.value)

    if (user.role !== 'admin') {
      await authStore.logout()
      error.value = 'This account does not have administrator access.'
      return
    }

    router.push('/admin/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.admin-login-page {
  min-height: calc(100vh - 65px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0e1a;
  font-family: 'Inter', sans-serif;
  padding: 40px 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #111827;
  border: 1px solid rgba(251, 191, 36, 0.15);
  border-radius: 24px;
  padding: 40px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 6px;
}

.brand strong {
  color: #fbbf24;
}

.brand-mark {
  font-size: 22px;
}

.sub {
  color: #64748b;
  font-size: 13px;
  margin-bottom: 28px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.input-group input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 15px;
  outline: none;
}

.input-group input:focus {
  border-color: #fbbf24;
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 12px;
  color: #1e1500;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: 0.2s;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.back-link {
  display: block;
  text-align: center;
  margin-top: 24px;
  color: #64748b;
  font-size: 13px;
  text-decoration: none;
}

.back-link:hover {
  color: #94a3b8;
}
</style>
