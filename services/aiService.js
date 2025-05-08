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

// Generate multiple message variants with tone and image suggestions
async function generateMessageVariants(campaignData) {
  const { objective, audienceDescription, baseMessage, tonePreference } = campaignData;
  
  const prompt = `
  You are a marketing expert for a CRM platform. Generate 3 message variants for this campaign:
  
  Campaign Objective: ${objective}
  Audience: ${audienceDescription}
  Base Message: "${baseMessage}"
  Tone Preference: ${tonePreference || 'professional'}
  
  For each variant:
  1. Provide the message text (1-2 sentences)
  2. Suggest an image concept that would pair well with the message
  3. Explain why this variant might resonate with the audience
  
  Format as a JSON array with message, imageIdea, and rationale properties.
  `;

  try {
    const result = await callGeminiAPI(prompt);
    if (!result) return [];
    
    // Clean up response (remove markdown code blocks if present)
    const cleanResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanResult);
  } catch (error) {
    console.error('generateMessageVariants Error:', error.message);
    return [];
  }
}

// Generate structured performance analysis with insights and recommendations
async function generatePerformanceSummary(campaignData) {
  const prompt = `
  Analyze this marketing campaign data and provide insights:
  
  Campaign Name: ${campaignData.name}
  Campaign Type: ${campaignData.type || 'Standard'}
  Audience Size: ${campaignData.audienceSize}
  Messages Sent: ${campaignData.sent}
  Messages Failed: ${campaignData.failed}
  Open Rate: ${campaignData.openRate || 'N/A'}
  Click Rate: ${campaignData.clickRate || 'N/A'}
  Conversion Rate: ${campaignData.conversionRate || 'N/A'}
  
  Provide:
  1. A performance summary (2-3 sentences)
  2. 3 key insights with supporting data
  3. 2-3 actionable recommendations
  4. Comparison to industry benchmarks if available
  
  Format as JSON with summary, insights (array), recommendations (array), and benchmarks properties.
  `;

  try {
    const result = await callGeminiAPI(prompt);
    if (!result) return { summary: 'Analysis unavailable at this time.' };
    
    // Clean up response (remove markdown code blocks if present)
    const cleanResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanResult);
  } catch (error) {
    console.error('generatePerformanceSummary Error:', error.message);
    return { 
      summary: 'Analysis unavailable due to technical issues.',
      insights: [],
      recommendations: [],
      benchmarks: {}
    };
  }
}

// Get AI recommendations for optimal send times
async function getOptimalSendTime(segmentData) {
  const prompt = `
  Based on this audience segment information, recommend the optimal send times for a marketing campaign:
  
  Segment Rules: ${JSON.stringify(segmentData.rules || [])}
  Segment Description: ${segmentData.description || 'General audience'}
  Industry: ${segmentData.industry || 'General'}
  
  Provide:
  1. The top 3 best times to send (in HH:MM format, 24-hour)
  2. The worst time to send (to avoid)
  3. A brief explanation for your recommendations
  
  Format as JSON with best_times (array), worst_time (string), and rationale (string) properties.
  `;

  try {
    const result = await callGeminiAPI(prompt);
    if (!result) return { best_times: ['09:00', '12:00', '17:00'], worst_time: '03:00', rationale: 'Based on general engagement patterns.' };
    
    // Clean up response (remove markdown code blocks if present)
    const cleanResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanResult);
  } catch (error) {
    console.error('getOptimalSendTime Error:', error.message);
    return { 
      best_times: ['09:00', '12:00', '17:00'], 
      worst_time: '03:00', 
      rationale: 'Default recommendations due to processing error.' 
    };
  }
}

// Generate lookalike audience rules based on high-value customers
async function generateLookalikeAudience(audienceData) {
  const { highValueCustomers, segmentDescription } = audienceData;
  
  const prompt = `
  Create lookalike audience rules based on these high-value customer profiles:
  
  High-Value Customers: ${JSON.stringify(highValueCustomers || [])}
  Original Segment Description: "${segmentDescription || 'Top customers'}"
  
  Identify patterns and create lookalike segment rules in this format:
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
    console.error('generateLookalikeAudience Error:', error.message);
    return [];
  }
}

// Automatically generate relevant tags for a campaign
async function autoTagCampaign(campaignData) {
  const { name, objective, messageTemplate } = campaignData;
  
  const prompt = `
  Auto-generate 3-5 relevant tags for this marketing campaign:
  
  Campaign Name: ${name || ''}
  Campaign Objective: ${objective || ''}
  Message Content: "${messageTemplate || ''}"
  
  Tags should be:
  1. Single words or short phrases (lowercase)
  2. Relevant to the campaign content, audience, or objective
  3. Useful for filtering and organizing campaigns
  
  Return only a JSON array of tag strings.
  `;

  try {
    const result = await callGeminiAPI(prompt);
    if (!result) return [];
    
    // Clean up response (remove markdown code blocks if present)
    const cleanResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanResult);
  } catch (error) {
    console.error('autoTagCampaign Error:', error.message);
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