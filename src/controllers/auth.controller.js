const crypto = require('crypto');
const { Op } = require('sequelize');
const { User } = require('../models');
const env = require('../config/env');
const { AUTH_COOKIE, signAuthToken, authCookieOptions } = require('../utils/jwt');
const { isEmailConfigured, sendPasswordResetEmail } = require('../services/email.service');

const showLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

const showRegister = (req, res) => {
  res.render('auth/register', { title: 'Register' });
};

const showForgotPassword = (req, res) => {
  res.render('auth/forgot-password', { title: 'Forgot Password' });
};

const showResetPassword = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: {
        [Op.gt]: new Date(),
      },
    },
  });

  if (!user) {
    req.flash('error', 'This password reset link is invalid or has expired.');
    return res.redirect('/auth/forgot-password');
  }

  return res.render('auth/reset-password', {
    title: 'Reset Password',
    token: req.params.token,
  });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    req.flash('error', 'An account with that email already exists.');
    req.flash('oldInput', req.body);
    return res.redirect('/auth/register');
  }

  const user = await User.create({
    name,
    email,
    passwordHash: password,
  });

  const token = signAuthToken(user);
  res.cookie(AUTH_COOKIE, token, authCookieOptions);

  req.flash('success', 'Welcome aboard. Your account has been created.');
  return res.redirect('/dashboard');
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user || !(await user.verifyPassword(password))) {
    req.flash('error', 'Invalid email or password.');
    req.flash('oldInput', { email });
    return res.redirect('/auth/login');
  }

  const token = signAuthToken(user);
  res.cookie(AUTH_COOKIE, token, authCookieOptions);

  req.flash('success', `Welcome back, ${user.name}.`);
  return res.redirect('/dashboard');
};

const logout = (req, res) => {
  res.clearCookie(AUTH_COOKIE, authCookieOptions);
  return res.redirect('/auth/login');
};

const forgotPassword = async (req, res) => {
  const user = await User.findOne({
    where: {
      email: req.body.email,
    },
  });

  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const resetUrl = `${env.appUrl}/auth/reset-password/${rawToken}`;

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();

    try {
      const emailResult = await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
      });

      if (!emailResult.sent && env.nodeEnv !== 'production') {
        req.flash('info', `Reset link: ${resetUrl}`);
      }
    } catch (error) {
      console.error('Password reset email failed:', error);

      if (env.nodeEnv !== 'production' || !isEmailConfigured()) {
        req.flash('info', `Reset link: ${resetUrl}`);
      } else {
        req.flash('error', 'We could not send the reset email right now. Please try again.');
        return res.redirect('/auth/forgot-password');
      }
    }
  }

  req.flash('success', 'If an account exists for that email, a password reset link is ready.');
  return res.redirect('/auth/forgot-password');
};

const resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: {
        [Op.gt]: new Date(),
      },
    },
  });

  if (!user) {
    req.flash('error', 'This password reset link is invalid or has expired.');
    return res.redirect('/auth/forgot-password');
  }

  user.passwordHash = req.body.password;
  user.resetPasswordToken = null;
  user.resetPasswordExpiresAt = null;
  await user.save();

  const token = signAuthToken(user);
  res.cookie(AUTH_COOKIE, token, authCookieOptions);

  req.flash('success', 'Your password has been reset successfully.');
  return res.redirect('/dashboard');
};

module.exports = {
  showLogin,
  showRegister,
  showForgotPassword,
  showResetPassword,
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
