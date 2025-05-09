const CommunicationLog = require('../models/CommunicationLog');
const Campaign = require('../models/Campaign');
const RedisService = require('../services/redisService');

const sendSingleMessage = async (customer, messageTemplate, campaignId) => {
  const personalizedMessage = messageTemplate.replace('{name}', customer.name);
  const log = await CommunicationLog.create({
    campaign: campaignId,
    customer: customer._id,
    message: personalizedMessage,
    status: 'PENDING'
  });

  const isSuccess = Math.random() < 0.9;
  
  setTimeout(async () => {
    await processDeliveryReceipt({
      communicationLogId: log._id,
      campaignId,
      status: isSuccess ? 'DELIVERED' : 'FAILED',
      deliveredAt: isSuccess ? new Date() : null
    });
  }, Math.random() * 3000);
};

const processDeliveryReceipt = async (receipt) => {
  try {
    await Promise.all([
      CommunicationLog.findByIdAndUpdate(receipt.communicationLogId, {
        status: receipt.status,
        deliveredAt: receipt.deliveredAt
      }),
      Campaign.findByIdAndUpdate(receipt.campaignId, {
        $inc: { [receipt.status === 'DELIVERED' ? 'sent' : 'failed']: 1 }
      })
    ]);
  } catch (error) {
    console.error('Error processing receipt:', error);
  }
};

exports.sendCampaignMessages = async (customers, messageTemplate, campaignId) => {
  try {
    for (let i = 0; i < customers.length; i += 50) {
      const batch = customers.slice(i, i + 50);
      await Promise.all(batch.map(customer => 
        sendSingleMessage(customer, messageTemplate, campaignId)
      ));
    }
  } catch (error) {
    console.error('Error sending messages:', error);
  }
};

exports.processDeliveryReceipt = processDeliveryReceipt;