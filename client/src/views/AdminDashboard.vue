<template>
  <div class="admin-dashboard">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="brand">Admin Panel</div>
      <nav class="nav">
        <button 
          v-for="t in tabs" 
          :key="t.id"
          :class="{ active: activeTab === t.id }"
          @click="activeTab = t.id"
        >
          <span class="icon">{{ t.icon }}</span>
          {{ t.label }}
        </button>
      </nav>
      <div class="sidebar-footer">
        <button class="logout-btn" @click="logout">Logout</button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main">
      <header class="header">
        <h1>{{ tabs.find(t => t.id === activeTab).label }}</h1>
        <div class="header-meta">
          <div class="live-pill"><span class="pulse"></span> Live System</div>
        </div>
      </header>

      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="tab-pane">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="label">Total Users</div>
            <div class="value">{{ overview.users?.total ?? 0 }}</div>
            <div class="trend">{{ overview.users?.active ?? 0 }} active</div>
          </div>
          <div class="stat-card">
            <div class="label">Total Stations</div>
            <div class="value">{{ overview.stations?.total ?? 0 }}</div>
            <div class="trend">{{ overview.stations?.active ?? 0 }} active</div>
          </div>
          <div class="stat-card">
            <div class="label">Charger Ports</div>
            <div class="value">{{ overview.chargers?.total ?? 0 }}</div>
            <div class="trend">{{ overview.chargers?.available ?? 0 }} available now</div>
          </div>
          <div class="stat-card">
            <div class="label">Bookings</div>
            <div class="value">{{ overview.bookings?.total ?? 0 }}</div>
            <div class="trend">{{ overview.bookings?.byStatus?.confirmed || 0 }} confirmed</div>
          </div>
          <div class="stat-card">
            <div class="label">Feedback / Reviews</div>
            <div class="value">{{ overview.reviews?.total ?? 0 }}</div>
            <div class="trend">Avg. Rating: {{ overview.reviews?.avgRating || '—' }} / 5</div>
          </div>
          <div class="stat-card">
            <div class="label">Simulated Payments</div>
            <div class="value">Rs. {{ overview.payments?.totalVolume ?? 0 }}</div>
            <div class="trend">{{ overview.payments?.total ?? 0 }} transactions</div>
          </div>
        </div>

        <div class="grid-2col mt-8">
          <div class="card">
            <h3>Users by Role</h3>
            <div class="health-list">
              <div class="health-item">
                <span>EV Users</span>
                <span>{{ overview.users?.byRole?.user ?? 0 }}</span>
              </div>
              <div class="health-item">
                <span>Station Owners</span>
                <span>{{ overview.users?.byRole?.station_owner ?? 0 }}</span>
              </div>
              <div class="health-item">
                <span>Admins</span>
                <span>{{ overview.users?.byRole?.admin ?? 0 }}</span>
              </div>
            </div>
          </div>
          <div class="card">
            <h3>Recent User Registrations</h3>
            <div class="list">
              <div v-for="u in recentUsers" :key="u._id" class="list-item">
                <div class="av">{{ u.name[0] }}</div>
                <div class="info">
                  <strong>{{ u.name }}</strong>
                  <span>{{ u.email }}</span>
                </div>
                <div class="tag" :class="u.role">{{ u.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stations Tab -->
      <div v-if="activeTab === 'stations'" class="tab-pane">
        <div class="card">
          <div class="table-header">
            <h3>Manage Stations ({{ stations.length }})</h3>
            <input v-model="stationSearch" type="text" placeholder="Search stations or owners..." class="search" />
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Station Name</th>
                <th>Owner</th>
                <th>Location</th>
                <th>Chargers</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in filteredStations" :key="s._id">
                <td><strong>{{ s.name }}</strong></td>
                <td>
                  {{ s.operator?.name || '—' }}
                  <div class="sub-text">{{ s.operator?.businessName || s.operator?.email }}</div>
                </td>
                <td>{{ s.address?.city }}</td>
                <td>{{ s.liveSummary?.available ?? 0 }}/{{ s.liveSummary?.totalPorts ?? 0 }} available</td>
                <td>{{ s.avgRating ? `${s.avgRating} ★ (${s.reviewCount})` : '—' }}</td>
                <td><span class="tag" :class="s.status">{{ s.status }}</span></td>
                <td>
                  <button class="action-btn" @click="toggleStationStatus(s)">Toggle Status</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="tab-pane">
        <div class="card">
          <div class="table-header">
            <h3>User Management ({{ allUsers.length }})</h3>
            <input v-model="userSearch" type="text" placeholder="Search users..." class="search" />
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in filteredUsers" :key="u._id">
                <td>{{ u.name }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.phone }}</td>
                <td><span class="tag" :class="u.role">{{ u.role }}</span></td>
                <td><span class="tag" :class="u.isActive ? 'active' : 'inactive'">{{ u.isActive ? 'active' : 'inactive' }}</span></td>
                <td>{{ new Date(u.createdAt).toLocaleDateString() }}</td>
                <td class="actions-cell">
                  <button class="action-btn" @click="toggleUserActive(u)">{{ u.isActive ? 'Deactivate' : 'Reactivate' }}</button>
                  <button class="action-btn danger" @click="deleteUser(u._id)">Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Feedback Tab -->
      <div v-if="activeTab === 'feedback'" class="tab-pane">
        <div class="card">
          <div class="table-header">
            <h3>Platform Feedback ({{ allReviews.length }})</h3>
            <input v-model="feedbackSearch" type="text" placeholder="Search by station or reviewer..." class="search" />
          </div>
          <div v-if="allReviews.length === 0" class="empty-msg">No feedback submitted yet.</div>
          <div v-else class="feedback-list">
            <div v-for="r in filteredReviews" :key="r._id" class="feedback-card">
              <div class="fb-header">
                <div>
                  <strong>{{ r.station?.name || 'Unknown station' }}</strong>
                  <span class="fb-by">by {{ r.user?.name || 'Anonymous' }}</span>
                </div>
                <div class="fb-right">
                  <span class="stars">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
                  <span class="fb-date">{{ new Date(r.createdAt).toLocaleDateString() }}</span>
                </div>
              </div>
              <p class="fb-comment">{{ r.comment || '(no comment)' }}</p>
              <div v-if="r.reply?.text" class="fb-reply">
                <span class="label">Owner response</span>
                <p>{{ r.reply.text }}</p>
              </div>
              <button class="action-btn danger sm" @click="removeReview(r._id)">Remove Feedback</button>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchOverview, fetchAllUsers, fetchAllStations } from '../services/admin.js'
import { fetchAllReviews, deleteReview } from '../services/reviews.js'
import api from '../services/api.js'
import { clearUser } from '../services/auth.js'

const router = useRouter()
const activeTab = ref('overview')
const overview = ref({})
const stations = ref([])
const allUsers = ref([])
const allReviews = ref([])

const stationSearch = ref('')
const userSearch = ref('')
const feedbackSearch = ref('')

const tabs = [
  { id: 'overview', label: 'Overview', icon: '' },
  { id: 'stations', label: 'Stations', icon: '' },
  { id: 'users', label: 'Users', icon: '' },
  { id: 'feedback', label: 'Feedback', icon: '' }
]

const recentUsers = computed(() =>
  [...allUsers.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
)

const filteredStations = computed(() => {
  const q = stationSearch.value.trim().toLowerCase()
  if (!q) return stations.value
  return stations.value.filter(s =>
    s.name?.toLowerCase().includes(q) ||
    s.operator?.name?.toLowerCase().includes(q) ||
    s.operator?.businessName?.toLowerCase().includes(q) ||
    s.address?.city?.toLowerCase().includes(q)
  )
})

const filteredUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase()
  if (!q) return allUsers.value
  return allUsers.value.filter(u =>
    u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
  )
})

const filteredReviews = computed(() => {
  const q = feedbackSearch.value.trim().toLowerCase()
  if (!q) return allReviews.value
  return allReviews.value.filter(r =>
    r.station?.name?.toLowerCase().includes(q) || r.user?.name?.toLowerCase().includes(q)
  )
})

const loadData = async () => {
  try {
    const [ov, users, sts, reviews] = await Promise.all([
      fetchOverview(),
      fetchAllUsers(),
      fetchAllStations(),
      fetchAllReviews()
    ])
    overview.value = ov
    allUsers.value = users
    stations.value = sts
    allReviews.value = reviews
  } catch (err) {
    console.error('Failed to load admin data:', err)
  }
}

const toggleStationStatus = async (station) => {
  const newStatus = station.status === 'active' ? 'inactive' : 'active'
  try {
    await api.put(`/stations/${station._id}`, { status: newStatus })
    loadData()
  } catch (err) {
    alert('Failed to update station.')
  }
}

const deleteUser = async (id) => {
  if (!confirm('Permanently remove this user?')) return
  try {
    await api.delete(`/users/${id}`)
    loadData()
  } catch (err) {
    alert('Failed to delete user.')
  }
}

const toggleUserActive = async (u) => {
  try {
    await api.put(`/users/${u._id}/${u.isActive ? 'deactivate' : 'reactivate'}`)
    loadData()
  } catch (err) {
    alert('Failed to update user status.')
  }
}

const removeReview = async (id) => {
  if (!confirm('Remove this feedback? This cannot be undone.')) return
  try {
    await deleteReview(id)
    allReviews.value = allReviews.value.filter(r => r._id !== id)
  } catch (err) {
    alert('Failed to remove feedback.')
  }
}

const logout = () => {
  clearUser()
  router.push('/')
}

onMounted(loadData)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.admin-dashboard {
  display: flex;
  min-height: calc(100vh - 65px);
  background: #0a0e1a;
  color: #f1f5f9;
  font-family: 'Inter', sans-serif;
}

.sidebar {
  width: 260px;
  background: #0d1323;
  border-right: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  padding: 30px 20px;
}

.brand {
  font-size: 22px;
  font-weight: 800;
  color: #fbbf24;
  margin-bottom: 40px;
}

.nav {
  flex: 1;
}

.nav button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 8px;
  transition: all 0.2s;
}

.nav button.active {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

.nav button:hover:not(.active) {
  background: rgba(255,255,255,0.05);
  color: #f1f5f9;
}

.logout-btn {
  width: 100%;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: none;
  border-radius: 12px;
  color: #fca5a5;
  font-weight: 700;
  cursor: pointer;
}

.main {
  flex: 1;
  padding: 40px 60px;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.header h1 { font-size: 32px; font-weight: 800; }

.live-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 229, 157, 0.1);
  color: #00e59d;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}

.pulse {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse-a 1.5s infinite;
}

@keyframes pulse-a { 0%,100% {opacity:1} 50% {opacity:0.3} }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  background: #111827;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.05);
}

.stat-card .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
.stat-card .value { font-size: 32px; font-weight: 800; color: #f1f5f9; margin-bottom: 4px; }
.stat-card .trend { font-size: 11px; color: #00e59d; }

.card {
  background: #111827;
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(255,255,255,0.05);
}

.mt-8 { margin-top: 32px; }
.grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

.list { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
.list-item { display: flex; align-items: center; gap: 16px; }
.av { width: 40px; height: 40px; background: #334155; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; }
.info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.info span { font-size: 12px; color: #64748b; }

.tag { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; white-space: nowrap; }
.tag.user { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
.tag.station_owner { background: rgba(168, 85, 247, 0.1); color: #c084fc; }
.tag.admin { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }
.tag.active { background: rgba(0, 229, 157, 0.1); color: #34d399; }
.tag.inactive { background: rgba(239, 68, 68, 0.1); color: #f87171; }

.health-list { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
.health-item { display: flex; justify-content: space-between; font-size: 14px; color: #94a3b8; }
.status-ok { color: #00e59d; font-weight: 700; }

.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; }
.table-header h3 { white-space: nowrap; }
.search { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 10px 16px; border-radius: 12px; color: #f1f5f9; outline: none; width: 280px; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 12px; font-size: 12px; color: #475569; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); }
.data-table td { padding: 16px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
.sub-text { font-size: 11px; color: #64748b; margin-top: 2px; }

.actions-cell { display: flex; gap: 8px; }

.action-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #f1f5f9; padding: 6px 14px; border-radius: 8px; cursor: pointer; }
.action-btn.danger { color: #fca5a5; border-color: rgba(239, 68, 68, 0.2); }
.action-btn.sm { padding: 5px 12px; font-size: 12px; margin-top: 12px; }

.empty-msg { color: #64748b; text-align: center; padding: 40px; }

/* Feedback */
.feedback-list { display: flex; flex-direction: column; gap: 16px; }
.feedback-card { background: #0d1323; border-radius: 18px; padding: 22px; border: 1px solid rgba(255,255,255,0.06); }
.fb-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.fb-header strong { font-size: 15px; display: block; }
.fb-by { font-size: 12px; color: #64748b; }
.fb-right { text-align: right; display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
.fb-right .stars { color: #fbbf24; font-size: 15px; }
.fb-date { font-size: 11px; color: #64748b; }
.fb-comment { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 10px; }
.fb-reply { background: rgba(0, 229, 157, 0.05); border-left: 3px solid #00e59d; padding: 10px 14px; border-radius: 8px; }
.fb-reply .label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #00e59d; margin-bottom: 4px; }
.fb-reply p { font-size: 13px; color: #94a3b8; }

@media (max-width: 900px) {
  .admin-dashboard { flex-direction: column; }
  .sidebar { width: 100%; }
  .main { padding: 24px; }
  .stats-grid { grid-template-columns: 1fr; }
  .grid-2col { grid-template-columns: 1fr; }
}
</style>
