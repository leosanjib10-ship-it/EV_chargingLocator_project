import mongoose from 'mongoose';
import { ALL_ROLES, ROLES } from '#config/constants';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ALL_ROLES,
      default: ROLES.USER,
    },
    avatar: {
      type: String,
      default: '',
    },
    vehicleType: {
      type: String,
    },
    businessName: {
      type: String,
    },
    location: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

export const User = mongoose.model('User', userSchema);

export default User;
