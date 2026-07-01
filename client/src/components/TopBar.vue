<script setup>
import { defineProps, defineEmits } from 'vue'
import { user } from '../services/auth.js'

defineProps({
  darkMode: Boolean
})

const emit = defineEmits(['toggle-dark-mode', 'toggle-sidebar', 'logout'])
</script>

<template>
  <header class="top-bar">
    <div class="left-side">
      <button class="icon-btn" @click="$emit('toggle-sidebar')" title="Toggle Sidebar">
        ☰
      </button>
      <div class="breadcrumb">
        <span>Home</span>
        <span>/</span>
        <span>Dashboard</span>
      </div>
    </div>

    <div class="right-side">
      <button class="icon-btn" @click="$emit('toggle-dark-mode')" :title="darkMode ? 'Light Mode' : 'Dark Mode'">
        {{ darkMode ? '☀️' : '🌙' }}
      </button>

      <button class="icon-btn" title="Notifications">
        🔔
        <span class="notification-badge">3</span>
      </button>

      <div class="user-menu">
        <div class="user-avatar">{{ user.name?.charAt(0) || 'U' }}</div>
        <div class="user-info">
          <p class="user-name">{{ user.name || 'User' }}</p>
          <p class="user-email">{{ user.email || 'user@example.com' }}</p>
        </div>
      </div>

      <button class="logout-btn" @click="$emit('logout')">
        🚪 Logout
      </button>
    </div>
  </header>
</template>

<style scoped>
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}

:global(.dark-mode) .top-bar {
  background: #2a2a2a;
  border-bottom-color: #3a3a3a;
}

.left-side {
  display: flex;
  align-items: center;
  gap: 20px;
}

.right-side {
  display: flex;
  align-items: center;
  gap: 15px;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.icon-btn:hover {
  background: #f0f0f0;
}

:global(.dark-mode) .icon-btn:hover {
  background: #3a3a3a;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 18px;
  height: 18px;
  background: #f5576c;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
}

.breadcrumb {
  display: flex;
  gap: 10px;
  font-size: 13px;
  color: #999;
}

:global(.dark-mode) .breadcrumb {
  color: #ccc;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

:global(.dark-mode) .user-menu {
  background: #3a3a3a;
}

.user-menu:hover {
  background: #f0f0f0;
}

:global(.dark-mode) .user-menu:hover {
  background: #4a4a4a;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

:global(.dark-mode) .user-name {
  color: #fff;
}

.user-email {
  font-size: 11px;
  color: #999;
  margin: 0;
}

.logout-btn {
  padding: 8px 15px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(245, 87, 108, 0.3);
}

@media (max-width: 768px) {
  .top-bar {
    padding: 12px 15px;
    gap: 10px;
  }

  .left-side {
    gap: 10px;
  }

  .breadcrumb {
    display: none;
  }

  .user-info {
    display: none;
  }

  .logout-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
