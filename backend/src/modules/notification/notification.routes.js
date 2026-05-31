import { Router } from 'express';
import { param } from 'express-validator';
import * as notificationController from './notification.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.patch(
  '/read-all',
  notificationController.markAllRead
);
router.patch(
  '/:id/read',
  param('id').isMongoId().withMessage('Invalid notification id'),
  validate,
  notificationController.markRead
);

export default router;
