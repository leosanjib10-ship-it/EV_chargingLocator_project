import express from 'express';
import * as paymentController from '#controllers/payment.controller';
import { authenticate } from '#middleware/authMiddleware';

const router = express.Router();

router.use(authenticate);

router.post('/bookings/:bookingId/simulate', paymentController.simulatePayment);
router.get('/me', paymentController.getMyPayments);
router.get('/:id', paymentController.getPaymentById);

export default router;
