const crypto = require('crypto');

const CSRF_COOKIE = 'expensepilot_csrf';

const ensureCsrfToken = (req, res, next) => {
  const existingToken = req.cookies[CSRF_COOKIE];
  const token = existingToken || crypto.randomBytes(24).toString('hex');

  if (!existingToken) {
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  req.csrfToken = () => token;
  next();
};

const verifyCsrfToken = (req, res, next) => {
  const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

  if (safeMethods.has(req.method)) {
    return next();
  }

  const cookieToken = req.cookies[CSRF_COOKIE];
  const requestToken = req.body._csrf || req.headers['x-csrf-token'];

  if (cookieToken && requestToken && cookieToken === requestToken) {
    return next();
  }

  if (req.headers.accept?.includes('application/json')) {
    return res.status(403).json({ message: 'Invalid CSRF token.' });
  }

  req.flash('error', 'Your form session expired. Please try again.');
  return res.redirect('back');
};

module.exports = {
  ensureCsrfToken,
  verifyCsrfToken,
};
