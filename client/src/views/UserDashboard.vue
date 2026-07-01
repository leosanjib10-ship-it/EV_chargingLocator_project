<template>
  <div class="user-dashboard">

    <!-- Sidebar -->
    <aside class="dashboard-sidebar">
      <div class="brand">ChargeNP</div>
      <nav class="nav-menu">
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
    <main class="dashboard-main">
      <header class="main-header">
        <h1>{{ tabs.find(t => t.id === activeTab).label }}</h1>
        <p class="greeting">Hello, {{ user?.name }}</p>
      </header>

      <!-- Profile Tab -->
      <div v-if="activeTab === 'profile'" class="tab-pane">
        <div class="card profile-card">
          <div class="profile-header">
            <div class="avatar">{{ user?.name?.[0]?.toUpperCase() }}</div>
            <div class="details">
              <h3>{{ user?.name }}</h3>
              <p>{{ user?.email }}</p>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Full Name</label>
              <input v-model="form.name" type="text" />
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input v-model="form.phone" type="text" placeholder="e.g. 98XXXXXXXX" />
            </div>
            <div class="form-group">
              <label>Vehicle Type</label>
              <select v-model="form.vehicleType">
                <option value="Car">Electric Car</option>
                <option value="Scooter">Electric Scooter / Bike</option>
                <option value="Bus">Electric Bus / Van</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div v-if="profileMsg" class="alert" :class="profileMsg.type">
            {{ profileMsg.text }}
          </div>
          
          <button class="save-btn" @click="updateProfile" :disabled="saving">
            {{ saving ? 'Saving Changes...' : 'Save Profile' }}
          </button>
        </div>
      </div>

      <!-- Give Feedback Tab -->
      <div v-if="activeTab === 'feedback'" class="tab-pane">
        <div class="card feedback-card">
          <h3 class="feedback-title">Share Feedback</h3>
          <p class="feedback-sub">Rate a station you've used and let the owner know how it went.</p>

          <div class="form-group">
            <label>Station</label>
            <select v-model="feedbackForm.stationId">
              <option value="" disabled>Select a station...</option>
              <option v-for="s in stationOptions" :key="s._id" :value="s._id">{{ s.name }} — {{ s.address?.city }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Your Rating</label>
            <div class="star-picker">
              <span
                v-for="n in 5" :key="n"
                class="star"
                :class="{ filled: n <= feedbackForm.rating }"
                @click="feedbackForm.rating = n"
              >★</span>
            </div>
          </div>

          <div class="form-group">
            <label>Comment</label>
            <textarea v-model="feedbackForm.comment" rows="4" placeholder="How was the charging experience, the location, the pricing?"></textarea>
          </div>

          <div v-if="feedbackMsg" class="alert" :class="feedbackMsg.type">{{ feedbackMsg.text }}</div>

          <button class="save-btn" @click="submitFeedback" :disabled="submittingFeedback">
            {{ submittingFeedback ? 'Submitting...' : 'Submit Feedback' }}
          </button>
        </div>
      </div>

      <!-- Activity/Reviews Tab -->
      <div v-if="activeTab === 'reviews'" class="tab-pane">
        <div v-if="reviewsLoading" class="loading">Loading your reviews...</div>
        <div v-else-if="reviews.length === 0" class="empty-state">
          <span class="icon">💬</span>
          <h3>No reviews yet</h3>
          <p>Share your experience with the community by reviewing stations you've visited.</p>
          <RouterLink to="/find" class="find-btn">Find Stations</RouterLink>
        </div>
        
        <div v-else class="reviews-list">
          <div v-for="r in reviews" :key="r._id" class="review-card">
            <div class="review-header">
              <div class="station-info">
                <strong>{{ r.station?.name }}</strong>
                <span class="date">{{ formatDate(r.createdAt) }}</span>
              </div>
              <div class="stars">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5-r.rating) }}</div>
            </div>
            <p class="comment">{{ r.comment }}</p>
            <div v-if="r.reply?.text" class="reply">
              <span class="label">Response from owner:</span>
              <p>{{ r.reply.text }}</p>
            </div>
            <button class="delete-review-btn" @click="confirmDeleteReview(r._id)">Delete Review</button>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api.js'
import { fetchStationReviews, fetchMyReviews, createReview, deleteReview } from '../services/reviews.js'
import { fetchStations } from '../services/stations.js'
import { clearUser } from '../services/auth.js'

const router = useRouter()
const activeTab = ref('profile')
const saving = ref(false)
const reviewsLoading = ref(true)
const reviews = ref([])
const profileMsg = ref(null)

const tabs = [
  { id: 'profile', label: 'My Profile', icon: '' },
  { id: 'feedback', label: 'Give Feedback', icon: '' },
  { id: 'reviews', label: 'My Feedback', icon: '' }
]

const user = computed(() => {
  try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
})

const form = ref({
  name: user.value.name || '',
  phone: user.value.phone || '',
  vehicleType: user.value.vehicleType || 'Car'
})

const stationOptions = ref([])
const feedbackForm = ref({ stationId: '', rating: 0, comment: '' })
const feedbackMsg = ref(null)
const submittingFeedback = ref(false)

const loadStationOptions = async () => {
  try {
    const data = await fetchStations({ limit: 100, status: 'active' })
    stationOptions.value = data.stations || []
  } catch (err) {
    console.error('Failed to load stations:', err)
  }
}

const submitFeedback = async () => {
  feedbackMsg.value = null
  if (!feedbackForm.value.stationId) {
    feedbackMsg.value = { type: 'error', text: 'Please select a station.' }
    return
  }
  if (!feedbackForm.value.rating) {
    feedbackMsg.value = { type: 'error', text: 'Please choose a star rating.' }
    return
  }
  submittingFeedback.value = true
  try {
    await createReview({
      stationId: feedbackForm.value.stationId,
      rating: feedbackForm.value.rating,
      comment: feedbackForm.value.comment
    })
    feedbackMsg.value = { type: 'success', text: 'Thank you! Your feedback has been submitted.' }
    feedbackForm.value = { stationId: '', rating: 0, comment: '' }
    await loadReviews()
  } catch (err) {
    feedbackMsg.value = { type: 'error', text: err.response?.data?.message || 'Failed to submit feedback.' }
  } finally {
    submittingFeedback.value = false
  }
}

const loadReviews = async () => {
  if (!user.value._id) return
  reviewsLoading.value = true
  try {
    reviews.value = await fetchMyReviews(user.value._id)
  } catch (err) {
    console.error('Failed to load reviews:', err)
  } finally {
    reviewsLoading.value = false
  }
}

const updateProfile = async () => {
  saving.value = true
  profileMsg.value = null
  try {
    const res = await api.put(`/users/${user.value._id}`, form.value)
    const updatedUser = { ...user.value, ...form.value }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    profileMsg.value = { type: 'success', text: 'Profile updated successfully!' }
  } catch (err) {
    profileMsg.value = { type: 'error', text: 'Failed to update profile.' }
  } finally {
    saving.value = false
  }
}

const confirmDeleteReview = async (id) => {
  if (!confirm('Are you sure you want to delete this review?')) return
  try {
    await deleteReview(id)
    reviews.value = reviews.value.filter(r => r._id !== id)
  } catch (err) {
    alert('Failed to delete review.')
  }
}

const formatDate = (d) => new Date(d).toLocaleDateString()

const logout = () => {
  clearUser()
  router.push('/')
}

onMounted(() => {
  loadReviews()
  loadStationOptions()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.user-dashboard {
  display: flex;
  min-height: calc(100vh - 65px);
  background: #0a0e1a;
  color: #f1f5f9;
  font-family: 'Inter', sans-serif;
}

/* Sidebar */
.dashboard-sidebar {
  width: 260px;
  background: #0d1323;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
}

.brand {
  font-size: 22px;
  font-weight: 800;
  color: #00e59d;
  margin-bottom: 40px;
  padding-left: 10px;
}

.nav-menu {
  flex: 1;
}

.nav-menu button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 8px;
  transition: all 0.2s;
}

.nav-menu button.active {
  background: rgba(0, 229, 157, 0.1);
  color: #00e59d;
}

.nav-menu button:hover:not(.active) {
  background: rgba(255, 255, 255, 0.05);
  color: #f1f5f9;
}

.sidebar-footer {
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
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
  transition: 0.2s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Main Content */
.dashboard-main {
  flex: 1;
  padding: 40px 60px;
  overflow-y: auto;
}

.main-header {
  margin-bottom: 40px;
}

.main-header h1 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
}

.greeting {
  color: #64748b;
  font-size: 16px;
}

.card {
  background: #111827;
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.avatar {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #00e59d, #00b4a0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  color: #0d1323;
}

.profile-header h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.profile-header p {
  color: #64748b;
  font-size: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 15px;
  outline: none;
}

.form-group input:focus {
  border-color: #00e59d;
}

.feedback-card {
  max-width: 640px;
}

.feedback-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
}

.feedback-sub {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 28px;
}

.feedback-card .form-group {
  margin-bottom: 20px;
}

.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 15px;
  font-family: inherit;
  outline: none;
  resize: vertical;
}

.form-group textarea:focus {
  border-color: #00e59d;
}

.star-picker {
  display: flex;
  gap: 6px;
  font-size: 32px;
}

.star-picker .star {
  color: #334155;
  cursor: pointer;
  transition: 0.15s;
}

.star-picker .star:hover {
  transform: scale(1.1);
}

.star-picker .star.filled {
  color: #fbbf24;
}

.save-btn {
  padding: 14px 28px;
  background: linear-gradient(135deg, #00e59d, #00b4a0);
  border: none;
  border-radius: 12px;
  color: #0d1323;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: 0.2s;
}

.save-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alert {
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 24px;
}

.alert.success { background: rgba(0, 229, 157, 0.1); color: #00e59d; }
.alert.error { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }

/* Reviews */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  background: #111827;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.station-info {
  display: flex;
  flex-direction: column;
}

.station-info strong {
  font-size: 18px;
}

.date {
  font-size: 12px;
  color: #64748b;
}

.stars {
  color: #fbbf24;
  font-size: 18px;
}

.comment {
  color: #94a3b8;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.reply {
  background: rgba(0, 229, 157, 0.05);
  border-left: 3px solid #00e59d;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.reply .label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #00e59d;
  margin-bottom: 4px;
}

.reply p {
  font-size: 13px;
  color: #94a3b8;
}

.delete-review-btn {
  background: none;
  border: none;
  color: #fca5a5;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.delete-review-btn:hover {
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  padding: 80px 40px;
}

.empty-state .icon { font-size: 48px; margin-bottom: 16px; display: block; }
.empty-state h3 { font-size: 20px; margin-bottom: 8px; }
.empty-state p { color: #64748b; margin-bottom: 24px; }

.find-btn {
  display: inline-block;
  padding: 12px 24px;
  background: #00e59d;
  color: #0d1323;
  text-decoration: none;
  font-weight: 700;
  border-radius: 10px;
}

@media (max-width: 900px) {
  .user-dashboard { flex-direction: column; }
  .dashboard-sidebar { width: 100%; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .form-grid { grid-template-columns: 1fr; }
  .dashboard-main { padding: 30px 20px; }
}
</style>
