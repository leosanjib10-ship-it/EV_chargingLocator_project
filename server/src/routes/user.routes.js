import express from 'express';
import * as userController from '#controllers/user.controller';
import { authenticate, authorize } from '#middleware/authMiddleware';

const router = express.Router();

// All routes below require authentication; admin-only routes are further restricted.
router.get('/stats/summary', authenticate, authorize('admin'), userController.getUserStatistics);
router.get('/search/query', authenticate, authorize('admin'), userController.searchUsers);

router.get('/', authenticate, authorize('admin'), userController.getAllUsers);
router.get('/:id', authenticate, userController.getUserById);
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

router.put('/:id/change-password', authenticate, userController.changePassword);
router.put('/:id/deactivate', authenticate, authorize('admin'), userController.deactivateUser);
router.put('/:id/reactivate', authenticate, authorize('admin'), userController.reactivateUser);

export default router;
