/**
 * List available models for this API key
 */
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  console.log('\n📋 Checking available models...\n');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    const models = await genAI.listModels();
    
    console.log('✅ Available models:\n');
    let count = 0;
    for await (const model of models) {
      count++;
      console.log(`${count}. ${model.name}`);
    }
    
    if (count === 0) {
      console.log('❌ No models found');
    } else {
      console.log(`\n✅ Total: ${count} models available`);
    }
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
  }
}

listModels();
