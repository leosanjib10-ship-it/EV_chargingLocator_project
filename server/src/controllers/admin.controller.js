import ApiResponse from '#utils/ApiResponse';
import asyncHandler from '#utils/asyncHandler';
import { User } from '#models/User';
import { EvStation } from '#models/Station';
import { ChargerPort } from '#models/Charger';
import { Booking } from '#models/Booking';
import { Payment } from '#models/Payment';
import Review from '#models/Review';

// ─── Platform-wide overview (admin only) ────────────────────────────────
// Gives the admin a single call that summarizes everything happening
// across the app: accounts by role, stations/chargers, booking activity,
// payment volume, and feedback.
export const getOverview = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    usersByRoleAgg,
    activeUsers,
    totalStations,
    activeStations,
    totalChargers,
    availableChargers,
    totalBookings,
    bookingsByStatusAgg,
    totalPayments,
    paymentVolumeAgg,
    totalReviews,
    avgRatingAgg,
  ] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    User.countDocuments({ isActive: true }),
    EvStation.countDocuments(),
    EvStation.countDocuments({ status: 'active' }),
    ChargerPort.countDocuments(),
    ChargerPort.countDocuments({ availability: 'available' }),
    Booking.countDocuments(),
    Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Payment.countDocuments(),
    Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Review.countDocuments(),
    Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
  ]);

  const usersByRole = usersByRoleAgg.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});
  const bookingsByStatus = bookingsByStatusAgg.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});

  res.status(200).json(
    new ApiResponse(200, 'Platform overview fetched successfully', {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        byRole: {
          user: usersByRole.user || 0,
          station_owner: usersByRole.station_owner || 0,
          admin: usersByRole.admin || 0,
        },
      },
      stations: {
        total: totalStations,
        active: activeStations,
      },
      chargers: {
        total: totalChargers,
        available: availableChargers,
      },
      bookings: {
        total: totalBookings,
        byStatus: bookingsByStatus,
      },
      payments: {
        total: totalPayments,
        totalVolume: paymentVolumeAgg[0]?.total || 0,
      },
      reviews: {
        total: totalReviews,
        avgRating: avgRatingAgg[0]?.avg ? Math.round(avgRatingAgg[0].avg * 10) / 10 : 0,
      },
    })
  );
});
