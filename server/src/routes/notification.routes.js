import express from 'express';
import * as notificationController from '#controllers/notification.controller';
import { authenticate } from '#middleware/authMiddleware';

const router = express.Router();

router.use(authenticate);

router.get('/', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

export default router;
