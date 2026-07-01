import crypto from 'crypto';
import ApiResponse from '#utils/ApiResponse';
import ApiError from '#utils/ApiError';
import asyncHandler from '#utils/asyncHandler';
import { Payment } from '#models/Payment';
import { Booking } from '#models/Booking';

// NOTE: This is a simulated payment flow. No real gateway (eSewa, Khalti,
// Stripe, PayPal) is integrated — see README "Future Work" for real
// integration plans.

// ─── Simulate Payment for a Booking ────────────────────────────────────────
export const simulatePayment = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { method = 'simulated_wallet' } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');

  if (String(booking.user) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only pay for your own bookings');
  }

  const existing = await Payment.findOne({ booking: bookingId, status: 'success' });
  if (existing) {
    throw new ApiError(409, 'This booking has already been paid for');
  }

  const payment = await Payment.create({
    booking: bookingId,
    user: req.user._id,
    amount: booking.estimatedCost || 0,
    method,
    status: 'success',
    transactionRef: `SIM-${crypto.randomUUID()}`,
  });

  res.status(201).json(new ApiResponse(201, 'Payment simulated successfully', payment));
});

// ─── Get My Payments ────────────────────────────────────────
export const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate({ path: 'booking', populate: { path: 'station', select: 'name' } })
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, 'Payments fetched successfully', payments));
});

// ─── Get Payment By Id ────────────────────────────────────────
export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ApiError(404, 'Payment not found');

  if (String(payment.user) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to view this payment');
  }

  res.status(200).json(new ApiResponse(200, 'Payment fetched successfully', payment));
});
