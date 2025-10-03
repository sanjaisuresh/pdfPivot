const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyEmail, verifySecurityAnswers, resetPassword } = require('../controller/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password/verify-email', verifyEmail);
router.post('/forgot-password/verify-answers', verifySecurityAnswers);
router.post('/forgot-password/reset', resetPassword);

// Protected routes
router.get('/me', auth, getMe);

module.exports = router; 