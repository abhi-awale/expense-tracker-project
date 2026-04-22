const { User } = require('../models');
const { AUTH_COOKIE, verifyAuthToken, authCookieOptions } = require('../utils/jwt');

module.exports = async (req, res, next) => {
  const token = req.cookies[AUTH_COOKIE];
  req.user = null;

  if (!token) {
    return next();
  }

  try {
    const payload = verifyAuthToken(token);
    const user = await User.findByPk(payload.id, {
      attributes: ['id', 'name', 'email', 'isPremium', 'premiumPlan', 'premiumActivatedAt'],
    });

    if (!user) {
      res.clearCookie(AUTH_COOKIE, authCookieOptions);
      return next();
    }

    req.user = user;
    return next();
  } catch (error) {
    res.clearCookie(AUTH_COOKIE, authCookieOptions);
    return next();
  }
};
