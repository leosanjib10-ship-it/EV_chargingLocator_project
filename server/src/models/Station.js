import mongoose from 'mongoose';

const amenitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['cafe', 'parking', 'restroom', 'wifi', 'restaurant', 'hotel', 'shopping', 'other'],
  },
  distance: { type: String },
  notes: { type: String },
});

const operatingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  },
  open: { type: String },
  close: { type: String },
  is24Hours: { type: Boolean, default: false },
  isClosed: { type: Boolean, default: false },
});

const evStationSchema = new mongoose.Schema(
  {
    operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      country: { type: String, required: true, default: 'Nepal' },
      zipCode: { type: String },
      formatted: { type: String },
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance', 'coming_soon'],
      default: 'active',
    },
    photos: [{ type: String }],
    totalPorts: { type: Number, default: 0 },
    operatingHours: [operatingHoursSchema],
    is24Hours: { type: Boolean, default: false },
    amenities: [amenitySchema],
    network: { type: String },
    accessType: {
      type: String,
      enum: ['public', 'semi_public', 'private'],
      default: 'public',
    },
    accessInstructions: { type: String },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

evStationSchema.index({ location: '2dsphere' });
evStationSchema.index({ name: 'text', 'address.city': 'text', 'address.formatted': 'text' });
evStationSchema.index({ status: 1 });
evStationSchema.index({ operator: 1 });

export const EvStation = mongoose.model('EvStation', evStationSchema);
