const { body } = require('express-validator');

const updateProfileRules = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 80 }),
  body('email').trim().isEmail().withMessage('Valid email is required.'),
];

const updatePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long.')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('New password must be different from the current password.'),
  body('confirmNewPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('New passwords do not match.'),
];

module.exports = {
  updateProfileRules,
  updatePasswordRules,
};
