const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');
const stripeController  = require('../controller/subscriptionController');

const {
    createPlan,
    getPlans,
    updatePlan,
    deletePlan
} = require('../controllers/subscriptionController');

// Public routes
router.get('/plans', getPlans);
router.get('/plans/:id', stripeController.getPlanById);

// Protected admin routes
router.post('/plans', auth, admin, createPlan);
router.put('/plans/:id', auth, admin, updatePlan);
router.delete('/plans/:id', auth, admin, deletePlan);
router.post('/create-checkout-session',auth, stripeController.createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.stripeWebhook);
module.exports = router;
