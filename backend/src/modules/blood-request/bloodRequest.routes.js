import { Router } from 'express';
import * as bloodRequestController from './bloodRequest.controller.js';
import {
  createRequestValidator,
  listRequestsValidator,
  nearbyRequestsValidator,
  requestIdValidator,
  updateStatusValidator,
} from './bloodRequest.validator.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

router.get(
  '/nearby',
  authorize('donor'),
  nearbyRequestsValidator,
  validate,
  bloodRequestController.getNearbyRequests
);

router.post(
  '/',
  authorize('hospital'),
  createRequestValidator,
  validate,
  bloodRequestController.createRequest
);

router.get(
  '/',
  listRequestsValidator,
  validate,
  bloodRequestController.listRequests
);

router.get(
  '/:id',
  requestIdValidator,
  validate,
  bloodRequestController.getRequest
);

router.patch(
  '/:id/respond',
  authorize('donor'),
  requestIdValidator,
  validate,
  bloodRequestController.respondToRequest
);

router.patch(
  '/:id/status',
  authorize('hospital'),
  updateStatusValidator,
  validate,
  bloodRequestController.updateStatus
);

export default router;
