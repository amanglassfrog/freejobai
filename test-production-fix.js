#!/usr/bin/env node

/**
 * Test Script for Production MongoDB SSL Fix
 * Run this after deploying the fix to verify it's working
 */

const https = require('https');

const PRODUCTION_URL = 'https://www.freejobai.com';

async function testEndpoint(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = `${PRODUCTION_URL}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Production-Fix-Test/1.0'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testMongoDBFix() {
  console.log('🔧 Testing Production MongoDB SSL Fix...\n');
  
  try {
    // Test 1: MongoDB Connection (should now work)
    console.log('1️⃣ Testing MongoDB Connection...');
    const mongoTest = await testEndpoint('/api/test-mongodb');
    console.log(`   Status: ${mongoTest.status}`);
    console.log(`   Response: ${JSON.stringify(mongoTest.data, null, 2)}`);
    
    if (mongoTest.status === 200 && mongoTest.data.success) {
      console.log('   ✅ MongoDB connection successful - SSL fix working!\n');
    } else if (mongoTest.status === 500 && mongoTest.data.error && mongoTest.data.error.includes('sslvalidate')) {
      console.log('   ❌ Still getting SSL error - fix not deployed yet\n');
    } else {
      console.log('   ⚠️  MongoDB connection failed with different error\n');
    }
    
    // Test 2: Login Endpoint (should not return 500 anymore)
    console.log('2️⃣ Testing Login Endpoint...');
    const loginTest = await testEndpoint('/api/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'testpassword'
    });
    console.log(`   Status: ${loginTest.status}`);
    
    if (loginTest.status === 500) {
      console.log('   ❌ Still getting 500 error - MongoDB connection issue persists\n');
    } else if (loginTest.status === 401) {
      console.log('   ✅ Login endpoint working (expected 401 for invalid credentials)\n');
    } else {
      console.log(`   ⚠️  Unexpected status: ${loginTest.status}\n`);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
  
  console.log('🏁 Test completed!');
  console.log('\n📋 Results Summary:');
  console.log('- If MongoDB test shows success: SSL fix is working');
  console.log('- If login still returns 500: Check MongoDB connection');
  console.log('- If both work: Your production issue is resolved!');
}

// Run tests if this script is executed directly
if (require.main === module) {
  testMongoDBFix().catch(console.error);
}

module.exports = { testEndpoint, testMongoDBFix };
