const { body } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('Valid email is required.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match.'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const forgotPasswordRules = [
  body('email').trim().isEmail().withMessage('Valid email is required.'),
];

const resetPasswordRules = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match.'),
];

module.exports = {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
};
