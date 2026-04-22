const jwt = require('jsonwebtoken');
const env = require('../config/env');

const AUTH_COOKIE = 'expensepilot_token';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 12;

const signAuthToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    env.jwtSecret,
    { expiresIn: '12h' }
  );

const verifyAuthToken = (token) => jwt.verify(token, env.jwtSecret);

const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.nodeEnv === 'production',
  maxAge: COOKIE_MAX_AGE,
};

module.exports = {
  AUTH_COOKIE,
  COOKIE_MAX_AGE,
  signAuthToken,
  verifyAuthToken,
  authCookieOptions,
};
