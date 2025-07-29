#!/usr/bin/env node

/**
 * 为测试用户增加100积分的脚本
 * 
 * 使用方法:
 * node scripts/add-test-credits.js [user_email]
 * 
 * 如果不提供email，将为所有用户增加积分
 */

const { increaseCredits, CreditsTransType } = require('../src/services/credit');
const { getOneYearLaterTimestr } = require('../src/lib/time');
const { findUserByEmail, getUsers } = require('../src/models/user');

console.log('🎯 测试用户积分增加脚本');
console.log('========================');

async function addCreditsToUser(userEmail, credits = 100) {
  try {
    console.log(`\n🔍 查找用户: ${userEmail}`);
    
    const user = await findUserByEmail(userEmail);
    if (!user) {
      console.log(`❌ 用户不存在: ${userEmail}`);
      return false;
    }

    console.log(`✅ 找到用户: ${user.email} (UUID: ${user.uuid})`);
    console.log(`💰 为用户增加 ${credits} 积分...`);

    await increaseCredits({
      user_uuid: user.uuid,
      trans_type: CreditsTransType.SystemAdd,
      credits: credits,
      expired_at: getOneYearLaterTimestr(),
    });

    console.log(`✅ 成功为用户 ${user.email} 增加 ${credits} 积分`);
    console.log(`📅 积分有效期: 1年`);
    
    return true;
  } catch (error) {
    console.error(`❌ 增加积分失败:`, error.message);
    return false;
  }
}

async function addCreditsToAllUsers(credits = 100) {
  try {
    console.log('\n🔍 获取所有用户...');
    
    const users = await getUsers(1, 100); // 获取前100个用户
    if (!users || users.length === 0) {
      console.log('❌ 没有找到任何用户');
      return;
    }

    console.log(`✅ 找到 ${users.length} 个用户`);
    
    let successCount = 0;
    for (const user of users) {
      try {
        console.log(`\n💰 为用户 ${user.email} 增加 ${credits} 积分...`);
        
        await increaseCredits({
          user_uuid: user.uuid,
          trans_type: CreditsTransType.SystemAdd,
          credits: credits,
          expired_at: getOneYearLaterTimestr(),
        });

        console.log(`✅ 成功为 ${user.email} 增加 ${credits} 积分`);
        successCount++;
      } catch (error) {
        console.error(`❌ 为 ${user.email} 增加积分失败:`, error.message);
      }
    }

    console.log(`\n📊 处理完成:`);
    console.log(`✅ 成功: ${successCount}/${users.length}`);
    console.log(`❌ 失败: ${users.length - successCount}/${users.length}`);
    
  } catch (error) {
    console.error('❌ 获取用户列表失败:', error.message);
  }
}

async function checkUserCredits(userEmail) {
  try {
    const { getUserCredits } = require('../src/services/credit');
    const user = await findUserByEmail(userEmail);
    
    if (!user) {
      console.log(`❌ 用户不存在: ${userEmail}`);
      return;
    }

    const credits = await getUserCredits(user.uuid);
    console.log(`\n💳 用户 ${userEmail} 当前积分:`);
    console.log(`   剩余积分: ${credits.left_credits}`);
    console.log(`   是否充值用户: ${credits.is_recharged ? '是' : '否'}`);
    console.log(`   是否Pro用户: ${credits.is_pro ? '是' : '否'}`);
    
  } catch (error) {
    console.error('❌ 查询积分失败:', error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const userEmail = args[0];
  const credits = parseInt(args[1]) || 100;

  if (userEmail) {
    if (userEmail === '--check') {
      const emailToCheck = args[1];
      if (!emailToCheck) {
        console.log('❌ 请提供要查询的用户邮箱');
        console.log('使用方法: node scripts/add-test-credits.js --check user@example.com');
        process.exit(1);
      }
      await checkUserCredits(emailToCheck);
    } else if (userEmail === '--all') {
      await addCreditsToAllUsers(credits);
    } else {
      // 为特定用户增加积分
      const success = await addCreditsToUser(userEmail, credits);
      if (success) {
        await checkUserCredits(userEmail);
      }
    }
  } else {
    console.log('📋 使用说明:');
    console.log('');
    console.log('1. 为特定用户增加积分:');
    console.log('   node scripts/add-test-credits.js user@example.com [积分数量]');
    console.log('   例如: node scripts/add-test-credits.js test@example.com 100');
    console.log('');
    console.log('2. 为所有用户增加积分:');
    console.log('   node scripts/add-test-credits.js --all [积分数量]');
    console.log('   例如: node scripts/add-test-credits.js --all 50');
    console.log('');
    console.log('3. 查询用户积分:');
    console.log('   node scripts/add-test-credits.js --check user@example.com');
    console.log('');
    console.log('💡 默认积分数量: 100');
    console.log('💡 积分有效期: 1年');
    process.exit(1);
  }
}

// 运行脚本
main().catch(error => {
  console.error('💥 脚本执行失败:', error);
  process.exit(1);
});
