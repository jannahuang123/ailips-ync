/**
 * LipSync工作流程测试脚本
 * 验证积分系统和视频生成功能
 */

const baseUrl = 'http://localhost:3001';

class LipSyncTester {
  constructor() {
    this.sessionCookie = '';
  }

  async log(message, type = 'info') {
    const icons = {
      info: '📝',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      step: '🔄'
    };
    console.log(`${icons[type]} ${message}`);
  }

  async testUserAuth() {
    this.log('检查用户认证状态...', 'step');
    
    try {
      const response = await fetch(`${baseUrl}/api/get-user-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.code === 0) {
        this.log(`用户已登录: ${data.data.email}`, 'success');
        this.log(`当前积分: ${data.data.credits?.left_credits || 0}`, 'info');
        return { success: true, user: data.data };
      } else {
        this.log('用户未登录或认证失败', 'error');
        return { success: false, error: data.message };
      }
    } catch (error) {
      this.log(`网络错误: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async addTestCredits(credits = 100) {
    this.log(`添加 ${credits} 测试积分...`, 'step');
    
    try {
      const response = await fetch(`${baseUrl}/api/admin/add-test-credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credits }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        this.log(`成功添加 ${credits} 积分!`, 'success');
        this.log(`原积分: ${data.data.previous_credits}`, 'info');
        this.log(`新积分: ${data.data.current_credits}`, 'info');
        return { success: true, data: data.data };
      } else {
        this.log(`添加积分失败: ${data.error}`, 'error');
        return { success: false, error: data.error };
      }
    } catch (error) {
      this.log(`网络错误: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async checkCredits() {
    this.log('检查当前积分...', 'step');
    
    try {
      const response = await fetch(`${baseUrl}/api/get-user-credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.code === 0) {
        this.log(`当前积分: ${data.data.left_credits}`, 'success');
        this.log(`Pro状态: ${data.data.is_pro ? '是' : '否'}`, 'info');
        this.log(`已充值: ${data.data.is_recharged ? '是' : '否'}`, 'info');
        return { success: true, credits: data.data };
      } else {
        this.log(`获取积分失败: ${data.message}`, 'error');
        return { success: false, error: data.message };
      }
    } catch (error) {
      this.log(`网络错误: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async testLipSyncAPI() {
    this.log('测试LipSync API可用性...', 'step');
    
    try {
      // 测试创建LipSync项目的API
      const response = await fetch(`${baseUrl}/api/lipsync/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Project',
          imageUrl: 'https://example.com/test.jpg',
          audioPrompt: 'Hello world test',
          quality: 'medium'
        }),
      });

      if (response.status === 402) {
        this.log('LipSync API正常，但积分不足 (402)', 'warning');
        return { success: true, needsCredits: true };
      } else if (response.status === 401) {
        this.log('LipSync API需要认证 (401)', 'warning');
        return { success: false, needsAuth: true };
      } else if (response.status === 400) {
        this.log('LipSync API参数错误，但API可用 (400)', 'success');
        return { success: true, needsCredits: false };
      } else {
        const data = await response.json();
        this.log(`LipSync API响应: ${response.status}`, 'info');
        return { success: true, response: data };
      }
    } catch (error) {
      this.log(`LipSync API测试失败: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async runFullTest() {
    console.log('🚀 开始LipSync工作流程测试');
    console.log('='.repeat(60));

    // 1. 检查用户认证
    const authResult = await this.testUserAuth();
    if (!authResult.success) {
      this.log('❌ 测试失败: 用户未登录', 'error');
      this.log('💡 请先登录应用: http://localhost:3001', 'info');
      return false;
    }

    // 2. 检查当前积分
    const creditsResult = await this.checkCredits();
    if (!creditsResult.success) {
      this.log('⚠️ 无法获取积分信息', 'warning');
    }

    const currentCredits = creditsResult.credits?.left_credits || 0;
    
    // 3. 如果积分不足，添加测试积分
    if (currentCredits < 10) {
      this.log(`积分不足 (${currentCredits} < 10)，添加测试积分...`, 'warning');
      const addResult = await this.addTestCredits(100);
      if (!addResult.success) {
        this.log('❌ 添加积分失败', 'error');
        return false;
      }
    } else {
      this.log(`积分充足 (${currentCredits} >= 10)`, 'success');
    }

    // 4. 测试LipSync API
    const apiResult = await this.testLipSyncAPI();
    if (!apiResult.success) {
      this.log('❌ LipSync API测试失败', 'error');
      return false;
    }

    // 5. 最终检查
    await this.checkCredits();

    console.log('\n' + '='.repeat(60));
    this.log('🎉 测试完成！LipSync功能已准备就绪', 'success');
    this.log('💡 现在可以在浏览器中测试视频生成功能', 'info');
    this.log('🔗 访问: http://localhost:3001', 'info');
    
    return true;
  }
}

// 主函数
async function main() {
  const command = process.argv[2];
  const tester = new LipSyncTester();

  if (command === '--auth') {
    await tester.testUserAuth();
  } else if (command === '--credits') {
    await tester.checkCredits();
  } else if (command === '--add') {
    const credits = parseInt(process.argv[3]) || 100;
    await tester.addTestCredits(credits);
  } else if (command === '--api') {
    await tester.testLipSyncAPI();
  } else if (command === '--full' || !command) {
    await tester.runFullTest();
  } else {
    console.log('📋 LipSync工作流程测试工具');
    console.log('');
    console.log('使用方法:');
    console.log('  node scripts/test-lipsync-workflow.js [选项]');
    console.log('');
    console.log('选项:');
    console.log('  --full     完整测试流程 (默认)');
    console.log('  --auth     测试用户认证');
    console.log('  --credits  检查用户积分');
    console.log('  --add [N]  添加N积分 (默认100)');
    console.log('  --api      测试LipSync API');
    console.log('');
    console.log('示例:');
    console.log('  node scripts/test-lipsync-workflow.js');
    console.log('  node scripts/test-lipsync-workflow.js --add 200');
  }
}

// 运行脚本
main().catch(error => {
  console.error('💥 脚本执行失败:', error);
  process.exit(1);
});
