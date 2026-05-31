import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from './auth.controller.js';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updatePasswordValidator,
} from './auth.validator.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply strict rate limiting only to endpoints that are sensitive to abuse
// (login, register, and forgot-password). Do not globally apply to /me,
// logout or refresh-token which may be called frequently by authenticated clients.
router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authenticate, authController.getMe);
router.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordValidator,
  validate,
  authController.forgotPassword
);
router.patch(
  '/reset-password/:token',
  resetPasswordValidator,
  validate,
  authController.resetPassword
);
router.get('/verify-email/:token', authController.verifyEmail);
router.patch(
  '/update-password',
  authenticate,
  updatePasswordValidator,
  validate,
  authController.updatePassword
);

export default router;
