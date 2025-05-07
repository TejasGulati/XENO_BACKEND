const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Route for creating a new customer
router.post('/', customerController.createCustomer);

// Route for getting all customers
router.get('/', customerController.getAllCustomers);

// Route for getting a customer by ID
router.get('/:id', customerController.getCustomerById);

// Route for updating a customer
router.put('/:id', customerController.updateCustomer);

// Route for deleting a customer
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;