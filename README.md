# Xeno CRM Backend API


## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Redis Integration](#redis-integration)
- [AI Capabilities](#ai-capabilities)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

### 🎯 Campaign Management
- Create targeted marketing campaigns with custom segment rules
- AI-powered message generation and optimization
- Real-time audience preview and sizing
- Campaign performance tracking (sent/delivered/failed metrics)
- Communication log tracking for all customer interactions

### 👥 Customer Management
- Full CRUD operations for customer profiles
- Customer lifetime value tracking (total spend, visit count)
- Redis-powered asynchronous processing for high-volume operations
- Comprehensive customer communication history

### 🛒 Order Processing
- Order creation with automatic customer profile updates
- Order status tracking (pending/completed/cancelled)
- Customer-specific order history
- Redis-based event processing for order creation

### 🤖 AI Integration
- AI-generated message variants based on campaign objectives
- Natural language to segment rule conversion
- Automated campaign performance summaries
- Powered by Gemini AI API

### ⚡ Performance Optimizations
- Redis-based pub/sub for high-volume operations
- Bulk processing of delivery receipts
- Serverless-ready architecture
- Connection pooling and retry logic

## Tech Stack

**Backend**  
- Node.js v18+
- Express.js
- MongoDB (Atlas recommended)
- Redis/Upstash

**AI Services**  
- Gemini AI API

**DevOps**  
- Vercel (serverless deployment)
- MongoDB Atlas
- Upstash Redis

## API Endpoints

### Campaigns (`/api/campaigns`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | POST | Create new campaign |
| `/` | GET | List all campaigns |
| `/:id` | GET | Get campaign details |
| `/:id/logs` | GET | Get campaign communication logs |
| `/preview-audience` | POST | Preview campaign audience |
| `/delivery-receipt` | POST | Update delivery status |
| `/logs/all` | GET | Get all communication logs |
| `/logs/customer/:customerId` | GET | Get logs by customer |
| `/logs/status/:status` | GET | Get logs by status |

### Customers (`/api/customers`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | POST | Create new customer |
| `/` | GET | List all customers |
| `/:id` | GET | Get customer details |
| `/:id` | PUT | Update customer |
| `/:id` | DELETE | Delete customer |

### Orders (`/api/orders`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | POST | Create new order |
| `/` | GET | List all orders |
| `/:id` | GET | Get order details |
| `/customer/:customerId` | GET | Get orders by customer |
| `/:id` | PUT | Update order |
| `/:id` | DELETE | Delete order |

### AI Services (`/api/ai`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/generate-message` | POST | Generate AI message variants |
| `/generate-segment-rules` | POST | Convert NL to segment rules |
| `/generate-campaign-summary` | POST | Generate performance summary |

## Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TejasGulati/XENO_BACKEND
   cd xeno-crm-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**  
   Create a `.env` file based on the example below

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Run in production**
   ```bash
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# Redis
REDIS_URL=redis://default:password@upstash-redis-url:port

# AI Services
GEMINI_API_KEY=your-gemini-api-key
```

## Redis Integration

The system uses Redis for:
- Asynchronous customer/order creation
- Delivery receipt processing
- Event-driven architecture

Key channels:
- `customer:create` - New customer events
- `order:create` - New order events
- `delivery:receipt` - Message delivery status updates

## AI Capabilities

### 1. Message Generation
- Enhances base messages based on campaign objectives
- Maintains personalization tokens
- Generates multiple variants and selects the best

### 2. Segment Rule Conversion
- Converts natural language ("customers who spent > $100 last month") to structured rules
- Supports complex logical operators (AND/OR)

### 3. Performance Analysis
- Automated campaign summaries
- Key insights and recommendations
- Human-readable performance reports

## Deployment

### Vercel Deployment
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard

### Manual Deployment
1. Build your project:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   node server.js
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

---
