<template>
  <div class="about-page">
    
    <!-- Hero Section -->
    <header class="about-hero">
      <div class="hero-content">
        <div class="tag">⚡ Nepal's EV Journey</div>
        <h1 class="gradient-text">Powering the Future of Transport in Nepal</h1>
        <p class="hero-sub">
          ChargeNP is Nepal's first dedicated platform built to solve the visibility gap 
          for EV charging infrastructure. We connect drivers with real-time station data, 
          eliminating range anxiety and promoting sustainable travel across the Himalayas.
        </p>
      </div>
      <div class="hero-glow"></div>
    </header>

    <!-- Mission & Statistics -->
    <section class="info-section">
      <div class="stats-grid">
        <div v-for="stat in statistics" :key="stat.title" class="stat-card">
          <div class="stat-icon">{{ stat.icon }}</div>
          <div class="stat-info">
            <h2>{{ stat.number }}</h2>
            <h4>{{ stat.title }}</h4>
            <p>{{ stat.desc }}</p>
          </div>
        </div>
      </div>

      <div class="mission-grid">
        <div v-for="item in missions" :key="item.title" class="mission-card glass">
          <div class="mission-icon">{{ item.icon }}</div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </div>
      </div>
    </section>

    <!-- Project Timeline -->
    <section class="roadmap-section">
      <h2 class="section-title">Our Roadmap</h2>
      <div class="roadmap-grid">
        <div v-for="item in roadmap" :key="item.title" class="roadmap-item">
          <div class="status-dot" :class="{ completed: item.status === 'Completed' }"></div>
          <div class="roadmap-content">
            <h4>{{ item.title }}</h4>
            <span class="status-label">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="team-section">
      <h2 class="section-title">Meet the Team</h2>
      <div class="team-grid">
        <div v-for="m in team" :key="m.name" class="team-card glass">
          <div class="member-avatar">{{ m.name[0] }}</div>
          <h3>{{ m.name }}</h3>
          <p class="member-role">{{ m.role }}</p>
          <p class="member-desc">{{ m.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="about-footer">
      <div class="footer-logo">ChargeNP</div>
      <p>Building a cleaner, greener Nepal through technology.</p>
      <div class="footer-copy">© 2026 ChargeNP. All rights reserved.</div>
    </footer>

  </div>
</template>

<script setup>
const statistics = [
  { icon: "🔋", number: "100+", title: "Stations", desc: "Across Nepal" },
  { icon: "🌍", number: "15+", title: "Districts", desc: "Major Corridors" },
  { icon: "⚡", number: "3+", title: "Connectors", desc: "CCS2, GBT, Type2" }
]

const missions = [
  {
    icon: "🎯",
    title: "Our Mission",
    description: "To eliminate range anxiety for EV owners in Nepal by providing accurate, real-time charging status."
  },
  {
    icon: "🗺️",
    title: "Strategic Mapping",
    description: "Integrating all public and private charging hubs into one unified, easy-to-use digital map."
  }
]

const roadmap = [
  { title: "Live Map", status: "Completed" },
  { title: "Review System", status: "Completed" },
  { title: "Owner Portal", status: "Completed" },
  { title: "Booking API", status: "Coming Soon" },
  { title: "Trip Planner", status: "Coming Soon" }
]

const team = [
  { 
    name: "Sanjip Niraula", 
    role: "Project Head", 
    desc: "Backend architecture and system security expert." 
  },
  { 
    name: "Aayush Mishra", 
    role: "UI/UX Designer", 
    desc: "Crafting beautiful and intuitive user experiences." 
  },
  { 
    name: "Rupesh Thakur", 
    role: "Fullstack Dev", 
    desc: "Specialist in real-time data integration." 
  }
]
</script>

<style scoped>
.about-page {
  background: #080a12;
  color: #f1f5f9;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

.about-hero {
  position: relative;
  padding: 120px 40px;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
}

.tag {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(0, 229, 157, 0.1);
  color: #00e59d;
  border: 1px solid rgba(0, 229, 157, 0.2);
  border-radius: 30px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 24px;
}

.gradient-text {
  font-size: 56px;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #00e59d, #00b4d8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-sub {
  max-width: 800px;
  margin: 0 auto;
  font-size: 18px;
  color: #94a3b8;
  line-height: 1.7;
}

.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 700px;
  height: 400px;
  background: radial-gradient(circle, rgba(0, 229, 157, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.info-section {
  padding: 80px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-bottom: 80px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(255,255,255,0.03);
  padding: 30px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.06);
}

.stat-icon { font-size: 40px; }
.stat-info h2 { font-size: 32px; font-weight: 800; color: #00e59d; }
.stat-info h4 { font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }

.mission-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.glass {
  background: rgba(255,255,255,0.02);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  padding: 40px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass:hover {
  background: rgba(255,255,255,0.05);
  transform: translateY(-5px);
  border-color: rgba(0, 229, 157, 0.3);
}

.mission-icon { font-size: 32px; margin-bottom: 20px; }
.mission-card h3 { font-size: 22px; margin-bottom: 12px; }
.mission-card p { color: #94a3b8; line-height: 1.6; }

.section-title {
  text-align: center;
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 50px;
}

.roadmap-section {
  padding: 80px 40px;
  background: rgba(255,255,255,0.01);
}

.roadmap-grid {
  max-width: 800px;
  margin: 0 auto;
  border-left: 2px solid rgba(255,255,255,0.05);
  padding-left: 40px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.roadmap-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-dot {
  position: absolute;
  left: -51px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #1f2937;
  border: 4px solid #080a12;
}

.status-dot.completed { background: #00e59d; }

.roadmap-content h4 { font-size: 18px; margin-bottom: 4px; }
.status-label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }

.team-section {
  padding: 80px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.team-card {
  text-align: center;
}

.member-avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #00e59d, #00b4d8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 900;
  color: #03150d;
}

.member-role { color: #00e59d; font-weight: 700; font-size: 14px; margin-bottom: 12px; }
.member-desc { font-size: 14px; color: #94a3b8; line-height: 1.5; }

.about-footer {
  padding: 80px 40px;
  text-align: center;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.footer-logo { font-size: 28px; font-weight: 900; color: #00e59d; margin-bottom: 12px; }
.footer-copy { margin-top: 24px; color: #475569; font-size: 13px; }

@media (max-width: 1024px) {
  .team-grid, .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .team-grid, .stats-grid, .mission-grid { grid-template-columns: 1fr; }
  .gradient-text { font-size: 36px; }
  .about-hero { padding: 80px 20px; }
}
</style>
