const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');
const CommunicationLog = require('../models/CommunicationLog');
const RedisService = require('../services/redisService');
const { generateAIMessage } = require('../services/aiService');

// Rule evaluator
const evaluateRule = (customer, rule) => {
  const { field, operator, value } = rule;
  switch (operator) {
    case 'EQUALS': return customer[field] === value;
    case 'NOT_EQUALS': return customer[field] !== value;
    case 'GREATER_THAN': return customer[field] > value;
    case 'LESS_THAN': return customer[field] < value;
    case 'CONTAINS': return customer[field]?.includes(value);
    case 'NOT_CONTAINS': return !customer[field]?.includes(value);
    case 'DAYS_AGO':
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - value);
      return new Date(customer[field]) <= daysAgo;
    default: return false;
  }
};

const customerMatchesSegment = (customer, rules) => {
  if (!rules || rules.length === 0) return true;
  let result = evaluateRule(customer, rules[0]);

  for (let i = 1; i < rules.length; i++) {
    const ruleResult = evaluateRule(customer, rules[i]);
    result = rules[i].logicalOperator === 'AND' ? result && ruleResult : result || ruleResult;
  }

  return result;
};

// Create campaign
exports.createCampaign = async (req, res) => {
  try {
    const newCampaign = new Campaign(req.body);
    const customers = await Customer.find();
    const audienceCustomers = customers.filter(c => customerMatchesSegment(c, newCampaign.segmentRules));
    newCampaign.audienceSize = audienceCustomers.length;

    const savedCampaign = await newCampaign.save();

    if (savedCampaign.status !== 'draft') {
      let messageTemplate = savedCampaign.messageTemplate;

      if (savedCampaign.useAIMessage) {
        messageTemplate = await generateAIMessage({
          campaignObjective: savedCampaign.objective,
          audienceDescription: savedCampaign.description,
          baseMessage: messageTemplate
        });
      }

      for (const customer of audienceCustomers) {
        const personalizedMessage = messageTemplate.replace('{name}', customer.name);

        const log = await CommunicationLog.create({
          campaign: savedCampaign._id,
          customer: customer._id,
          message: personalizedMessage,
          status: 'PENDING',
          sentAt: new Date()
        });

        setTimeout(async () => {
          const isSuccess = Math.random() < 0.9;
          await CommunicationLog.findByIdAndUpdate(log._id, {
            status: isSuccess ? 'DELIVERED' : 'FAILED',
            deliveredAt: isSuccess ? new Date() : null,
            error: isSuccess ? null : 'Failed to deliver message'
          });

          await Campaign.findByIdAndUpdate(savedCampaign._id, {
            $inc: { [isSuccess ? 'sent' : 'failed']: 1 }
          });

          await RedisService.publish('delivery:receipt', {
            communicationLogId: log._id,
            campaignId: savedCampaign._id,
            status: isSuccess ? 'DELIVERED' : 'FAILED',
            deliveredAt: isSuccess ? new Date() : null
          });
        }, Math.random() * 5000);
      }

      savedCampaign.status = 'sent';
      await savedCampaign.save();
    }

    res.status(201).json(savedCampaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all campaigns
exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get campaign by ID
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Preview audience
exports.previewAudience = async (req, res) => {
  try {
    const { segmentRules } = req.body;
    const customers = await Customer.find();
    const matched = customers.filter(c => customerMatchesSegment(c, segmentRules));
    res.status(200).json({
      audienceSize: matched.length,
      sampleCustomers: matched.slice(0, 5).map(c => ({
        _id: c._id, name: c.name, email: c.email
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔄 UPDATED: Delivery receipt handler
exports.updateDeliveryReceipt = async (req, res) => {
  try {
    const { communicationLogId, status, deliveredAt, error } = req.body;

    if (!mongoose.Types.ObjectId.isValid(communicationLogId)) {
      return res.status(400).json({ message: 'Invalid log ID' });
    }

    const validStatuses = ['DELIVERED', 'FAILED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedLog = await CommunicationLog.findByIdAndUpdate(
      communicationLogId,
      {
        status,
        deliveredAt: deliveredAt || new Date(),
        error: error || null
      },
      { new: true }
    ).populate('campaign');

    if (!updatedLog) {
      return res.status(404).json({ message: 'Log not found' });
    }

    await Campaign.findByIdAndUpdate(updatedLog.campaign._id, {
      $inc: {
        [status === 'DELIVERED' ? 'sent' : 'failed']: 1
      }
    });

    res.status(200).json(updatedLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Campaign logs
exports.getCampaignLogs = async (req, res) => {
  try {
    const logs = await CommunicationLog.find({ campaign: req.params.id })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 NEW: Get all logs
exports.getAllLogs = async (req, res) => {
  try {
    const logs = await CommunicationLog.find()
      .populate('campaign', 'name')
      .populate('customer', 'name email')
      .sort({ sentAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 NEW: Get logs by customer
exports.getLogsByCustomer = async (req, res) => {
  try {
    const logs = await CommunicationLog.find({ customer: req.params.customerId })
      .populate('campaign', 'name')
      .sort({ sentAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 NEW: Get logs by status
exports.getLogsByStatus = async (req, res) => {
  try {
    const validStatuses = ['PENDING', 'SENT', 'DELIVERED', 'FAILED'];
    const status = req.params.status.toUpperCase();
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const logs = await CommunicationLog.find({ status })
      .populate('campaign', 'name')
      .populate('customer', 'name email')
      .sort({ sentAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
