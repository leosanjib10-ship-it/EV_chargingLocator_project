import mongoose from 'mongoose';

const chargerPortSchema = new mongoose.Schema(
  {
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EvStation',
      required: true
    },
    portNumber: { type: String, trim: true },
    connectorType: {
      type: String,
      enum: ['CCS', 'CHAdeMO', 'Type2', 'J1772', 'Tesla', 'GBT'],
      required: true
    },
    chargeLevel: {
      type: String,
      enum: ['Level1', 'Level2', 'DC_Fast'],
      required: true
    },
    powerKw: { type: Number },
    voltage: { type: Number },
    amperage: { type: Number },
    availability: {
      type: String,
      enum: ['available', 'occupied', 'offline', 'reserved'],
      default: 'available'
    },
    lastStatusUpdate: { type: Date, default: Date.now },
    pricing: {
      perKwh: { type: Number },
      perMinute: { type: Number },
      sessionFee: { type: Number, default: 0 },
      currency: { type: String, default: 'NPR' },
      freeCharging: { type: Boolean, default: false }
    },
    isActive: { type: Boolean, default: true },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

chargerPortSchema.index({ station: 1 });
chargerPortSchema.index({ station: 1, availability: 1 });
chargerPortSchema.index({ connectorType: 1 });
chargerPortSchema.index({ chargeLevel: 1 });

export const ChargerPort = mongoose.model('ChargerPort', chargerPortSchema);
