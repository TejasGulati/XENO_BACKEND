const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');

router.post('/', campaignController.createCampaign);
router.get('/', campaignController.getAllCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.post('/preview-audience', campaignController.previewAudience);
router.post('/delivery-receipt', campaignController.updateDeliveryReceipt);
router.get('/:id/logs', campaignController.getCampaignLogs);
router.get('/logs/all', campaignController.getAllLogs);
router.get('/logs/customer/:customerId', campaignController.getLogsByCustomer);
router.get('/logs/status/:status', campaignController.getLogsByStatus);

module.exports = router;