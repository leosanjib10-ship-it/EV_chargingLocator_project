import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import { pinoHttp } from 'pino-http';

import { env, allowedOrigins } from '#config/env';
import {
  authRoutes,
  usersRoutes,
  stationRoutes,
  chargerRoutes,
  reviewRoutes,
  bookingRoutes,
  paymentRoutes,
  notificationRoutes,
  adminRoutes,
} from '#routes/index';
import errorMiddleware from '#middleware/errorMiddleware';
import { generalLimiter } from '#middleware/rateLimiter';
import sanitize from '#middleware/sanitize';
import ApiError from '#utils/ApiError';

const app = express();

// Trust the first proxy hop (needed for correct req.ip / secure cookies behind Nginx/Docker)
app.set('trust proxy', 1);

// ─── Core Middleware ────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(compression());

// ─── Security Middleware ────────────────────────────────────────
app.use(helmet());
const isLocalhostOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no Origin header), e.g. curl/health checks.
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      // In development, Vite auto-bumps the port (5173 -> 5174 -> ...) when
      // one is already taken, so reflect any localhost origin to avoid CORS
      // friction while testing locally.
      if (env.NODE_ENV !== 'production' && isLocalhostOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new ApiError(403, `Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(sanitize);
app.use(hpp());

// ─── Logging ────────────────────────────────────────
app.use(
  pinoHttp({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    redact: ['req.headers.authorization', 'req.headers.cookie'],
    autoLogging: {
      ignore: (req) => req.url === '/health',
    },
  })
);

// ─── Rate Limiting (general baseline; auth routes have stricter limits) ────
app.use('/api', generalLimiter);

// ─── Routes ────────────────────────────────────────
app.use('/api/account', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/chargers', chargerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ChargeNP server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    errors: [],
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;
