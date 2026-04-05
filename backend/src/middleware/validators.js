import { body, validationResult } from 'express-validator';

export const validateCreateOrder = [
  body('planId')
    .isIn(['pro', 'elite'])
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
    .isIn(['pro', 'elite'])
    .withMessage('Invalid tier'),
  body('planId')
    .isIn(['pro', 'elite'])
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
