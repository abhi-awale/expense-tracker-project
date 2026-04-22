const env = require('../config/env');
const { createPremiumOrder, verifyPremiumOrder, isCashfreeConfigured } = require('../services/payment.service');

const createCheckoutSession = async (req, res) => {
  if (req.user.isPremium) {
    return res.status(409).json({
      message: 'Your account is already on the premium plan.',
    });
  }

  const session = await createPremiumOrder(req.user);
  return res.json({
    ...session,
    priceLabel: `INR ${env.premiumPrice}`,
  });
};

const handleCashfreeReturn = async (req, res) => {
  const orderId = req.query.order_id;

  if (!orderId) {
    req.flash('error', 'Payment verification could not find an order reference.');
    return res.redirect('/account');
  }

  if (!isCashfreeConfigured()) {
    req.flash('error', 'Cashfree credentials are not configured yet.');
    return res.redirect('/account');
  }

  try {
    const { isPaid } = await verifyPremiumOrder(orderId, req.user.id);

    if (isPaid) {
      req.flash('success', 'Premium activated successfully. Report exports and custom categories are now unlocked.');
    } else {
      req.flash('error', 'Payment is still pending or was not completed.');
    }
  } catch (error) {
    req.flash('error', error.message || 'Unable to verify your payment right now.');
  }

  return res.redirect('/account');
};

module.exports = {
  createCheckoutSession,
  handleCashfreeReturn,
};
