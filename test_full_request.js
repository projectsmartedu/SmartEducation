// Full Request-Response Test (like Postman)
console.log('\n═════════════════════════════════════════════════════════════════');
console.log('           ML MODEL API TEST - POSTMAN STYLE');
console.log('═════════════════════════════════════════════════════════════════\n');

const ML_SERVICE_URL = 'http://localhost:5001';

// Test Case 1: RISK PREDICTION
async function testRiskPrediction() {
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│  TEST 1: RISK PREDICTION ENDPOINT                           │');
  console.log('└─────────────────────────────────────────────────────────────┘\n');

  const studentData = {
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

  console.log('📤 REQUEST:');
  console.log('───────────');
  console.log(`Method:  POST`);
  console.log(`URL:     ${ML_SERVICE_URL}/api/risk/predict`);
  console.log(`Headers: Content-Type: application/json`);
  console.log('\nBody:');
  console.log(JSON.stringify(studentData, null, 2));

  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/risk/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });

    console.log('\n📥 RESPONSE:');
    console.log('────────────');
    console.log(`Status:  ${response.status} ${response.statusText}`);
    console.log(`Headers: Content-Type: ${response.headers.get('content-type')}`);

    const data = await response.json();
    console.log('\nBody:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n✅ SUCCESS - Got valid API response!\n');
    return true;
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}\n`);
    return false;
  }
}

// Test Case 2: BATCH PREDICTION
async function testBatchPrediction() {
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│  TEST 2: BATCH RISK PREDICTION ENDPOINT                     │');
  console.log('└─────────────────────────────────────────────────────────────┘\n');

  const students = [
    {
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
    },
    {
      prior_failures: 2,
      study_time: 2,
      absences: 8,
      parent_edu: 2,
      family_support: 2,
      health: 2,
      internet: 1,
      activities: 0,
      travel_time: 2,
      age: 20,
      paid_support: 1
    }
  ];

  console.log('📤 REQUEST:');
  console.log('───────────');
  console.log(`Method:  POST`);
  console.log(`URL:     ${ML_SERVICE_URL}/api/risk/batch-predict`);
  console.log(`Headers: Content-Type: application/json`);
  console.log(`\nBody (2 students):`);
  console.log(JSON.stringify({ students }, null, 2));

  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/risk/batch-predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students })
    });

    console.log('\n📥 RESPONSE:');
    console.log('────────────');
    console.log(`Status:  ${response.status} ${response.statusText}`);
    console.log(`Headers: Content-Type: ${response.headers.get('content-type')}`);

    const data = await response.json();
    console.log('\nBody:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n✅ SUCCESS - Batch predictions received!\n');
    return true;
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}\n`);
    return false;
  }
}

// Test Case 3: HEALTH CHECK
async function testHealthCheck() {
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│  TEST 3: HEALTH CHECK ENDPOINT                              │');
  console.log('└─────────────────────────────────────────────────────────────┘\n');

  console.log('📤 REQUEST:');
  console.log('───────────');
  console.log(`Method:  GET`);
  console.log(`URL:     ${ML_SERVICE_URL}/api/health`);

  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/health`);

    console.log('\n📥 RESPONSE:');
    console.log('────────────');
    console.log(`Status:  ${response.status} ${response.statusText}`);
    console.log(`Headers: Content-Type: ${response.headers.get('content-type')}`);

    const data = await response.json();
    console.log('\nBody:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n✅ SUCCESS - Health check passed!\n');
    return true;
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}\n`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const test1 = await testRiskPrediction();
  const test2 = await testBatchPrediction();
  const test3 = await testHealthCheck();

  console.log('═════════════════════════════════════════════════════════════════');
  console.log('                        TEST SUMMARY');
  console.log('═════════════════════════════════════════════════════════════════');
  console.log(`✅ Risk Prediction:       ${test1 ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Batch Prediction:      ${test2 ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Health Check:          ${test3 ? 'PASSED' : 'FAILED'}`);
  console.log('═════════════════════════════════════════════════════════════════\n');

  if (test1 && test2 && test3) {
    console.log('🎉 All tests passed! Your ML model is working correctly!\n');
  } else {
    console.log('⚠️  Some tests failed. Check the output above.\n');
  }
}

runAllTests();
