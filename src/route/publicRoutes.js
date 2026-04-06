const express = require('express');
const response = require('../utils/response');

const router = express.Router();

router.get('/', (req, res) => {
    return response.view(res, 'index');
});

router.get('/login', (req, res) => {
    return response.view(res, 'login');
});

router.get('/register', (req, res) => {
    return response.view(res, 'register');
});

module.exports = router;