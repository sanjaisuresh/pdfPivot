const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// @desc    Update user plan
// @route   PUT /api/admin/users/:userId/plan
// @access  Private/Admin
const updateUserPlan = asyncHandler(async (req, res) => {
    const { plan } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!['Basic', 'Developer', 'Business'].includes(plan)) {
        res.status(400);
        throw new Error('Invalid plan type');
    }

    user.subscription.plan = plan;
    user.subscription.startDate = new Date();
    
    // Reset usage counts when changing plans
    Object.keys(user.usage).forEach(service => {
        if (service !== 'lastReset') {
            user.usage[service] = {
                count: 0,
                lastReset: new Date()
            };
        }
    });

    const updatedUser = await user.save();
    res.json({
        message: 'User plan updated successfully',
        user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            subscription: updatedUser.subscription,
            usage: updatedUser.usage
        }
    });
});

// @desc    Update user role
// @route   PUT /api/admin/users/:userId/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!['user', 'admin'].includes(role)) {
        res.status(400);
        throw new Error('Invalid role');
    }

    user.role = role;
    const updatedUser = await user.save();
    res.json({
        message: 'User role updated successfully',
        user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
        }
    });
});

// @desc    Update user status
// @route   PUT /api/admin/users/:userId/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.isActive = isActive;
    const updatedUser = await user.save();
    res.json({
        message: 'User status updated successfully',
        user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isActive: updatedUser.isActive
        }
    });
});

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get users per plan type
    const basicPlanUsers = await User.countDocuments({ 'subscription.plan': 'Basic' });
    const developerPlanUsers = await User.countDocuments({ 'subscription.plan': 'Developer' });
    const businessPlanUsers = await User.countDocuments({ 'subscription.plan': 'Business' });

    // Calculate total feature usage across all users
    const users = await User.find({});
    const featureUsage = {};

    users.forEach(user => {
        if (user.usage) {
            Object.keys(user.usage).forEach(service => {
                if (service !== 'lastReset') {
                    if (!featureUsage[service]) {
                        featureUsage[service] = 0;
                    }
                    featureUsage[service] += user.usage[service].count || 0;
                }
            });
        }
    });

    res.json({
        userStats: {
            total: totalUsers,
            basicPlan: basicPlanUsers,
            developerPlan: developerPlanUsers,
            businessPlan: businessPlanUsers
        },
        featureUsage
    });
});

module.exports = {
    getDashboardStats,
    getAllUsers,
    updateUserPlan,
    updateUserRole,
    updateUserStatus
}; 