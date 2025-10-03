const User = require('../models/User');
const Plan = require('../models/Plan');

exports.getDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get active subscriptions count (users with a plan other than Basic)
    const activeSubscriptions = await User.countDocuments({
      currentPlan: { $exists: true },
      'currentPlan.name': { $ne: 'Basic' }
    });

    // Calculate monthly revenue (sum of all active subscriptions' monthly fees)
    const users = await User.find({
      currentPlan: { $exists: true },
      'currentPlan.name': { $ne: 'Basic' }
    }).populate('currentPlan');

    const monthlyRevenue = users.reduce((total, user) => {
      const plan = user.currentPlan;
      if (!plan) return total;
      return total + (user.subscriptionType === 'annual' ? plan.annualFee / 12 : plan.monthlyFee);
    }, 0);

    res.json({
      totalUsers,
      activeSubscriptions,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100 // Round to 2 decimal places
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
}; 