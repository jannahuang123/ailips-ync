#!/usr/bin/env node

/**
 * 🔧 用户积分修复脚本
 * 
 * 功能：
 * 1. 检查当前用户积分状态
 * 2. 为积分不足的用户增加积分
 * 3. 验证API端点可用性
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

console.log('🔧 用户积分修复脚本启动...\n');

// 检查环境变量
function checkEnvironment() {
  console.log('📋 检查环境配置...');
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'AUTH_SECRET',
    'AUTH_URL'
  ];
  
  const missing = requiredEnvVars.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    console.error('❌ 缺少必要的环境变量:', missing.join(', '));
    console.log('💡 请确保 .env.local 文件包含所有必要的配置');
    process.exit(1);
  }
  
  console.log('✅ 环境配置检查通过\n');
}

// 检查数据库连接
async function checkDatabase() {
  console.log('🗄️  检查数据库连接...');
  
  try {
    // 使用 Drizzle 检查数据库连接
    const { db } = require('../src/db');
    const { users } = require('../src/db/schema');
    
    // 简单查询测试连接
    const userCount = await db.select().from(users).limit(1);
    console.log('✅ 数据库连接正常\n');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 检查用户积分状态
async function checkUserCredits() {
  console.log('💳 检查用户积分状态...');
  
  try {
    const { db } = require('../src/db');
    const { users, credits } = require('../src/db/schema');
    const { eq, sql } = require('drizzle-orm');
    
    // 获取所有用户及其积分
    const usersWithCredits = await db
      .select({
        uuid: users.uuid,
        email: users.email,
        nickname: users.nickname,
        totalCredits: sql`COALESCE(SUM(${credits.credits}), 0)`.as('totalCredits')
      })
      .from(users)
      .leftJoin(credits, eq(users.uuid, credits.user_uuid))
      .groupBy(users.uuid, users.email, users.nickname);
    
    console.log('📊 用户积分统计:');
    console.log('─'.repeat(80));
    console.log('用户邮箱'.padEnd(30) + '昵称'.padEnd(20) + '积分余额');
    console.log('─'.repeat(80));
    
    let lowCreditUsers = [];
    
    usersWithCredits.forEach(user => {
      const credits = parseInt(user.totalCredits) || 0;
      const status = credits < 10 ? '⚠️ 积分不足' : '✅ 积分充足';
      
      console.log(
        (user.email || 'N/A').padEnd(30) + 
        (user.nickname || 'N/A').padEnd(20) + 
        `${credits} ${status}`
      );
      
      if (credits < 10) {
        lowCreditUsers.push(user);
      }
    });
    
    console.log('─'.repeat(80));
    console.log(`📈 总用户数: ${usersWithCredits.length}`);
    console.log(`⚠️  积分不足用户: ${lowCreditUsers.length}\n`);
    
    return lowCreditUsers;
    
  } catch (error) {
    console.error('❌ 检查用户积分失败:', error.message);
    return [];
  }
}

// 为用户增加积分
async function addCreditsToUsers(users) {
  if (users.length === 0) {
    console.log('✅ 所有用户积分充足，无需增加积分\n');
    return;
  }
  
  console.log(`💰 为 ${users.length} 个用户增加积分...`);
  
  try {
    const { increaseCredits, CreditsTransType } = require('../src/services/credit');
    const { getOneYearLaterTimestr } = require('../src/lib/time');
    
    for (const user of users) {
      console.log(`  📝 为用户 ${user.email} 增加 50 积分...`);
      
      await increaseCredits({
        user_uuid: user.uuid,
        trans_type: CreditsTransType.SystemAdd,
        credits: 50,
        expired_at: getOneYearLaterTimestr(),
      });
      
      console.log(`  ✅ 成功为 ${user.email} 增加 50 积分`);
    }
    
    console.log(`✅ 成功为 ${users.length} 个用户增加积分\n`);
    
  } catch (error) {
    console.error('❌ 增加积分失败:', error.message);
  }
}

// 测试API端点
async function testAPIEndpoints() {
  console.log('🔍 测试API端点可用性...');
  
  const endpoints = [
    '/api/get-user-credits',
    '/api/get-user-info',
    '/api/lipsync/create'
  ];
  
  // 这里只是检查路由文件是否存在
  endpoints.forEach(endpoint => {
    const routePath = path.join(__dirname, '..', 'src', 'app', 'api', endpoint.slice(5), 'route.ts');
    const exists = fs.existsSync(routePath);
    console.log(`  ${exists ? '✅' : '❌'} ${endpoint} - ${exists ? '路由文件存在' : '路由文件缺失'}`);
  });
  
  console.log('');
}

// 主函数
async function main() {
  try {
    checkEnvironment();
    
    const dbConnected = await checkDatabase();
    if (!dbConnected) {
      console.log('❌ 数据库连接失败，脚本终止');
      process.exit(1);
    }
    
    await testAPIEndpoints();
    
    const lowCreditUsers = await checkUserCredits();
    await addCreditsToUsers(lowCreditUsers);
    
    console.log('🎉 积分修复脚本执行完成！');
    console.log('💡 建议：');
    console.log('  1. 重启开发服务器以确保更改生效');
    console.log('  2. 清除浏览器缓存并重新登录');
    console.log('  3. 测试LipSync功能是否正常工作');
    
  } catch (error) {
    console.error('❌ 脚本执行失败:', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { main };
