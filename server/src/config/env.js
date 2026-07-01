import dotenv from 'dotenv';
import { cleanEnv, port, str, url } from 'envalid';

dotenv.config();

export const env = cleanEnv(process.env, {
  PORT: port({ default: 5001 }),
  NODE_ENV: str({
    choices: ['development', 'production', 'test'],
    default: 'development',
  }),
  DATABASE_URL: str({ devDefault: 'mongodb://127.0.0.1:27017/ev-charging' }),
  JWT_SECRET: str({ devDefault: 'dev-access-secret-change-in-production' }),
  JWT_REFRESH_SECRET: str({ devDefault: 'dev-refresh-secret-change-in-production' }),
  // Comma-separated list of allowed origins is supported, e.g.
  // "http://localhost:5173,http://localhost:5174"
  CLIENT_URL: str({ default: 'http://localhost:5173' }),
});

export const allowedOrigins = env.CLIENT_URL.split(',').map((origin) => origin.trim());

export default env;
