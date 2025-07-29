/**
 * 测试积分添加功能的简单脚本
 * 解决用户积分不足导致的402错误
 */

async function testAddCredits() {
  console.log('🚀 测试积分添加功能...');
  console.log('='.repeat(50));

  const baseUrl = 'http://localhost:3001';
  
  try {
    // 测试添加积分API
    console.log('📝 调用添加积分API...');
    
    const response = await fetch(`${baseUrl}/api/admin/add-test-credits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credits: 100 }),
    });

    console.log(`📊 响应状态: ${response.status}`);
    
    const data = await response.json();
    console.log('📋 响应数据:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('✅ 成功添加积分!');
      console.log(`   用户UUID: ${data.data.user_uuid}`);
      console.log(`   添加积分: ${data.data.credits_added}`);
      console.log(`   原积分: ${data.data.previous_credits}`);
      console.log(`   新积分: ${data.data.current_credits}`);
    } else {
      console.log('❌ 添加积分失败:', data.error);
      
      if (response.status === 401) {
        console.log('💡 提示: 需要先登录应用');
        console.log('   1. 打开浏览器访问: http://localhost:3001');
        console.log('   2. 登录你的账号');
        console.log('   3. 然后访问: http://localhost:3001/admin/add-credits');
      }
    }

  } catch (error) {
    console.error('💥 网络错误:', error.message);
    console.log('💡 请确保开发服务器正在运行 (npm run dev)');
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎯 下一步操作:');
  console.log('1. 确保已登录应用');
  console.log('2. 访问 http://localhost:3001/admin/add-credits');
  console.log('3. 点击"Add 100 Credits"按钮');
  console.log('4. 然后测试LipSync功能');
}

async function testGetCredits() {
  console.log('🔍 检查当前积分...');
  
  const baseUrl = 'http://localhost:3001';
  
  try {
    const response = await fetch(`${baseUrl}/api/admin/add-test-credits`, {
      method: 'GET',
    });

    console.log(`📊 响应状态: ${response.status}`);
    
    const data = await response.json();
    console.log('📋 积分信息:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('✅ 当前积分信息:');
      console.log(`   用户UUID: ${data.data.user_uuid}`);
      console.log(`   当前积分: ${data.data.credits}`);
      console.log(`   Pro状态: ${data.data.is_pro}`);
      console.log(`   已充值: ${data.data.is_recharged}`);
    } else {
      console.log('❌ 获取积分失败:', data.error);
    }

  } catch (error) {
    console.error('💥 网络错误:', error.message);
  }
}

// 主函数
async function main() {
  const command = process.argv[2];

  console.log('🎯 LipSync积分测试工具');
  console.log('解决"Insufficient credits"错误\n');

  if (command === '--check') {
    await testGetCredits();
  } else if (command === '--add' || !command) {
    await testAddCredits();
  } else {
    console.log('📋 使用说明:');
    console.log('');
    console.log('1. 添加积分测试 (默认):');
    console.log('   node test-add-credits.js');
    console.log('   node test-add-credits.js --add');
    console.log('');
    console.log('2. 检查积分:');
    console.log('   node test-add-credits.js --check');
    console.log('');
    console.log('💡 注意: 需要先在浏览器中登录应用');
  }
}

// 运行脚本
main().catch(error => {
  console.error('💥 脚本执行失败:', error);
  process.exit(1);
});
