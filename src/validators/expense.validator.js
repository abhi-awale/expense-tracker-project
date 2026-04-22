const { body } = require('express-validator');

module.exports = [
  body('title').trim().notEmpty().withMessage('Expense title is required.').isLength({ max: 100 }),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than zero.'),
  body('expenseDate').isISO8601().withMessage('A valid expense date is required.'),
  body('categoryId').isInt({ gt: 0 }).withMessage('Please select a category.'),
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
];
