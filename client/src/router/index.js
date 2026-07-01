import { createRouter, createWebHistory } from 'vue-router'
import { pinia } from '../stores/pinia.js'
import { useAuthStore } from '../stores/auth.js'

// Views
import Home from '../views/Home.vue'
import FindStation from '../views/FindStation.vue'
import About from '../views/About.vue'
import StationDetail from '../views/StationDetail.vue'
import UserAuth from '../views/UserAuth.vue'
import StationLogin from '../views/StationLogin.vue'
import AdminLogin from '../views/AdminLogin.vue'
import UserDashboard from '../views/UserDashboard.vue'
import StationDashboard from '../views/StationDashboard.vue'
import AdminDashboard from '../views/AdminDashboard.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/find', name: 'FindStation', component: FindStation },
  { path: '/about', name: 'About', component: About },
  { path: '/stations/:id', name: 'StationDetail', component: StationDetail },
  { path: '/user-auth', name: 'UserAuth', component: UserAuth },
  { path: '/station-login', name: 'StationLogin', component: StationLogin },
  { path: '/admin-login', name: 'AdminLogin', component: AdminLogin },
  {
    path: '/user/dashboard',
    name: 'UserDashboard',
    component: UserDashboard,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/station/dashboard',
    name: 'StationDashboard',
    component: StationDashboard,
    meta: { requiresAuth: true, role: 'station_owner' }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

const getDashboardForRole = (role) => {
  if (role === 'station_owner') return '/station/dashboard'
  if (role === 'admin') return '/admin/dashboard'
  return '/user/dashboard'
}

// Navigation Guards (role-based access control)
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore(pinia)

  // Wait for the silent refresh-token bootstrap to finish so guards see an
  // accurate authentication state, even on a hard page reload.
  if (!authStore.ready) {
    await authStore.bootstrap()
  }

  const isAuthenticated = authStore.isAuthenticated
  const user = authStore.user

  if (to.meta.requiresAuth && !isAuthenticated) {
    let loginPath = '/user-auth'
    if (to.meta.role === 'station_owner') loginPath = '/station-login'
    if (to.meta.role === 'admin') loginPath = '/admin-login'
    next(loginPath)
    return
  }

  if (to.meta.role && user && user.role !== to.meta.role) {
    next(getDashboardForRole(user.role))
    return
  }

  next()
})

export default router
