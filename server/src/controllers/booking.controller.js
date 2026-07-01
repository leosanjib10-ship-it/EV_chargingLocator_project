import ApiResponse from '#utils/ApiResponse';
import ApiError from '#utils/ApiError';
import asyncHandler from '#utils/asyncHandler';
import { Booking } from '#models/Booking';
import { EvStation } from '#models/Station';
import * as bookingRepository from '#repositories/booking.repository';
import * as bookingService from '#services/booking.service';
import { Notification } from '#models/Notification';

// ─── Create Booking ────────────────────────────────────────
export const createBooking = asyncHandler(async (req, res) => {
  const { station, charger, bookingTime, durationMinutes, vehicleType, notes } = req.body;

  const { chargerDoc, start, end } = await bookingService.assertBookingIsValid({
    station,
    charger,
    bookingTime,
    durationMinutes,
  });

  const estimatedCost = bookingService.estimateCost(chargerDoc, durationMinutes);

  const booking = await bookingRepository.createBooking({
    user: req.user._id,
    station,
    charger,
    bookingTime: start,
    endTime: end,
    durationMinutes,
    vehicleType,
    notes,
    estimatedCost,
  });

  await Notification.create({
    user: req.user._id,
    title: 'Booking confirmed',
    message: `Your charging session is booked for ${start.toLocaleString()}.`,
    type: 'booking',
    relatedId: booking._id,
  });

  res.status(201).json(new ApiResponse(201, 'Booking created successfully', booking));
});

// ─── Get My Bookings ────────────────────────────────────────
export const getMyBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const bookings = await bookingRepository.findByUser(req.user._id, filter);
  res.status(200).json(new ApiResponse(200, 'Bookings fetched successfully', bookings));
});

// ─── Get Station Bookings (owner/admin) ────────────────────────────────────────
export const getStationOwnerBookings = asyncHandler(async (req, res) => {
  let stationIds;
  if (req.user.role === 'admin') {
    stationIds = (await EvStation.find().select('_id')).map((s) => s._id);
  } else {
    stationIds = (await EvStation.find({ operator: req.user._id }).select('_id')).map((s) => s._id);
  }

  const bookings = await bookingRepository.findByStationOwnerVisible(stationIds);
  res.status(200).json(new ApiResponse(200, 'Station bookings fetched successfully', bookings));
});

// ─── Get Booking By Id ────────────────────────────────────────
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingRepository.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');

  const station = await EvStation.findById(booking.station);
  const isOwner = station && String(station.operator) === String(req.user._id);
  const isBookingUser = String(booking.user) === String(req.user._id);

  if (!isBookingUser && !isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to view this booking');
  }

  res.status(200).json(new ApiResponse(200, 'Booking fetched successfully', booking));
});

// ─── Cancel Booking ────────────────────────────────────────
export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');

  const isBookingUser = String(booking.user) === String(req.user._id);
  if (!isBookingUser && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only cancel your own bookings');
  }

  if (['completed', 'cancelled'].includes(booking.status)) {
    throw new ApiError(409, `Booking is already ${booking.status}`);
  }

  if (booking.bookingTime.getTime() <= Date.now()) {
    throw new ApiError(409, 'Cannot cancel a booking that has already started');
  }

  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancellationReason = reason;
  await booking.save();

  res.status(200).json(new ApiResponse(200, 'Booking cancelled successfully', booking));
});

// ─── Complete Booking (owner/admin) ────────────────────────────────────────
export const completeBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');

  if (booking.status !== 'confirmed' && booking.status !== 'pending') {
    throw new ApiError(409, `Booking cannot be completed from status "${booking.status}"`);
  }

  booking.status = 'completed';
  await booking.save();

  res.status(200).json(new ApiResponse(200, 'Booking marked as completed', booking));
});
