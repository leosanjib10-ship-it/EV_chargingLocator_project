import express from 'express';
import * as bookingController from '#controllers/booking.controller';
import { authenticate, authorize } from '#middleware/authMiddleware';
import validate from '#middleware/validate';
import { createBookingSchema, cancelBookingSchema } from '#validators/booking.validator';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createBookingSchema), bookingController.createBooking);
router.get('/me', bookingController.getMyBookings);
router.get('/owner', authorize('station_owner', 'admin'), bookingController.getStationOwnerBookings);
router.get('/:id', bookingController.getBookingById);
router.patch('/:id/cancel', validate(cancelBookingSchema), bookingController.cancelBooking);
router.patch('/:id/complete', authorize('station_owner', 'admin'), bookingController.completeBooking);

export default router;
