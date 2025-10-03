const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
    getDashboardStats,
    getAllUsers,
    updateUserPlan,
    updateUserRole,
    updateUserStatus
} = require('../controllers/adminController');
const {
    getFilteredPaymentsForAdmin
} = require('../controllers/paymentController');

// Apply middleware to all routes
router.use((req, res, next) => {
    auth(req, res, (err) => {
        if (err) return next(err);
        admin(req, res, next);
    });
});

// Get dashboard statistics
router.get('/dashboard/stats', getDashboardStats);

// Get all users
router.get('/users', getAllUsers);

// Update user's plan
router.put('/users/:userId/plan', updateUserPlan);

// Update user's role
router.put('/users/:userId/role', updateUserRole);

// Update user's status
router.put('/users/:userId/status', updateUserStatus);
router.get('/payments',admin, getFilteredPaymentsForAdmin);

module.exports = router; 