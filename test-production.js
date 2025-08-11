#!/usr/bin/env node

/**
 * Production Environment Test Script
 * Run this to test your production environment before deploying
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://www.freejobai.com';

// Test functions
async function testEndpoint(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = `${PRODUCTION_URL}${endpoint}`;
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Production-Test-Script/1.0'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = client.request(url, options, (res) => {
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

async function runTests() {
  console.log('🚀 Starting Production Environment Tests...\n');
  
  try {
    // Test 1: MongoDB Connection
    console.log('1️⃣ Testing MongoDB Connection...');
    const mongoTest = await testEndpoint('/api/test-mongodb');
    console.log(`   Status: ${mongoTest.status}`);
    console.log(`   Response: ${JSON.stringify(mongoTest.data, null, 2)}`);
    
    if (mongoTest.status === 200 && mongoTest.data.success) {
      console.log('   ✅ MongoDB connection successful\n');
    } else {
      console.log('   ❌ MongoDB connection failed\n');
    }
    
    // Test 2: Login Endpoint (without credentials)
    console.log('2️⃣ Testing Login Endpoint...');
    const loginTest = await testEndpoint('/api/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'testpassword'
    });
    console.log(`   Status: ${loginTest.status}`);
    
    if (loginTest.status === 401) {
      console.log('   ✅ Login endpoint working (expected 401 for invalid credentials)\n');
    } else if (loginTest.status === 500) {
      console.log('   ❌ Login endpoint returning 500 error\n');
    } else {
      console.log(`   ⚠️  Unexpected status: ${loginTest.status}\n`);
    }
    
    // Test 3: Check if site is accessible
    console.log('3️⃣ Testing Site Accessibility...');
    const siteTest = await testEndpoint('/');
    console.log(`   Status: ${siteTest.status}`);
    
    if (siteTest.status === 200) {
      console.log('   ✅ Site is accessible\n');
    } else {
      console.log('   ❌ Site accessibility issues\n');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
  
  console.log('🏁 Tests completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Check the MongoDB test results above');
  console.log('2. If MongoDB fails, check your MONGODB_URI environment variable');
  console.log('3. If login returns 500, check your JWT_SECRET environment variable');
  console.log('4. Redeploy after setting environment variables');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEndpoint, runTests };
