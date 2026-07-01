import { Booking } from '#models/Booking';

export const createBooking = (data) => Booking.create(data);

export const findById = (id) =>
  Booking.findById(id).populate('station', 'name address').populate('charger', 'portNumber connectorType');

export const findByUser = (userId, filter = {}) =>
  Booking.find({ user: userId, ...filter })
    .populate('station', 'name address')
    .populate('charger', 'portNumber connectorType')
    .sort({ bookingTime: -1 });

export const findByStationOwnerVisible = (stationIds) =>
  Booking.find({ station: { $in: stationIds } })
    .populate('user', 'name email phone')
    .populate('station', 'name')
    .populate('charger', 'portNumber connectorType')
    .sort({ bookingTime: -1 });

export default { createBooking, findById, findByUser, findByStationOwnerVisible };
