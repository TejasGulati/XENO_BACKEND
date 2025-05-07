const express = require('express');
const router = express.Router();
const {
  generateAIMessage,
  generateSegmentRules,
  generateCampaignSummary
} = require('../services/aiService');

// Generate message variants
router.post('/generate-message', async (req, res) => {
  try {
    const message = await generateAIMessage(req.body);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convert natural language to segment rules
router.post('/generate-segment-rules', async (req, res) => {
  try {
    const { naturalLanguage } = req.body;
    if (!naturalLanguage) {
      return res.status(400).json({ error: 'naturalLanguage is required' });
    }
    
    const rules = await generateSegmentRules(naturalLanguage);
    res.json({ rules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate campaign performance summary
router.post('/generate-campaign-summary', async (req, res) => {
  try {
    const summary = await generateCampaignSummary(req.body);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;