import express from 'express';
import * as adminController from '#controllers/admin.controller';
import { authenticate, authorize } from '#middleware/authMiddleware';

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/overview', adminController.getOverview);

export default router;
