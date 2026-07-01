<template>
  <div class="dashboard">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">ChargeNP</div>
      <nav class="sidebar-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="nav-item"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="nav-icon">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </nav>
      <div class="sidebar-user">
        <div class="user-av">{{ user?.name?.[0]?.toUpperCase() }}</div>
        <div class="user-info">
          <div class="user-n">{{ user?.name?.split(' ')[0] }}</div>
          <div class="user-role">Station Owner</div>
        </div>
        <button class="logout-btn" @click="logout" title="Logout">⏻</button>
      </div>
    </aside>

    <!-- Main -->
    <main class="main">

      <!-- Header -->
      <header class="top-bar">
        <div>
          <h1>{{ currentTabLabel }}</h1>
          <p class="sub">{{ user?.businessName || user?.name }}</p>
        </div>
        <div class="top-actions">
          <button v-if="activeTab === 'stations'" class="btn-primary" @click="openAddStation">
            + Add Station
          </button>
          <div class="live-pill">
            <span class="pulse"></span> Live
          </div>
        </div>
      </header>

      <!-- ── Overview Tab ── -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">{{ stats.stations }}</div>
            <div class="metric-label">My Stations</div>
          </div>
          <div class="metric-card green">
            <div class="metric-value">{{ stats.available }}/{{ stats.ports }}</div>
            <div class="metric-label">Ports Available</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ stats.occupied }}</div>
            <div class="metric-label">Currently Occupied</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ stats.avgRating || '—' }}</div>
            <div class="metric-label">Avg Rating</div>
          </div>
        </div>

        <!-- Quick port status -->
        <div class="card mt-6">
          <div class="card-header">
            <h2>Live Port Status</h2>
            <div class="live-pill small"><span class="pulse"></span> Real-time</div>
          </div>
          <div v-if="allPorts.length === 0" class="empty-msg">No ports added yet. Go to Stations to add chargers.</div>
          <div v-else class="port-status-grid">
            <div v-for="port in allPorts" :key="port._id" class="port-status-card" :class="port.availability">
              <div class="ps-top">
                <strong>{{ port.stationName }}</strong>
                <span class="ps-badge" :class="port.availability">{{ port.availability }}</span>
              </div>
              <div class="ps-info">Port {{ port.portNumber }} · {{ port.connectorType }} · {{ port.powerKw || '?' }} kW</div>
              <select class="ps-select" :value="port.availability" @change="updateStatus(port._id, $event.target.value)">
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Stations Tab ── -->
      <div v-if="activeTab === 'stations'" class="tab-content">
        <div v-if="stationsLoading" class="loading-msg">Loading stations...</div>
        <div v-else-if="stations.length === 0" class="empty-card">
          <div class="empty-icon">🔌</div>
          <h3>No stations yet</h3>
          <p>Add your first EV charging station to get started.</p>
          <button class="btn-primary" @click="openAddStation">+ Add Station</button>
        </div>
        <div v-else class="stations-list">
          <div v-for="s in stations" :key="s._id" class="station-card">
            <div class="sc-left">
              <div class="sc-header">
                <h3>{{ s.name }}</h3>
                <span class="sc-status" :class="s.status">{{ s.status }}</span>
              </div>
              <p class="sc-addr">Address: {{ s.address?.formatted || s.address?.city }}</p>
              <div class="sc-live">
                <span class="live-dot-sm" :class="s.liveStatus?.available > 0 ? 'available' : 'offline'"></span>
                {{ s.liveStatus?.available || 0 }}/{{ s.liveStatus?.totalPorts || 0 }} ports free ·
                {{ s.liveStatus?.occupied || 0 }} occupied
              </div>
              <div class="sc-ports-row">
                <div v-for="port in (s.liveStatus?.ports || []).slice(0, 6)" :key="port._id" class="mini-port" :class="port.availability" :title="`Port ${port.portNumber} - ${port.availability}`"></div>
              </div>
            </div>
            <div class="sc-actions">
              <button class="btn-sm" @click="openAddPort(s)">+ Port</button>
              <button class="btn-sm" @click="openEditStation(s)">Edit</button>
              <button class="btn-sm btn-danger" @click="confirmDeleteStation(s)">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Ports Tab ── -->
      <div v-if="activeTab === 'ports'" class="tab-content">
        <div v-if="allPorts.length === 0" class="empty-msg">No charger ports yet. Add ports from your station.</div>
        <div v-else class="ports-table-wrap">
          <table class="ports-table">
            <thead>
              <tr>
                <th>Station</th>
                <th>Port #</th>
                <th>Connector</th>
                <th>Level</th>
                <th>Power</th>
                <th>Pricing</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="port in allPorts" :key="port._id">
                <td>{{ port.stationName }}</td>
                <td>{{ port.portNumber || '—' }}</td>
                <td><span class="connector-tag">{{ port.connectorType }}</span></td>
                <td>{{ port.chargeLevel?.replace('_', ' ') }}</td>
                <td>{{ port.powerKw ? `${port.powerKw} kW` : '—' }}</td>
                <td class="pricing-cell">
                  <span v-if="port.pricing?.freeCharging" class="free-tag">Free</span>
                  <span v-else>
                    {{ port.pricing?.perKwh ? `Rs.${port.pricing.perKwh}/kWh` : '' }}
                    {{ port.pricing?.perMinute ? ` Rs.${port.pricing.perMinute}/min` : '' }}
                  </span>
                </td>
                <td>
                  <select class="inline-select" :value="port.availability" @change="updateStatus(port._id, $event.target.value)">
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="offline">Offline</option>
                  </select>
                </td>
                <td>
                  <button class="btn-sm btn-danger" @click="confirmDeletePort(port)">Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Feedback Tab ── -->
      <div v-if="activeTab === 'feedback'" class="tab-content">
        <div v-if="feedbackLoading" class="loading-msg">Loading feedback...</div>
        <div v-else-if="feedback.length === 0" class="empty-card">
          <div class="empty-icon">💬</div>
          <h3>No feedback yet</h3>
          <p>Reviews left by EV users on your stations will show up here.</p>
        </div>
        <div v-else class="feedback-list">
          <div v-for="r in feedback" :key="r._id" class="feedback-card">
            <div class="fb-header">
              <div>
                <strong>{{ r.station?.name }}</strong>
                <span class="fb-by">by {{ r.user?.name || 'Anonymous' }}</span>
              </div>
              <div class="fb-right">
                <span class="stars">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
                <span class="fb-date">{{ new Date(r.createdAt).toLocaleDateString() }}</span>
              </div>
            </div>
            <p class="fb-comment">{{ r.comment || '(no comment)' }}</p>

            <div v-if="r.reply?.text" class="fb-reply">
              <span class="label">Your response</span>
              <p>{{ r.reply.text }}</p>
            </div>
            <div v-else class="fb-reply-form">
              <textarea v-model="replyDrafts[r._id]" rows="2" placeholder="Write a response to this feedback..."></textarea>
              <button class="btn-sm" @click="sendReply(r._id)" :disabled="replyingTo === r._id">
                {{ replyingTo === r._id ? 'Sending...' : 'Reply' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Profile Tab ── -->
      <div v-if="activeTab === 'profile'" class="tab-content">
        <div class="profile-grid">
          <div class="card">
            <h2 class="card-title">Account Info</h2>
            <div class="profile-form">
              <label>Full Name</label>
              <input v-model="profile.name" type="text" />
              <label>Business Name</label>
              <input v-model="profile.businessName" type="text" />
              <label>Phone</label>
              <input v-model="profile.phone" type="text" />
              <label>Email (read-only)</label>
              <input :value="user?.email" type="email" disabled />
            </div>
            <p v-if="profileMsg" class="profile-msg" :class="profileMsg.type">{{ profileMsg.text }}</p>
            <button class="btn-primary" @click="saveProfile" :disabled="savingProfile">
              {{ savingProfile ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>

    </main>

    <!-- ── Add / Edit Station Modal ── -->
    <div v-if="showStationModal" class="modal-overlay" @click.self="showStationModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingStation ? 'Edit Station' : 'Add Charging Station' }}</h3>
          <button class="modal-close" @click="showStationModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label>Station Name *</label>
            <input v-model="stationForm.name" placeholder="e.g. Kathmandu Fast Charge Hub" />
          </div>
          <div class="form-row">
            <label>Description</label>
            <textarea v-model="stationForm.description" placeholder="Brief description..."></textarea>
          </div>
          <div class="form-2col">
            <div class="form-row">
              <label>Street *</label>
              <input v-model="stationForm.street" placeholder="Street address" />
            </div>
            <div class="form-row">
              <label>City *</label>
              <input v-model="stationForm.city" placeholder="e.g. Kathmandu" />
            </div>
          </div>
          <div class="form-2col">
            <div class="form-row">
              <label>Latitude *</label>
              <input v-model.number="stationForm.lat" type="number" step="any" placeholder="27.7172" />
            </div>
            <div class="form-row">
              <label>Longitude *</label>
              <input v-model.number="stationForm.lon" type="number" step="any" placeholder="85.3240" />
            </div>
          </div>
          <div class="form-2col">
            <div class="form-row">
              <label>Access Type</label>
              <select v-model="stationForm.accessType">
                <option value="public">Public</option>
                <option value="semi_public">Semi-Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div class="form-row">
              <label>Status</label>
              <select v-model="stationForm.status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <label>Network / Brand</label>
            <input v-model="stationForm.network" placeholder="e.g. ChargeNP, NREDA" />
          </div>
          <div class="form-check">
            <input type="checkbox" id="is24h" v-model="stationForm.is24Hours" />
            <label for="is24h">Open 24 Hours</label>
          </div>
          <p v-if="stationError" class="form-error">{{ stationError }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="showStationModal = false">Cancel</button>
          <button class="btn-primary" @click="saveStation" :disabled="savingStation">
            {{ savingStation ? 'Saving...' : (editingStation ? 'Update Station' : 'Create Station') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Add Port Modal ── -->
    <div v-if="showPortModal" class="modal-overlay" @click.self="showPortModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Add Charger Port — {{ portStation?.name }}</h3>
          <button class="modal-close" @click="showPortModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-2col">
            <div class="form-row">
              <label>Port Number</label>
              <input v-model="portForm.portNumber" placeholder="e.g. A1" />
            </div>
            <div class="form-row">
              <label>Connector Type *</label>
              <select v-model="portForm.connectorType">
                <option value="CCS">CCS</option>
                <option value="CHAdeMO">CHAdeMO</option>
                <option value="Type2">Type 2</option>
                <option value="J1772">J1772</option>
                <option value="Tesla">Tesla</option>
                <option value="GBT">GBT</option>
              </select>
            </div>
          </div>
          <div class="form-2col">
            <div class="form-row">
              <label>Charge Level *</label>
              <select v-model="portForm.chargeLevel">
                <option value="DC_Fast">DC Fast</option>
                <option value="Level2">Level 2 (AC)</option>
                <option value="Level1">Level 1</option>
              </select>
            </div>
            <div class="form-row">
              <label>Power (kW)</label>
              <input v-model.number="portForm.powerKw" type="number" placeholder="50" />
            </div>
          </div>
          <div class="form-check">
            <input type="checkbox" id="free-chg" v-model="portForm.freeCharging" />
            <label for="free-chg">Free Charging</label>
          </div>
          <div v-if="!portForm.freeCharging" class="form-2col">
            <div class="form-row">
              <label>Price per kWh (NPR)</label>
              <input v-model.number="portForm.perKwh" type="number" placeholder="20" />
            </div>
            <div class="form-row">
              <label>Session Fee (NPR)</label>
              <input v-model.number="portForm.sessionFee" type="number" placeholder="0" />
            </div>
          </div>
          <div class="form-row">
            <label>Notes</label>
            <input v-model="portForm.notes" placeholder="Any notes about this port..." />
          </div>
          <p v-if="portError" class="form-error">{{ portError }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="showPortModal = false">Cancel</button>
          <button class="btn-primary" @click="savePort" :disabled="savingPort">
            {{ savingPort ? 'Saving...' : 'Add Port' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Delete -->
    <div v-if="confirmDelete.show" class="modal-overlay" @click.self="confirmDelete.show = false">
      <div class="modal small">
        <div class="modal-header">
          <h3>Confirm Delete</h3>
          <button class="modal-close" @click="confirmDelete.show = false">✕</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete <strong>{{ confirmDelete.name }}</strong>? This cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="confirmDelete.show = false">Cancel</button>
          <button class="btn-danger-solid" @click="executeDelete">Delete</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  fetchMyStations,
  createStation,
  updateStation,
  deleteStation,
  createCharger,
  deleteCharger,
  updatePortStatus
} from '../services/stations.js'
import api from '../services/api.js'
import { fetchOwnerReviews, replyToReview } from '../services/reviews.js'
import { clearUser } from '../services/auth.js'

const router = useRouter()

const tabs = [
  { id: 'overview', label: 'Overview', icon: '' },
  { id: 'stations', label: 'My Stations', icon: '' },
  { id: 'ports', label: 'Charger Ports', icon: '' },
  { id: 'feedback', label: 'Feedback', icon: '' },
  { id: 'profile', label: 'Profile', icon: '' }
]

const activeTab = ref('overview')
const stationsLoading = ref(true)
const stations = ref([])

// Feedback
const feedback = ref([])
const feedbackLoading = ref(true)
const replyDrafts = ref({})
const replyingTo = ref(null)

// Modals
const showStationModal = ref(false)
const showPortModal = ref(false)
const editingStation = ref(null)
const portStation = ref(null)
const savingStation = ref(false)
const savingPort = ref(false)
const stationError = ref('')
const portError = ref('')

const confirmDelete = ref({ show: false, type: '', id: '', name: '', stationId: '' })

const stationForm = ref({ name: '', description: '', street: '', city: '', lat: 27.7172, lon: 85.3240, accessType: 'public', status: 'active', network: '', is24Hours: false })
const portForm = ref({ portNumber: '', connectorType: 'CCS', chargeLevel: 'DC_Fast', powerKw: 50, perKwh: 20, sessionFee: 0, freeCharging: false, notes: '' })

// Profile
const profile = ref({ name: '', businessName: '', phone: '' })
const savingProfile = ref(false)
const profileMsg = ref(null)

const user = computed(() => {
  try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
})

const currentTabLabel = computed(() => tabs.find(t => t.id === activeTab.value)?.label || '')

const allPorts = computed(() =>
  stations.value.flatMap(s =>
    (s.liveStatus?.ports || []).map(p => ({ ...p, stationName: s.name }))
  )
)

const stats = computed(() => {
  const ports = allPorts.value
  const avgR = stations.value.filter(s => s.avgRating > 0)
  const rawAvg = avgR.length ? avgR.reduce((a, s) => a + s.avgRating, 0) / avgR.length : 0
  return {
    stations: stations.value.length,
    ports: ports.length,
    available: ports.filter(p => p.availability === 'available').length,
    occupied: ports.filter(p => p.availability === 'occupied').length,
    avgRating: rawAvg ? rawAvg.toFixed(1) : null
  }
})

const load = async () => {
  stationsLoading.value = true
  try {
    stations.value = await fetchMyStations()
  } finally {
    stationsLoading.value = false
  }
}

const loadFeedback = async () => {
  feedbackLoading.value = true
  try {
    feedback.value = await fetchOwnerReviews()
  } catch (err) {
    console.error('Failed to load feedback:', err)
  } finally {
    feedbackLoading.value = false
  }
}

const sendReply = async (reviewId) => {
  const text = (replyDrafts.value[reviewId] || '').trim()
  if (!text) return
  replyingTo.value = reviewId
  try {
    const updated = await replyToReview(reviewId, text)
    const idx = feedback.value.findIndex(r => r._id === reviewId)
    if (idx !== -1) feedback.value[idx] = { ...feedback.value[idx], reply: updated.reply }
    delete replyDrafts.value[reviewId]
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to send reply.')
  } finally {
    replyingTo.value = null
  }
}

// Station CRUD
const openAddStation = () => {
  editingStation.value = null
  stationForm.value = { name: '', description: '', street: '', city: '', lat: 27.7172, lon: 85.3240, accessType: 'public', status: 'active', network: '', is24Hours: false }
  stationError.value = ''
  showStationModal.value = true
}

const openEditStation = (s) => {
  editingStation.value = s
  stationForm.value = {
    name: s.name,
    description: s.description || '',
    street: s.address?.street || '',
    city: s.address?.city || '',
    lat: s.location?.coordinates?.[1] || 27.7172,
    lon: s.location?.coordinates?.[0] || 85.3240,
    accessType: s.accessType || 'public',
    status: s.status || 'active',
    network: s.network || '',
    is24Hours: s.is24Hours || false
  }
  stationError.value = ''
  showStationModal.value = true
}

const saveStation = async () => {
  if (!stationForm.value.name || !stationForm.value.street || !stationForm.value.city) {
    stationError.value = 'Name, street and city are required'
    return
  }
  savingStation.value = true
  stationError.value = ''
  try {
    const payload = {
      name: stationForm.value.name,
      description: stationForm.value.description,
      address: { street: stationForm.value.street, city: stationForm.value.city, country: 'Nepal' },
      location: { coordinates: [stationForm.value.lon, stationForm.value.lat] },
      accessType: stationForm.value.accessType,
      status: stationForm.value.status,
      network: stationForm.value.network,
      is24Hours: stationForm.value.is24Hours
    }
    if (editingStation.value) {
      await updateStation(editingStation.value._id, payload)
    } else {
      await createStation(payload)
    }
    showStationModal.value = false
    await load()
    activeTab.value = 'stations'
  } catch (err) {
    stationError.value = err.response?.data?.message || 'Failed to save station'
  } finally {
    savingStation.value = false
  }
}

const confirmDeleteStation = (s) => {
  confirmDelete.value = { show: true, type: 'station', id: s._id, name: s.name }
}

// Port CRUD
const openAddPort = (station) => {
  portStation.value = station
  portForm.value = { portNumber: '', connectorType: 'CCS', chargeLevel: 'DC_Fast', powerKw: 50, perKwh: 20, sessionFee: 0, freeCharging: false, notes: '' }
  portError.value = ''
  showPortModal.value = true
  activeTab.value = 'stations'
}

const savePort = async () => {
  savingPort.value = true
  portError.value = ''
  try {
    await createCharger({
      stationId: portStation.value._id,
      portNumber: portForm.value.portNumber,
      connectorType: portForm.value.connectorType,
      chargeLevel: portForm.value.chargeLevel,
      powerKw: portForm.value.powerKw,
      pricing: portForm.value.freeCharging
        ? { freeCharging: true, currency: 'NPR' }
        : { perKwh: portForm.value.perKwh, sessionFee: portForm.value.sessionFee, currency: 'NPR' },
      notes: portForm.value.notes
    })
    showPortModal.value = false
    await load()
  } catch (err) {
    portError.value = err.response?.data?.message || 'Failed to add port'
  } finally {
    savingPort.value = false
  }
}

const confirmDeletePort = (port) => {
  confirmDelete.value = { show: true, type: 'port', id: port._id, name: `Port ${port.portNumber || port._id?.slice(-4)}` }
}

const executeDelete = async () => {
  const { type, id } = confirmDelete.value
  confirmDelete.value.show = false
  try {
    if (type === 'station') await deleteStation(id)
    else if (type === 'port') await deleteCharger(id)
    await load()
  } catch (err) {
    console.error('Delete failed:', err)
  }
}

const updateStatus = async (portId, availability) => {
  await updatePortStatus(portId, availability)
  await load()
}

// Profile
const saveProfile = async () => {
  savingProfile.value = true
  profileMsg.value = null
  try {
    const u = user.value
    await api.put(`/users/${u._id}`, {
      name: profile.value.name,
      businessName: profile.value.businessName,
      phone: profile.value.phone
    })
    const updated = { ...u, name: profile.value.name, businessName: profile.value.businessName, phone: profile.value.phone }
    localStorage.setItem('user', JSON.stringify(updated))
    profileMsg.value = { type: 'success', text: 'Profile updated successfully!' }
  } catch (err) {
    profileMsg.value = { type: 'error', text: err.response?.data?.message || 'Failed to update profile' }
  } finally {
    savingProfile.value = false
  }
}

const logout = () => {
  clearUser()
  router.push('/station-login')
}


onMounted(async () => {
  await load()
  loadFeedback()
  const u = user.value
  profile.value = { name: u?.name || '', businessName: u?.businessName || '', phone: u?.phone || '' }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.dashboard {
  display: flex;
  height: 100vh;
  background: #0a0e1a;
  color: #f1f5f9;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 240px;
  background: #0d1323;
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-brand {
  padding: 24px 20px;
  font-size: 20px;
  font-weight: 800;
  color: #00e59d;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.sidebar-nav {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 14px;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.nav-item:hover { background: rgba(255,255,255,0.04); color: #94a3b8; }
.nav-item.active { background: rgba(0,229,157,0.12); color: #00e59d; font-weight: 600; }

.nav-icon { font-size: 16px; }

.sidebar-user {
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-av {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00e59d, #00b4a0);
  color: #0a1a0e;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.user-info { flex: 1; min-width: 0; }
.user-n { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 11px; color: #475569; }

.logout-btn {
  background: none;
  border: none;
  color: #475569;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.2s;
}

.logout-btn:hover { color: #ef4444; }

/* Main */
.main {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(13, 19, 35, 0.5);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.top-bar h1 { font-size: 24px; font-weight: 800; }
.sub { font-size: 13px; color: #475569; }

.top-actions { display: flex; align-items: center; gap: 12px; }

.live-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0,229,157,0.1);
  border: 1px solid rgba(0,229,157,0.2);
  color: #00e59d;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.live-pill.small { font-size: 11px; padding: 4px 10px; }

.pulse {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #00e59d;
  animation: pulse-a 1.5s infinite;
}

@keyframes pulse-a { 0%,100%{opacity:1} 50%{opacity:0.3} }

/* Tab content */
.tab-content { padding: 28px 32px; flex: 1; }

/* Metrics */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.metric-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 22px;
  text-align: center;
  transition: all 0.2s;
}

.metric-card:hover { background: rgba(255,255,255,0.07); }
.metric-card.green { border-color: rgba(0,229,157,0.2); }

.metric-icon { font-size: 28px; margin-bottom: 8px; }
.metric-value { font-size: 28px; font-weight: 800; color: #00e59d; margin-bottom: 4px; }
.metric-label { font-size: 12px; color: #475569; }

.card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 24px;
}

.mt-6 { margin-top: 24px; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h2 { font-size: 18px; font-weight: 700; }

/* Port status grid */
.port-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.port-status-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 14px;
}

.port-status-card.available { border-left: 3px solid #00e59d; }
.port-status-card.occupied { border-left: 3px solid #ef4444; }
.port-status-card.offline { border-left: 3px solid #475569; }
.port-status-card.reserved { border-left: 3px solid #f59e0b; }

.ps-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.ps-top strong { font-size: 13px; font-weight: 700; }

.ps-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
}

.ps-badge.available { background: rgba(0,229,157,0.15); color: #00e59d; }
.ps-badge.occupied { background: rgba(239,68,68,0.15); color: #f87171; }
.ps-badge.offline { background: rgba(100,116,139,0.15); color: #94a3b8; }
.ps-badge.reserved { background: rgba(245,158,11,0.15); color: #fbbf24; }

.ps-info { font-size: 12px; color: #64748b; margin-bottom: 10px; }

.ps-select {
  width: 100%;
  padding: 7px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 7px;
  color: #f1f5f9;
  font-size: 12px;
  font-family: 'Inter', sans-serif;
  outline: none;
  cursor: pointer;
}

/* Stations list */
.stations-list { display: flex; flex-direction: column; gap: 14px; }

.station-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.2s;
}

.station-card:hover { border-color: rgba(0,229,157,0.2); }

.sc-left { flex: 1; }

.sc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
.sc-header h3 { font-size: 17px; font-weight: 700; }

.sc-status {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
  text-transform: capitalize;
}

.sc-status.active { background: rgba(0,229,157,0.12); color: #00e59d; }
.sc-status.inactive, .sc-status.maintenance { background: rgba(239,68,68,0.12); color: #f87171; }
.sc-status.coming_soon { background: rgba(245,158,11,0.12); color: #fbbf24; }

.sc-addr { font-size: 13px; color: #64748b; margin-bottom: 8px; }

.sc-live {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 10px;
}

.live-dot-sm {
  width: 6px; height: 6px;
  border-radius: 50%;
}

.live-dot-sm.available { background: #00e59d; }
.live-dot-sm.offline { background: #475569; }

.sc-ports-row { display: flex; gap: 4px; flex-wrap: wrap; }

.mini-port {
  width: 10px; height: 10px;
  border-radius: 2px;
}

.mini-port.available { background: #00e59d; }
.mini-port.occupied { background: #ef4444; }
.mini-port.reserved { background: #f59e0b; }
.mini-port.offline { background: #334155; }

.sc-actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }

/* Empty states */
.empty-card {
  background: rgba(255,255,255,0.03);
  border: 2px dashed rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 60px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon { font-size: 48px; }
.empty-card h3 { font-size: 18px; font-weight: 700; }
.empty-card p { color: #475569; font-size: 14px; }
.empty-msg { text-align: center; color: #475569; padding: 40px; font-size: 14px; }

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #00e59d, #00b4a0);
  color: #0a1a0e;
  border: none;
  padding: 10px 18px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-sm {
  padding: 7px 14px;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 7px;
  background: transparent;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-sm:hover { border-color: rgba(255,255,255,0.25); color: #f1f5f9; }
.btn-sm.btn-danger { border-color: rgba(239,68,68,0.3); color: #f87171; }
.btn-sm.btn-danger:hover { background: rgba(239,68,68,0.1); }

.btn-ghost {
  padding: 10px 18px;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 9px;
  background: transparent;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover { border-color: rgba(255,255,255,0.25); color: #f1f5f9; }

.btn-danger-solid {
  padding: 10px 18px;
  border: none;
  border-radius: 9px;
  background: #ef4444;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

/* Ports Table */
.ports-table-wrap { overflow-x: auto; border-radius: 14px; }

.ports-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  overflow: hidden;
}

.ports-table th {
  padding: 12px 14px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #475569;
  background: rgba(255,255,255,0.04);
  text-align: left;
}

.ports-table td {
  padding: 12px 14px;
  font-size: 13px;
  color: #94a3b8;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.connector-tag {
  background: rgba(124,58,237,0.15);
  color: #a78bfa;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.pricing-cell { color: #64748b; }
.free-tag { color: #00e59d; font-weight: 600; font-size: 12px; }

.inline-select {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: #f1f5f9;
  padding: 5px 8px;
  font-size: 12px;
  cursor: pointer;
  outline: none;
}

/* Profile */
.profile-grid { max-width: 540px; }
.card-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.profile-form label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }

.profile-form input {
  padding: 11px 14px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 9px;
  color: #f1f5f9;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: border-color 0.2s;
}

.profile-form input:focus { border-color: #00e59d; }
.profile-form input:disabled { opacity: 0.4; cursor: not-allowed; }

.profile-msg { font-size: 13px; margin-bottom: 12px; padding: 10px 14px; border-radius: 8px; }
.profile-msg.success { background: rgba(0,229,157,0.1); color: #00e59d; }
.profile-msg.error { background: rgba(239,68,68,0.1); color: #f87171; }

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.modal {
  background: #111827;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal.small { max-width: 400px; }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.modal-header h3 { font-size: 18px; font-weight: 700; }

.modal-close {
  background: none;
  border: none;
  color: #475569;
  font-size: 18px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover { background: rgba(255,255,255,0.06); color: #f1f5f9; }

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-row { display: flex; flex-direction: column; gap: 6px; }
.form-row label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }

.form-row input, .form-row select, .form-row textarea {
  padding: 10px 13px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #f1f5f9;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: border-color 0.2s;
}

.form-row input:focus, .form-row select:focus, .form-row textarea:focus { border-color: #00e59d; }
.form-row textarea { resize: vertical; min-height: 80px; }

.form-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.form-check {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  cursor: pointer;
}

.form-check input { accent-color: #00e59d; width: 16px; height: 16px; cursor: pointer; }

.form-error { color: #f87171; font-size: 13px; background: rgba(239,68,68,0.1); padding: 10px 12px; border-radius: 8px; }

.loading-msg { padding: 40px; text-align: center; color: #64748b; }

@media (max-width: 900px) {
  .dashboard { flex-direction: column; height: auto; }
  .sidebar { width: 100%; flex-direction: row; height: auto; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .sidebar-nav { flex-direction: row; overflow-x: auto; padding: 8px; }
  .sidebar-user { display: none; }
  .sidebar-brand { display: none; }
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
  .tab-content { padding: 20px; }
  .top-bar { padding: 16px 20px; }
}
.feedback-list { display: flex; flex-direction: column; gap: 16px; }
.feedback-card { background: #111827; border-radius: 20px; padding: 24px; border: 1px solid rgba(255,255,255,0.08); }
.fb-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.fb-header strong { font-size: 16px; display: block; }
.fb-by { font-size: 12px; color: #64748b; }
.fb-right { text-align: right; display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
.fb-right .stars { color: #fbbf24; font-size: 16px; }
.fb-date { font-size: 11px; color: #64748b; }
.fb-comment { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 16px; }
.fb-reply { background: rgba(0, 229, 157, 0.05); border-left: 3px solid #00e59d; padding: 12px 16px; border-radius: 8px; }
.fb-reply .label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #00e59d; margin-bottom: 4px; }
.fb-reply p { font-size: 13px; color: #94a3b8; }
.fb-reply-form { display: flex; gap: 10px; align-items: flex-start; }
.fb-reply-form textarea {
  flex: 1;
  padding: 10px 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #f1f5f9;
  font-family: inherit;
  font-size: 13px;
  resize: vertical;
  outline: none;
}
.fb-reply-form textarea:focus { border-color: #00e59d; }
</style>
