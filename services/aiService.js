const fetch = require('node-fetch');

async function callGeminiAPI(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const body = { contents: [{ parts: [{ text: prompt }] }] };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    console.error('API Call Error:', error.message);
    throw error;
  }
}

async function generateAIMessage({ campaignObjective, audienceDescription, baseMessage }) {
  const prompt = `Generate an improved message variant based on:
  Objective: ${campaignObjective}
  Audience: ${audienceDescription}
  Base Message: "${baseMessage}"
  Respond with just the message content.`;
  
  try {
    const result = await callGeminiAPI(prompt);
    return result || baseMessage;
  } catch (error) {
    return baseMessage;
  }
}

async function generateSegmentRules(naturalLanguage) {
  const prompt = `Convert this to CRM segment rules: "${naturalLanguage}"
  Return a JSON array with field, operator, value, logicalOperator.`;
  
  try {
    const result = await callGeminiAPI(prompt);
    return result ? JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim()) : [];
  } catch (error) {
    return [];
  }
}

async function generateCampaignSummary(campaignData) {
  const prompt = `Generate a performance summary for campaign:
  Name: ${campaignData.name}
  Audience: ${campaignData.audienceSize}
  Sent: ${campaignData.sent}
  Failed: ${campaignData.failed}
  Return a short paragraph.`;
  
  try {
    const result = await callGeminiAPI(prompt);
    return result || 'Performance analysis unavailable.';
  } catch (error) {
    return 'Performance analysis unavailable.';
  }
}

async function generateMessageVariants(campaignData) {
  const prompt = `Generate 3 message variants for:
  Objective: ${campaignData.objective}
  Audience: ${campaignData.audienceDescription}
  Base Message: "${campaignData.baseMessage}"
  Return JSON array with message, imageIdea, rationale.`;
  
  try {
    const result = await callGeminiAPI(prompt);
    return result ? JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim()) : [];
  } catch (error) {
    return [];
  }
}

async function generatePerformanceSummary(campaignData) {
  const prompt = `Analyze campaign data and provide insights:
  ${JSON.stringify(campaignData)}
  Return JSON with summary, insights, recommendations.`;
  
  try {
    const result = await callGeminiAPI(prompt);
    return result ? JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim()) : 
      { summary: 'Analysis unavailable' };
  } catch (error) {
    return { summary: 'Analysis unavailable' };
  }
}

async function getOptimalSendTime(segmentData) {
  const prompt = `Recommend send times for segment:
  ${JSON.stringify(segmentData)}
  Return JSON with best_times, worst_time, rationale.`;
  
  try {
    const result = await callGeminiAPI(prompt);
    return result ? JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim()) : 
      { best_times: ['09:00'], worst_time: '03:00', rationale: 'Default times' };
  } catch (error) {
    return { best_times: ['09:00'], worst_time: '03:00', rationale: 'Default times' };
  }
}

async function generateLookalikeAudience(audienceData) {
  const prompt = `Create lookalike rules for:
  ${JSON.stringify(audienceData)}
  Return JSON array of rules.`;
  
  try {
    const result = await callGeminiAPI(prompt);
    return result ? JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim()) : [];
  } catch (error) {
    return [];
  }
}

async function autoTagCampaign(campaignData) {
  const prompt = `Generate tags for campaign:
  ${JSON.stringify(campaignData)}
  Return JSON array of tags.`;
  
  try {
    const result = await callGeminiAPI(prompt);
    return result ? JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim()) : [];
  } catch (error) {
    return [];
  }
}

module.exports = {
  generateAIMessage,
  generateSegmentRules,
  generateCampaignSummary,
  generateMessageVariants,
  generatePerformanceSummary,
  getOptimalSendTime,
  generateLookalikeAudience,
  autoTagCampaign
};