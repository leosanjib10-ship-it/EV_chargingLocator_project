<template>
  <div class="about-page">

    <!-- ================= HERO SECTION ================= -->
    <section class="about-hero">

      <div class="hero-left">

        <span class="tag">
          ⚡ About ChargeNP
        </span>

        <h1>
          Powering Nepal's
          <span>EV Journey</span>
        </h1>

        <p>
          ChargeNP is Nepal's first dedicated platform to help EV drivers
          find reliable charging stations across the country with real-time
          information.
        </p>


        <div class="hero-buttons">
          <button class="primary-btn">
            📍 Explore Stations
          </button>

          <button class="outline-btn">
            ✉ Contact Us
          </button>
        </div>


        <div class="hero-features">

          <div>
            ⚡ Real-time Updates
          </div>

          <div>
            🗺 Google Maps Navigation
          </div>

          <div>
            🇳🇵 Built for Nepal
          </div>

        </div>

      </div>


      <div class="hero-image">

        <img 
        src=""
        alt="EV Charging Car"
        />

      </div>


    </section>



    <!-- ================= STATISTICS ================= -->

    <section class="stats-section">

      <div
      class="stat-card"
      v-for="stat in statistics"
      :key="stat.title"
      >

        <div class="stat-icon">
          {{stat.icon}}
        </div>

        <h4>
          {{stat.title}}
        </h4>

        <p>
          {{stat.desc}}
        </p>

      </div>


    </section>




    <!-- ================= OUR STORY ================= -->

    <section class="story-section">


      <div class="story-content">

        <span class="section-label">
          OUR STORY
        </span>


        <h2>
          Built from a need.
          Driven by a mission.
        </h2>


        <p>
          Many EV drivers in Nepal face uncertainty on the road —
          not knowing where the next charging station is, whether it is
          available, or how much it will cost.
        </p>


        <p>
          ChargeNP was created to solve this real problem by building
          a platform that provides accurate, real-time, and easy-to-access
          charging information across Nepal.
        </p>


        <button class="story-btn">
          Made with ❤️ in Nepal for EV drivers
        </button>


      </div>




      <div class="mission-grid">


        <div 
        class="info-card"
        v-for="item in missions"
        :key="item.title"
        >

          <div class="info-icon">
            {{item.icon}}
          </div>


          <h3>
            {{item.title}}
          </h3>


          <p>
            {{item.description}}
          </p>


        </div>


      </div>


    </section>





    <!-- ================= ROAD FEATURES ================= -->


    <section class="road-section">


      <h2>
        What you get on the road
      </h2>


      <div class="road-grid">


        <div
        class="road-card"
        v-for="feature in roadFeatures"
        :key="feature.title"
        >


          <div class="road-icon">
            {{feature.icon}}
          </div>


          <h3>
            {{feature.title}}
          </h3>


          <p>
            {{feature.desc}}
          </p>


        </div>


      </div>


    </section>





    <!-- ================= WHY CHOOSE + TECHNOLOGY ================= -->


    <section class="choose-section">


      <div class="choose-box">


        <h2>
          Why Choose ChargeNP?
        </h2>


        <ul>

          <li
          v-for="item in chooseList"
          :key="item"
          >
            ✔ {{item}}
          </li>


        </ul>


      </div>



      <div class="technology-box">


        <h2>
          Built with modern technology
        </h2>


        <div class="tech-grid">


          <div
          class="tech-item"
          v-for="tech in technologies"
          :key="tech.name"
          >

            <img 
            :src="tech.logo"
            :alt="tech.name"
            />


            <span>
              {{tech.name}}
            </span>


          </div>


        </div>


      </div>


    </section>





    <!-- ================= TEAM ================= -->


    <section class="team-section">


      <h2>
        Meet The Team
      </h2>



      <div class="team-grid">


        <div
        class="team-card"
        v-for="member in team"
        :key="member.name"
        >


          <div class="avatar">

            <img
            :src="member.image"
            :alt="member.name"
            />

          </div>


          <h3>
            {{member.name}}
          </h3>


          <span>
            {{member.role}}
          </span>


          <p>
            {{member.desc}}
          </p>



          <div class="social">

            <a href="#">
              Github
            </a>

            <a href="#">
              LinkedIn
            </a>

            <a href="#">
              Email
            </a>

          </div>


        </div>


      </div>


    </section>





    <!-- ================= ROADMAP ================= -->


    <section class="roadmap-section">


      <h2>
        Roadmap
      </h2>


      <div class="roadmap">


        <div
        v-for="item in roadmap"
        :key="item.title"
        class="road-item"
        >


          <div class="circle">
            ✔
          </div>


          <h4>
            {{item.title}}
          </h4>


          <p>
            {{item.status}}
          </p>


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


const statistics = [

{
icon:"🔋",
title:"Charging Stations",
desc:"And growing every day"
},

{
icon:"🗺",
title:"Districts Covered",
desc:"Across all of Nepal"
},

{
icon:"🔌",
title:"Connector Types",
desc:"CCS2, GB/T, Type 2"
},

{
icon:"🕒",
title:"Real-time Updates",
desc:"Live availability status"
}

]





const missions=[

{
icon:"🎯",
title:"Our Mission",
description:"To eliminate range anxiety by providing accurate real-time information about charging infrastructure in Nepal."
},


{
icon:"👁",
title:"Our Vision",
description:"A future where every EV driver in Nepal can travel with confidence and ease."
},


{
icon:"🇳🇵",
title:"Built for Nepal",
description:"Supporting Nepal's major highways, cities and remote routes."
},


{
icon:"👥",
title:"For Station Owners",
description:"Grow your visibility and manage stations in real time."
}

]




const roadFeatures=[

{
icon:"🗺",
title:"Live Station Map",
desc:"Interactive map with real-time station status."
},

{
icon:"➤",
title:"Google Navigation",
desc:"One tap navigation using Google Maps."
},

{
icon:"⚡",
title:"Real-time Availability",
desc:"Know charger status before you go."
},

{
icon:"⭐",
title:"Ratings & Reviews",
desc:"Check ratings and feedback."
},

{
icon:"🏢",
title:"Owner Dashboard",
desc:"Manage stations easily."
}

]



const chooseList=[

"Accurate real-time data",
"Nationwide coverage",
"Smart search & filters",
"Multiple connector support",
"Fast Google Maps navigation",
"Community reviews",
"Easy responsive UI",
"Free for everyone"

]



const technologies=[

{
name:"Vue.js",
logo:"/images/vue.png"
},

{
name:"Node.js",
logo:"/images/node.png"
},

{
name:"Express",
logo:"/images/express.png"
},

{
name:"MongoDB",
logo:"/images/mongo.png"
},

{
name:"Google Maps",
logo:"/images/maps.png"
},

{
name:"Firebase",
logo:"/images/firebase.png"
}

]



const team=[

{
name:"Sanjip Niraula",
role:"Project Head & Backend",
desc:"Leads backend development and system architecture.",
image:"/images/sanjip.png"
},

{
name:"Aayush Mishra",
role:"UI/UX & Frontend",
desc:"Designs beautiful interfaces and user experiences.",
image:"/images/aayush.png"
},

{
name:"Rupesh Thakur",
role:"Backend Developer",
desc:"Builds APIs and ensures smooth performance.",
image:"/images/rupesh.png"
}

]




const roadmap=[

{
title:"Live Station Map",
status:"Completed"
},

{
title:"Real-time Updates",
status:"Completed"
},

{
title:"Reviews & Ratings",
status:"Completed"
},

{
title:"Owner Dashboard",
status:"Completed"
},

{
title:"Online Booking",
status:"Coming Soon"
},

{
title:"Route Planner",
status:"Coming Soon"
},

{
title:"AI Recommendations",
status:"Coming Soon"
}

]



</script>
<style scoped>


/* ================= GLOBAL ================= */

.about-page{
  background:#ffffff;
  color:#111;
  font-family:Inter,Arial,sans-serif;
}


h1,h2,h3,h4,p{
  margin:0;
}


h2{
  font-size:32px;
  font-weight:700;
  text-align:center;
  color:#111;
}


p{
  color:#555;
  line-height:1.7;
}





/* ================= HERO ================= */


.about-hero{

  display:flex;
  align-items:center;
  justify-content:space-between;

  padding:60px 8% 60px;

  background:
  linear-gradient(
  90deg,
  #ffffff 0%,
  #f3fbf8 100%
  );

}


.hero-left{

 width:50%;

}



.tag{

display:inline-block;

padding:7px 16px;

border-radius:30px;

background:#e7f8ef;

color:#159447;

font-size:14px;

font-weight:600;

}



.hero-left h1{
font-size:52px;
line-height:1.15;
margin:20px 0;
font-weight:800;
color:black;
}



.hero-left h1 span{

color:#139447;

}



.hero-left p{

max-width:520px;

font-size:16px;

}



.hero-buttons{

display:flex;

gap:15px;

margin-top:30px;

}



.primary-btn,
.outline-btn{

padding:13px 25px;

border-radius:8px;

cursor:pointer;

font-weight:600;

}



.primary-btn{

background:#0b9b4a;

border:none;

color:white;

}



.outline-btn{

background:white;

border:1px solid #0b9b4a;

color:#0b9b4a;

}



.hero-features{

display:flex;

gap:30px;

margin-top:35px;

font-size:14px;

color:#555;

}



.hero-image{

width:45%;

}



.hero-image img{

width:100%;

object-fit:contain;

}





/* ================= STATS ================= */


.stats-section{

margin:0 7%;

padding:25px;

display:grid;

grid-template-columns:repeat(4,1fr);

gap:20px;

background:white;

border-radius:18px;

box-shadow:
0 10px 35px rgba(0,0,0,.08);

}



.stat-card{

text-align:center;

}



.stat-icon{

font-size:35px;

margin-bottom:10px;

}



.stat-card h2{

color:#0a9b48;

font-size:34px;

}



.stat-card h4{

margin:8px 0;

}


.stat-card p{

font-size:13px;

}







/* ================= STORY ================= */



.story-section{

padding:80px 8%;

display:grid;

grid-template-columns:1fr 1fr;

gap:50px;

}



.section-label{

color:#079445;

font-size:13px;

font-weight:700;

}



.story-content h2{

text-align:left;

font-size:35px;

margin:20px 0;

}



.story-content p{

margin-bottom:20px;

}



.story-btn{

padding:12px 20px;

border-radius:8px;

background:white;

border:1px solid #0a9b48;

color:#0a9b48;

}




.mission-grid{
display:grid;
grid-template-columns:repeat(2,1fr);
gap:05px;

}



.info-card{

padding:05px;

border-radius:16px;

border:1px solid #eee;

box-shadow:
0 5px 20px rgba(0,0,0,.05);

}



.info-icon{

font-size:30px;

}



.info-card h3{

margin:15px 0;

}







/* ================= ROAD FEATURES ================= */


.road-section{

padding:60px 8%;

background:#fafafa;

}


.road-grid{

margin-top:50px;

display:grid;

grid-template-columns:repeat(5,1fr);

gap:20px;

}



.road-card{

text-align:center;

}



.road-icon{

width:65px;

height:65px;

margin:auto;

border-radius:50%;

display:flex;

align-items:center;

justify-content:center;

background:#0a9b48;

color:white;

font-size:25px;

}



.road-card h3{

font-size:16px;

margin:15px 0;

}


.road-card p{

font-size:14px;

}







/* ================= CHOOSE ================= */


.choose-section{

padding:70px 8%;

display:grid;

grid-template-columns:1fr 1fr;

gap:30px;

}



.choose-box,
.technology-box{

padding:35px;

background:#fff;

border-radius:18px;

box-shadow:
0 5px 25px rgba(0,0,0,.06);

}



.choose-box h2,
.technology-box h2{

text-align:left;

font-size:25px;

margin-bottom:25px;

}



.choose-box ul{

display:grid;

grid-template-columns:1fr 1fr;

gap:15px;

list-style:none;

padding:0;

}



.choose-box li{

color:#078c43;

}



.tech-grid{

display:grid;

grid-template-columns:repeat(3,1fr);

gap:25px;

}



.tech-item{

text-align:center;

}



.tech-item img{

width:45px;

height:45px;

object-fit:contain;

}



.tech-item span{

display:block;

font-size:13px;

margin-top:8px;

}







/* ================= TEAM ================= */



.team-section{

padding:70px 8%;

}



.team-grid{

margin-top:40px;

display:grid;

grid-template-columns:repeat(3,1fr);

gap:30px;

}



.team-card{

text-align:center;

padding:30px 20px;

border-radius:18px;

border:1px solid #eee;

}



.avatar{

width:90px;

height:90px;

margin:auto;

border-radius:50%;

overflow:hidden;

border:3px solid #0a9b48;

}



.avatar img{

width:100%;

height:100%;

object-fit:cover;

}



.team-card h3{

margin-top:15px;

}



.team-card span{

color:#0a9b48;

font-size:14px;

}



.team-card p{

font-size:14px;

margin:15px;

}



.social{

display:flex;

justify-content:center;

gap:15px;

}



.social a{

font-size:13px;

color:#111;

}






/* ================= ROADMAP ================= */



.roadmap-section{

padding:60px 5%;

}



.roadmap{

display:flex;

justify-content:space-between;

margin-top:50px;

}



.road-item{

text-align:center;

flex:1;

}



.circle{

margin:auto;

width:35px;

height:35px;

background:#0a9b48;

color:white;

border-radius:50%;

display:flex;

justify-content:center;

align-items:center;

}



.road-item h4{

margin-top:15px;

font-size:14px;

}



.road-item p{

font-size:13px;

}





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

/* ================= RESPONSIVE ================= */



@media(max-width:1000px){


.about-hero{

flex-direction:column;

}



.hero-left,
.hero-image{

width:100%;

}


.stats-section{

grid-template-columns:repeat(2,1fr);

}



.story-section{

grid-template-columns:1fr;

}



.road-grid{

grid-template-columns:repeat(2,1fr);

}



.choose-section{

grid-template-columns:1fr;

}



.team-grid{

grid-template-columns:1fr 1fr;

}


.footer{

grid-template-columns:1fr 1fr;

}



}




@media(max-width:600px){


.hero-left h1{

font-size:38px;

}


.hero-features{

flex-direction:column;

}



.stats-section{

grid-template-columns:1fr;

}



.mission-grid{

grid-template-columns:1fr;

}



.road-grid{

grid-template-columns:1fr;

}



.tech-grid{

grid-template-columns:repeat(2,1fr);

}



.team-grid{

grid-template-columns:1fr;

}



.choose-box ul{

grid-template-columns:1fr;

}



.roadmap{

overflow-x:auto;

}



.footer{

grid-template-columns:1fr;

}



}



</style>