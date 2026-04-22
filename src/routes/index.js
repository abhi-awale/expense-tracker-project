const express = require('express');
const asyncHandler = require('../utils/async-handler');
const homeController = require('../controllers/home.controller');
const authController = require('../controllers/auth.controller');
const accountController = require('../controllers/account.controller');
const billingController = require('../controllers/billing.controller');
const dashboardController = require('../controllers/dashboard.controller');
const expenseController = require('../controllers/expense.controller');
const categoryController = require('../controllers/category.controller');
const reportController = require('../controllers/report.controller');
const authValidator = require('../validators/auth.validator');
const accountValidator = require('../validators/account.validator');
const expenseValidator = require('../validators/expense.validator');
const categoryValidator = require('../validators/category.validator');
const { handleValidation } = require('../validators');
const { requireAuth, requireGuest, requirePremiumPage } = require('../middleware/auth');

const router = express.Router();
router.get('/', homeController.showLandingPage);

router.get('/auth/login', requireGuest, authController.showLogin);
router.post(
  '/auth/login',
  requireGuest,
  authValidator.loginRules,
  handleValidation('/auth/login'),
  asyncHandler(authController.login)
);
router.get('/auth/register', requireGuest, authController.showRegister);
router.post(
  '/auth/register',
  requireGuest,
  authValidator.registerRules,
  handleValidation('/auth/register'),
  asyncHandler(authController.register)
);
router.get('/auth/forgot-password', requireGuest, authController.showForgotPassword);
router.post(
  '/auth/forgot-password',
  requireGuest,
  authValidator.forgotPasswordRules,
  handleValidation('/auth/forgot-password'),
  asyncHandler(authController.forgotPassword)
);
router.get('/auth/reset-password/:token', requireGuest, asyncHandler(authController.showResetPassword));
router.post(
  '/auth/reset-password/:token',
  requireGuest,
  authValidator.resetPasswordRules,
  handleValidation((req) => `/auth/reset-password/${req.params.token}`),
  asyncHandler(authController.resetPassword)
);
router.post('/auth/logout', requireAuth, authController.logout);

router.get('/dashboard', requireAuth, asyncHandler(dashboardController.showDashboard));

router.get('/account', requireAuth, asyncHandler(accountController.showAccount));
router.post(
  '/account/profile',
  requireAuth,
  accountValidator.updateProfileRules,
  handleValidation('/account'),
  asyncHandler(accountController.updateProfile)
);
router.post(
  '/account/password',
  requireAuth,
  accountValidator.updatePasswordRules,
  handleValidation('/account'),
  asyncHandler(accountController.updatePassword)
);
router.post('/api/billing/premium/checkout', requireAuth, asyncHandler(billingController.createCheckoutSession));
router.get('/billing/cashfree/return', requireAuth, asyncHandler(billingController.handleCashfreeReturn));

router.get('/expenses', requireAuth, asyncHandler(expenseController.list));
router.post(
  '/expenses',
  requireAuth,
  expenseValidator,
  handleValidation('/expenses'),
  asyncHandler(expenseController.create)
);
router.get('/api/expenses', requireAuth, asyncHandler(expenseController.listJson));
router.put('/api/expenses/:id', requireAuth, asyncHandler(expenseController.update));
router.delete('/api/expenses/:id', requireAuth, asyncHandler(expenseController.remove));
router.get('/expenses/export/pdf', requireAuth, requirePremiumPage, asyncHandler(expenseController.exportPdf));
router.get('/expenses/export/excel', requireAuth, requirePremiumPage, asyncHandler(expenseController.exportExcel));

router.get('/categories', requireAuth, asyncHandler(categoryController.list));
router.post(
  '/categories',
  requireAuth,
  categoryValidator,
  handleValidation('/categories'),
  asyncHandler(categoryController.create)
);
router.delete('/api/categories/:id', requireAuth, asyncHandler(categoryController.remove));

router.get('/reports', requireAuth, asyncHandler(reportController.showReports));
router.get('/api/reports/insights', requireAuth, asyncHandler(reportController.getInsights));
router.get('/reports/export/pdf', requireAuth, requirePremiumPage, asyncHandler(reportController.exportPdf));
router.get('/reports/export/excel', requireAuth, requirePremiumPage, asyncHandler(reportController.exportExcel));

module.exports = router;
