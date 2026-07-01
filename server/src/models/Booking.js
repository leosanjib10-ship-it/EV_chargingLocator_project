import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EvStation',
      required: true,
    },
    charger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargerPort',
      required: true,
    },
    bookingTime: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 15,
      default: 60,
    },
    endTime: {
      type: Date,
      required: true,
    },
    vehicleType: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'confirmed',
    },
    estimatedCost: { type: Number, default: 0 },
    notes: { type: String, trim: true },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ station: 1 });
bookingSchema.index({ charger: 1, bookingTime: 1 });
bookingSchema.index({ bookingTime: 1 });
bookingSchema.index({ status: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
