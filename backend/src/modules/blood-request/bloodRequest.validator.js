import { body, param, query } from 'express-validator';
import DonorProfile from '../../models/DonorProfile.model.js';

const bloodGroups = DonorProfile.schema.path('bloodGroup').enumValues;

export const createRequestValidator = [
  body('bloodGroup')
    .notEmpty()
    .withMessage('bloodGroup is required')
    .isIn(bloodGroups)
    .withMessage('Invalid blood group'),
  body('unitsRequired')
    .isInt({ min: 1 })
    .withMessage('unitsRequired must be at least 1'),
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'critical'])
    .withMessage('Invalid urgency level'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('location.coordinates must be [longitude, latitude]'),
  body('expiresAt').optional().isISO8601().withMessage('expiresAt must be a valid date'),
];

export const listRequestsValidator = [
  query('status')
    .optional()
    .isIn(['open', 'in-progress', 'fulfilled', 'cancelled'])
    .withMessage('Invalid status'),
  query('bloodGroup').optional().isIn(bloodGroups).withMessage('Invalid blood group'),
  query('urgency')
    .optional()
    .isIn(['low', 'medium', 'critical'])
    .withMessage('Invalid urgency'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];

export const nearbyRequestsValidator = [
  query('longitude')
    .notEmpty()
    .withMessage('longitude is required')
    .isFloat({ min: -180, max: 180 }),
  query('latitude')
    .notEmpty()
    .withMessage('latitude is required')
    .isFloat({ min: -90, max: 90 }),
  query('bloodGroup').optional().isIn(bloodGroups).withMessage('Invalid blood group'),
  query('radius').optional().isInt({ min: 1000, max: 100000 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];

export const requestIdValidator = [
  param('id').isMongoId().withMessage('Invalid request id'),
];

export const updateStatusValidator = [
  ...requestIdValidator,
  body('status')
    .notEmpty()
    .withMessage('status is required')
    .isIn(['in-progress', 'fulfilled', 'cancelled'])
    .withMessage('Invalid status'),
  body('unitsFulfilled')
    .optional()
    .isInt({ min: 0 })
    .withMessage('unitsFulfilled must be a non-negative integer'),
];
