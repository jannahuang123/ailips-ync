#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testAPIDirectly() {
  console.log('🧪 Testing API endpoints directly...\n');

  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Check if API route exists
    console.log('1️⃣ Testing API route existence...');
    const response = await fetch(`${baseUrl}/api/upload/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Status Text: ${response.statusText}`);
    
    if (response.status === 404) {
      console.log('❌ API route not found - this indicates a routing issue');
      return;
    }
    
    if (response.status === 401) {
      console.log('✅ API route exists but requires authentication (expected)');
    }
    
    const result = await response.text();
    console.log(`   Response: ${result}\n`);
    
    // Test 2: Check session endpoint
    console.log('2️⃣ Testing session endpoint...');
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`);
    console.log(`   Session Status: ${sessionResponse.status}`);
    
    const sessionData = await sessionResponse.json();
    console.log(`   Session Data:`, sessionData);
    
    if (!sessionData.user) {
      console.log('ℹ️  No active session - user needs to sign in');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the development server is running on port 3000');
      console.log('   Run: npm run dev');
    }
  }
}

// Run the test
testAPIDirectly().catch(console.error);
