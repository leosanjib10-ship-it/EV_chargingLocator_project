<template>
  <div class="home">

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-left">
        <div class="badge">
          <span class="badge-icon">⚡</span>
          Powering Nepal's EV Future
        </div>

        <h1 class="headline">
          Find EV Chargers.<br />
          Anywhere in <span class="highlight">Nepal. </span>
        </h1>

        <p class="subtext">
          Real-time availability, connector type filters, and one-tap
          navigation — built for Nepali EV drivers.
        </p>

        <div class="hero-actions">
          <RouterLink to="/find" class="btn-primary">
            Find Stations Now
          </RouterLink>
          <RouterLink to="/station-login" class="btn-outline">
            Add Your Station
          </RouterLink>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon stat-icon-green">📶</div>
            <div class="stat-info">
              <div class="stat-title">Live Data</div>
              <div class="stat-desc">Real-time station availability</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon stat-icon-amber">🔌</div>
            <div class="stat-info">
              <div class="stat-title">20+</div>
              <div class="stat-desc">Charging Points and growing</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon stat-icon-green">📍</div>
            <div class="stat-info">
              <div class="stat-title">10+</div>
              <div class="stat-desc">Districts Covered</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon stat-icon-blue">🔌</div>
            <div class="stat-info">
              <div class="stat-title">3</div>
              <div class="stat-desc">Connector Types</div>
            </div>
          </div>
        </div>

        <div class="free-banner">
          <span>🌿 <strong>Free to use. Always will be.</strong></span>
          <span class="divider">|</span>
          <span>Made with ❤️ in Nepal 🇳🇵</span>
        </div>
      </div>

          <!--Maps-->
      <div class="hero-visual">
        <div class="map-glow"></div>
        <div class="map-card">
          <div id="map" class="real-map"></div>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section class="how-it-works">
      <h2 class="section-title">How ChargeNP works</h2>
      <div class="steps">
        <div class="step">
          <div class="step-number">01</div>
          <h3>Find a Station</h3>
          <p>Search by location or browse the map to find the nearest available EV charging station.</p>
        </div>
        <div class="step-arrow">→</div>
        <div class="step">
          <div class="step-number">02</div>
          <h3>Check Live Status</h3>
          <p>View real-time port availability, connector types, pricing and operating hours.</p>
        </div>
        <div class="step-arrow">→</div>
        <div class="step">
          <div class="step-number">03</div>
          <h3>Navigate & Charge</h3>
          <p>Tap "Get Directions" to open Google Maps navigation and head to the station to charge.</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-card">
        <div class="cta-glow"></div>
        <h2>Own an EV Charging Station?</h2>
        <p>Join ChargeNP and get your station listed in minutes. Manage ports, monitor live status, and connect with EV drivers across Nepal.</p>
        <div class="cta-actions">
          <RouterLink to="/station-login" class="btn-primary">
            List Your Station — It's Free
          </RouterLink>
          <RouterLink to="/find" class="btn-ghost">
            Browse Stations →
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-brand">
        <div class="footer-logo">ChargeNP</div>
        <p>Built for Nepal's growing EV community.</p>
      </div>
      <div class="footer-links">
        <RouterLink to="/find">Find Stations</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/station-login">Station Owner</RouterLink>
      </div>
      <div class="footer-copy">© 2026 ChargeNP. All rights reserved.</div>
    </footer>

  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import { fetchStations } from '../services/stations.js'

const stats = ref({ stations: 0, ports: 0, cities: 0 })

onMounted(async () => {
  // Display only the map of Nepal
  const map = L.map('map').setView([28.3949, 84.1240], 7)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  // Your existing statistics code
  try {
    const data = await fetchStations({ limit: 100, status: 'active' })
    const stations = data.stations || []
    const cities = new Set(stations.map(s => s.address?.city).filter(Boolean))
    const ports = stations.reduce((sum, s) => sum + (s.liveSummary?.totalPorts || 0), 0)

    stats.value = {
      stations: stations.length || 20,
      ports: ports || 60,
      cities: cities.size || 10
    }
  } catch {
    stats.value = { stations: 20, ports: 60, cities: 10 }
  }
})
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

.home {
  font-family: 'Inter', sans-serif;
  background-color: #ffffff;
  background-image: 
    radial-gradient(at 50% 0%, rgba(0, 229, 157, 0.05) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(30, 64, 175, 0.05) 0px, transparent 50%);
  color: #0f172a;
  min-height: 0vh;
}

/* ── Hero ── */
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 80px;
  align-items: center;
  padding: 20px 80px;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-left {
  padding-top: 8px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #eafbea;
  color: #15803d;
  font-weight: 600;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 999px;
  margin-bottom: 24px;
}

.badge-icon{
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00e59d;
  animation: pulse-badge 2s infinite;
}

@keyframes pulse-badge {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.headline {
  font-size: 52px;
  line-height: 1.1;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 20px;
}

.highlight {
  color: #22c55e;
}

.subtext {
  font-size: 17px;
  color: #64748b;
  line-height: 1.6;
  max-width: 480px;
  margin-bottom: 28px;
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #00e59d, #00d98b);
  color: #03150d;
  padding: 16px 32px;
  border-radius: 16px;
  font-weight: 800;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 30px rgba(0, 229, 157, 0.25);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 45px rgba(0, 229, 157, 0.4);
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: #0f172a;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  border: 1.5px solid rgba(115, 110, 110, 0.2);
  transition: all 0.3s;
}

.btn-outline:hover {
  border-color: #00e59d;
  color: #00e59d;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #eef1ee;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.stat-icon-green {
  background: #eafbea;
}

.stat-icon-amber {
  background: #fef3e0;
}

.stat-icon-blue {
  background: #e6f2ff;
}

.stat-title {
  font-weight: 700;
  font-size: 15px;
  color: #0f172a;
}

.stat-desc {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.3;
}

/* Free banner */
.free-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f2faf3;
  border: 1px solid #dcf3de;
  border-radius: 12px;
  padding: 14px 20px;
  font-size: 14px;
  color: #166534;
  margin-bottom: 28px;
}

.divider {
  color: #cbd5c9;
}

/* Map Visual */
.hero-visual {
  position: relative;
}

.map-glow {
  position: absolute;
  inset: -40px;
  background: radial-gradient(ellipse at center, rgba(0, 229, 157, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.map-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 20px;
  backdrop-filter: blur(12px);
  position: relative;
}



.real-map {
  width: 100%;
  height: 350px;
  border-radius: 20px;
  overflow: hidden;
}


@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}


.dot.available { background: #00e59d; }
.dot.busy { background: #ef4444; }
.dot.offline { background: #64748b; }


/* ── How It Works ── */
.how-it-works {
  padding: 0px;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.how-it-works .section-title {
  text-align: center;
  color:#000;
}

.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
  max-width: 900px;
  margin: 0 auto;
}

.step {
  text-align: center;
  flex: 1;
}

.step-number {
  font-size: 11px;
  font-weight: 800;
  color: #00e59d;
  letter-spacing: 2px;
  margin-bottom: 12px;
}

.step-icon {
  font-size: 44px;
  margin-bottom: 16px;
}

.step h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
}

.step p {
  color: #000;
  font-size: 14px;
  line-height: 1.6;
}

.step-arrow {
  font-size: 28px;
  color: #334155;
  flex-shrink: 0;
  margin-top: -20px;
}

/* ── CTA ── */
.cta-section {
  padding: 80px;
  max-width: 1400px;
  margin: 0 auto;
}

.cta-card {
  position: relative;
  background: linear-gradient(135deg, #0f2a1e, #0a1f2e);
  border: 1px solid rgba(0, 229, 157, 0.2);
  border-radius: 28px;
  padding: 64px;
  text-align: center;
  overflow: hidden;
}

.cta-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 300px;
  background: radial-gradient(ellipse, rgba(0, 229, 157, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.cta-card h2 {
  font-size: 38px;
  font-weight: 800;
  margin-bottom: 16px;
  position: relative;
}

.cta-card p {
  color: #94a3b8;
  font-size: 17px;
  line-height: 1.7;
  max-width: 560px;
  margin: 0 auto 36px;
  position: relative;
}

.cta-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  position: relative;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  color: #94a3b8;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s;
}

.btn-ghost:hover { color: #00e59d; }

/* ── Footer ── */
.footer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 40px 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.footer-logo {
  font-size: 22px;
  font-weight: 800;
  color: #00e59d;
  margin-bottom: 6px;
}

.footer-brand p {
  color: #475569;
  font-size: 13px;
}

.footer-links {
  display: flex;
  gap: 28px;
}

.footer-links a {
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-links a:hover { color: #00e59d; }

.footer-copy {
  color: #334155;
  font-size: 13px;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 60px 40px;
  }
  .hero-title { font-size: 42px; }
  .features { padding: 60px 40px; }
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .how-it-works { padding: 60px 40px; }
  .cta-section { padding: 60px 40px; }
  .footer { padding: 40px; }
}

@media (max-width: 640px) {
  .hero { padding: 40px 20px; }
  .hero-title { font-size: 34px; }
  .features { padding: 40px 20px; }
  .features-grid { grid-template-columns: 1fr; }
  .steps { flex-direction: column; }
  .step-arrow { transform: rotate(90deg); margin: 0; }
  .how-it-works { padding: 40px 20px; }
  .cta-section { padding: 40px 20px; }
  .cta-card { padding: 40px 24px; }
  .cta-card h2 { font-size: 26px; }
  .footer { flex-direction: column; text-align: center; padding: 30px 20px; }
}


</style>
