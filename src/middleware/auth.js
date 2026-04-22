const requireAuth = (req, res, next) => {
  if (!req.user) {
    req.flash('error', 'Please sign in to continue.');
    return res.redirect('/auth/login');
  }

  return next();
};

const requireGuest = (req, res, next) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }

  return next();
};

const requirePremiumPage = (req, res, next) => {
  if (req.user?.isPremium) {
    return next();
  }

  req.flash('error', 'This feature is available on the premium plan.');
  return res.redirect('/account');
};

const requirePremiumApi = (req, res, next) => {
  if (req.user?.isPremium) {
    return next();
  }

  return res.status(403).json({
    message: 'This feature is available on the premium plan.',
  });
};

module.exports = {
  requireAuth,
  requireGuest,
  requirePremiumPage,
  requirePremiumApi,
};
