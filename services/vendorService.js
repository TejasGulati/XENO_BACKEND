const CommunicationLog = require('../models/CommunicationLog');
const Campaign = require('../models/Campaign');
const RedisService = require('../services/redisService');

const sendSingleMessage = async (customer, messageTemplate, campaignId) => {
  const personalizedMessage = messageTemplate.replace('{name}', customer.name);
  const log = await CommunicationLog.create({
    campaign: campaignId,
    customer: customer._id,
    message: personalizedMessage,
    status: 'PENDING',
    sentAt: new Date()
  });

  // Simulate vendor API call with 90% success rate
  const isSuccess = Math.random() < 0.9;
  
  setTimeout(async () => {
    await processDeliveryReceipt({
      communicationLogId: log._id,
      campaignId,
      status: isSuccess ? 'DELIVERED' : 'FAILED',
      deliveredAt: isSuccess ? new Date() : null,
      error: isSuccess ? null : 'Failed to deliver message'
    });

    // Publish to Redis if needed
    await RedisService.publish('delivery:receipt', {
      communicationLogId: log._id,
      campaignId,
      status: isSuccess ? 'DELIVERED' : 'FAILED',
      deliveredAt: isSuccess ? new Date() : null
    });
  }, Math.random() * 5000);
};

const processDeliveryReceipt = async (receipt) => {
  try {
    const batchUpdates = [
      CommunicationLog.findByIdAndUpdate(receipt.communicationLogId, {
        status: receipt.status,
        deliveredAt: receipt.deliveredAt,
        error: receipt.error
      }, { new: true }),
      Campaign.findByIdAndUpdate(receipt.campaignId, {
        $inc: { [receipt.status === 'DELIVERED' ? 'sent' : 'failed']: 1 }
      })
    ];
    await Promise.all(batchUpdates);
  } catch (error) {
    console.error('Error processing delivery receipt:', error);
    throw error;
  }
};

exports.sendCampaignMessages = async (customers, messageTemplate, campaignId) => {
  try {
    const batchSize = 100;
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);
      await Promise.all(batch.map(customer => 
        sendSingleMessage(customer, messageTemplate, campaignId)
      ));
    }
  } catch (error) {
    console.error('Error sending campaign messages:', error);
    throw error;
  }
};

exports.processDeliveryReceipt = processDeliveryReceipt;