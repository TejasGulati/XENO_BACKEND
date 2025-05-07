const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Route for creating a new order
router.post('/', orderController.createOrder);

// Route for getting all orders
router.get('/', orderController.getAllOrders);

// Route for getting an order by ID
router.get('/:id', orderController.getOrderById);

// Route for getting orders by customer ID
router.get('/customer/:customerId', orderController.getOrdersByCustomerId);

// Route for updating an order
router.put('/:id', orderController.updateOrder);

// Route for deleting an order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;