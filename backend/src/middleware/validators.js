import { body, validationResult } from 'express-validator';

export const validateCreateOrder = [
  body('planId')
    .isIn(['pro'])
    .withMessage('Invalid plan selected'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number'),
  body('currency')
    .optional()
    .isIn(['INR', 'USD'])
    .withMessage('Invalid currency'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

export const validateVerifyPayment = [
  body('razorpay_order_id')
    .matches(/^order_[A-Za-z0-9]{14}$/)
    .withMessage('Invalid order ID format'),
  body('razorpay_payment_id')
    .matches(/^pay_[A-Za-z0-9]{14}$/)
    .withMessage('Invalid payment ID format'),
  body('razorpay_signature')
    .isHexadecimal()
    .isLength({ min: 64, max: 64 })
    .withMessage('Invalid signature format'),
  body('user_email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email'),
  body('tier')
    .isIn(['pro'])
    .withMessage('Invalid tier'),
  body('planId')
    .isIn(['pro'])
    .withMessage('Invalid plan selected'),
  body('amount')
    .isNumeric()
    .withMessage('Amount is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

export const validateUpdateProfile = [
  body('displayName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage('Name must be 1-60 characters'),
  body('username')
    .optional({ nullable: true })
    .isString()
    .trim()
    .matches(/^(?=.*[A-Z])[A-Za-z0-9._-]{3,30}$/)
    .withMessage(
      'Username must be 3-30 characters (letters, numbers, dot, underscore, hyphen) with at least one capital letter'
    ),
  body('avatarUrl')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 500 })
    .withMessage('Invalid avatar URL'),
  body('avatarPublicId')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 300 })
    .withMessage('Invalid avatar reference'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];
