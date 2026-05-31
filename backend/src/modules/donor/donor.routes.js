import { Router } from 'express';
import * as donorController from './donor.controller.js';
import {
  setupProfileValidator,
  updateProfileValidator,
  nearbyDonorsValidator,
  historyValidator,
} from './donor.validator.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

router.get(
  '/nearby',
  authorize('hospital', 'admin'),
  nearbyDonorsValidator,
  validate,
  donorController.getNearbyDonors
);

router.post(
  '/setup',
  authorize('donor'),
  setupProfileValidator,
  validate,
  donorController.setupProfile
);

router.use(authorize('donor'));

router.get('/profile', donorController.getProfile);
router.patch(
  '/profile',
  updateProfileValidator,
  validate,
  donorController.updateProfile
);
router.patch('/availability', donorController.toggleAvailability);
router.get(
  '/history',
  historyValidator,
  validate,
  donorController.getDonationHistory
);

export default router;
