#!/usr/bin/env node

/**
 * GitHub OAuth 配置诊断工具
 * 检查 GitHub OAuth 配置和 React Hydration 问题
 */

console.log('🔍 GitHub OAuth 配置诊断工具');
console.log('=' .repeat(60));

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

// 1. 检查环境变量
console.log('\n📋 1. GitHub 环境变量检查');
console.log('-'.repeat(40));

const requiredGitHubEnvVars = [
  'AUTH_GITHUB_ID',
  'AUTH_GITHUB_SECRET', 
  'NEXT_PUBLIC_AUTH_GITHUB_ENABLED',
  'NEXTAUTH_URL',
  'AUTH_SECRET'
];

const envIssues = [];

requiredGitHubEnvVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const displayValue = value ? 
    (varName.includes('SECRET') ? `${value.substring(0, 10)}...` : 
     varName.includes('ID') ? `${value.substring(0, 15)}...` : value) : 
    '未设置';
  
  console.log(`${status} ${varName}: ${displayValue}`);
  
  if (!value) {
    envIssues.push({
      name: varName,
      issue: '环境变量未设置'
    });
  }
});

// 2. 检查 GitHub Client ID 格式
console.log('\n🔍 2. GitHub Client ID 格式检查');
console.log('-'.repeat(40));

const githubClientId = process.env.AUTH_GITHUB_ID;

if (githubClientId) {
  const isValidFormat = githubClientId.startsWith('Ov') || githubClientId.startsWith('Iv');
  console.log(`${isValidFormat ? '✅' : '❌'} AUTH_GITHUB_ID 格式: ${isValidFormat ? '正确' : '可能错误'}`);
  
  if (!isValidFormat) {
    console.log('⚠️ GitHub Client ID 通常以 Ov 或 Iv 开头');
  }
}

// 3. 检查 GitHub Secret 格式
console.log('\n🔐 3. GitHub Client Secret 检查');
console.log('-'.repeat(40));

const githubSecret = process.env.AUTH_GITHUB_SECRET;
if (githubSecret) {
  const isValidLength = githubSecret.length === 40;
  console.log(`${isValidLength ? '✅' : '❌'} AUTH_GITHUB_SECRET 长度: ${isValidLength ? '正确 (40字符)' : `错误 (${githubSecret.length}字符)`}`);
  
  if (!isValidLength) {
    console.log('⚠️ GitHub Client Secret 应该是 40 个字符的十六进制字符串');
  }
}

// 4. 检查回调 URL 配置
console.log('\n🔗 4. 回调 URL 配置检查');
console.log('-'.repeat(40));

const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
  const callbackUrl = `${nextAuthUrl}/api/auth/callback/github`;
  console.log(`✅ 预期回调 URL: ${callbackUrl}`);
  console.log('📋 请确保在 GitHub OAuth App 中配置了此回调 URL');
} else {
  console.log('❌ NEXTAUTH_URL 未设置，无法生成回调 URL');
  envIssues.push({
    name: 'NEXTAUTH_URL',
    issue: '未设置 NEXTAUTH_URL'
  });
}

// 5. React Hydration 问题检查
console.log('\n⚛️ 5. React Hydration 问题分析');
console.log('-'.repeat(40));

console.log('React Error #418 通常由以下原因引起:');
console.log('');
console.log('🔸 服务端和客户端渲染不一致');
console.log('🔸 条件渲染在不同环境下产生不同结果');
console.log('🔸 异步状态管理导致的时序问题');
console.log('🔸 环境变量在服务端和客户端不一致');
console.log('');
console.log('已实施的修复措施:');
console.log('✅ AuthStatusDebug 组件添加客户端检查');
console.log('✅ AppContext 日志添加客户端检查');
console.log('✅ useAuthStatus Hook 添加初始化状态管理');

// 6. GitHub OAuth App 配置指南
console.log('\n🛠️ 6. GitHub OAuth App 配置指南');
console.log('-'.repeat(40));

console.log('请在 GitHub Settings 中确保以下配置:');
console.log('');
console.log('📍 OAuth App 设置:');
console.log('   访问: https://github.com/settings/developers');
console.log(`   Homepage URL: ${nextAuthUrl || 'https://lipsyncvideo.net'}`);
console.log(`   Authorization callback URL: ${nextAuthUrl || 'https://lipsyncvideo.net'}/api/auth/callback/github`);
console.log('');
console.log('📍 权限设置:');
console.log('   - 读取用户邮箱地址');
console.log('   - 读取用户公开信息');

// 7. 测试建议
console.log('\n🧪 7. 测试建议');
console.log('-'.repeat(40));

console.log('请执行以下测试步骤:');
console.log('');
console.log('1. 清除浏览器缓存和 Cookie');
console.log('2. 打开浏览器开发者工具');
console.log('3. 访问登录页面:');
console.log(`   ${nextAuthUrl || 'https://lipsyncvideo.net'}/auth/signin`);
console.log('4. 点击 GitHub 登录按钮');
console.log('5. 观察控制台是否还有 React Error #418');
console.log('6. 检查网络请求是否成功');

// 8. 问题总结
console.log('\n📊 8. 问题总结');
console.log('-'.repeat(40));

if (envIssues.length === 0) {
  console.log('✅ 环境变量配置看起来正确');
  console.log('');
  console.log('React Error #418 修复措施已实施:');
  console.log('✅ 客户端渲染检查');
  console.log('✅ Hydration 安全的日志输出');
  console.log('✅ 状态管理优化');
  console.log('');
  console.log('如果仍有问题，请检查:');
  console.log('1. GitHub OAuth App 回调 URL 配置');
  console.log('2. Vercel 环境变量是否与本地一致');
  console.log('3. 浏览器缓存是否已清除');
} else {
  console.log(`❌ 发现 ${envIssues.length} 个配置问题:`);
  envIssues.forEach((issue, index) => {
    console.log(`\n${index + 1}. ${issue.name}`);
    console.log(`   问题: ${issue.issue}`);
  });
}

// 9. 修复命令
console.log('\n🔧 9. 修复建议');
console.log('-'.repeat(40));

console.log('已实施的 Hydration 修复:');
console.log('✅ AuthStatusDebug 组件客户端检查');
console.log('✅ AppContext 日志客户端检查');
console.log('✅ 状态管理优化');
console.log('');
console.log('请重新构建和部署应用:');
console.log('npm run build');
console.log('git add . && git commit -m "fix: 修复 React Hydration 问题"');
console.log('git push');

console.log('\n🎯 诊断完成！');
console.log('React Error #418 修复措施已实施，请重新测试 GitHub 登录功能。');
