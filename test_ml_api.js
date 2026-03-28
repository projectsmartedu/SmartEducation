// Test ML Service API Response
const fs = require('fs');
const path = require('path');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

console.log('\n🔍 Testing ML Model API Responses\n');
console.log(`📡 ML Service URL: ${ML_SERVICE_URL}\n`);

// Sample student data for testing (with required columns for risk prediction)
const testData = {
  prior_failures: 0,
  study_time: 5,
  absences: 2,
  parent_edu: 3,
  family_support: 4,
  health: 4,
  internet: 1,
  activities: 1,
  travel_time: 1,
  age: 18,
  paid_support: 0
};

async function testRiskPrediction() {
  try {
    console.log('1️⃣  Testing Risk Prediction Endpoint...');
    console.log(`   POST ${ML_SERVICE_URL}/api/risk/predict`);
    
    const response = await fetch(`${ML_SERVICE_URL}/api/risk/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
      timeout: 10000
    });

    if (!response.ok) {
      console.log(`   ❌ HTTP Error: ${response.status} ${response.statusText}`);
      return false;
    }

    const data = await response.json();
    console.log('   ✅ Got response!');
    console.log('   Response:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testHealthCheck() {
  try {
    console.log('\n2️⃣  Testing if ML Service is Running...');
    console.log(`   GET ${ML_SERVICE_URL}/`);
    
    const response = await fetch(`${ML_SERVICE_URL}/`, {
      timeout: 5000
    });

    const data = await response.text();
    console.log(`   ✅ Service is running! Status: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`   ❌ Service not responding: ${error.message}`);
    return false;
  }
}

async function runTests() {
  try {
    // Check if service is running
    const isRunning = await testHealthCheck();
    
    if (!isRunning) {
      console.log('\n⚠️  ML Service is not running. Start it with:');
      console.log('   node ml-service/server.js');
      console.log('\n   Or in development:');
      console.log('   nodemon ml-service/server.js\n');
      return;
    }

    // Test API
    await testRiskPrediction();

    console.log('\n✨ Test Summary:');
    console.log('  - If you see responses above, your ML model IS getting API responses');
    console.log('  - If you see errors, check that the ML service is running\n');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run tests
runTests();
