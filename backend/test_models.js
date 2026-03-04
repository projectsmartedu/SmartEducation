/**
 * Test various model names to find what's available
 */
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModels() {
  console.log('\n🔍 Testing various model names...\n');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Try common model names
  const modelNames = [
    'gemini-pro',
    'gemini-pro-vision',
    'text-bison-001',
    'gemini-1.0-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash',
  ];
  
  const testPrompt = 'Say "Hello"';
  
  for (const modelName of modelNames) {
    try {
      console.log(`🔄 Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(testPrompt);
      const text = result.response.text();
      
      console.log(`✅ SUCCESS: ${modelName}`);
      console.log(`   Response: ${text.substring(0, 50)}...\n`);
      
    } catch (error) {
      const msg = error.message || '';
      if (msg.includes('404') || msg.includes('not found')) {
        console.log(`❌ Not found: ${modelName}\n`);
      } else if (msg.includes('401') || msg.includes('Unauthorized')) {
        console.log(`❌ Unauthorized: ${modelName}\n`);
      } else if (msg.includes('429')) {
        console.log(`⚠️  Rate limited: ${modelName}\n`);
      } else {
        console.log(`❌ Error: ${modelName} - ${msg.substring(0, 60)}...\n`);
      }
    }
  }
}

testModels();
