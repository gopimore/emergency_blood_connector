import { body } from 'express-validator';

export const updateProfileValidator = [
  body('hospitalName').optional().trim().notEmpty().withMessage('Hospital name cannot be empty'),
  body('registrationNo')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Registration number cannot be empty'),
  body('contactPhone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Contact phone cannot be empty'),
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be [longitude, latitude]'),
  body('address.city').optional().isString().trim(),
  body('address.state').optional().isString().trim(),
  body('address.pincode').optional().isString().trim(),
];
