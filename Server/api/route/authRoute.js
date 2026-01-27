const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { registerValidation, loginValidation, validate } = require('../validator/authValidator');

router.post('/register', registerValidation, validate, authController.register);

router.post('/login', loginValidation, validate, authController.login);

router.post('/logout', authMiddleware, authController.logout);

router.post('/refresh-token', authController.refreshToken);

router.get('/profile', authMiddleware, authController.getProfile);

router.get('/sessions', authMiddleware, authController.getSessions);

module.exports = router;