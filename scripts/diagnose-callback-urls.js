#!/usr/bin/env node

/**
 * 🔍 Google OAuth 回调 URL 和 Supabase 配置诊断脚本
 * 
 * 专门检查：
 * 1. Google OAuth 回调 URL 配置
 * 2. Supabase 数据库连接和表结构
 * 3. NextAuth 会话处理
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

console.log('🔍 诊断 Google OAuth 回调和 Supabase 配置...\n');

// 1. 检查当前域名和回调 URL
console.log('🌐 1. 域名和回调 URL 检查');
console.log('=' .repeat(50));

const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
const authUrl = process.env.AUTH_URL || `${webUrl}/api/auth`;

console.log(`当前域名: ${webUrl}`);
console.log(`认证 URL: ${authUrl}`);

// 生成正确的回调 URL
const expectedCallbackUrls = [
  `${webUrl}/api/auth/callback/google`,
  'http://localhost:3000/api/auth/callback/google' // 开发环境
];

console.log('\n✅ Google OAuth 应该配置的回调 URL:');
expectedCallbackUrls.forEach((url, index) => {
  console.log(`${index + 1}. ${url}`);
});

// 2. 检查 Supabase 数据库连接
console.log('\n🗄️ 2. Supabase 数据库连接检查');
console.log('=' .repeat(50));

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
  console.log('✅ DATABASE_URL 已配置');
  
  // 解析数据库 URL
  try {
    const url = new URL(databaseUrl);
    console.log(`主机: ${url.hostname}`);
    console.log(`端口: ${url.port}`);
    console.log(`数据库: ${url.pathname.substring(1)}`);
    console.log(`用户: ${url.username}`);
    
    if (url.hostname.includes('supabase.com')) {
      console.log('✅ 确认为 Supabase 数据库');
    } else {
      console.log('⚠️ 不是 Supabase 数据库');
    }
  } catch (error) {
    console.log('❌ DATABASE_URL 格式错误:', error.message);
  }
} else {
  console.log('❌ DATABASE_URL 未配置');
}

// 3. 生成测试 SQL 查询
console.log('\n📋 3. 数据库表结构验证 SQL');
console.log('=' .repeat(50));

const testQueries = `
-- 检查用户表是否存在
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 检查积分表是否存在  
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'credits' 
ORDER BY ordinal_position;

-- 检查是否有测试用户数据
SELECT COUNT(*) as user_count FROM users;

-- 检查最近的登录记录
SELECT email, signin_provider, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
`;

console.log('请在 Supabase SQL Editor 中运行以下查询:');
console.log(testQueries);

// 4. NextAuth 配置检查
console.log('\n🔐 4. NextAuth 配置检查');
console.log('=' .repeat(50));

// 检查关键配置
const authSecret = process.env.AUTH_SECRET;
const trustHost = process.env.AUTH_TRUST_HOST;

console.log(`AUTH_SECRET: ${authSecret ? '✅ 已设置' : '❌ 未设置'}`);
console.log(`AUTH_TRUST_HOST: ${trustHost || '未设置'}`);

if (authSecret && authSecret.length < 32) {
  console.log('⚠️ AUTH_SECRET 长度不足 32 字符，可能导致会话问题');
}

// 5. 生成调试代码
console.log('\n🐛 5. 调试代码建议');
console.log('=' .repeat(50));

const debugCode = `
// 在 src/auth/config.ts 的 callbacks 中添加调试日志:

callbacks: {
  async jwt({ token, user, account, profile }) {
    console.log('🔍 JWT Callback:', {
      hasToken: !!token,
      hasUser: !!user,
      hasAccount: !!account,
      provider: account?.provider,
      userEmail: user?.email,
      tokenSub: token?.sub
    });
    
    if (user && account) {
      console.log('👤 新用户登录:', {
        email: user.email,
        provider: account.provider,
        providerAccountId: account.providerAccountId
      });
    }
    
    return token;
  },
  
  async session({ session, token }) {
    console.log('🎫 Session Callback:', {
      hasSession: !!session,
      hasToken: !!token,
      userEmail: session?.user?.email,
      tokenSub: token?.sub
    });
    
    return session;
  },
  
  async signIn({ user, account, profile }) {
    console.log('🚪 SignIn Callback:', {
      userEmail: user?.email,
      provider: account?.provider,
      success: true
    });
    
    try {
      // 这里会调用 handleSignInUser
      return true;
    } catch (error) {
      console.error('❌ SignIn 失败:', error);
      return false;
    }
  }
}
`;

console.log(debugCode);

// 6. 常见问题检查清单
console.log('\n✅ 6. 问题检查清单');
console.log('=' .repeat(50));

const checklist = [
  '□ Google Cloud Console 中的回调 URL 是否包含正确的域名?',
  '□ OAuth 同意屏幕是否已发布 (Published)?',
  '□ 授权域是否包含您的 Vercel 域名?',
  '□ Supabase 数据库是否可以正常连接?',
  '□ users 表是否存在且结构正确?',
  '□ handleSignInUser 函数是否正常保存用户?',
  '□ Vercel 环境变量是否与本地一致?',
  '□ AUTH_SECRET 在所有环境中是否一致?'
];

checklist.forEach(item => console.log(item));

// 7. 生成测试 URL
console.log('\n🧪 7. 测试 URL');
console.log('=' .repeat(50));

console.log('请测试以下 URL:');
console.log(`登录页面: ${webUrl}/auth/signin`);
console.log(`API 健康检查: ${webUrl}/api/auth/providers`);
console.log(`会话检查: ${webUrl}/api/auth/session`);

console.log('\n🔍 诊断完成！');
console.log('\n📝 下一步建议:');
console.log('1. 检查 Google Cloud Console 的回调 URL 配置');
console.log('2. 在 Supabase 中运行上述 SQL 查询验证表结构');
console.log('3. 添加调试日志到 NextAuth 配置');
console.log('4. 检查浏览器开发者工具的网络请求和控制台日志');
