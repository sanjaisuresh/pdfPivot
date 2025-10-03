const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
    country: {
    type: String,
    default: ''
  },
  securityQuestions: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    }
  }],
  imagesProcessed: {
    type: Number,
    default: 0
  },
  currentPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    default: null
  },
  subscriptionType: {
    type: String,
    enum: ['monthly', 'annual', 'free'],
    default: 'free'
  },
  subscriptionStartDate: {
    type: Date,
    default: null
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
  usage: [
    {
      service: {
        type: String,
        required: true
      },
      count: {
        type: Number,
        default: 0
      },
      lastReset: {
        type: Date,
        default: Date.now
      }
    }
  ],
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  preferredLanguage: {
    type: String,
    default: 'en'
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema); 