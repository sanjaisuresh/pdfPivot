// models/payment.model.ts
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  chargeId: String,
  amount: Number,
  currency: String,
  billingDetails: {
    name: String,
    email: String,
    country: String
  },
  paymentMethod: {
    brand: String,
    last4: String,
    expMonth: Number,
    expYear: Number,
    funding: String,
    country: String
  },
  receiptUrl: String,
  status: String,

  // New fields
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  planId: { type: mongoose.Types.ObjectId, ref: 'Plan', required: true },
  billingType: { type: String, enum: ['monthly', 'annual'], required: true },
  billingCycle: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },

  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Payment', paymentSchema);