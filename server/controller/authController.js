const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Plan = require('../models/Plan');

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, name, securityQuestions,country } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Get basic plan
    const basicPlan = await Plan.findOne({ name: 'Basic' });
    if (!basicPlan) {
      return res.status(500).json({ error: 'Basic plan not found' });
    }

    // Create new user
    user = new User({
      email,
      password,
      name,
      country,
      securityQuestions,  // This will now be an array with two questions
      currentPlan: basicPlan._id,
      subscriptionType: 'free',
      subscriptionStartDate: new Date(),
      usage: basicPlan.services.map(service => ({
        service: service.name,
        count: 0,
        lastReset: new Date()
      }))
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      token,
       user: {
        ...user.toObject(),password:undefined,id:user?._id
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password (in a real app, use bcrypt)
    if (user.password !== password) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      token,
      user: {
        ...user.toObject(),password:undefined,id:user?._id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Return security questions without answers
    const securityQuestions = user.securityQuestions.map(sq => sq.question);
    res.json({ securityQuestions });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.verifySecurityAnswers = async (req, res) => {
  try {
    const { email, answers } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if answers match (case-insensitive)
    const correctAnswers = user.securityQuestions.every((sq, index) => 
      sq.answer === answers[index].toLowerCase()
    );

    if (!correctAnswers) {
      return res.status(400).json({ error: 'Incorrect security answers' });
    }

    res.json({ message: 'Security answers verified' });
  } catch (error) {
    console.error('Verify security answers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 