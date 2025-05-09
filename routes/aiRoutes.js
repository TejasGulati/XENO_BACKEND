const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

router.post('/generate-message', async (req, res) => {
  try {
    const message = await aiService.generateAIMessage(req.body);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate-segment-rules', async (req, res) => {
  try {
    const { naturalLanguage } = req.body;
    if (!naturalLanguage) {
      return res.status(400).json({ error: 'naturalLanguage is required' });
    }
    
    const rules = await aiService.generateSegmentRules(naturalLanguage);
    res.json({ rules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate-campaign-summary', async (req, res) => {
  try {
    const summary = await aiService.generateCampaignSummary(req.body);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/message-variants', async (req, res) => {
  try {
    const variants = await aiService.generateMessageVariants(req.body);
    res.json({ variants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/performance-summary', async (req, res) => {
  try {
    const analysis = await aiService.generatePerformanceSummary(req.body);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/optimal-time', async (req, res) => {
  try {
    const result = await aiService.getOptimalSendTime(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/lookalike-audience', async (req, res) => {
  try {
    const rules = await aiService.generateLookalikeAudience(req.body);
    res.json({ rules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/auto-tag', async (req, res) => {
  try {
    const tags = await aiService.autoTagCampaign(req.body);
    res.json({ tags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;