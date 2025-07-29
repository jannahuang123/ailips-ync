#!/usr/bin/env node

/**
 * 🔍 谷歌登录和 Supabase 配置诊断脚本
 * 
 * 用途：检查 NextAuth + Google OAuth + Supabase 配置是否正确
 * 运行：node scripts/diagnose-auth.js
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

console.log('🔍 开始诊断谷歌登录和 Supabase 配置...\n');

// 配置检查结果
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  issues: []
};

function checkResult(name, condition, value, expected, severity = 'error') {
  const status = condition ? '✅' : (severity === 'warning' ? '⚠️' : '❌');
  const result = condition ? 'PASS' : (severity === 'warning' ? 'WARN' : 'FAIL');
  
  console.log(`${status} ${name}: ${result}`);
  
  if (!condition) {
    const issue = {
      name,
      severity,
      current: value,
      expected,
      fix: getFixSuggestion(name)
    };
    results.issues.push(issue);
    
    if (severity === 'warning') {
      results.warnings++;
    } else {
      results.failed++;
    }
  } else {
    results.passed++;
  }
  
  if (value && typeof value === 'string' && value.length > 50) {
    console.log(`   值: ${value.substring(0, 30)}...`);
  } else if (value) {
    console.log(`   值: ${value}`);
  }
  console.log();
}

function getFixSuggestion(name) {
  const fixes = {
    'AUTH_GOOGLE_ID': '在 Google Cloud Console 创建 OAuth 2.0 客户端 ID',
    'AUTH_GOOGLE_SECRET': '从 Google Cloud Console 获取客户端密钥',
    'NEXT_PUBLIC_AUTH_GOOGLE_ID': '设置为与 AUTH_GOOGLE_ID 相同的值',
    'DATABASE_URL': '从 Supabase 项目设置中获取数据库连接字符串',
    'AUTH_SECRET': '运行 openssl rand -base64 32 生成新密钥',
    'AUTH_URL': '设置为您的域名 + /api/auth',
    'NEXT_PUBLIC_WEB_URL': '设置为您的实际域名'
  };
  return fixes[name] || '请检查配置文档';
}

// 1. 基础环境变量检查
console.log('📋 1. 基础环境变量检查');
console.log('=' .repeat(50));

checkResult(
  'AUTH_SECRET',
  process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32,
  process.env.AUTH_SECRET,
  '至少32字符的随机字符串'
);

checkResult(
  'AUTH_URL',
  process.env.AUTH_URL && process.env.AUTH_URL.includes('/api/auth'),
  process.env.AUTH_URL,
  'https://your-domain.com/api/auth'
);

checkResult(
  'NEXT_PUBLIC_WEB_URL',
  process.env.NEXT_PUBLIC_WEB_URL && process.env.NEXT_PUBLIC_WEB_URL !== 'http://localhost:3000',
  process.env.NEXT_PUBLIC_WEB_URL,
  '生产环境域名',
  'warning'
);

// 2. 谷歌认证配置检查
console.log('🔐 2. 谷歌认证配置检查');
console.log('=' .repeat(50));

checkResult(
  'NEXT_PUBLIC_AUTH_GOOGLE_ENABLED',
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === 'true',
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED,
  'true'
);

checkResult(
  'AUTH_GOOGLE_ID',
  process.env.AUTH_GOOGLE_ID && 
  process.env.AUTH_GOOGLE_ID !== 'your-google-client-id.apps.googleusercontent.com' &&
  process.env.AUTH_GOOGLE_ID.includes('.apps.googleusercontent.com'),
  process.env.AUTH_GOOGLE_ID,
  '真实的 Google 客户端 ID'
);

checkResult(
  'AUTH_GOOGLE_SECRET',
  process.env.AUTH_GOOGLE_SECRET && 
  process.env.AUTH_GOOGLE_SECRET !== 'your-google-client-secret' &&
  process.env.AUTH_GOOGLE_SECRET.length > 20,
  process.env.AUTH_GOOGLE_SECRET,
  '真实的 Google 客户端密钥'
);

checkResult(
  'NEXT_PUBLIC_AUTH_GOOGLE_ID',
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID === process.env.AUTH_GOOGLE_ID,
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID,
  '与 AUTH_GOOGLE_ID 相同'
);

// 3. 数据库配置检查
console.log('🗄️ 3. Supabase 数据库配置检查');
console.log('=' .repeat(50));

checkResult(
  'DATABASE_URL',
  process.env.DATABASE_URL && 
  process.env.DATABASE_URL.startsWith('postgresql://') &&
  process.env.DATABASE_URL.includes('supabase.com'),
  process.env.DATABASE_URL,
  'postgresql://postgres:password@host:port/postgres'
);

// 4. 生成配置建议
console.log('📝 4. 配置修复建议');
console.log('=' .repeat(50));

if (results.issues.length > 0) {
  console.log('发现以下配置问题：\n');
  
  results.issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.name}`);
    console.log(`   问题: ${issue.current || '未设置'}`);
    console.log(`   期望: ${issue.expected}`);
    console.log(`   修复: ${issue.fix}`);
    console.log();
  });
  
  // 生成 .env.local 模板
  console.log('🔧 建议的 .env.local 配置：');
  console.log('-'.repeat(50));
  console.log(`
# 基础配置
NEXT_PUBLIC_WEB_URL="https://your-domain.com"
AUTH_SECRET="${process.env.AUTH_SECRET || 'run: openssl rand -base64 32'}"
AUTH_URL="https://your-domain.com/api/auth"
AUTH_TRUST_HOST=true

# 谷歌认证 (需要从 Google Cloud Console 获取)
AUTH_GOOGLE_ID="your-real-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-real-client-secret"
NEXT_PUBLIC_AUTH_GOOGLE_ID="your-real-client-id.apps.googleusercontent.com"
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED="true"

# Supabase 数据库 (从 Supabase 项目获取)
DATABASE_URL="${process.env.DATABASE_URL || 'postgresql://postgres:password@host:port/postgres'}"
  `);
  
} else {
  console.log('✅ 所有配置检查通过！');
}

// 5. 总结报告
console.log('📊 5. 诊断总结');
console.log('=' .repeat(50));
console.log(`✅ 通过: ${results.passed}`);
console.log(`❌ 失败: ${results.failed}`);
console.log(`⚠️  警告: ${results.warnings}`);

if (results.failed > 0) {
  console.log('\n🚨 需要修复的关键问题:');
  console.log('1. 设置真实的 Google OAuth 客户端 ID 和密钥');
  console.log('2. 确保 Supabase 数据库连接正常');
  console.log('3. 配置正确的回调 URL');
  
  console.log('\n📚 详细配置指南: GOOGLE_AUTH_SUPABASE_CONFIG_GUIDE.md');
}

console.log('\n🔍 诊断完成！');
