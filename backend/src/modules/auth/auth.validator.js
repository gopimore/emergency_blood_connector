import { body } from 'express-validator';
import DonorProfile from '../../models/DonorProfile.model.js';

const bloodGroups = DonorProfile.schema.path('bloodGroup').enumValues;

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('role')
    .isIn(['donor', 'hospital', 'admin'])
    .withMessage('Role must be donor, hospital, or admin'),
  body('bloodGroup')
    .if(body('role').equals('donor'))
    .notEmpty()
    .withMessage('Blood group is required for donors')
    .isIn(bloodGroups)
    .withMessage('Invalid blood group'),
  body('hospitalName')
    .if(body('role').equals('hospital'))
    .notEmpty()
    .withMessage('Hospital name is required for hospitals'),
  body('registrationNo')
    .if(body('role').equals('hospital'))
    .notEmpty()
    .withMessage('Registration number is required for hospitals'),
  body('contactPhone')
    .if(body('role').equals('hospital'))
    .notEmpty()
    .withMessage('Contact phone is required for hospitals'),
];

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
];

export const resetPasswordValidator = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

export const updatePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];
