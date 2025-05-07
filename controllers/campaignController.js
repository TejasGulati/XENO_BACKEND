const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');
const CommunicationLog = require('../models/CommunicationLog');

// Helper function to evaluate a segment rule against a customer
const evaluateRule = (customer, rule) => {
  const { field, operator, value } = rule;
  
  switch (operator) {
    case 'EQUALS':
      return customer[field] === value;
    case 'NOT_EQUALS':
      return customer[field] !== value;
    case 'GREATER_THAN':
      return customer[field] > value;
    case 'LESS_THAN':
      return customer[field] < value;
    case 'CONTAINS':
      return customer[field]?.includes(value);
    case 'NOT_CONTAINS':
      return !customer[field]?.includes(value);
    case 'DAYS_AGO':
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - value);
      return new Date(customer[field]) <= daysAgo;
    default:
      return false;
  }
};

// Function to evaluate if a customer matches segment rules
const customerMatchesSegment = (customer, rules) => {
  if (!rules || rules.length === 0) return true;
  
  let result = evaluateRule(customer, rules[0]);
  
  for (let i = 1; i < rules.length; i++) {
    const rule = rules[i];
    const ruleResult = evaluateRule(customer, rule);
    
    if (rule.logicalOperator === 'AND') {
      result = result && ruleResult;
    } else if (rule.logicalOperator === 'OR') {
      result = result || ruleResult;
    }
  }
  
  return result;
};

// Dummy function to simulate message sending
const sendMessage = async (customer, messageTemplate) => {
  // Personalize message with customer name
  const personalizedMessage = messageTemplate.replace('{name}', customer.name);
  
  // Simulate 90% success rate
  const isSuccess = Math.random() < 0.9;
  
  return {
    status: isSuccess ? 'SENT' : 'FAILED',
    message: personalizedMessage,
    error: isSuccess ? null : 'Failed to deliver message'
  };
};

// Create a new campaign
exports.createCampaign = async (req, res) => {
  try {
    const newCampaign = new Campaign(req.body);
    
    // Calculate audience size
    const customers = await Customer.find();
    const audienceCustomers = customers.filter(customer => 
      customerMatchesSegment(customer, newCampaign.segmentRules)
    );
    
    newCampaign.audienceSize = audienceCustomers.length;
    const savedCampaign = await newCampaign.save();
    
    // If campaign is not a draft, send messages
    if (savedCampaign.status !== 'draft') {
      // Send messages to each matching customer
      let sent = 0;
      let failed = 0;
      
      for (const customer of audienceCustomers) {
        const result = await sendMessage(customer, savedCampaign.messageTemplate);
        
        // Log the communication
        await new CommunicationLog({
          campaign: savedCampaign._id,
          customer: customer._id,
          message: result.message,
          status: result.status,
          sentAt: result.status === 'SENT' ? new Date() : null,
          errorMessage: result.error
        }).save();
        
        if (result.status === 'SENT') {
          sent++;
        } else {
          failed++;
        }
      }
      
      // Update campaign stats
      savedCampaign.sent = sent;
      savedCampaign.failed = failed;
      savedCampaign.status = 'completed';
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

// Get a campaign by ID
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get audience preview for a campaign (returns count only)
exports.previewAudience = async (req, res) => {
  try {
    const { segmentRules } = req.body;
    
    const customers = await Customer.find();
    const audienceCustomers = customers.filter(customer => 
      customerMatchesSegment(customer, segmentRules)
    );
    
    res.status(200).json({ 
      audienceSize: audienceCustomers.length,
      // Include first 5 customers as sample
      sampleCustomers: audienceCustomers.slice(0, 5).map(c => ({
        _id: c._id,
        name: c.name,
        email: c.email
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delivery receipt API
exports.updateDeliveryReceipt = async (req, res) => {
  try {
    const { communicationLogId, status, deliveredAt } = req.body;
    
    const log = await CommunicationLog.findById(communicationLogId);
    if (!log) {
      return res.status(404).json({ message: 'Communication log not found' });
    }
    
    log.status = status;
    log.deliveredAt = deliveredAt || new Date();
    await log.save();
    
    // Update campaign stats
    const campaign = await Campaign.findById(log.campaign);
    if (campaign) {
      if (status === 'SENT') {
        campaign.sent += 1;
        campaign.failed -= log.status === 'FAILED' ? 1 : 0;
      } else if (status === 'FAILED') {
        campaign.failed += 1;
        campaign.sent -= log.status === 'SENT' ? 1 : 0;
      }
      await campaign.save();
    }
    
    res.status(200).json(log);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get communication logs for a campaign
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