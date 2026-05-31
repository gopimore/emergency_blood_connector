import { Router } from 'express';
import { param } from 'express-validator';
import * as adminController from './admin.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.patch(
  '/users/:id/ban',
  param('id').isMongoId().withMessage('Invalid user id'),
  validate,
  adminController.banUser
);
router.patch(
  '/users/:id/unban',
  param('id').isMongoId().withMessage('Invalid user id'),
  validate,
  adminController.unbanUser
);
router.delete(
  '/users/:id',
  param('id').isMongoId().withMessage('Invalid user id'),
  validate,
  adminController.deleteUser
);

export default router;
