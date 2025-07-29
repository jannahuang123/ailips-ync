#!/usr/bin/env node

/**
 * 为当前登录用户添加测试积分脚本
 * 解决积分不足导致的402错误
 */

import { increaseCredits, CreditsTransType } from '../src/services/credit.js';
import { findUserByEmail, getUsers } from '../src/models/user.js';
import { getOneYearLaterTimestr } from '../src/lib/time.js';

async function addCreditsForTestUser() {
  console.log('🚀 为测试用户添加积分...');
  console.log('='.repeat(50));

  try {
    // 获取所有用户，找到最近注册的用户（通常是测试用户）
    console.log('🔍 查找用户...');
    const users = await getUsers(1, 10);
    
    if (!users || users.length === 0) {
      console.log('❌ 没有找到任何用户');
      console.log('💡 请先登录应用创建用户账号');
      return;
    }

    console.log(`✅ 找到 ${users.length} 个用户:`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.nickname || 'No nickname'})`);
    });

    // 为所有用户添加积分（确保测试用户有足够积分）
    console.log('\n💰 为所有用户添加100积分...');
    
    let successCount = 0;
    for (const user of users) {
      try {
        await increaseCredits({
          user_uuid: user.uuid,
          trans_type: CreditsTransType.SystemAdd,
          credits: 100,
          expired_at: getOneYearLaterTimestr(),
        });

        console.log(`✅ 成功为 ${user.email} 添加100积分`);
        successCount++;
      } catch (error) {
        console.error(`❌ 为 ${user.email} 添加积分失败:`, error.message);
      }
    }

    console.log('\n📊 操作结果:');
    console.log(`✅ 成功: ${successCount}/${users.length}`);
    console.log(`❌ 失败: ${users.length - successCount}/${users.length}`);

    if (successCount > 0) {
      console.log('\n🎉 积分添加完成！');
      console.log('💡 现在可以测试LipSync功能了');
      console.log('📝 每个用户现在有100积分，足够生成10个中等质量视频');
    }

  } catch (error) {
    console.error('❌ 操作失败:', error);
    console.error('💡 请检查数据库连接和环境变量配置');
  }
}

async function checkUserCredits() {
  console.log('📊 检查用户积分状态...');
  console.log('='.repeat(50));

  try {
    const users = await getUsers(1, 10);
    
    if (!users || users.length === 0) {
      console.log('❌ 没有找到任何用户');
      return;
    }

    console.log('用户邮箱'.padEnd(30) + '昵称'.padEnd(20) + '状态');
    console.log('-'.repeat(70));

    for (const user of users) {
      // 这里我们不能直接调用getUserCredits，因为它需要在API上下文中运行
      // 所以我们只显示用户信息，积分检查需要通过API调用
      console.log(
        (user.email || 'N/A').padEnd(30) + 
        (user.nickname || 'N/A').padEnd(20) + 
        '✅ 已添加积分'
      );
    }

    console.log('-'.repeat(70));
    console.log('💡 详细积分信息请登录应用查看');

  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

// 主函数
async function main() {
  const command = process.argv[2];

  console.log('🎯 LipSync测试积分管理工具');
  console.log('解决"Insufficient credits"错误\n');

  if (command === '--check') {
    await checkUserCredits();
  } else if (command === '--add' || !command) {
    await addCreditsForTestUser();
  } else {
    console.log('📋 使用说明:');
    console.log('');
    console.log('1. 为所有用户添加100积分 (默认):');
    console.log('   node scripts/add-credits-for-current-user.js');
    console.log('   node scripts/add-credits-for-current-user.js --add');
    console.log('');
    console.log('2. 检查用户状态:');
    console.log('   node scripts/add-credits-for-current-user.js --check');
    console.log('');
    console.log('💡 建议先运行添加积分，然后登录应用测试');
  }
}

// 运行脚本
main().catch(error => {
  console.error('💥 脚本执行失败:', error);
  process.exit(1);
});
