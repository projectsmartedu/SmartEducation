/**
 * Test gemini-2.0-flash model (the only one working with this key)
 */
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModel() {
  console.log('\nTesting Google Gemini Model (gemini-2.0-flash)...\n');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const testPrompt = 'What is photosynthesis? Explain in 2-3 sentences.';
  
  try {
    console.log(`Testing model: gemini-2.0-flash`);
    console.log(`Prompt: "${testPrompt}"\n`);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const startTime = Date.now();
    const result = await model.generateContent(testPrompt);
    const endTime = Date.now();
    
    const answer = result.response.text();
    
    console.log(`SUCCESS! Model is working!\n`);
    console.log(`Response time: ${endTime - startTime}ms\n`);
    console.log(`ANSWER:\n${answer}\n`);
    console.log('═'.repeat(60));
    
    process.exit(0);
      
  } catch (error) {
    const msg = error.message || '';
    console.error(`Model failed: ${msg}`);
    
    if (msg.includes('429')) {
      console.log('\nRate limit exceeded - quota renewed tomorrow');
    }
    process.exit(1);
  }
}

testModel();
