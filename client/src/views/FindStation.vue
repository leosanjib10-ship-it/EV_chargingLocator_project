<template>
  <div class="find-page">

    <!-- Page Header -->
    <div class="page-header">
      <h1>Find Charging Stations</h1>
      <p>Live availability · Updated every 15 seconds</p>
    </div>

    <div class="find-layout">

      <!-- Filter Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <h3>Search</h3>
          <div class="input-wrap">
            <span class="input-icon">Search</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="City or station name..."
              @input="applyFilters"
            />
          </div>
        </div>

        <div class="sidebar-section">
          <h3>Near Me</h3>
            {{ locating ? 'Locating...' : 'Use My Location' }}
          <div v-if="userLocation" class="location-info">
            <span>✓ Location detected</span>
            <label>
              Radius:
              <select v-model.number="radius" @change="loadNearby">
                <option :value="5">5 km</option>
                <option :value="10">10 km</option>
                <option :value="25">25 km</option>
                <option :value="50">50 km</option>
              </select>
            </label>
          </div>
        </div>

        <div class="sidebar-section">
          <h3>Connector Type</h3>
          <div class="check-group">
            <label v-for="c in connectorOptions" :key="c" class="check-item">
              <input type="checkbox" :value="c" v-model="selectedConnectors" @change="applyFilters" />
              <span>{{ c }}</span>
            </label>
          </div>
        </div>

        <div class="sidebar-section">
          <h3>Availability</h3>
          <div class="radio-group">
            <label class="radio-item">
              <input type="radio" v-model="availFilter" value="" @change="applyFilters" />
              <span>All Stations</span>
            </label>
            <label class="radio-item">
              <input type="radio" v-model="availFilter" value="available" @change="applyFilters" />
              <span>Available Only</span>
            </label>
            <label class="radio-item">
              <input type="radio" v-model="availFilter" value="busy" @change="applyFilters" />
              <span>Busy</span>
            </label>
          </div>
        </div>

        <div class="sidebar-section">
          <h3>Min Power (kW)</h3>
          <input
            v-model.number="minPower"
            type="range"
            min="0"
            max="150"
            step="10"
            @input="applyFilters"
            class="range-slider"
          />
          <div class="range-label">{{ minPower > 0 ? `${minPower}+ kW` : 'Any power' }}</div>
        </div>

        <button class="reset-btn" @click="resetFilters">Reset Filters</button>
      </aside>

      <!-- Main Content -->
      <main class="main-content">

        <!-- Status bar -->
        <div class="status-bar">
          <span>{{ filteredStations.length }} station{{ filteredStations.length !== 1 ? 's' : '' }} found</span>
          <div class="live-indicator">
            <span class="pulse"></span> Live
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading stations...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <span>⚠️</span>
          <p>{{ error }}</p>
          <button @click="loadStations">Try Again</button>
        </div>

        <div v-else-if="filteredStations.length === 0" class="empty-state">
          <p>No stations match your filters.</p>
          <button @click="resetFilters">Clear Filters</button>
        </div>

        <div v-else class="station-grid">
          <div
            v-for="station in filteredStations"
            :key="station._id"
            class="station-card"
          >
            <div class="card-header">
              <div class="status-badge" :class="station.liveSummary?.status || 'offline'">
                <span class="status-dot"></span>
                {{ statusLabel(station.liveSummary?.status) }}
              </div>
              <div class="card-rating" v-if="station.avgRating > 0">
                Rating: {{ station.avgRating }}
              </div>
            </div>

            <h2 class="card-name">{{ station.name }}</h2>
            <p class="card-location">{{ station.address?.formatted || station.address?.city }}</p>

            <div class="card-stats">
              <div class="stat-item">
                <strong>{{ station.liveSummary?.available || 0 }}/{{ station.liveSummary?.totalPorts || 0 }}</strong>
                <span>Ports Free</span>
              </div>
              <div class="stat-item" v-if="station.liveSummary?.maxPower">
                <strong>{{ station.liveSummary.maxPower }} kW</strong>
                <span>Max Power</span>
              </div>
              <div class="stat-item" v-if="station.liveSummary?.minPrice">
                <strong>Rs.{{ station.liveSummary.minPrice }}</strong>
                <span>From/kWh</span>
              </div>
            </div>

            <div class="connector-tags" v-if="station.liveSummary?.connectors?.length">
              <span
                v-for="c in station.liveSummary.connectors"
                :key="c"
                class="connector-tag"
              >{{ c }}</span>
            </div>

            <div class="card-24h" v-if="station.is24Hours">
              <span>Open 24 Hours</span>
            </div>

            <div class="card-actions">
              <RouterLink :to="`/stations/${station._id}`" class="view-btn">
                View Details
              </RouterLink>
              <button class="directions-btn" @click="openDirections(station)">
                Directions
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { fetchStations, fetchNearbyStations } from '../services/stations.js'

const stations = ref([])
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')
const selectedConnectors = ref([])
const availFilter = ref('')
const minPower = ref(0)
const userLocation = ref(null)
const locating = ref(false)
const radius = ref(25)

let pollTimer = null

const connectorOptions = ['CCS', 'Type2', 'GBT', 'CHAdeMO', 'J1772', 'Tesla']

const loadStations = async () => {
  try {
    error.value = ''
    const data = await fetchStations({ limit: 100, status: 'active' })
    stations.value = data.stations || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load stations'
  } finally {
    loading.value = false
  }
}

const loadNearby = async () => {
  if (!userLocation.value) return
  loading.value = true
  try {
    const data = await fetchNearbyStations(
      userLocation.value.lat,
      userLocation.value.lng,
      radius.value
    )
    stations.value = Array.isArray(data) ? data : (data.stations || [])
  } catch (err) {
    error.value = 'Failed to fetch nearby stations'
  } finally {
    loading.value = false
  }
}

const locateMe = () => {
  if (!navigator.geolocation) {
    error.value = 'Geolocation not supported by your browser'
    return
  }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLocation.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      locating.value = false
      loadNearby()
    },
    () => {
      locating.value = false
      error.value = 'Could not get your location. Please allow location access.'
    }
  )
}

const filteredStations = computed(() => {
  return stations.value.filter(s => {
    const q = searchQuery.value.toLowerCase()
    const matchSearch = !q ||
      s.name?.toLowerCase().includes(q) ||
      s.address?.city?.toLowerCase().includes(q) ||
      s.address?.formatted?.toLowerCase().includes(q)

    const matchConnector =
      selectedConnectors.value.length === 0 ||
      selectedConnectors.value.some(c => s.liveSummary?.connectors?.includes(c))

    const matchPower = (s.liveSummary?.maxPower || 0) >= minPower.value

    const matchAvail =
      !availFilter.value || s.liveSummary?.status === availFilter.value

    return matchSearch && matchConnector && matchPower && matchAvail
  })
})

const applyFilters = () => { /* reactivity handles it via computed */ }

const resetFilters = () => {
  searchQuery.value = ''
  selectedConnectors.value = []
  availFilter.value = ''
  minPower.value = 0
}

const statusLabel = (s) => {
  if (s === 'available') return 'Available'
  if (s === 'busy') return 'Busy'
  return 'Offline'
}

const openDirections = (station) => {
  const [lon, lat] = station.location?.coordinates || []
  if (lat && lon) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank')
  }
}

onMounted(() => {
  loadStations()
  pollTimer = setInterval(loadStations, 15000)
})

onUnmounted(() => clearInterval(pollTimer))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.find-page {
  min-height: calc(100vh - 65px);
  background-color: #080a12;
  background-image: 
    radial-gradient(at 0% 0%, rgba(0, 229, 157, 0.05) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(124, 58, 237, 0.05) 0px, transparent 50%);
  color: #f1f5f9;
  font-family: 'Inter', sans-serif;
}

.page-header {
  padding: 40px 60px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.page-header h1 {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.page-header p {
  color: #64748b;
  font-size: 14px;
}

/* Layout */
.find-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: calc(100vh - 145px);
}

/* Sidebar */
.sidebar {
  background: #0d1323;
  border-right: 1px solid rgba(255,255,255,0.06);
  padding: 24px 20px;
  overflow-y: auto;
  position: sticky;
  top: 65px;
  height: calc(100vh - 65px);
}

.sidebar-section {
  margin-bottom: 28px;
}

.sidebar-section h3 {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #475569;
  margin-bottom: 12px;
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
}

.input-wrap input {
  width: 100%;
  padding: 10px 10px 10px 32px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #f1f5f9;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input-wrap input:focus { border-color: #00e59d; }

.locate-btn {
  width: 100%;
  padding: 10px;
  background: rgba(0, 229, 157, 0.12);
  border: 1px solid rgba(0, 229, 157, 0.3);
  border-radius: 8px;
  color: #00e59d;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.locate-btn:hover:not(:disabled) {
  background: rgba(0, 229, 157, 0.2);
}

.locate-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.location-info {
  margin-top: 10px;
  font-size: 12px;
  color: #00e59d;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.location-info label {
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.location-info select {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: #f1f5f9;
  padding: 4px 8px;
  font-size: 12px;
  outline: none;
}

.check-group, .radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.check-item, .radio-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 13px;
  color: #94a3b8;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.check-item:hover, .radio-item:hover { background: rgba(255,255,255,0.04); }

.check-item input, .radio-item input {
  accent-color: #00e59d;
  width: 14px;
  height: 14px;
}

.range-slider {
  width: 100%;
  accent-color: #00e59d;
  cursor: pointer;
}

.range-label {
  font-size: 12px;
  color: #00e59d;
  font-weight: 600;
  margin-top: 4px;
}

.reset-btn {
  width: 100%;
  padding: 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: #ef4444;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.reset-btn:hover { background: rgba(239, 68, 68, 0.2); }

/* Main */
.main-content {
  padding: 24px 32px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 13px;
  color: #64748b;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #00e59d;
  font-weight: 600;
}

.pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00e59d;
  animation: pulse-anim 1.5s infinite;
}

@keyframes pulse-anim {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* States */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  gap: 16px;
  color: #64748b;
}

.error-state { color: #fca5a5; }

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #00e59d;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-icon { font-size: 48px; }

.error-state button, .empty-state button {
  padding: 10px 20px;
  background: rgba(0,229,157,0.12);
  border: 1px solid rgba(0,229,157,0.3);
  border-radius: 8px;
  color: #00e59d;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

/* Grid */
.station-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.station-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  padding: 22px;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.station-card:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(0, 229, 157, 0.25);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.available {
  background: rgba(0, 229, 157, 0.15);
  color: #00e59d;
}

.status-badge.busy {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.status-badge.offline {
  background: rgba(100, 116, 139, 0.15);
  color: #94a3b8;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse-anim 2s infinite;
}

.status-badge.offline .status-dot { animation: none; }

.card-rating {
  font-size: 13px;
  color: #fbbf24;
  font-weight: 600;
}

.card-name {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
}

.card-location {
  font-size: 13px;
  color: #64748b;
}

.card-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-item strong {
  font-size: 17px;
  font-weight: 700;
  color: #00e59d;
}

.stat-item span {
  font-size: 11px;
  color: #475569;
}

.connector-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.connector-tag {
  background: rgba(124, 58, 237, 0.15);
  color: #a78bfa;
  border: 1px solid rgba(124, 58, 237, 0.2);
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.card-24h {
  font-size: 12px;
  color: #00e59d;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.view-btn {
  flex: 1;
  padding: 10px;
  background: linear-gradient(135deg, #00e59d, #00d98b);
  color: #03150d;
  text-decoration: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 800;
  text-align: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 229, 157, 0.15);
}

.view-btn:hover { 
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 229, 157, 0.3);
}

.directions-btn {
  flex: 1;
  padding: 10px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 9px;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.directions-btn:hover { border-color: rgba(255,255,255,0.25); color: #f1f5f9; }

/* Responsive */
@media (max-width: 900px) {
  .find-layout { grid-template-columns: 1fr; }
  .sidebar { position: static; height: auto; }
  .page-header { padding: 24px 20px 16px; }
  .main-content { padding: 16px 20px; }
}

@media (max-width: 600px) {
  .station-grid { grid-template-columns: 1fr; }
}
</style>
