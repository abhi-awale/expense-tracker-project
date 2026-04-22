const { validationResult } = require('express-validator');

const handleValidation = (view) => (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().reduce((acc, error) => {
    acc[error.path] = error.msg;
    return acc;
  }, {});

  req.flash('validationErrors', errors);
  req.flash('oldInput', req.body);
  req.flash('error', 'Please fix the highlighted errors.');

  return res.redirect(typeof view === 'function' ? view(req) : view);
};

module.exports = {
  handleValidation,
};
