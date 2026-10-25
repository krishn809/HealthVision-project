import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array().map(err => err.msg)
    });
  }
  next();
};

export const registerValidation = [
  body('name.first').notEmpty().withMessage('First name is required'),
  body('name.last').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('dateOfBirth').optional(),
  body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('bloodGroup').optional(),
  body('emergencyContact.name').optional(),
  body('emergencyContact.phone').optional(),
  body('emergencyContact.relation').optional(),
  body('avatarUrl').optional(),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required'),
];

export const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please include a valid email'),
];

export const resetPasswordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const updateProfileValidation = [
  body('name.first').optional().notEmpty().withMessage('First name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please include a valid email'),
  body('phone').optional().notEmpty().withMessage('Phone number cannot be empty'),
  body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']).withMessage('Invalid blood group'),
  body('avatarUrl').optional(),
];
