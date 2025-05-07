const RedisService = require('./redisService');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const CommunicationLog = require('../models/CommunicationLog');
const Campaign = require('../models/Campaign');

class ConsumerService {
  constructor() {
    this.deliveryReceipts = [];
    this.receiptTimer = null;
    this.initializeConsumers();
  }

  async initializeConsumers() {
    try {
      await RedisService.connect();

      await RedisService.subscribe('customer:create', async (data) => {
        try {
          const customer = new Customer(data);
          await customer.save();
          console.log(`Created customer: ${customer._id}`);
        } catch (err) {
          console.error('Error processing customer:', err);
        }
      });

      await RedisService.subscribe('order:create', async (data) => {
        try {
          const customer = await Customer.findById(data.customer);
          if (!customer) {
            console.error(`Customer not found: ${data.customer}`);
            return;
          }

          const order = new Order(data);
          await order.save();
          console.log(`Created order: ${order._id}`);
        } catch (err) {
          console.error('Error processing order:', err);
        }
      });

      await RedisService.subscribe('delivery:receipt', async (data) => {
        this.deliveryReceipts.push(data);

        if (this.deliveryReceipts.length >= 10) {
          await this.processDeliveryReceipts();
        } else if (!this.receiptTimer) {
          this.receiptTimer = setTimeout(async () => {
            await this.processDeliveryReceipts();
            this.receiptTimer = null;
          }, 5000);
        }
      });

      console.log('Redis consumers initialized');
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
          update: {
            $set: {
              status: receipt.status,
              deliveredAt: receipt.deliveredAt || new Date()
            }
          }
        }
      }));

      await CommunicationLog.bulkWrite(bulkOps);

      const campaignUpdates = {};
      receipts.forEach(receipt => {
        if (!campaignUpdates[receipt.campaignId]) {
          campaignUpdates[receipt.campaignId] = { sent: 0, failed: 0 };
        }

        if (receipt.status === 'SENT') {
          campaignUpdates[receipt.campaignId].sent += 1;
        } else if (receipt.status === 'FAILED') {
          campaignUpdates[receipt.campaignId].failed += 1;
        }
      });

      await Promise.all(
        Object.entries(campaignUpdates).map(([campaignId, stats]) =>
          Campaign.findByIdAndUpdate(campaignId, {
            $inc: {
              sent: stats.sent,
              failed: stats.failed
            }
          })
        )
      );

      console.log(`Processed ${receipts.length} delivery receipts`);
    } catch (err) {
      console.error('Error processing delivery receipts:', err);
    }
  }
}

module.exports = new ConsumerService();
