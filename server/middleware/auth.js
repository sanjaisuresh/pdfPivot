const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('currentPlan');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // If no plan is assigned, get the Basic plan
    if (!user.currentPlan) {
      const Plan = require('../models/Plan');
      user.currentPlan = await Plan.findOne({ name: 'Basic' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Token is not valid' });
  }
}; 