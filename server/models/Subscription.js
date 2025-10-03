const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    default: 'active'
  },
  billingType: {
    type: String,
    enum: ['monthly', 'annual'],
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  chargeId: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
