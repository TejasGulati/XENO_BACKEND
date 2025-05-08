const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

/**
 * @route   POST /api/ai/generate-message
 * @desc    Generate AI-optimized message from base message
 * @access  Private
 */
router.post('/generate-message', async (req, res) => {
  try {
    const message = await aiService.generateAIMessage(req.body);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/ai/generate-segment-rules
 * @desc    Convert natural language to segment rules
 * @access  Private
 */
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

/**
 * @route   POST /api/ai/generate-campaign-summary
 * @desc    Generate text summary of campaign performance
 * @access  Private
 */
router.post('/generate-campaign-summary', async (req, res) => {
  try {
    const summary = await aiService.generateCampaignSummary(req.body);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/ai/message-variants
 * @desc    Generate multiple message variants with tone and image suggestions
 * @access  Private
 */
router.post('/message-variants', async (req, res) => {
  try {
    const variants = await aiService.generateMessageVariants(req.body);
    res.json({ variants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/ai/performance-summary
 * @desc    Generate structured performance analysis with insights and recommendations
 * @access  Private
 */
router.post('/performance-summary', async (req, res) => {
  try {
    const analysis = await aiService.generatePerformanceSummary(req.body);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/ai/optimal-time
 * @desc    Get AI recommendations for optimal send times
 * @access  Private
 */
router.post('/optimal-time', async (req, res) => {
  try {
    const result = await aiService.getOptimalSendTime(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/ai/lookalike-audience
 * @desc    Generate lookalike audience rules based on high-value customers
 * @access  Private
 */
router.post('/lookalike-audience', async (req, res) => {
  try {
    const rules = await aiService.generateLookalikeAudience(req.body);
    res.json({ rules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/ai/auto-tag
 * @desc    Automatically generate relevant tags for a campaign
 * @access  Private
 */
router.post('/auto-tag', async (req, res) => {
  try {
    const tags = await aiService.autoTagCampaign(req.body);
    res.json({ tags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;