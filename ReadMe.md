# ChargeNP — EV Charging Locator

Full-stack platform for EV drivers to find charging stations with **live availability**, book charging slots, and simulate payment. Station owners can register, manage stations/charger ports, and track bookings. Admins manage users, stations, and reviews.

## Features

- **EV Users**: Find stations, view live port status, book charging slots, leave reviews.
- **Station Owners**: Add stations & charger ports, update live port status/pricing, view bookings for their stations.
- **Admins**: Manage users, moderate stations/reviews, view platform-wide bookings.
- **Booking Module**: Conflict-free slot booking (no double bookings / past bookings / offline chargers), cancellation, and completion tracking.
- **Simulated Payments**: Booking cost estimate + simulated payment record (no real gateway wired up — see Future Work).
- **Auth**: Access token (15 min) + refresh token (7 days, httpOnly cookie) with rotation and revocation.
- **Security**: Helmet, rate limiting, CORS, NoSQL-injection sanitization, HPP protection, centralized error handling, structured logging (Pino).

## Tech Stack

| Layer    | Stack                                                                 |
|----------|------------------------------------------------------------------------|
| Backend  | Node.js, Express 5, MongoDB, Mongoose, JWT (access + refresh), bcryptjs, Zod |
| Frontend | Vue 3, Vite, Vue Router, Pinia, Axios                                  |
| Security | Helmet, express-rate-limit, compression, cookie-parser, HPP, Pino      |
| Deploy   | Docker / Docker Compose                                                |

## Project Structure

```
server/
  src/
    config/        env.js, constants.js (roles, regex, rate limits)
    controllers/    request handlers
    middleware/     auth, validation, rate limiting, sanitization, errors
    models/         Mongoose schemas (User, EvStation, ChargerPort, Review,
                     Booking, Payment, Notification, RefreshToken)
    repositories/   thin data-access layer (user, booking)
    routes/         Express routers
    services/       business logic (token issuance/rotation, booking rules)
    utils/          password hashing, phone normalization, JWT, cookies
    validators/     Zod request schemas
client/
  src/
    components/, views/, router/, stores/ (Pinia), services/ (Axios), utils/
```

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB running locally (or update `DATABASE_URL`)

### 1. Backend

```bash
cd server
cp .env.example .env   # then fill in real secrets for JWT_SECRET / JWT_REFRESH_SECRET
npm install
npm run seed            # optional: creates demo owner/user/admin + sample stations
npm run dev
```

Server runs on `http://localhost:5001` by default. Health check: `GET /health`.

### 2. Frontend

```bash
cd client
cp .env.example .env    # set VITE_API_URL if backend isn't on localhost:5001
npm install
npm run dev
```

Client runs on `http://localhost:5173` by default.

### Demo accounts (after `npm run seed`)

| Role          | Email                | Password    |
|---------------|-----------------------|-------------|
| Station Owner | owner@chargenp.com    | Owner@123   |
| EV User       | user@chargenp.com     | User@1234   |
| Admin         | admin@chargenp.com    | Admin@123   |

## Environment Variables

### Server (`server/.env`)

| Variable              | Description                                   | Default (dev)                              |
|-----------------------|------------------------------------------------|---------------------------------------------|
| `PORT`                | API port                                       | `5001`                                       |
| `NODE_ENV`             | `development` \| `production` \| `test`       | `development`                                |
| `DATABASE_URL`         | MongoDB connection string                     | `mongodb://127.0.0.1:27017/ev-charging`      |
| `JWT_SECRET`           | Access-token signing secret                   | *(must be overridden in production)*         |
| `JWT_REFRESH_SECRET`   | Refresh-token signing secret                  | *(must be overridden in production)*         |
| `CLIENT_URL`           | Allowed CORS origin (also refresh-cookie scope) | `http://localhost:5173`                     |

### Client (`client/.env`)

| Variable        | Description                     |
|-----------------|----------------------------------|
| `VITE_API_URL`  | Base URL of the backend API, e.g. `http://localhost:5001/api` |

## Authentication Flow

1. **Register/Login** — `POST /api/account/register` or `/api/account/login`. Returns the user profile and a short-lived **access token** in the JSON body; a **refresh token** is set as an httpOnly, `SameSite=Lax` cookie scoped to `/api/account`.
2. **Authenticated requests** — send `Authorization: Bearer <accessToken>`.
3. **Refresh** — when the access token expires (15 min), the frontend calls `POST /api/account/refresh` (cookie sent automatically) to silently get a new access token. Refresh tokens rotate on every use and are stored in MongoDB so they can be revoked.
4. **Logout** — `POST /api/account/logout` revokes the current refresh token and clears the cookie.

## API Overview

All responses follow: `{ success: boolean, message: string, data?, errors?: string[] }`.

| Area          | Routes (prefix `/api`)                                                  |
|---------------|----------------------------------------------------------------------------|
| Auth          | `POST /account/register`, `POST /account/login`, `POST /account/refresh`, `POST /account/logout`, `GET /account/me`, `POST /account/reset-password` |
| Users         | `GET/PUT/DELETE /users/:id`, `PUT /users/:id/change-password`, admin-only listing/stats/search/deactivate/reactivate |
| Stations      | `GET /stations`, `GET /stations/nearby`, `GET /stations/:id`, `GET /stations/:id/live`, owner-only create/update/delete |
| Chargers      | `GET /chargers`, `GET /chargers/station/:stationId`, owner-only create/update/status/pricing/delete |
| Reviews       | `GET /reviews/station/:stationId`, `POST /reviews`, owner-only reply, owner/author delete |
| Bookings      | `POST /bookings`, `GET /bookings/me`, `GET /bookings/owner`, `PATCH /bookings/:id/cancel`, `PATCH /bookings/:id/complete` |
| Payments      | `POST /payments/bookings/:bookingId/simulate`, `GET /payments/me`, `GET /payments/:id` |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` |

Rate limits: login 5/15min, register 10/15min, general API 100/15min per IP.

## Validation Rules

- **Nepal phone**: `^(\+977)?(9[678]\d{8})$`, normalized to `+977XXXXXXXXXX` before saving. Email and phone are both unique.
- **Password**: min 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character. Hashed with bcrypt (12 salt rounds).
- **Booking**: charger must belong to the given station, must be active/online, booking time must be in the future, and no overlapping booking may exist for the same charger.

## Deployment (Docker)

```bash
docker compose up --build
```

This starts MongoDB, the API server (port `5001`), and the built client behind Nginx (port `8080`). Set real `JWT_SECRET` / `JWT_REFRESH_SECRET` values via a `.env` file or your orchestrator's secret store before deploying to production — the defaults are for local development only.

## Future Work

The following are intentionally **not** implemented yet and are simulated/stubbed for now:

- Real payment gateway integration: eSewa, Khalti, Stripe, PayPal.
- Google OAuth login.
- OTP / email verification for registration and password reset.
- Push notifications (current notifications are in-app/DB only).
- IoT-based real-time charger monitoring (current live status is DB-driven, updated via API calls from station owners).
- AI-assisted route optimization for trip planning.
