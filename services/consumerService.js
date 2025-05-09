const RedisService = require('./redisService');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const CommunicationLog = require('../models/CommunicationLog');
const Campaign = require('../models/Campaign');

class ConsumerService {
  constructor() {
    this.deliveryReceipts = [];
    this.initializeConsumers();
  }

  async initializeConsumers() {
    try {
      await RedisService.connect();

      RedisService.subscribe('customer:create', async (data) => {
        try {
          const customer = new Customer(data);
          await customer.save();
        } catch (err) {
          console.error('Error processing customer:', err);
        }
      });

      RedisService.subscribe('order:create', async (data) => {
        try {
          const order = new Order(data);
          await order.save();
        } catch (err) {
          console.error('Error processing order:', err);
        }
      });

      RedisService.subscribe('delivery:receipt', async (data) => {
        this.deliveryReceipts.push(data);
        if (this.deliveryReceipts.length >= 5) await this.processDeliveryReceipts();
      });

    } catch (err) {
      console.error('Error initializing Redis consumers:', err);
    }
  }

  async processDeliveryReceipts() {
    if (this.deliveryReceipts.length === 0) return;
    const receipts = [...this.deliveryReceipts];
    this.deliveryReceipts = [];

    try {
      const bulkOps = receipts.map(receipt => ({
        updateOne: {
          filter: { _id: receipt.communicationLogId },
          update: { status: receipt.status, deliveredAt: receipt.deliveredAt }
        }
      }));

      await CommunicationLog.bulkWrite(bulkOps);

      for (const receipt of receipts) {
        await Campaign.findByIdAndUpdate(receipt.campaignId, {
          $inc: { [receipt.status === 'DELIVERED' ? 'sent' : 'failed']: 1 }
        });
      }
    } catch (err) {
      console.error('Error processing receipts:', err);
    }
  }
}

module.exports = new ConsumerService();