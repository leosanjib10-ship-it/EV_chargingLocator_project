import mongoose from 'mongoose';
import { env } from '#config/env';

export const connectDb = async () => {
  try {
    await mongoose.connect(env.DATABASE_URL);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDb;
