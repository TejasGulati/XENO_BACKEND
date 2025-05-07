const mongoose = require('mongoose');

const SegmentRuleSchema = new mongoose.Schema({
  field: String,
  operator: String,
  value: mongoose.Schema.Types.Mixed,
  logicalOperator: {
    type: String,
    enum: ['AND', 'OR'],
    default: 'AND'
  }
}, { _id: false });

const CampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  segmentRules: [SegmentRuleSchema],
  messageTemplate: {
    type: String,
    required: true
  },
  audienceSize: {
    type: Number,
    default: 0
  },
  sent: {
    type: Number,
    default: 0
  },
  failed: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'completed'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  scheduledDate: {
    type: Date
  }
});

module.exports = mongoose.model('Campaign', CampaignSchema);