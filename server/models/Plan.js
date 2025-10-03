const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  monthlyFee: {
    type: Number,
    required: true,
    default: 0
  },
  annualFee: {
    type: Number,
    required: true,
    default: 0
  },
  features: [{
    type: String,
    required: true
  }],
  services: [{
    name: {
      type: String,
      required: true,
     enum: [
  'merge-pdf',
  'split-pdf',
  'remove-pages',
  'extract-pages',
  'organize-pdf',
  'rotate-pdf',
  'compress-pdf',
  'jpg-to-pdf',
  'word-to-pdf',
  'ppt-to-pdf',
  'excel-to-pdf',
  'html-to-pdf',
  'pdf-to-jpg',
  'pdf-to-word',
  'pdf-to-ppt',
  'pdf-to-excel',
  'pdf-to-pdfa',
  'view-metadata',
  'add-page-numbers',
  'add-watermark',
  'unlock-pdf',
  'protect-pdf',
  'compare-pdf',
  'pdf-to-text',
  'update-metadata',
  'pdf-voice-reader',
  'translate',
  'handwriting',
  'pdf-expire',
    'e-sign'

]
    },
    monthlyQuota: {
      type: Number,
      required: true,
      default: 0
    },
    annualQuota: {
      type: Number,
      required: true,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);
