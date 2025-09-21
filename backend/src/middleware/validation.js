const { body, param, query, validationResult } = require('express-validator');

// Handle validation results
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidation
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidation
];

// Sweet validation rules
const sweetValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Sweet name must be between 1 and 100 characters'),
  body('category')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number')
    .custom((value) => {
      if (value > 999.99) {
        throw new Error('Price cannot exceed $999.99');
      }
      return true;
    }),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer')
    .custom((value) => {
      if (value > 10000) {
        throw new Error('Quantity cannot exceed 10,000');
      }
      return true;
    }),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('image')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Image emoji cannot exceed 10 characters'),
  handleValidation
];

// Parameter validation
const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidation
];

// Purchase validation
const purchaseValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items array is required and must not be empty'),
  body('items.*.sweetId')
    .isMongoId()
    .withMessage('Invalid sweet ID format'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  handleValidation
];

// Search validation
const searchValidation = [
  query('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search name cannot exceed 100 characters'),
  query('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be non-negative'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be non-negative')
    .custom((value, { req }) => {
      if (req.query.minPrice && parseFloat(value) < parseFloat(req.query.minPrice)) {
        throw new Error('Maximum price must be greater than minimum price');
      }
      return true;
    }),
  handleValidation
];

// Restock validation
const restockValidation = [
  body('quantity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Restock quantity must be between 1 and 1000'),
  handleValidation
];

module.exports = {
  registerValidation,
  loginValidation,
  sweetValidation,
  idValidation,
  purchaseValidation,
  searchValidation,
  restockValidation
};
