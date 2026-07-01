import { Booking } from '#models/Booking';
import { ChargerPort } from '#models/Charger';
import { EvStation } from '#models/Station';
import ApiError from '#utils/ApiError';

// Ensures a booking request is valid: charger belongs to the station,
// the charger is active, the requested time is not in the past, and no
// overlapping booking exists for the same charger.
export const assertBookingIsValid = async ({ station, charger, bookingTime, durationMinutes }) => {
  const stationDoc = await EvStation.findById(station);
  if (!stationDoc) {
    throw new ApiError(404, 'Station not found');
  }

  const chargerDoc = await ChargerPort.findById(charger);
  if (!chargerDoc) {
    throw new ApiError(404, 'Charger not found');
  }

  if (String(chargerDoc.station) !== String(station)) {
    throw new ApiError(400, 'Charger does not belong to the selected station');
  }

  if (!chargerDoc.isActive || chargerDoc.availability === 'offline') {
    throw new ApiError(409, 'Selected charger is currently unavailable');
  }

  const start = new Date(bookingTime);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  if (start.getTime() <= Date.now()) {
    throw new ApiError(400, 'Booking time must be in the future');
  }

  // Overlap: existing.start < newEnd AND existing.end > newStart
  const conflict = await Booking.findOne({
    charger,
    status: { $in: ['pending', 'confirmed'] },
    bookingTime: { $lt: end },
    endTime: { $gt: start },
  });

  if (conflict) {
    throw new ApiError(409, 'This charger is already booked for the selected time slot');
  }

  return { stationDoc, chargerDoc, start, end };
};

export const estimateCost = (chargerDoc, durationMinutes) => {
  const perMinute = chargerDoc.pricing?.perMinute || 0;
  const sessionFee = chargerDoc.pricing?.sessionFee || 0;
  if (chargerDoc.pricing?.freeCharging) return 0;
  return Math.round((perMinute * durationMinutes + sessionFee) * 100) / 100;
};

export default { assertBookingIsValid, estimateCost };
