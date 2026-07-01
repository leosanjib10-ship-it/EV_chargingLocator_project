<template>
  <div class="detail-page">

    <div v-if="loading" class="state-view">
      <div class="spinner"></div>
      <p>Loading station...</p>
    </div>

    <div v-else-if="error" class="state-view error-text">
       <p>Error: {{ error }}</p>
       <RouterLink to="/find" class="back-link">← Back to stations</RouterLink>
    </div>

    <template v-else-if="station">

      <!-- Station Hero -->
      <div class="station-hero">
        <div class="hero-inner">
          <RouterLink to="/find" class="back-btn">← Back</RouterLink>

          <div class="hero-top">
            <div>
              <h1>{{ station.name }}</h1>
              <p class="hero-address">Location: {{ station.address?.formatted || station.address?.city }}</p>
              <p class="hero-desc" v-if="station.description">{{ station.description }}</p>
            </div>
            <div class="hero-meta">
              <div class="live-pill">
                <span class="live-dot"></span>
                {{ liveStatus.available }}/{{ liveStatus.totalPorts }} ports free
              </div>
              <div class="rating-pill" v-if="station.avgRating > 0">
                Rating: {{ station.avgRating }} ({{ station.reviewCount }} reviews)
              </div>
              <button class="directions-btn-lg" @click="openDirections">
                Get Directions
              </button>
            </div>
          </div>

          <!-- Quick info row -->
          <div class="info-chips">
            <span class="chip">{{ station.accessType === 'public' ? 'Public' : station.accessType === 'semi_public' ? 'Semi-Public' : 'Private' }}</span>
            <span class="chip" v-if="station.is24Hours">24 Hours</span>
            <span class="chip" v-if="station.network">Network: {{ station.network }}</span>
            <span class="chip status-chip" :class="station.status">{{ station.status }}</span>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-grid">

        <!-- Ports -->
        <section class="ports-section">
          <h2 class="section-title">
            Charger Ports
            <span class="port-count">{{ liveStatus.totalPorts }} total</span>
          </h2>

          <div v-if="!liveStatus.ports?.length" class="no-ports">
            No charger ports listed yet.
          </div>

          <div v-else class="ports-grid">
            <div
              v-for="port in liveStatus.ports"
              :key="port._id"
              class="port-card"
              :class="port.availability"
            >
              <div class="port-header">
                <div class="port-id">Port {{ port.portNumber || port._id?.slice(-4) }}</div>
                <div class="port-status" :class="port.availability">{{ port.availability }}</div>
              </div>

              <div class="port-specs">
                <span class="spec-badge connector">{{ port.connectorType }}</span>
                <span class="spec-badge level">{{ port.chargeLevel?.replace('_', ' ') }}</span>
                <span class="spec-badge power" v-if="port.powerKw">{{ port.powerKw }} kW</span>
              </div>

              <div class="port-pricing" v-if="port.pricing">
                <template v-if="port.pricing.freeCharging">
                  <span class="free-tag">Free Charging</span>
                </template>
                <template v-else>
                  <span v-if="port.pricing.perKwh">Rs. {{ port.pricing.perKwh }}/kWh</span>
                  <span v-if="port.pricing.perMinute"> · Rs. {{ port.pricing.perMinute }}/min</span>
                  <span v-if="port.pricing.sessionFee"> · Rs. {{ port.pricing.sessionFee }} session fee</span>
                </template>
                <span class="currency">{{ port.pricing.currency || 'NPR' }}</span>
              </div>

              <div class="port-updated" v-if="port.lastStatusUpdate">
                Updated {{ formatTime(port.lastStatusUpdate) }}
              </div>
            </div>
          </div>
        </section>

        <!-- Sidebar -->
        <aside class="detail-sidebar">

          <!-- Operating Hours -->
          <div class="sidebar-card" v-if="station.operatingHours?.length || station.is24Hours">
            <h3>Operating Hours</h3>
            <div v-if="station.is24Hours" class="hours-24">Open 24 hours, 7 days a week</div>
            <div v-else class="hours-list">
              <div
                v-for="h in station.operatingHours"
                :key="h.day"
                class="hours-row"
                :class="{ today: isToday(h.day) }"
              >
                <span class="day">{{ capitalize(h.day) }}</span>
                <span v-if="h.isClosed" class="closed-tag">Closed</span>
                <span v-else-if="h.is24Hours" class="open-tag">24 hours</span>
                <span v-else class="time-range">{{ h.open }} – {{ h.close }}</span>
              </div>
            </div>
          </div>

          <!-- Amenities -->
          <div class="sidebar-card" v-if="station.amenities?.length">
            <h3>🏪 Nearby Amenities</h3>
            <div class="amenities-list">
              <div v-for="a in station.amenities" :key="a._id" class="amenity-row">
                <span class="amenity-icon">{{ amenityIcon(a.category) }}</span>
                <div>
                  <div class="amenity-name">{{ a.name }}</div>
                  <div class="amenity-meta" v-if="a.distance">{{ a.distance }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Operator -->
          <div class="sidebar-card" v-if="station.operator">
            <h3>Station Operator</h3>
            <div class="operator-info">
              <div class="operator-avatar">{{ station.operator.name?.[0]?.toUpperCase() }}</div>
              <div>
                <div class="op-name">{{ station.operator.name }}</div>
                <div class="op-email">{{ station.operator.email }}</div>
              </div>
            </div>
          </div>

        </aside>
      </div>

      <!-- Reviews Section -->
      <div class="reviews-section">
        <div class="reviews-inner">
          <div class="reviews-header">
            <h2>Reviews</h2>
            <div class="avg-rating" v-if="station.avgRating > 0">
              <div class="stars">{{ starDisplay(station.avgRating) }}</div>
              <span>{{ station.avgRating }} out of 5 ({{ station.reviewCount }} reviews)</span>
            </div>
          </div>

          <!-- Write Review -->
          <div class="write-review" v-if="isLoggedIn">
            <h3>Leave a Review</h3>
            <div class="star-picker">
              <button
                v-for="n in 5"
                :key="n"
                class="star-btn"
                :class="{ active: n <= newReview.rating }"
                @click="newReview.rating = n"
              >★</button>
            </div>
            <textarea
              v-model="newReview.comment"
              placeholder="Share your experience at this station..."
              class="review-textarea"
              rows="3"
            ></textarea>
            <div class="review-actions">
              <p v-if="reviewError" class="review-error">{{ reviewError }}</p>
              <button
                class="submit-review-btn"
                @click="submitReview"
                :disabled="reviewLoading || !newReview.rating"
              >
                {{ reviewLoading ? 'Submitting...' : 'Submit Review' }}
              </button>
            </div>
          </div>
          <div class="login-prompt" v-else>
            <RouterLink to="/user-auth">Login</RouterLink> to leave a review.
          </div>

          <!-- Reviews List -->
          <div v-if="reviewsLoading" class="reviews-loading">Loading reviews...</div>
          <div v-else-if="reviews.length === 0" class="no-reviews">No reviews yet. Be the first!</div>
          <div v-else class="reviews-list">
            <div v-for="r in reviews" :key="r._id" class="review-card">
              <div class="review-header">
                <div class="reviewer-avatar">{{ r.user?.name?.[0]?.toUpperCase() }}</div>
                <div class="reviewer-info">
                  <div class="reviewer-name">{{ r.user?.name }}</div>
                  <div class="review-date">{{ formatDate(r.createdAt) }}</div>
                </div>
                <div class="review-stars">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</div>
              </div>
              <p class="review-comment" v-if="r.comment">{{ r.comment }}</p>
              <div class="review-reply" v-if="r.reply?.text">
                <div class="reply-label">Station Response</div>
                <p>{{ r.reply.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchStationLive } from '../services/stations.js'
import { fetchStationReviews, createReview } from '../services/reviews.js'
import { authStore } from '../services/auth.js'

const route = useRoute()
const station = ref(null)
const liveStatus = ref({ ports: [], available: 0, totalPorts: 0 })
const loading = ref(true)
const error = ref('')
const reviews = ref([])
const reviewsLoading = ref(true)
const newReview = ref({ rating: 0, comment: '' })
const reviewLoading = ref(false)
const reviewError = ref('')
let pollTimer = null

const isLoggedIn = computed(() => authStore.isAuthenticated)

const loadLive = async () => {
  try {
    const data = await fetchStationLive(route.params.id)
    station.value = data.station
    liveStatus.value = data.liveStatus
  } catch (err) {
    error.value = err.response?.data?.message || 'Station not found'
  } finally {
    loading.value = false
  }
}

const loadReviews = async () => {
  try {
    const data = await fetchStationReviews(route.params.id)
    reviews.value = data.reviews || []
  } finally {
    reviewsLoading.value = false
  }
}

const submitReview = async () => {
  if (!newReview.value.rating) return
  reviewError.value = ''
  reviewLoading.value = true
  try {
    await createReview({
      stationId: route.params.id,
      rating: newReview.value.rating,
      comment: newReview.value.comment
    })
    newReview.value = { rating: 0, comment: '' }
    await loadReviews()
    await loadLive()
  } catch (err) {
    reviewError.value = err.response?.data?.message || 'Failed to submit review'
  } finally {
    reviewLoading.value = false
  }
}

const openDirections = () => {
  const [lon, lat] = station.value?.location?.coordinates || []
  if (lat && lon) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank')
}

const formatTime = (dateStr) => {
  try {
    const d = new Date(dateStr)
    const ago = Math.round((Date.now() - d.getTime()) / 60000)
    if (ago < 1) return 'just now'
    if (ago < 60) return `${ago}m ago`
    return `${Math.round(ago / 60)}h ago`
  } catch { return '' }
}

const formatDate = (dateStr) => {
  try { return new Date(dateStr).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return '' }
}

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

const isToday = (day) => {
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  return days[new Date().getDay()] === day
}

const amenityIcon = (cat) => {
  const map = { cafe: 'Cafe', parking: 'Parking', restroom: 'Restroom', wifi: 'Wifi', restaurant: 'Restaurant', hotel: 'Hotel', shopping: 'Shop' }
  return map[cat] || '·'
}

const starDisplay = (r) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r))

onMounted(() => {
  loadLive()
  loadReviews()
  pollTimer = setInterval(loadLive, 15000)
})

onUnmounted(() => clearInterval(pollTimer))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.detail-page {
  min-height: calc(100vh - 65px);
  background: #0a0e1a;
  color: #f1f5f9;
  font-family: 'Inter', sans-serif;
}

/* States */
.state-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  gap: 16px;
  color: #64748b;
  font-size: 16px;
}

.error-text { color: #fca5a5; }

.spinner {
  width: 40px; height: 40px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #00e59d;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.back-link {
  color: #00e59d;
  text-decoration: none;
  font-weight: 600;
}

/* Hero */
.station-hero {
  background: linear-gradient(160deg, #0d1f2d 0%, #0a1a1a 100%);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding: 32px 0;
}

.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.back-btn {
  display: inline-block;
  color: #00e59d;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 20px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.back-btn:hover { opacity: 1; }

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.hero-top h1 {
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
}

.hero-address { color: #64748b; font-size: 14px; margin-bottom: 8px; }
.hero-desc { color: #94a3b8; font-size: 14px; line-height: 1.6; max-width: 500px; }

.hero-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  flex-shrink: 0;
}

.live-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 229, 157, 0.12);
  border: 1px solid rgba(0, 229, 157, 0.25);
  color: #00e59d;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 15px;
}

.live-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #00e59d;
  animation: pulse-d 1.5s infinite;
}

@keyframes pulse-d { 0%,100%{opacity:1} 50%{opacity:0.3} }

.rating-pill {
  font-size: 14px;
  font-weight: 600;
  color: #fbbf24;
}

.directions-btn-lg {
  background: linear-gradient(135deg, #00e59d, #00b4a0);
  color: #0a1a0e;
  border: none;
  padding: 11px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.directions-btn-lg:hover { opacity: 0.9; transform: translateY(-1px); }

.info-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  color: #94a3b8;
}

.status-chip.active { border-color: rgba(0,229,157,0.3); color: #00e59d; background: rgba(0,229,157,0.08); }
.status-chip.inactive, .status-chip.maintenance { border-color: rgba(239,68,68,0.3); color: #f87171; }

/* Content layout */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.port-count {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  background: rgba(255,255,255,0.06);
  padding: 3px 10px;
  border-radius: 12px;
}

.no-ports {
  color: #475569;
  padding: 32px;
  text-align: center;
}

.ports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.port-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 18px;
  transition: all 0.2s;
}

.port-card.available { border-left: 3px solid #00e59d; }
.port-card.occupied { border-left: 3px solid #ef4444; opacity: 0.8; }
.port-card.offline { border-left: 3px solid #475569; opacity: 0.6; }
.port-card.reserved { border-left: 3px solid #f59e0b; }

.port-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.port-id { font-weight: 700; font-size: 15px; }

.port-status {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.port-status.available { background: rgba(0,229,157,0.15); color: #00e59d; }
.port-status.occupied { background: rgba(239,68,68,0.15); color: #f87171; }
.port-status.offline { background: rgba(100,116,139,0.15); color: #94a3b8; }
.port-status.reserved { background: rgba(245,158,11,0.15); color: #fbbf24; }

.port-specs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.spec-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.spec-badge.connector { background: rgba(124,58,237,0.15); color: #a78bfa; }
.spec-badge.level { background: rgba(14,165,233,0.15); color: #38bdf8; }
.spec-badge.power { background: rgba(0,229,157,0.12); color: #00e59d; }

.port-pricing {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.free-tag { color: #00e59d; font-weight: 600; }
.currency { color: #475569; font-size: 11px; margin-left: 4px; }

.port-updated { font-size: 11px; color: #334155; }

/* Sidebar */
.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 20px;
}

.sidebar-card h3 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 14px;
  color: #94a3b8;
}

.hours-24 { color: #00e59d; font-size: 14px; font-weight: 600; }

.hours-list { display: flex; flex-direction: column; gap: 8px; }

.hours-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  padding: 6px 8px;
  border-radius: 6px;
}

.hours-row.today { background: rgba(0,229,157,0.08); }

.day { color: #94a3b8; }
.closed-tag { color: #ef4444; font-size: 12px; }
.open-tag { color: #00e59d; font-size: 12px; }
.time-range { color: #f1f5f9; font-size: 12px; }

.amenities-list { display: flex; flex-direction: column; gap: 10px; }

.amenity-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.amenity-icon { font-size: 18px; }
.amenity-name { font-size: 13px; font-weight: 600; }
.amenity-meta { font-size: 11px; color: #475569; }

.operator-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.operator-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00e59d, #00b4a0);
  color: #0a1a0e;
  font-weight: 800;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.op-name { font-weight: 700; font-size: 14px; }
.op-email { font-size: 12px; color: #475569; }

/* Reviews */
.reviews-section {
  background: rgba(255,255,255,0.02);
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 48px 0;
}

.reviews-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.reviews-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 32px;
}

.reviews-header h2 { font-size: 24px; font-weight: 800; }

.avg-rating {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stars { font-size: 20px; color: #fbbf24; letter-spacing: 2px; }
.avg-rating span { font-size: 13px; color: #64748b; }

.write-review {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
}

.write-review h3 { font-size: 16px; font-weight: 700; margin-bottom: 14px; }

.star-picker {
  display: flex;
  gap: 4px;
  margin-bottom: 14px;
}

.star-btn {
  font-size: 28px;
  background: none;
  border: none;
  cursor: pointer;
  color: #334155;
  transition: all 0.15s;
  line-height: 1;
}

.star-btn.active { color: #fbbf24; transform: scale(1.1); }
.star-btn:hover { color: #fbbf24; }

.review-textarea {
  width: 100%;
  padding: 12px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #f1f5f9;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.review-textarea:focus { border-color: #00e59d; }

.review-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.review-error { font-size: 13px; color: #f87171; }

.submit-review-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #00e59d, #00b4a0);
  color: #0a1a0e;
  border: none;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-review-btn:disabled { background: #334155; color: #64748b; cursor: not-allowed; }

.login-prompt {
  text-align: center;
  color: #64748b;
  padding: 24px;
  margin-bottom: 24px;
}

.login-prompt a { color: #00e59d; font-weight: 600; text-decoration: none; }

.reviews-loading, .no-reviews {
  color: #475569;
  text-align: center;
  padding: 32px;
}

.reviews-list { display: flex; flex-direction: column; gap: 16px; }

.review-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 20px;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.reviewer-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: rgba(124,58,237,0.3);
  color: #a78bfa;
  font-weight: 800;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.reviewer-info { flex: 1; }
.reviewer-name { font-weight: 700; font-size: 14px; }
.review-date { font-size: 12px; color: #475569; }

.review-stars { font-size: 16px; color: #fbbf24; letter-spacing: 1px; }

.review-comment { color: #94a3b8; font-size: 14px; line-height: 1.7; }

.review-reply {
  margin-top: 14px;
  background: rgba(0,229,157,0.06);
  border: 1px solid rgba(0,229,157,0.12);
  border-radius: 8px;
  padding: 12px;
}

.reply-label { font-size: 12px; font-weight: 700; color: #00e59d; margin-bottom: 6px; }
.review-reply p { font-size: 13px; color: #94a3b8; }

@media (max-width: 900px) {
  .content-grid { grid-template-columns: 1fr; padding: 20px; }
  .hero-inner { padding: 0 20px; }
  .hero-top { flex-direction: column; }
  .hero-meta { align-items: flex-start; }
  .reviews-inner { padding: 0 20px; }
}
</style>
