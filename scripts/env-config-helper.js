#!/usr/bin/env node

/**
 * LipSyncVideo 环境变量配置助手
 * 帮助您了解需要配置哪些环境变量以及如何获取它们
 */

const crypto = require('crypto');

console.log('🔑 LipSyncVideo 环境变量配置助手');
console.log('================================\n');

// 生成 AUTH_SECRET
const authSecret = crypto.randomBytes(32).toString('base64');

console.log('✅ 可以自动生成的环境变量：');
console.log('─'.repeat(50));
console.log(`AUTH_SECRET="${authSecret}"`);
console.log(`AUTH_TRUST_HOST="true"`);
console.log(`NEXT_PUBLIC_PROJECT_NAME="LipSyncVideo"`);
console.log(`NEXT_PUBLIC_AUTH_GOOGLE_ENABLED="true"`);

console.log('\n📋 需要您手动获取的环境变量：');
console.log('─'.repeat(50));

console.log('\n🗄️  1. Supabase 数据库配置 (必需)');
console.log('   📍 访问: https://supabase.com');
console.log('   📝 步骤:');
console.log('      1. 创建新项目');
console.log('      2. 进入 Settings → Database');
console.log('      3. 复制 Connection string');
console.log('      4. 进入 Settings → API');
console.log('      5. 复制 Project URL 和 anon public key');
console.log('   🔑 需要获取:');
console.log('      - DATABASE_URL');
console.log('      - NEXT_PUBLIC_SUPABASE_URL');
console.log('      - NEXT_PUBLIC_SUPABASE_ANON_KEY');

console.log('\n🔐 2. Google OAuth 配置 (必需)');
console.log('   📍 访问: https://console.cloud.google.com');
console.log('   📝 步骤:');
console.log('      1. 创建新项目或选择现有项目');
console.log('      2. 启用 Google+ API');
console.log('      3. 配置 OAuth 同意屏幕');
console.log('      4. 创建 OAuth 2.0 客户端 ID');
console.log('      5. 添加重定向 URI: https://your-app.vercel.app/api/auth/callback/google');
console.log('   🔑 需要获取:');
console.log('      - AUTH_GOOGLE_ID (客户端 ID)');
console.log('      - AUTH_GOOGLE_SECRET (客户端密钥)');

console.log('\n🤖 3. AI 服务配置 (可选但推荐)');
console.log('   🎬 HeyGen (推荐):');
console.log('      📍 访问: https://www.heygen.com');
console.log('      🔑 获取: HEYGEN_API_KEY');
console.log('   🔄 APICore (备用):');
console.log('      📍 访问: https://apicore.ai');
console.log('      🔑 获取: APICORE_API_KEY');

console.log('\n💳 4. 支付系统配置 (可选)');
console.log('   📍 访问: https://dashboard.stripe.com');
console.log('   🔑 需要获取:');
console.log('      - STRIPE_PUBLIC_KEY');
console.log('      - STRIPE_PRIVATE_KEY');
console.log('      - STRIPE_WEBHOOK_SECRET');

console.log('\n🛠️  Vercel 环境变量设置命令：');
console.log('─'.repeat(50));

console.log('\n# 1. 设置自动生成的变量');
console.log(`vercel env add AUTH_SECRET production`);
console.log(`# 粘贴: ${authSecret}`);
console.log('');
console.log('vercel env add AUTH_TRUST_HOST production');
console.log('# 输入: true');
console.log('');
console.log('vercel env add NEXT_PUBLIC_PROJECT_NAME production');
console.log('# 输入: LipSyncVideo');
console.log('');
console.log('vercel env add NEXT_PUBLIC_AUTH_GOOGLE_ENABLED production');
console.log('# 输入: true');

console.log('\n# 2. 设置基于您的 Vercel URL 的变量');
console.log('vercel env add NEXT_PUBLIC_WEB_URL production');
console.log('# 输入: https://your-vercel-app.vercel.app');
console.log('');
console.log('vercel env add AUTH_URL production');
console.log('# 输入: https://your-vercel-app.vercel.app/api/auth');

console.log('\n# 3. 设置数据库变量 (需要先创建 Supabase 项目)');
console.log('vercel env add DATABASE_URL production');
console.log('# 输入: postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres');
console.log('');
console.log('vercel env add NEXT_PUBLIC_SUPABASE_URL production');
console.log('# 输入: https://[PROJECT-REF].supabase.co');
console.log('');
console.log('vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production');
console.log('# 输入: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...');

console.log('\n# 4. 设置 Google OAuth 变量 (需要先创建 OAuth 应用)');
console.log('vercel env add AUTH_GOOGLE_ID production');
console.log('# 输入: 123456789-abcdefg.apps.googleusercontent.com');
console.log('');
console.log('vercel env add AUTH_GOOGLE_SECRET production');
console.log('# 输入: GOCSPX-abcdefghijklmnop');
console.log('');
console.log('vercel env add NEXT_PUBLIC_AUTH_GOOGLE_ID production');
console.log('# 输入: 123456789-abcdefg.apps.googleusercontent.com');

console.log('\n📝 配置完成后：');
console.log('─'.repeat(50));
console.log('1. 运行: vercel --prod');
console.log('2. 等待部署完成');
console.log('3. 访问您的应用测试功能');

console.log('\n🎯 最小必需配置清单 (应用才能运行)：');
console.log('─'.repeat(50));
console.log('✅ AUTH_SECRET (已生成)');
console.log('⏳ NEXT_PUBLIC_WEB_URL');
console.log('⏳ AUTH_URL');
console.log('⏳ DATABASE_URL');
console.log('⏳ NEXT_PUBLIC_SUPABASE_URL');
console.log('⏳ NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('⏳ AUTH_GOOGLE_ID');
console.log('⏳ AUTH_GOOGLE_SECRET');
console.log('⏳ NEXT_PUBLIC_AUTH_GOOGLE_ID');

console.log('\n🚀 配置完成后，您的 LipSyncVideo 应用就可以正常运行了！');
console.log('\n📚 详细配置指南: docs/VERCEL_ENV_SETUP_GUIDE.md');
