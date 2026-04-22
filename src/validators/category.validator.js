const { body } = require('express-validator');

module.exports = [
  body('name').trim().notEmpty().withMessage('Category name is required.').isLength({ max: 60 }),
  body('description').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
];
