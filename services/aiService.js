const fetch = require('node-fetch');

// Function to send a POST request to Gemini API
async function callGeminiAPI(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  
  const body = {
    contents: [{
      parts: [{ text: prompt }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Handle Gemini API response format
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts[0].text;
    }
    throw new Error('Unexpected API response format');
    
  } catch (error) {
    console.error('API Call Error:', error.message);
    throw error; // Re-throw to handle in calling functions
  }
}

// Generate AI-powered message variants
async function generateAIMessage({ campaignObjective, audienceDescription, baseMessage }) {
  const prompt = `
  You are a marketing assistant for a CRM platform. Generate 3 improved message variants based on the following campaign details:
  
  Campaign Objective: ${campaignObjective}
  Audience: ${audienceDescription}
  Base Message: "${baseMessage}"
  
  Requirements:
  1. Keep the core intent but make it more engaging
  2. Each variant should be 1-2 sentences max
  3. Include personalization tokens like {name} where appropriate
  4. Return only the best variant
  
  Respond with just the message content (no numbering or quotes).
  `;

  try {
    const result = await callGeminiAPI(prompt);
    return result || baseMessage; // Fallback to original if AI fails
  } catch (error) {
    console.error('generateAIMessage Error:', error.message);
    return baseMessage;
  }
}

// Generate natural language to segment rules
async function generateSegmentRules(naturalLanguage) {
  const prompt = `
  Convert this natural language segment description into logical rules for a CRM system:
  
  Description: "${naturalLanguage}"
  
  Rules should be in this JSON format:
  {
    "field": string (customer field name),
    "operator": string (EQUALS, NOT_EQUALS, GREATER_THAN, LESS_THAN, CONTAINS, DAYS_AGO),
    "value": mixed (string, number, boolean),
    "logicalOperator": string (AND, OR)
  }
  
  Return only a JSON array of rules.
  `;

  try {
    const result = await callGeminiAPI(prompt);
    if (!result) return [];
    
    // Clean up response (remove markdown code blocks if present)
    const cleanResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanResult);
  } catch (error) {
    console.error('generateSegmentRules Error:', error.message);
    return [];
  }
}

// Generate campaign performance summary
async function generateCampaignSummary(campaignData) {
  const prompt = `
  Generate a human-readable performance summary for this marketing campaign:
  
  Campaign Name: ${campaignData.name}
  Audience Size: ${campaignData.audienceSize}
  Messages Sent: ${campaignData.sent}
  Messages Failed: ${campaignData.failed}
  Delivery Rate: ${Math.round((campaignData.sent / campaignData.audienceSize) * 100)}%
  
  Additional Context:
  - Campaign Objective: ${campaignData.objective}
  - Target Segment: ${campaignData.description}
  
  Provide:
  1. A 1-2 sentence overview of performance
  2. 2-3 key insights
  3. 1-2 recommendations for improvement
  
  Format as a short paragraph (3-5 sentences total).
  `;

  try {
    const result = await callGeminiAPI(prompt);
    return result || 'Performance analysis unavailable at this time.';
  } catch (error) {
    console.error('generateCampaignSummary Error:', error.message);
    return 'Performance analysis unavailable due to technical issues.';
  }
}

module.exports = {
  generateAIMessage,
  generateSegmentRules,
  generateCampaignSummary
};