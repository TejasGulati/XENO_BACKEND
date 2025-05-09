const { createClient } = require('redis');

class RedisService {
  constructor() {
    this.publisher = createClient({ url: process.env.REDIS_URL });
    this.subscriber = createClient({ url: process.env.REDIS_URL });
    this.connect();
  }

  async connect() {
    if (!this.publisher.isOpen) await this.publisher.connect();
    if (!this.subscriber.isOpen) await this.subscriber.connect();
  }

  async publish(channel, message) {
    try {
      await this.publisher.publish(channel, JSON.stringify(message));
    } catch (err) {
      console.error('Redis publish error:', err);
    }
  }

  async subscribe(channel, callback) {
    try {
      await this.subscriber.subscribe(channel, (message) => {
        callback(JSON.parse(message));
      });
    } catch (err) {
      console.error('Redis subscribe error:', err);
    }
  }
}

module.exports = new RedisService();