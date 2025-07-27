#!/usr/bin/env node

/**
 * Environment Variables Checker for LipSyncVideo.net
 * 
 * This script checks which environment variables are set and which are missing
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Environment Variables Checker');
console.log('================================\n');

// Load environment variables from .env.local if it exists
if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
  console.log('✅ Loaded .env.local file\n');
} else {
  console.log('⚠️  No .env.local file found (this is normal for Vercel deployment)\n');
}

// Define required and optional environment variables
const requiredVars = {
  'Basic Configuration': [
    'NEXT_PUBLIC_WEB_URL',
    'NEXT_PUBLIC_PROJECT_NAME'
  ],
  'Authentication': [
    'AUTH_SECRET',
    'AUTH_URL',
    'AUTH_TRUST_HOST'
  ],
  'Google OAuth': [
    'AUTH_GOOGLE_ID',
    'AUTH_GOOGLE_SECRET',
    'NEXT_PUBLIC_AUTH_GOOGLE_ID'
  ],
  'Database (Supabase)': [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
};

const optionalVars = {
  'AI Services': [
    'HEYGEN_API_KEY',
    'APICORE_API_KEY',
    'DID_API_KEY'
  ],
  'Payment (Stripe)': [
    'STRIPE_PUBLIC_KEY',
    'STRIPE_PRIVATE_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ],
  'Analytics': [
    'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID',
    'SENTRY_DSN'
  ],
  'Email Service': [
    'RESEND_API_KEY'
  ]
};

function checkVariables(vars, isRequired = true) {
  let allSet = true;
  let totalVars = 0;
  let setVars = 0;

  for (const [category, variables] of Object.entries(vars)) {
    console.log(`📋 ${category}:`);
    
    for (const varName of variables) {
      totalVars++;
      const value = process.env[varName];
      
      if (value) {
        setVars++;
        // Show partial value for security
        const displayValue = value.length > 20 
          ? `${value.substring(0, 10)}...${value.substring(value.length - 5)}`
          : value;
        console.log(`   ✅ ${varName} = ${displayValue}`);
      } else {
        if (isRequired) {
          allSet = false;
          console.log(`   ❌ ${varName} = NOT SET`);
        } else {
          console.log(`   ⚪ ${varName} = NOT SET (optional)`);
        }
      }
    }
    console.log('');
  }

  return { allSet, setVars, totalVars };
}

// Check required variables
console.log('🔴 REQUIRED Environment Variables:');
console.log('==================================\n');
const requiredResult = checkVariables(requiredVars, true);

// Check optional variables
console.log('🟡 OPTIONAL Environment Variables:');
console.log('==================================\n');
const optionalResult = checkVariables(optionalVars, false);

// Summary
console.log('📊 SUMMARY:');
console.log('===========');
console.log(`Required variables: ${requiredResult.setVars}/${requiredResult.totalVars} set`);
console.log(`Optional variables: ${optionalResult.setVars}/${optionalResult.totalVars} set`);
console.log('');

if (requiredResult.allSet) {
  console.log('🎉 All required environment variables are set!');
  console.log('Your application should be able to run properly.');
} else {
  console.log('⚠️  Some required environment variables are missing.');
  console.log('Please set them before deploying to production.');
}

console.log('');
console.log('🔧 How to set missing variables:');
console.log('');
console.log('For Vercel deployment:');
console.log('1. Go to https://vercel.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings → Environment Variables');
console.log('4. Add the missing variables');
console.log('5. Redeploy your application');
console.log('');
console.log('For local development:');
console.log('1. Create a .env.local file in your project root');
console.log('2. Add the missing variables in KEY=value format');
console.log('3. Restart your development server');
console.log('');

console.log('📚 For detailed setup instructions:');
console.log('- docs/ENVIRONMENT_VARIABLES_GUIDE.md');
console.log('- Run: node scripts/generate-auth-secret.js (for AUTH_SECRET)');

// Exit with error code if required vars are missing
if (!requiredResult.allSet) {
  process.exit(1);
}
