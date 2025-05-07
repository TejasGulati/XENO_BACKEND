# Xeno CRM Backend

This is a basic Node.js backend for the Xeno CRM platform that handles customer segmentation, campaign creation, and delivery tracking.

## Features

- Customer data management
- Order management
- Campaign creation and audience segmentation
- Delivery tracking and logging

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB connection string (from MongoDB Atlas or local MongoDB)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd xeno_crm_backend
```

2. Install dependencies
```bash
npm install
```

3. Edit the `.env` file with your MongoDB connection string
```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

4. Start the development server
```bash
npm run dev
```

5. For production, use
```bash
npm start
```

## API Endpoints

### Customers

- `POST /api/customers` - Create a new customer
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get a customer by ID
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer

### Orders

- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get an order by ID
- `GET /api/orders/customer/:customerId` - Get orders by customer ID
- `PUT /api/orders/:id` - Update an order
- `DELETE /api/orders/:id` - Delete an order

### Campaigns

- `POST /api/campaigns` - Create a new campaign
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get a campaign by ID
- `POST /api/campaigns/preview-audience` - Preview audience size
- `POST /api/campaigns/delivery-receipt` - Update delivery status
- `GET /api/campaigns/:id/logs` - Get communication logs for a campaign

## Deployment

This project is configured for deployment on Vercel. Follow these steps to deploy:

1. Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

2. Login to Vercel
```bash
vercel login
```

3. Deploy the project
```bash
vercel
```

4. For production deployment
```bash
vercel --prod
```

## Environment Variables for Vercel

Make sure to add the following environment variables in your Vercel project settings:

- `MONGODB_URI`: Your MongoDB connection string

## Project Structure

```
xeno_crm_backend/
├── controllers/
│   ├── campaignController.js
│   ├── customerController.js
│   └── orderController.js
├── middleware/
│   └── errorMiddleware.js
├── models/
│   ├── Campaign.js
│   ├── CommunicationLog.js
│   ├── Customer.js
│   └── Order.js
├── routes/
│   ├── campaignRoutes.js
│   ├── customerRoutes.js
│   └── orderRoutes.js
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── server.js
└── vercel.json
```

## Development Workflow

1. Make changes to your code
2. Test your changes locally using `npm run dev`
3. Commit your changes to git
4. Deploy to Vercel using `vercel` or `vercel --prod`

## Testing the API

You can test the API endpoints using Postman, cURL, or any API testing tool. Here are some example requests:

### Create a Customer
```
POST /api/customers
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "1234567890"
}
```

### Create an Order
```
POST /api/orders
Content-Type: application/json

{
  "customer": "customer_id_here",
  "orderAmount": 5000,
  "items": [
    {
      "name": "Product 1",
      "price": 5000,
      "quantity": 1
    }
  ]
}
```

### Create a Campaign
```
POST /api/campaigns
Content-Type: application/json

{
  "name": "Summer Sale",
  "description": "Special offers for the summer season",
  "segmentRules": [
    {
      "field": "totalSpend",
      "operator": "GREATER_THAN",
      "value": 10000,
      "logicalOperator": "AND"
    },
    {
      "field": "lastVisit",
      "operator": "DAYS_AGO",
      "value": 30,
      "logicalOperator": "OR"
    }
  ],
  "messageTemplate": "Hi {name}, enjoy our summer specials with 15% off!",
  "status": "draft"
}
```