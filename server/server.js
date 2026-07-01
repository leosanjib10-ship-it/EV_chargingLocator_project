import app from './app.js';
import { env } from '#config/env';
import { connectDb } from '#database/connection';

const startServer = async () => {
  try {
    await connectDb();
    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();