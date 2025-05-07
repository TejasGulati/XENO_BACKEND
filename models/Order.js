const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  orderAmount: {
    type: Number,
    required: true
  },
  items: [{
    name: String,
    price: Number,
    quantity: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
});

// Update customer's total spend when a new order is created
OrderSchema.post('save', async function() {
  try {
    const Customer = mongoose.model('Customer');
    const customer = await Customer.findById(this.customer);
    
    if (customer) {
      customer.totalSpend += this.orderAmount;
      customer.visitCount += 1;
      customer.lastVisit = Date.now();
      await customer.save();
    }
  } catch (error) {
    console.error('Error updating customer data:', error);
  }
});

module.exports = mongoose.model('Order', OrderSchema);