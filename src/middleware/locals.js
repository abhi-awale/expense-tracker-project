const { formatCurrency } = require('../utils/formatters');

module.exports = (req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.csrfToken = req.csrfToken ? req.csrfToken() : '';
  res.locals.successMessages = req.flash('success');
  res.locals.infoMessages = req.flash('info');
  res.locals.errorMessages = req.flash('error');
  res.locals.validationErrors = req.flash('validationErrors')[0] || {};
  res.locals.oldInput = req.flash('oldInput')[0] || {};
  res.locals.helpers = {
    formatCurrency,
  };
  next();
};
