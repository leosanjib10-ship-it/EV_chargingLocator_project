<template>
  <div class="login-page">
    <div class="login-card">

      <!-- Left Side -->
      <div class="login-info">
        <div class="logo">ChargeNP</div>
        <h1>Station Owner Portal</h1>

        <p>
          Manage your charging stations,
          update pricing , Add no of charger, Add Types of Charger etc.
        </p>

          <div class="info-badges">
          <div class="badge">Manage EV Stations</div>
          <div class="badge"> Reviews</div>
        </div>
      </div>

      <!-- Right Side -->
      <div class="login-form">

        <div class="tabs">
          <button
            :class="{ active: activeTab === 'login' }"
            @click="activeTab = 'login'"
            type="button"
          >
            Login
          </button>

          <button
            :class="{ active: activeTab === 'signup' }"
            @click="activeTab = 'signup'"
            type="button"
          >
            Register
          </button>
        </div>

        <!-- ERROR MESSAGE -->
        <div v-if="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <!-- SUCCESS MESSAGE -->
        <div v-if="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>

        <!-- LOGIN FORM -->
        <form
          v-if="activeTab === 'login'"
          @submit.prevent="loginOwner"
        >
          <h2>Welcome Back</h2>

          <p class="subtitle">
            Login to access your station dashboard.
          </p>

          <div class="input-group">
            <label>Email Address</label>
            <input
              v-model="login.email"
              type="email"
              placeholder="owner@example.com"
              required
              :disabled="loading"
            />
          </div>

          <div class="input-group">
            <label>Password</label>

            <div class="password-box">
              <input
                v-model="login.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter Password"
                required
                :disabled="loading"
              />

              <span
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </span>
            </div>
          </div>

          <div class="options">
            <label>
              <input
                type="checkbox"
                v-model="login.remember"
                :disabled="loading"
              />
              Remember Me
            </label>
          </div>

          <button 
            type="submit" 
            class="login-btn"
            :disabled="loading"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <!-- SIGNUP FORM -->
        <form
          v-else
          @submit.prevent="registerOwner"
        >
          <h2>Create Owner Account</h2>

          <p class="subtitle">
            Register your EV charging business.
          </p>

          <div class="signup-grid">

            <div class="input-group">
              <label>Full Name</label>
              <input
                v-model="signup.fullName"
                type="text"
                placeholder="Full Name"
                required
                :disabled="loading"
              />
            </div>

            <div class="input-group">
              <label>Business Name</label>
              <input
                v-model="signup.businessName"
                type="text"
                placeholder="Business Name"
                required
                :disabled="loading"
              />
            </div>

            <div class="input-group">
              <label>Email</label>
              <input
                v-model="signup.email"
                type="email"
                placeholder="example@gmail.com"
                required
                :disabled="loading"
              />
            </div>

            <div class="input-group">
              <label>Phone Number</label>
              <input
                v-model="signup.phone"
                type="text"
                placeholder="+977 98XXXXXXXX"
                required
                :disabled="loading"
              />
            </div>

            <div class="input-group full-width">
              <label>Station Location</label>
              <input
                v-model="signup.stationLocation"
                type="text"
                placeholder="Pokhara, Nepal"
                required
                :disabled="loading"
              />
            </div>

            <div class="input-group">
              <label>Password</label>
              <input
                v-model="signup.password"
                type="password"
                placeholder="Min 8 chars, upper+lower+number+symbol"
                required
                :disabled="loading"
              />
            </div>

            <div class="input-group">
              <label>Confirm Password</label>
              <input
                v-model="signup.confirmPassword"
                type="password"
                placeholder="Confirm Password"
                required
                :disabled="loading"
              />
            </div>

          </div>

          <div class="terms">
            <input
              type="checkbox"
              v-model="signup.agree"
              :disabled="loading"
            />

            <span>
              I agree to the Terms & Conditions
            </span>
          </div>

          <button 
            type="submit" 
            class="login-btn"
            :disabled="loading"
          >
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>

        </form>

      </div>
    </div>

    <!--<RouterLink to="/admin-login" class="admin-link">Administrator? Sign in here</RouterLink>-->
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { validateLogin, validateStationSignup } from "../utils/validation.js";
import { useAuthStore } from "../stores/auth.js";

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref("login");
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const login = ref({
  email: "",
  password: "",
  remember: false
});

const signup = ref({
  fullName: "",
  businessName: "",
  email: "",
  phone: "",
  stationLocation: "",
  password: "",
  confirmPassword: "",
  agree: false
});

const loginOwner = async () => {
  try {
    errorMessage.value = "";
    successMessage.value = "";

    const validation = validateLogin(login.value.email, login.value.password);
    if (!validation.valid) {
      errorMessage.value = validation.errors[0];
      return;
    }

    loading.value = true;

    const user = await authStore.login(login.value.email, login.value.password);

    if (user.role !== 'station_owner') {
      await authStore.logout();
      errorMessage.value = 'Please use the EV User portal to log in.';
      return;
    }

    successMessage.value = "Login successful! Redirecting...";

    setTimeout(() => {
      router.push("/station/dashboard");
    }, 1000);
  } catch (err) {
    console.error("Login error:", err);
    errorMessage.value = err.response?.data?.message || "Login failed. Please try again.";
  } finally {
    loading.value = false;
  }
};

const registerOwner = async () => {
  try {
    errorMessage.value = "";
    successMessage.value = "";

    const validation = validateStationSignup(signup.value);
    if (!validation.valid) {
      errorMessage.value = validation.errors[0];
      return;
    }

    loading.value = true;

    await authStore.register({
      name: signup.value.fullName,
      businessName: signup.value.businessName,
      email: signup.value.email,
      phone: signup.value.phone,
      location: signup.value.stationLocation,
      password: signup.value.password,
      role: "station_owner"
    });

    successMessage.value = "Account created successfully! Redirecting...";

    setTimeout(() => {
      router.push("/station/dashboard");
    }, 1500);
  } catch (err) {
    console.error("Registration error:", err);
    errorMessage.value = err.response?.data?.message || "Registration failed. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 30px;
  background-color: #ffffff;
  background-image: 
    radial-gradient(at 0% 0%, rgba(0, 229, 157, 0.08) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(6, 61, 51, 0.2) 0px, transparent 50%);
}

.admin-link {
  color: #475569;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s;
}

.admin-link:hover {
  color: #94a3b8;
}

.login-card {
  width: 1150px;
  max-width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 25px;
  overflow: hidden;
  background: #111827;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
}

.login-info {
  padding: 60px;
  background: linear-gradient(135deg, #0d212d, #06111a);
  color: white;
}

.logo {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 15px;
}


.login-info h1 {
  font-size: 42px;
  margin-bottom: 20px;
}

.login-info p {
  line-height: 1.8;
  margin-bottom: 30px;
}

.info-badges {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 60px;
}
.badge {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.login-form {
  padding: 50px;
}

.tabs {
  display: flex;
  margin-bottom: 30px;
  background: #64748b;
  border-radius: 12px;
  overflow: hidden;
}

.tabs button {
  flex: 1;
  border: none;
  background: transparent;
  padding: 15px;
  cursor: pointer;
  font-weight: 600;
}

.tabs button.active {
  background: #00c17c;
  color: #0a1a0e;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
}

.alert-error {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.alert-success {
  background: #efe;
  color: #3c3;
  border: 1px solid #cfc;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 25px;
}

.input-group {
  margin-bottom: 18px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
}

.input-group input {
  width: 100%;
  padding: 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  outline: none;
  transition: .3s;
  font-size: 14px;
}

.input-group input:focus {
  border-color: #00c17c;
  box-shadow: 0 0 0 4px rgba(0,193,124,.15);
}

.input-group input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.password-box {
  position: relative;
}

.toggle-password {
  position: absolute;
  top: 15px;
  right: 15px;
  cursor: pointer;
}

.options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
  font-size: 14px;
}

.options a {
  color: #00c17c;
  text-decoration: none;
}

.signup-grid {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 15px;
}

.full-width {
  grid-column: span 2;
}

.terms {
  display: flex;
  gap: 10px;
  margin: 15px 0 25px;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  border: none;
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00e59d, #00d98b);
  color: #03150d;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 25px rgba(0, 229, 157, 0.2);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 229, 157, 0.35);
}

.login-btn:disabled {
  background: #999;
  cursor: not-allowed;
  transform: none;
}

@media(max-width:900px) {
  .login-card {
    grid-template-columns: 1fr;
  }

  .login-info {
    display: none;
  }

  .signup-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: span 1;
  }

  .login-form {
    padding: 30px;
  }
}
</style>
