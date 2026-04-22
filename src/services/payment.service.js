const crypto = require('crypto');
const { Cashfree, CFEnvironment } = require('cashfree-pg');
const env = require('../config/env');
const { PaymentTransaction, User } = require('../models');

const isCashfreeConfigured = () => Boolean(env.cashfree.appId && env.cashfree.secretKey);

const extractCashfreeErrorMessage = (error) => {
  const providerMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error_description ||
    error?.response?.data?.type ||
    error?.message;

  if (error?.response?.status === 401) {
    return `Cashfree returned 401 Unauthorized. Verify that CASHFREE_ENV matches your keys and that CASHFREE_APP_ID and CASHFREE_SECRET_KEY are from the same Cashfree account/environment. Provider message: ${providerMessage}`;
  }

  return providerMessage || 'Cashfree request failed.';
};

const getCashfreeClient = () =>
  new Cashfree(
    env.cashfree.env === 'production' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
    env.cashfree.appId,
    env.cashfree.secretKey
  );

const createPremiumOrder = async (user) => {
  if (!isCashfreeConfigured()) {
    throw new Error('Cashfree credentials are missing. Please configure CASHFREE_APP_ID and CASHFREE_SECRET_KEY.');
  }
  
  try {
    const cashfreeClient = getCashfreeClient();
    const orderId = `premium_${user.id}_${Date.now()}`;

    const response = await cashfreeClient.PGCreateOrder({
      order_id: orderId,
      order_amount: env.premiumPrice,
      order_currency: 'INR',
      customer_details: {
        customer_id: `user_${user.id}`,
        customer_name: user.name,
        customer_email: user.email,
        customer_phone: '9999999999',
      },
      order_meta: {
        return_url: `${env.appUrl}/billing/cashfree/return?order_id=${orderId}`,
      },
      order_note: 'ExpensePilot premium upgrade',
      order_tags: {
        feature: 'premium_upgrade',
        user_id: String(user.id),
        request_id: crypto.randomUUID(),
      },
    });

    const payload = response.data;

    await PaymentTransaction.create({
      orderId,
      providerOrderId: payload.cf_order_id,
      paymentSessionId: payload.payment_session_id,
      featureKey: 'premium_upgrade',
      amount: env.premiumPrice,
      currency: 'INR',
      userId: user.id,
      status: payload.order_status || 'ACTIVE',
      metadata: payload,
    });

    return {
      orderId,
      paymentSessionId: payload.payment_session_id,
      mode: env.cashfree.env,
      amount: env.premiumPrice,
    };
  } catch (error) {
    throw new Error(extractCashfreeErrorMessage(error));
  }
};

const fetchOrder = async (orderId) => {
  const cashfreeClient = getCashfreeClient();
  const response = await cashfreeClient.PGFetchOrder(orderId);
  return response.data;
};

const fetchOrderPayments = async (orderId) => {
  const cashfreeClient = getCashfreeClient();
  const response = await cashfreeClient.PGOrderFetchPayments(orderId);
  return response.data;
};

const verifyPremiumOrder = async (orderId, userId) => {
  const transaction = await PaymentTransaction.findOne({
    where: { orderId, userId, featureKey: 'premium_upgrade' },
  });

  if (!transaction) {
    throw new Error('Payment order not found.');
  }

  let orderData;
  let payments;

  try {
    [orderData, payments] = await Promise.all([fetchOrder(orderId), fetchOrderPayments(orderId)]);
  } catch (error) {
    throw new Error(extractCashfreeErrorMessage(error));
  }

  const isPaid = orderData.order_status === 'PAID';

  transaction.status = orderData.order_status || transaction.status;
  transaction.metadata = {
    order: orderData,
    payments,
  };
  transaction.providerOrderId = orderData.cf_order_id || transaction.providerOrderId;
  transaction.paymentSessionId = orderData.payment_session_id || transaction.paymentSessionId;
  transaction.paidAt = isPaid ? new Date() : transaction.paidAt;
  await transaction.save();

  if (isPaid) {
    const user = await User.findByPk(userId);
    user.isPremium = true;
    user.premiumPlan = 'premium';
    user.premiumActivatedAt = new Date();
    await user.save();
  }

  return {
    transaction,
    isPaid,
  };
};

module.exports = {
  createPremiumOrder,
  verifyPremiumOrder,
  isCashfreeConfigured,
  extractCashfreeErrorMessage,
};
