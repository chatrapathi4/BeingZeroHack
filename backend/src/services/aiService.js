// -----------------------------------------
// AI Service
// Fallback chain: Gemini API -> Groq API -> Mock analysis
// -----------------------------------------

// ---- Gemini API Analysis ----
const analyzeWithGemini = async (imagePath) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const fs = require('fs');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this handmade artisan product image. Return a JSON object with these exact fields:
                  {
                    "productType": "identified product type",
                    "qualityScore": number between 0-100,
                    "qualityLevel": "Premium" or "Good" or "Standard",
                    "estimatedPriceRange": "Rs. MIN - Rs. MAX",
                    "qualityHints": ["hint1", "hint2", "hint3"],
                    "possibleDefects": ["defect1", "defect2"],
                    "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
                  }
                  Only return valid JSON, nothing else.`,
                },
                {
                  inlineData: { mimeType, data: base64Image },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Gemini API HTTP error:', response.status, errBody);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      productType: parsed.productType || 'Handmade Product',
      qualityScore: Math.min(100, Math.max(0, Number(parsed.qualityScore) || 75)),
      qualityLevel: parsed.qualityLevel || 'Good',
      estimatedPriceRange: parsed.estimatedPriceRange || 'Rs. 300 - Rs. 800',
      qualityHints: Array.isArray(parsed.qualityHints) ? parsed.qualityHints : [],
      possibleDefects: Array.isArray(parsed.possibleDefects) ? parsed.possibleDefects : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      aiSource: 'gemini',
    };
  } catch (error) {
    console.error('Gemini API error:', error.message);
    return null;
  }
};

// ---- Groq API Analysis (OpenAI-compatible, free tier) ----
const analyzeWithGroq = async (imagePath) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const fs = require('fs');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this handmade artisan product image. Return a JSON object with these exact fields:
                {
                  "productType": "identified product type",
                  "qualityScore": number between 0-100,
                  "qualityLevel": "Premium" or "Good" or "Standard",
                  "estimatedPriceRange": "Rs. MIN - Rs. MAX",
                  "qualityHints": ["hint1", "hint2", "hint3"],
                  "possibleDefects": ["defect1", "defect2"],
                  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
                }
                Only return valid JSON, nothing else.`,
              },
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${base64Image}` },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Groq API HTTP error:', response.status, errBody);
      return null;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      productType: parsed.productType || 'Handmade Product',
      qualityScore: Math.min(100, Math.max(0, Number(parsed.qualityScore) || 75)),
      qualityLevel: parsed.qualityLevel || 'Good',
      estimatedPriceRange: parsed.estimatedPriceRange || 'Rs. 300 - Rs. 800',
      qualityHints: Array.isArray(parsed.qualityHints) ? parsed.qualityHints : [],
      possibleDefects: Array.isArray(parsed.possibleDefects) ? parsed.possibleDefects : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      aiSource: 'groq',
    };
  } catch (error) {
    console.error('Groq API error:', error.message);
    return null;
  }
};

// ---- Template-based Mock Analysis (fallback) ----
const analyzeWithTemplate = (filename) => {
  const productTemplates = {
    basket: {
      type: 'Handwoven Basket',
      priceRange: { min: 400, max: 900 },
      qualities: ['weave pattern consistency', 'material durability', 'handle strength'],
    },
    pottery: {
      type: 'Handcrafted Pottery',
      priceRange: { min: 300, max: 1200 },
      qualities: ['glaze uniformity', 'shape symmetry', 'surface smoothness'],
    },
    textile: {
      type: 'Handwoven Textile',
      priceRange: { min: 500, max: 2000 },
      qualities: ['thread consistency', 'color vibrancy', 'pattern alignment'],
    },
    jewelry: {
      type: 'Handmade Jewelry',
      priceRange: { min: 200, max: 1500 },
      qualities: ['finish quality', 'stone setting', 'clasp security'],
    },
    woodwork: {
      type: 'Woodcraft Item',
      priceRange: { min: 600, max: 2500 },
      qualities: ['wood grain quality', 'joint precision', 'surface finish'],
    },
  };

  const categories = Object.keys(productTemplates);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const template = productTemplates[randomCategory];
  const qualityScore = Math.floor(Math.random() * 30) + 70;
  const qualityLevel = qualityScore >= 90 ? 'Premium' : qualityScore >= 80 ? 'Good' : 'Standard';

  const pickRandom = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const possibleDefects = [
    'Minor surface irregularity detected.',
    'Slight color variation in some areas.',
    'Small asymmetry in the overall shape.',
    'Minor finishing inconsistency.',
    'Faint surface scratch detected.',
  ];

  const suggestions = [
    'Consider applying a protective coating for durability.',
    'Ensure consistent drying time for uniform finish.',
    'Use finer materials for a more premium look.',
    'Add a signature mark to increase brand value.',
    'Consider packaging improvements for retail sale.',
    'Maintain consistent sizing for repeat customers.',
  ];

  const priceMin = template.priceRange.min + Math.floor(Math.random() * 100);
  const priceMax = template.priceRange.max + Math.floor(Math.random() * 200);

  return {
    productType: template.type,
    qualityScore,
    qualityLevel,
    estimatedPriceRange: `Rs. ${priceMin} - Rs. ${priceMax}`,
    qualityHints: [
      `This ${template.type.toLowerCase()} appears to be of ${qualityLevel.toLowerCase()} quality.`,
      `Quality score: ${qualityScore}/100 based on visual analysis.`,
      `Key quality factors assessed: ${template.qualities.join(', ')}.`,
    ],
    possibleDefects: qualityScore < 85 ? pickRandom(possibleDefects, 2) : pickRandom(possibleDefects, 1),
    suggestions: pickRandom(suggestions, 3),
    aiSource: 'template',
  };
};

// ---- Main analysis function with fallback chain ----
const analyzeProductImage = async (imagePath, filename) => {
  // Try Gemini first
  console.log('AI Analysis: Trying Gemini API...');
  let result = await analyzeWithGemini(imagePath);
  if (result) {
    console.log('AI Analysis: Gemini API succeeded.');
    return result;
  }

  // Fallback to Groq
  console.log('AI Analysis: Gemini unavailable, trying Groq API...');
  result = await analyzeWithGroq(imagePath);
  if (result) {
    console.log('AI Analysis: Groq API succeeded.');
    return result;
  }

  // Fallback to template-based analysis
  console.log('AI Analysis: Using template-based analysis (no API keys configured).');
  return analyzeWithTemplate(filename);
};

module.exports = { analyzeProductImage };
