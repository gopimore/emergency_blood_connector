import { Router } from 'express';
import * as hospitalController from './hospital.controller.js';
import { updateProfileValidator } from './hospital.validator.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate, authorize('hospital'));

router.get('/profile', hospitalController.getProfile);
router.patch(
  '/profile',
  updateProfileValidator,
  validate,
  hospitalController.updateProfile
);
router.get('/requests', hospitalController.getRequests);

export default router;
