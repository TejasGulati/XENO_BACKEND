const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');

// Route for creating a new campaign
router.post('/', campaignController.createCampaign);
router.get('/logs/all', campaignController.getAllLogs);
router.get('/logs/customer/:customerId', campaignController.getLogsByCustomer);
router.get('/logs/status/:status', campaignController.getLogsByStatus);
// Route for getting all campaigns
router.get('/', campaignController.getAllCampaigns);

// Route for getting a campaign by ID
router.get('/:id', campaignController.getCampaignById);

// Route for previewing audience size
router.post('/preview-audience', campaignController.previewAudience);

// Route for handling delivery receipts
router.post('/delivery-receipt', campaignController.updateDeliveryReceipt);

// Route for getting communication logs for a campaign
router.get('/:id/logs', campaignController.getCampaignLogs);

module.exports = router;