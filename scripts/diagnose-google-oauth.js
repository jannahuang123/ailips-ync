#!/usr/bin/env node

/**
 * Google OAuth 配置诊断工具
 * 检查 Google OAuth 配置的完整性和正确性
 */

console.log('🔍 Google OAuth 配置诊断工具');
console.log('=' .repeat(60));

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

// 1. 检查环境变量
console.log('\n📋 1. 环境变量检查');
console.log('-'.repeat(40));

const requiredGoogleEnvVars = [
  'AUTH_GOOGLE_ID',
  'AUTH_GOOGLE_SECRET', 
  'NEXT_PUBLIC_AUTH_GOOGLE_ID',
  'NEXT_PUBLIC_AUTH_GOOGLE_ENABLED',
  'NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED',
  'NEXTAUTH_URL',
  'AUTH_SECRET'
];

const envIssues = [];

requiredGoogleEnvVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const displayValue = value ? 
    (varName.includes('SECRET') ? `${value.substring(0, 10)}...` : 
     varName.includes('ID') ? `${value.substring(0, 20)}...` : value) : 
    '未设置';
  
  console.log(`${status} ${varName}: ${displayValue}`);
  
  if (!value) {
    envIssues.push({
      name: varName,
      issue: '环境变量未设置'
    });
  }
});

// 2. 检查 Google Client ID 格式
console.log('\n🔍 2. Google Client ID 格式检查');
console.log('-'.repeat(40));

const googleClientId = process.env.AUTH_GOOGLE_ID;
const publicGoogleClientId = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID;

if (googleClientId) {
  const isValidFormat = googleClientId.includes('.apps.googleusercontent.com');
  console.log(`${isValidFormat ? '✅' : '❌'} AUTH_GOOGLE_ID 格式: ${isValidFormat ? '正确' : '错误'}`);
  
  if (!isValidFormat) {
    envIssues.push({
      name: 'AUTH_GOOGLE_ID',
      issue: 'Client ID 格式不正确，应该以 .apps.googleusercontent.com 结尾'
    });
  }
}

if (publicGoogleClientId) {
  const isValidFormat = publicGoogleClientId.includes('.apps.googleusercontent.com');
  console.log(`${isValidFormat ? '✅' : '❌'} NEXT_PUBLIC_AUTH_GOOGLE_ID 格式: ${isValidFormat ? '正确' : '错误'}`);
  
  if (!isValidFormat) {
    envIssues.push({
      name: 'NEXT_PUBLIC_AUTH_GOOGLE_ID',
      issue: 'Public Client ID 格式不正确'
    });
  }
}

// 检查两个 Client ID 是否一致
if (googleClientId && publicGoogleClientId) {
  const isConsistent = googleClientId === publicGoogleClientId;
  console.log(`${isConsistent ? '✅' : '❌'} Client ID 一致性: ${isConsistent ? '一致' : '不一致'}`);
  
  if (!isConsistent) {
    envIssues.push({
      name: 'Client ID 一致性',
      issue: 'AUTH_GOOGLE_ID 和 NEXT_PUBLIC_AUTH_GOOGLE_ID 不一致'
    });
  }
}

// 3. 检查 Google Secret 格式
console.log('\n🔐 3. Google Client Secret 检查');
console.log('-'.repeat(40));

const googleSecret = process.env.AUTH_GOOGLE_SECRET;
if (googleSecret) {
  const isValidFormat = googleSecret.startsWith('GOCSPX-');
  console.log(`${isValidFormat ? '✅' : '❌'} AUTH_GOOGLE_SECRET 格式: ${isValidFormat ? '正确' : '可能错误'}`);
  
  if (!isValidFormat) {
    console.log('⚠️ Google Client Secret 通常以 GOCSPX- 开头');
  }
}

// 4. 检查回调 URL 配置
console.log('\n🔗 4. 回调 URL 配置检查');
console.log('-'.repeat(40));

const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
  const callbackUrl = `${nextAuthUrl}/api/auth/callback/google`;
  console.log(`✅ 预期回调 URL: ${callbackUrl}`);
  console.log('📋 请确保在 Google Cloud Console 中配置了此回调 URL');
} else {
  console.log('❌ NEXTAUTH_URL 未设置，无法生成回调 URL');
  envIssues.push({
    name: 'NEXTAUTH_URL',
    issue: '未设置 NEXTAUTH_URL'
  });
}

// 5. 检查授权域名
console.log('\n🌐 5. 授权域名检查');
console.log('-'.repeat(40));

if (nextAuthUrl) {
  const domain = new URL(nextAuthUrl).hostname;
  console.log(`✅ 当前域名: ${domain}`);
  console.log('📋 请确保在 Google Cloud Console 的 OAuth 同意屏幕中添加了此域名');
}

// 6. 生成 Google Cloud Console 配置指南
console.log('\n🛠️ 6. Google Cloud Console 配置指南');
console.log('-'.repeat(40));

console.log('请在 Google Cloud Console 中确保以下配置:');
console.log('');
console.log('📍 OAuth 2.0 客户端 ID 配置:');
console.log(`   授权的 JavaScript 来源: ${nextAuthUrl || 'https://lipsyncvideo.net'}`);
console.log(`   授权的重定向 URI: ${nextAuthUrl || 'https://lipsyncvideo.net'}/api/auth/callback/google`);
console.log('');
console.log('📍 OAuth 同意屏幕配置:');
console.log(`   授权域名: ${nextAuthUrl ? new URL(nextAuthUrl).hostname : 'lipsyncvideo.net'}`);
console.log('   作用域: ../auth/userinfo.email, ../auth/userinfo.profile, openid');

// 7. 测试 Google OAuth 端点
console.log('\n🧪 7. 测试建议');
console.log('-'.repeat(40));

console.log('请执行以下测试:');
console.log('');
console.log('1. 访问 Google Cloud Console:');
console.log('   https://console.cloud.google.com/apis/credentials');
console.log('');
console.log('2. 检查 OAuth 2.0 客户端 ID 配置');
console.log('');
console.log('3. 测试登录端点:');
console.log(`   ${nextAuthUrl || 'https://lipsyncvideo.net'}/api/auth/signin/google`);
console.log('');
console.log('4. 检查 Vercel 环境变量是否与本地一致');

// 8. 问题总结
console.log('\n📊 8. 问题总结');
console.log('-'.repeat(40));

if (envIssues.length === 0) {
  console.log('✅ 环境变量配置看起来正确');
  console.log('');
  console.log('如果仍有问题，请检查:');
  console.log('1. Google Cloud Console 中的回调 URL 配置');
  console.log('2. OAuth 同意屏幕的域名配置');
  console.log('3. Vercel 环境变量是否与本地一致');
} else {
  console.log(`❌ 发现 ${envIssues.length} 个配置问题:`);
  envIssues.forEach((issue, index) => {
    console.log(`\n${index + 1}. ${issue.name}`);
    console.log(`   问题: ${issue.issue}`);
  });
}

// 9. 生成修复命令
console.log('\n🔧 9. 可能的修复方案');
console.log('-'.repeat(40));

if (envIssues.length > 0) {
  console.log('请检查并修复 .env.local 文件中的以下配置:');
  console.log('');
  envIssues.forEach(issue => {
    if (issue.name === 'AUTH_GOOGLE_ID') {
      console.log(`${issue.name}="your-google-client-id.apps.googleusercontent.com"`);
    } else if (issue.name === 'AUTH_GOOGLE_SECRET') {
      console.log(`${issue.name}="GOCSPX-your-google-client-secret"`);
    } else if (issue.name === 'NEXTAUTH_URL') {
      console.log(`${issue.name}="https://lipsyncvideo.net"`);
    } else {
      console.log(`${issue.name}="appropriate-value"`);
    }
  });
}

// 10. Data Access 配置检查
console.log('\n🔐 10. Data Access 配置检查');
console.log('-'.repeat(40));

console.log('请确保在 Google Cloud Console 中配置了以下 Data Access 设置:');
console.log('');
console.log('📍 OAuth 同意屏幕 - 作用域 (Scopes):');
console.log('   ✅ ../auth/userinfo.email');
console.log('   ✅ ../auth/userinfo.profile');
console.log('   ✅ openid');
console.log('');
console.log('📍 测试用户 (如果应用状态为 Testing):');
console.log('   - 添加您要测试的 Google 账户邮箱');
console.log('   - 例如: your-email@gmail.com');
console.log('');
console.log('📍 发布状态:');
console.log('   - Testing: 仅测试用户可登录');
console.log('   - In production: 所有用户可登录（需审核）');
console.log('');
console.log('🔗 配置链接:');
console.log('   OAuth 同意屏幕: https://console.cloud.google.com/apis/credentials/consent');

console.log('\n🎯 诊断完成！');
console.log('请根据上述建议检查和修复 Google OAuth 配置。');
console.log('');
console.log('⚠️ 特别注意: Data Access 配置是登录成功的关键！');
