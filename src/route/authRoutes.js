const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.create);

router.post('/login', authController.login);

router.get('/verify-email', authController.verifyEmail);

router.get('/:id/resend-verification', authController.resendVerifyEmail);

module.exports = router;