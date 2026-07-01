import express from 'express';
import * as reviewController from '#controllers/review.controller';
import { authenticate, authorize } from '#middleware/authMiddleware';

const router = express.Router();

// Public
router.get('/station/:stationId', reviewController.getStationReviews);

// Authenticated
router.get('/owner', authenticate, authorize('station_owner', 'admin'), reviewController.getOwnerReviews);
router.get('/', authenticate, reviewController.getAllReviews);
router.post('/', authenticate, reviewController.createReview);
router.post('/:id/reply', authenticate, authorize('station_owner', 'admin'), reviewController.replyToReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

export default router;
