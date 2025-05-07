const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const Campaign = require('./models/Campaign');
const CommunicationLog = require('./models/CommunicationLog');

// Sample data
const sampleCustomers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    totalSpend: 15000,
    visitCount: 5,
    lastVisit: new Date('2025-04-01')
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '9876543210',
    totalSpend: 8000,
    visitCount: 3,
    lastVisit: new Date('2025-04-15')
  },
  {
    name: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    phone: '5555555555',
    totalSpend: 25000,
    visitCount: 8,
    lastVisit: new Date('2025-02-20')
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '1112223333',
    totalSpend: 5000,
    visitCount: 2,
    lastVisit: new Date('2025-01-10')
  },
  {
    name: 'Michael Wilson',
    email: 'michael.wilson@example.com',
    phone: '4444444444',
    totalSpend: 12000,
    visitCount: 4,
    lastVisit: new Date('2025-04-30')
  }
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Customer.deleteMany({});
    await Order.deleteMany({});
    await Campaign.deleteMany({});
    await CommunicationLog.deleteMany({});
    console.log('Cleared existing data');

    // Insert sample customers
    const insertedCustomers = await Customer.insertMany(sampleCustomers);
    console.log(`Inserted ${insertedCustomers.length} customers`);

    // Create sample orders for each customer
    const orders = [];
    
    for (const customer of insertedCustomers) {
      // Generate 1-3 orders per customer
      const numOrders = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numOrders; i++) {
        const orderAmount = Math.floor(Math.random() * 5000) + 1000;
        
        orders.push({
          customer: customer._id,
          orderAmount,
          items: [
            {
              name: 'Product ' + (i + 1),
              price: orderAmount,
              quantity: 1
            }
          ],
          status: 'completed',
          orderDate: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000) // Random date in last 90 days
        });
      }
    }
    
    const insertedOrders = await Order.insertMany(orders);
    console.log(`Inserted ${insertedOrders.length} orders`);

    // Create a sample campaign
    const campaign = await Campaign.create({
      name: 'Welcome Campaign',
      description: 'Welcome new customers with a special offer',
      segmentRules: [
        {
          field: 'totalSpend',
          operator: 'GREATER_THAN',
          value: 10000,
          logicalOperator: 'AND'
        },
        {
          field: 'visitCount',
          operator: 'LESS_THAN',
          value: 5,
          logicalOperator: 'OR'
        }
      ],
      messageTemplate: 'Hi {name}, welcome to our platform! Enjoy 10% off your next purchase.',
      audienceSize: 3,
      sent: 3,
      failed: 0,
      status: 'completed',
      createdAt: new Date('2025-04-01')
    });
    
    console.log('Inserted sample campaign');

    // Create communication logs for the campaign
    const matchingCustomers = insertedCustomers.filter(
      c => c.totalSpend > 10000 || c.visitCount < 5
    );
    
    const logs = matchingCustomers.map(customer => ({
      campaign: campaign._id,
      customer: customer._id,
      message: `Hi ${customer.name}, welcome to our platform! Enjoy 10% off your next purchase.`,
      status: 'SENT',
      sentAt: new Date('2025-04-01'),
      deliveredAt: new Date('2025-04-01'),
      createdAt: new Date('2025-04-01')
    }));
    
    const insertedLogs = await CommunicationLog.insertMany(logs);
    console.log(`Inserted ${insertedLogs.length} communication logs`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();