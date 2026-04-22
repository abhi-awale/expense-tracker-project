const { User } = require('../models');
const env = require('../config/env');
const { AUTH_COOKIE, signAuthToken, authCookieOptions } = require('../utils/jwt');

const showAccount = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'name', 'email', 'createdAt', 'isPremium', 'premiumPlan', 'premiumActivatedAt'],
  });

  res.render('account/index', {
    title: 'Account',
    accountUser: user,
    premiumPrice: env.premiumPrice,
  });
};

const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const existingUser = await User.findOne({
    where: { email },
  });

  if (existingUser && existingUser.id !== req.user.id) {
    req.flash('error', 'That email is already in use by another account.');
    req.flash('oldInput', req.body);
    return res.redirect('/account');
  }

  const user = await User.findByPk(req.user.id);
  user.name = name;
  user.email = email;
  await user.save();

  res.cookie(AUTH_COOKIE, signAuthToken(user), authCookieOptions);

  req.flash('success', 'Account details updated successfully.');
  return res.redirect('/account');
};

const updatePassword = async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!(await user.verifyPassword(req.body.currentPassword))) {
    req.flash('error', 'Current password is incorrect.');
    return res.redirect('/account');
  }

  user.passwordHash = req.body.newPassword;
  await user.save();

  res.cookie(AUTH_COOKIE, signAuthToken(user), authCookieOptions);

  req.flash('success', 'Password updated successfully.');
  return res.redirect('/account');
};

module.exports = {
  showAccount,
  updateProfile,
  updatePassword,
};
