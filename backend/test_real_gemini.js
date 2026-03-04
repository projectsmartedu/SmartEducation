/**
 * Test real Gemini API (not mock)
 * Check if quota has reset
 */
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testRealGemini() {
  console.log('\nTesting Real Gemini API (gemini-2.0-flash)...\n');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = 'What is photosynthesis? Answer in 2 sentences.';
    
    console.log(`Sending request to Gemini API...`);
    console.log(`This may take a few seconds...\n`);
    
    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const endTime = Date.now();
    
    const answer = result.response.text();
    
    console.log(`SUCCESS! Real Gemini API is working!\n`);
    console.log(`Response time: ${endTime - startTime}ms\n`);
    console.log(`Answer:\n${answer}\n`);
    console.log('═'.repeat(60));
    
    process.exit(0);
    
  } catch (error) {
    const msg = error.message || '';
    
    if (msg.includes('429')) {
      console.log(`Quota still exceeded (429)`);
      console.log(`You need to wait or upgrade your plan`);
      console.log(`\nFor now, use MOCK_AI_RESPONSES=true in .env to keep testing\n`);
    } else if (msg.includes('401') || msg.includes('invalid')) {
      console.log(`API Key Invalid (401)`);
      console.log(`Check your GEMINI_API_KEY in .env\n`);
    } else {
      console.log(`Error: ${msg.substring(0, 150)}\n`);
    }
    
    process.exit(1);
  }
}

testRealGemini();
