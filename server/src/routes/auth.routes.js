import express from 'express';
import * as authController from '#controllers/auth.controller';
import validate from '#middleware/validate';
import { registerSchema, loginSchema } from '#validators/auth.validator';
import { loginLimiter, registerLimiter } from '#middleware/rateLimiter';
import { authenticate } from '#middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerLimiter, validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/reset-password', authController.resetPassword);
router.get('/me', authenticate, authController.getMe);

export default router;
