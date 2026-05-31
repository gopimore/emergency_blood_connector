import { body, query } from 'express-validator';
import DonorProfile from '../../models/DonorProfile.model.js';

const bloodGroups = DonorProfile.schema.path('bloodGroup').enumValues;

export const setupProfileValidator = [
  body('bloodGroup')
    .notEmpty()
    .withMessage('Blood group is required')
    .isIn(bloodGroups)
    .withMessage('Invalid blood group'),
];

export const updateProfileValidator = [
  body('bloodGroup')
    .optional()
    .isIn(bloodGroups)
    .withMessage('Invalid blood group'),
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be [longitude, latitude]'),
  body('location.coordinates.*')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid coordinate value'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
  body('lastDonated')
    .optional()
    .isISO8601()
    .withMessage('lastDonated must be a valid date'),
  body('medicalConditions')
    .optional()
    .isArray()
    .withMessage('medicalConditions must be an array'),
  body('medicalConditions.*')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Each medical condition must be a non-empty string'),
];

export const nearbyDonorsValidator = [
  query('bloodGroup')
    .notEmpty()
    .withMessage('bloodGroup is required')
    .isIn(bloodGroups)
    .withMessage('Invalid blood group'),
  query('longitude')
    .notEmpty()
    .withMessage('longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  query('latitude')
    .notEmpty()
    .withMessage('latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  query('radius')
    .optional()
    .isInt({ min: 1000, max: 100000 })
    .withMessage('radius must be between 1000 and 100000 meters'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];

export const historyValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];
