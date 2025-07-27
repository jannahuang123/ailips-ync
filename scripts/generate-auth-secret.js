#!/usr/bin/env node

/**
 * Generate AUTH_SECRET for LipSyncVideo.net
 * 
 * This script generates a secure random AUTH_SECRET for NextAuth.js
 */

const crypto = require('crypto');

console.log('🔑 AUTH_SECRET Generator for LipSyncVideo.net');
console.log('==============================================\n');

// Generate a secure random 32-byte key
const authSecret = crypto.randomBytes(32).toString('base64');

console.log('✅ Generated AUTH_SECRET:');
console.log('------------------------');
console.log(authSecret);
console.log('------------------------\n');

console.log('📋 How to use this AUTH_SECRET:');
console.log('');
console.log('1. Copy the generated key above');
console.log('2. Go to your Vercel Dashboard');
console.log('3. Navigate to: Project → Settings → Environment Variables');
console.log('4. Add a new environment variable:');
console.log('   - Name: AUTH_SECRET');
console.log('   - Value: [paste the generated key]');
console.log('   - Environment: Production (and Preview if needed)');
console.log('5. Save and redeploy your application');
console.log('');

console.log('🔒 Security Notes:');
console.log('- This key is used to encrypt JWT tokens');
console.log('- Keep it secret and never commit it to your repository');
console.log('- Use different keys for development and production');
console.log('- Store it securely in Vercel environment variables');
console.log('');

console.log('🚀 Next steps:');
console.log('1. Set AUTH_SECRET in Vercel');
console.log('2. Configure your Supabase database connection');
console.log('3. Set up Google OAuth credentials');
console.log('4. Redeploy your application');
console.log('');

console.log('📚 For detailed setup instructions, see:');
console.log('docs/ENVIRONMENT_VARIABLES_GUIDE.md');
