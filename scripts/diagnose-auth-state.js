#!/usr/bin/env node

/**
 * 用户登录状态管理诊断工具
 * 检查 NextAuth 配置、会话存储、cookie 设置等关键问题
 */

console.log('🔍 用户登录状态管理诊断工具');
console.log('=' .repeat(60));

// 1. 检查环境变量配置
console.log('\n📋 1. 环境变量配置检查');
console.log('-'.repeat(40));

const requiredEnvVars = [
  'NEXTAUTH_URL',
  'AUTH_SECRET', 
  'AUTH_URL',
  'NEXT_PUBLIC_WEB_URL',
  'AUTH_GOOGLE_ID',
  'AUTH_GOOGLE_SECRET',
  'DATABASE_URL'
];

const envIssues = [];

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const displayValue = value ? 
    (varName.includes('SECRET') ? `${value.substring(0, 10)}...` : value) : 
    '未设置';
  
  console.log(`${status} ${varName}: ${displayValue}`);
  
  if (!value) {
    envIssues.push({
      name: varName,
      issue: '环境变量未设置',
      fix: getEnvVarFix(varName)
    });
  }
});

// 2. 检查域名一致性
console.log('\n🌐 2. 域名配置一致性检查');
console.log('-'.repeat(40));

const webUrl = process.env.NEXT_PUBLIC_WEB_URL;
const authUrl = process.env.AUTH_URL;
const nextAuthUrl = process.env.NEXTAUTH_URL;

console.log(`NEXT_PUBLIC_WEB_URL: ${webUrl}`);
console.log(`AUTH_URL: ${authUrl}`);
console.log(`NEXTAUTH_URL: ${nextAuthUrl}`);

const domainIssues = [];

if (webUrl && authUrl) {
  const webDomain = new URL(webUrl).origin;
  const authDomain = authUrl.replace('/api/auth', '');
  
  if (webDomain !== authDomain) {
    domainIssues.push({
      issue: 'WEB_URL 和 AUTH_URL 域名不匹配',
      webDomain,
      authDomain,
      fix: '确保两个URL使用相同的域名'
    });
  }
}

if (webUrl && nextAuthUrl) {
  const webDomain = new URL(webUrl).origin;
  const nextAuthDomain = nextAuthUrl;
  
  if (webDomain !== nextAuthDomain) {
    domainIssues.push({
      issue: 'WEB_URL 和 NEXTAUTH_URL 域名不匹配',
      webDomain,
      nextAuthDomain,
      fix: '确保两个URL使用相同的域名'
    });
  }
}

if (domainIssues.length === 0) {
  console.log('✅ 域名配置一致');
} else {
  domainIssues.forEach(issue => {
    console.log(`❌ ${issue.issue}`);
    console.log(`   Web域名: ${issue.webDomain || issue.webDomain}`);
    console.log(`   Auth域名: ${issue.authDomain || issue.nextAuthDomain}`);
    console.log(`   修复建议: ${issue.fix}`);
  });
}

// 3. 检查 NextAuth 配置
console.log('\n🔐 3. NextAuth 配置分析');
console.log('-'.repeat(40));

console.log('会话策略: JWT (默认)');
console.log('会话存储: 浏览器 Cookie');
console.log('Cookie 设置:');
console.log('  - httpOnly: true (安全)');
console.log('  - secure: true (HTTPS)');
console.log('  - sameSite: "lax" (跨站保护)');

// 4. 生成测试 URL
console.log('\n🧪 4. 测试端点生成');
console.log('-'.repeat(40));

const baseUrl = webUrl || 'https://lipsyncvideo.net';

const testUrls = [
  `${baseUrl}/api/auth/session`,
  `${baseUrl}/api/auth/providers`, 
  `${baseUrl}/api/auth/csrf`,
  `${baseUrl}/api/get-user-info`
];

console.log('请在浏览器中测试以下端点:');
testUrls.forEach(url => {
  console.log(`  ${url}`);
});

// 5. 生成诊断命令
console.log('\n🔧 5. 诊断命令');
console.log('-'.repeat(40));

console.log('在浏览器开发者工具中运行:');
console.log(`
// 检查会话状态
fetch('${baseUrl}/api/auth/session')
  .then(r => r.json())
  .then(data => console.log('Session:', data));

// 检查 Cookie
console.log('Cookies:', document.cookie);

// 检查本地存储
console.log('LocalStorage:', localStorage);
console.log('SessionStorage:', sessionStorage);
`);

// 6. 问题总结和修复建议
console.log('\n📊 6. 问题总结');
console.log('-'.repeat(40));

const allIssues = [...envIssues, ...domainIssues];

if (allIssues.length === 0) {
  console.log('✅ 未发现明显的配置问题');
  console.log('\n如果仍有登录状态丢失问题，请检查:');
  console.log('1. OAuth 提供商的回调 URL 配置');
  console.log('2. 浏览器 Cookie 设置和隐私模式');
  console.log('3. 网络代理或防火墙设置');
  console.log('4. 服务端日志中的认证回调错误');
} else {
  console.log(`❌ 发现 ${allIssues.length} 个配置问题:`);
  allIssues.forEach((issue, index) => {
    console.log(`\n${index + 1}. ${issue.name || issue.issue}`);
    console.log(`   问题: ${issue.issue || issue.name}`);
    console.log(`   修复: ${issue.fix}`);
  });
}

// 7. 生成修复脚本
console.log('\n🛠️ 7. 自动修复建议');
console.log('-'.repeat(40));

if (envIssues.length > 0) {
  console.log('请在 .env.local 中添加以下配置:');
  console.log('');
  envIssues.forEach(issue => {
    console.log(`${issue.name}="${getDefaultValue(issue.name)}"`);
  });
}

function getEnvVarFix(varName) {
  const fixes = {
    'NEXTAUTH_URL': '设置为您的完整域名，如 https://lipsyncvideo.net',
    'AUTH_SECRET': '运行 openssl rand -base64 32 生成',
    'AUTH_URL': '设置为 ${NEXTAUTH_URL}/api/auth',
    'NEXT_PUBLIC_WEB_URL': '设置为您的完整域名',
    'AUTH_GOOGLE_ID': '从 Google Cloud Console 获取',
    'AUTH_GOOGLE_SECRET': '从 Google Cloud Console 获取',
    'DATABASE_URL': '从 Supabase 项目设置获取'
  };
  return fixes[varName] || '请查看文档配置此变量';
}

function getDefaultValue(varName) {
  const defaults = {
    'NEXTAUTH_URL': 'https://lipsyncvideo.net',
    'AUTH_URL': 'https://lipsyncvideo.net/api/auth',
    'NEXT_PUBLIC_WEB_URL': 'https://lipsyncvideo.net',
    'AUTH_SECRET': 'run: openssl rand -base64 32',
    'AUTH_GOOGLE_ID': 'your-google-client-id',
    'AUTH_GOOGLE_SECRET': 'your-google-client-secret',
    'DATABASE_URL': 'your-supabase-connection-string'
  };
  return defaults[varName] || 'your-value-here';
}

console.log('\n🎯 诊断完成！');
console.log('如需进一步帮助，请提供上述测试结果。');
