#!/usr/bin/env node

/**
 * LipSyncVideo 环境变量配置助手
 * 使用方法: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(process.cwd(), '.env.local');

console.log('🎬 LipSyncVideo 环境变量配置助手');
console.log('=====================================\n');

const questions = [
  {
    key: 'DATABASE_URL',
    question: '📊 请输入 Supabase 数据库连接字符串 (DATABASE_URL):',
    required: true,
    example: 'postgresql://postgres:password@db.project.supabase.co:5432/postgres'
  },
  {
    key: 'AUTH_GOOGLE_ID',
    question: '🔐 请输入 Google OAuth 客户端 ID (AUTH_GOOGLE_ID):',
    required: true,
    example: 'your-client-id.apps.googleusercontent.com'
  },
  {
    key: 'AUTH_GOOGLE_SECRET',
    question: '🔐 请输入 Google OAuth 客户端密钥 (AUTH_GOOGLE_SECRET):',
    required: true,
    example: 'GOCSPX-your-client-secret'
  },
  {
    key: 'APICORE_API_KEY',
    question: '🤖 请输入 APICore.ai API 密钥 (APICORE_API_KEY):',
    required: false,
    example: 'your-apicore-api-key'
  },
  {
    key: 'HEYGEN_API_KEY',
    question: '🎭 请输入 HeyGen API 密钥 (HEYGEN_API_KEY) [可选]:',
    required: false,
    example: 'your-heygen-api-key'
  },
  {
    key: 'STRIPE_PUBLIC_KEY',
    question: '💳 请输入 Stripe 公钥 (STRIPE_PUBLIC_KEY):',
    required: false,
    example: 'pk_test_your_stripe_public_key'
  },
  {
    key: 'STRIPE_PRIVATE_KEY',
    question: '💳 请输入 Stripe 私钥 (STRIPE_PRIVATE_KEY):',
    required: false,
    example: 'sk_test_your_stripe_secret_key'
  }
];

const envConfig = {
  // 基础配置
  NEXT_PUBLIC_WEB_URL: 'http://localhost:3000',
  NEXT_PUBLIC_PROJECT_NAME: 'LipSyncVideo',
  
  // 认证配置
  AUTH_SECRET: 'Zt3BXVudzzRq2R2WBqhwRy1dNMq48Gg9zKAYq7YwSL0=',
  AUTH_URL: 'http://localhost:3000/api/auth',
  AUTH_TRUST_HOST: 'true',
  NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: 'true',
  NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED: 'true',
  
  // AI 服务配置
  APICORE_BASE_URL: 'https://api.apicore.ai',
  APICORE_VERSION: 'v1',
  HEYGEN_BASE_URL: 'https://api.heygen.com',
  DID_BASE_URL: 'https://api.d-id.com',
  
  // 文件处理配置
  MAX_IMAGE_SIZE: '10485760',
  MAX_AUDIO_SIZE: '52428800',
  MAX_VIDEO_SIZE: '104857600',
  SUPPORTED_IMAGE_FORMATS: 'jpg,jpeg,png,webp,heic',
  SUPPORTED_AUDIO_FORMATS: 'mp3,wav,m4a,ogg',
  SUPPORTED_VIDEO_FORMATS: 'mp4,mov,webm',
  
  // 积分系统配置
  CREDITS_PER_LIPSYNC_GENERATION: '10',
  CREDITS_PER_HD_EXPORT: '5',
  CREDITS_PER_4K_EXPORT: '15',
  FREE_TIER_MONTHLY_CREDITS: '100',
  
  // 支付配置
  NEXT_PUBLIC_PAY_SUCCESS_URL: 'http://localhost:3000/my-orders',
  NEXT_PUBLIC_PAY_FAIL_URL: 'http://localhost:3000/#pricing',
  NEXT_PUBLIC_PAY_CANCEL_URL: 'http://localhost:3000/#pricing',
  
  // 安全配置
  API_RATE_LIMIT_PER_MINUTE: '60',
  API_RATE_LIMIT_PER_HOUR: '1000',
  CORS_ALLOWED_ORIGINS: 'http://localhost:3000',
  
  // Redis 配置
  REDIS_HOST: 'localhost',
  REDIS_PORT: '6379',
  REDIS_DB: '0',
  
  // 其他配置
  NEXT_PUBLIC_LOCALE_DETECTION: 'false',
  NEXT_PUBLIC_DEFAULT_THEME: 'light',
  ADMIN_EMAILS: '',
  TEMP_FILE_RETENTION_HOURS: '24',
  MAX_CONCURRENT_UPLOADS: '3',
  ENABLE_VIRUS_SCAN: 'false',
  ENABLE_CONTENT_MODERATION: 'false'
};

async function askQuestion(question, example, required = false) {
  return new Promise((resolve) => {
    const prompt = required 
      ? `${question} (必填)\n示例: ${example}\n> `
      : `${question} (可选)\n示例: ${example}\n> `;
    
    rl.question(prompt, (answer) => {
      if (required && !answer.trim()) {
        console.log('❌ 此字段为必填项，请重新输入\n');
        askQuestion(question, example, required).then(resolve);
      } else {
        resolve(answer.trim());
      }
    });
  });
}

async function main() {
  console.log('请按照提示输入配置信息，按 Enter 跳过可选项\n');
  
  for (const q of questions) {
    const answer = await askQuestion(q.question, q.example, q.required);
    if (answer) {
      envConfig[q.key] = answer;
      if (q.key === 'AUTH_GOOGLE_ID') {
        envConfig['NEXT_PUBLIC_AUTH_GOOGLE_ID'] = answer;
      }
    }
  }
  
  // 生成 .env.local 文件
  const envContent = Object.entries(envConfig)
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ 环境变量配置完成！');
  console.log(`📁 配置文件已保存到: ${envPath}`);
  console.log('\n🚀 下一步操作:');
  console.log('1. 检查 .env.local 文件内容');
  console.log('2. 运行 npm run dev 启动开发服务器');
  console.log('3. 访问 http://localhost:3000 测试应用');
  
  rl.close();
}

main().catch(console.error);
