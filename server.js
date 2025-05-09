const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Xeno CRM API' });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = app;