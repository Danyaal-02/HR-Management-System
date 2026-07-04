import { body, validationResult } from 'express-validator';
import { COMMON_MESSAGES } from '../constants/messages.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: COMMON_MESSAGES.VALIDATION_FAILED,
      errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

// Admin/HR sign up
export const signupValidation = [
  body('company_name')
    .trim()
    .notEmpty().withMessage('Company name is required'),

  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),

  body('last_name')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email'),

  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any').withMessage('Enter a valid phone number'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Min 8 characters')
    .matches(/[A-Z]/).withMessage('Need one uppercase')
    .matches(/[a-z]/).withMessage('Need one lowercase')
    .matches(/[0-9]/).withMessage('Need one number')
    .matches(/[!@#$%^&*]/).withMessage('Need one special character'),

  body('confirm_password')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error('Passwords do not match');
      return true;
    }),

  handleValidationErrors,
];

// Login
export const loginValidation = [
  body('login_id')
    .trim()
    .notEmpty().withMessage('Login ID or Email is required'),

  body('password')
    .notEmpty().withMessage('Password is required'),

  handleValidationErrors,
];

// Admin creates employee
export const createEmployeeValidation = [
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('2-50 characters'),

  body('last_name')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('2-50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email'),

  body('date_of_joining')
    .notEmpty().withMessage('Date of joining is required')
    .isISO8601().withMessage('Must be YYYY-MM-DD'),

  body('department')
    .optional()
    .trim(),

  body('designation')
    .optional()
    .trim(),

  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any').withMessage('Enter a valid phone number'),

  handleValidationErrors,
];

// Change password
export const changePasswordValidation = [
  body('current_password')
    .notEmpty().withMessage('Current password is required'),

  body('new_password')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Min 8 characters')
    .matches(/[A-Z]/).withMessage('Need one uppercase')
    .matches(/[a-z]/).withMessage('Need one lowercase')
    .matches(/[0-9]/).withMessage('Need one number')
    .matches(/[!@#$%^&*]/).withMessage('Need one special character'),

  handleValidationErrors,
];
