const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getSubscriptionStatus,
    cancelSubscription,
    getUserPayments
} = require('../controllers/paymentController.js');

// Subscription routes
router.get('/', auth, getUserPayments);
router.get('/subscription-status', auth, getSubscriptionStatus);
router.post('/cancel-subscription', auth, cancelSubscription);

module.exports = router; 