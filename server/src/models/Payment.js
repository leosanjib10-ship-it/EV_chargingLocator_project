import mongoose from 'mongoose';

// Simulated payment record. No real payment gateway is integrated;
// eSewa / Khalti / Stripe / PayPal integration is tracked as future work.
const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: { type: String, default: 'NPR' },
    method: {
      type: String,
      enum: ['simulated_wallet', 'simulated_card', 'cash'],
      default: 'simulated_wallet',
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'success',
    },
    transactionRef: {
      type: String,
      unique: true,
    },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
