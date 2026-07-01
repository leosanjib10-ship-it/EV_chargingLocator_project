<script setup>
import { defineProps, computed } from 'vue'

defineProps({
  open: Boolean,
  activePage: String
})

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '#' },
  { id: 'bookings', label: 'Bookings', icon: '🎫', href: '#' },
  { id: 'stations', label: 'Stations', icon: '🔌', href: '#' },
  { id: 'revenue', label: 'Revenue', icon: '💰', href: '#' },
  { id: 'users', label: 'Users', icon: '👥', href: '#' },
  { id: 'analytics', label: 'Analytics', icon: '📈', href: '#' },
  { id: 'settings', label: 'Settings', icon: '⚙️', href: '#' }
]
</script>

<template>
  <aside :class="['sidebar', { 'closed': !open }]">
    <div class="sidebar-header">
      <div class="logo">
        ⚡ ChargeNP
      </div>
    </div>

    <nav class="sidebar-nav">
      <a
        v-for="item in menuItems"
        :key="item.id"
        :href="item.href"
        :class="['nav-item', { active: activePage === item.id }]"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </a>
    </nav>

    <div class="sidebar-footer">
      <div class="footer-text">v1.0.0</div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
}

.sidebar.closed {
  width: 80px;
}

:global(.dark-mode) .sidebar {
  background: #2a2a2a;
  border-right-color: #3a3a3a;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

:global(.dark-mode) .sidebar-header {
  border-bottom-color: #3a3a3a;
}

.logo {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:global(.dark-mode) .logo {
  color: #fff;
}

.sidebar.closed .logo {
  font-size: 14px;
}

.sidebar-nav {
  flex: 1;
  padding: 15px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #f8f9fa;
  color: #667eea;
}

:global(.dark-mode) .nav-item:hover {
  background: #3a3a3a;
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  border-left-color: #667eea;
}

:global(.dark-mode) .nav-item.active {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
}

.nav-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar.closed .nav-label {
  display: none;
}

.sidebar-footer {
  padding: 15px 20px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

:global(.dark-mode) .sidebar-footer {
  border-top-color: #3a3a3a;
}

.footer-text {
  font-size: 11px;
  color: #999;
  font-weight: 600;
}

@media (max-width: 768px) {
  .sidebar {
    width: 80px;
  }

  .sidebar.closed {
    width: 80px;
  }

  .sidebar-header {
    padding: 15px;
  }

  .nav-label {
    display: none;
  }

  .nav-item {
    justify-content: center;
    padding: 12px;
  }
}
</style>
