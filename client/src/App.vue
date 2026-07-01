<template>
  <div id="app">

    <!-- Navbar -->
    <nav class="navbar" :class="{ scrolled: isScrolled }">
      <RouterLink to="/" class="nav-logo">ChargeNP</RouterLink>

      <div class="nav-links">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/find">Find Stations</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </div>

      <div class="nav-auth">
        <!-- Not logged in -->
        <template v-if="!authUser">
          <RouterLink to="/user-auth" class="nav-btn-ghost">EV User</RouterLink>
          <RouterLink to="/station-login" class="nav-btn-primary">Station Owner</RouterLink>
        </template>

        <!-- Logged in -->
        <template v-else>
          <div class="user-menu" @click="menuOpen = !menuOpen" ref="menuRef">
            <div class="user-avatar">{{ authUser.name?.[0]?.toUpperCase() }}</div>
            <span class="user-name">{{ authUser.name?.split(' ')[0] }}</span>
            <span class="chevron" :class="{ open: menuOpen }">▾</span>
            <div class="dropdown" v-if="menuOpen">
              <RouterLink :to="dashboardPath" @click="menuOpen = false">Dashboard</RouterLink>
              <button @click="logout" class="logout-item">Logout</button>
            </div>
          </div>
        </template>
      </div>

      <!-- Mobile toggle -->
      <button class="mobile-toggle" @click="mobileOpen = !mobileOpen">
        <span></span><span></span><span></span>
      </button>
    </nav>

    <!-- Mobile menu -->
    <div class="mobile-menu" :class="{ open: mobileOpen }" @click="mobileOpen = false">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/find">Find Stations</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <template v-if="!authUser">
        <RouterLink to="/user-auth">EV User Login</RouterLink>
        <RouterLink to="/station-login">Station Owner Login</RouterLink>
      </template>
      <template v-else>
        <RouterLink :to="dashboardPath">Dashboard</RouterLink>
        <button @click="logout" class="mobile-logout">Logout</button>
      </template>
    </div>

    <!-- Page Content -->
    <RouterView />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'

import { user as authUser, clearUser } from './services/auth.js'

const router = useRouter()
const route = useRoute()
const isScrolled = ref(false)
const menuOpen = ref(false)
const mobileOpen = ref(false)
const menuRef = ref(null)

const dashboardPath = computed(() => {
  const role = authUser.value?.role
  if (role === 'station_owner') return '/station/dashboard'
  if (role === 'admin') return '/admin/dashboard'
  return '/user/dashboard'
})

const logout = () => {
  clearUser()
  menuOpen.value = false
  mobileOpen.value = false
  router.push('/')
}

const handleScroll = () => { isScrolled.value = window.scrollY > 20 }

const handleClickOutside = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    menuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})

watch(route, () => { mobileOpen.value = false })
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', system-ui, sans-serif;
  background-color: #080a12;
  background-image: 
    radial-gradient(at 0% 0%, rgba(0, 229, 157, 0.05) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(124, 58, 237, 0.05) 0px, transparent 50%);
  color: #f1f5f9;
  line-height: 1.6;
}

#app { 
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}
</style>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 60px;
  background: rgba(10, 14, 26, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s;
}

.navbar.scrolled {
  background: rgba(10, 14, 26, 0.95);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.nav-logo {
  font-size: 22px;
  font-weight: 800;
  color: #00e59d;
  text-decoration: none;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-links a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #f1f5f9;
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn-ghost {
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  padding: 9px 18px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.12);
  transition: all 0.2s;
}

.nav-btn-ghost:hover { color: #f1f5f9; border-color: rgba(255,255,255,0.25); }

.nav-btn-primary {
  background: linear-gradient(135deg, #00e59d, #00d98b);
  color: #051610;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  padding: 10px 22px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 229, 157, 0.2);
}

.nav-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 229, 157, 0.4);
}

/* User dropdown */
.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.2s;
}

.user-menu:hover { background: rgba(255,255,255,0.05); }

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00e59d, #00b4a0);
  color: #0a1a0e;
  font-weight: 800;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
}

.chevron {
  font-size: 12px;
  color: #64748b;
  transition: transform 0.2s;
}

.chevron.open { transform: rotate(180deg); }

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #1a2235;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 8px;
  min-width: 160px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropdown a {
  display: block;
  padding: 10px 14px;
  border-radius: 8px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.dropdown a:hover { background: rgba(255,255,255,0.06); color: #f1f5f9; }

.logout-item {
  display: block;
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #ef4444;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.logout-item:hover { background: rgba(239,68,68,0.1); }

/* Mobile */
.mobile-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
}

.mobile-toggle span {
  display: block;
  width: 22px;
  height: 2px;
  background: #94a3b8;
  border-radius: 2px;
}

.mobile-menu {
  display: none;
  flex-direction: column;
  gap: 4px;
  padding: 16px 20px;
  background: #0f1623;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.mobile-menu.open { display: flex; }

.mobile-menu a {
  padding: 12px;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
}

.mobile-menu a:hover { background: rgba(255,255,255,0.05); color: #f1f5f9; }

.mobile-logout {
  width: 100%;
  padding: 12px;
  background: none;
  border: none;
  color: #ef4444;
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 900px) {
  .navbar { padding: 14px 24px; }
  .nav-links { display: none; }
  .nav-auth { display: none; }
  .mobile-toggle { display: flex; }
}
</style>