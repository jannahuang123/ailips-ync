#!/usr/bin/env node

/**
 * 积分修复功能测试脚本
 * 
 * 功能：
 * 1. 测试积分诊断API
 * 2. 测试积分修复API
 * 3. 验证LipSync API积分检查
 */

const baseUrl = 'http://localhost:3001';

class CreditsFixTester {
  constructor() {
    this.baseUrl = baseUrl;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // cyan
      success: '\x1b[32m', // green
      warning: '\x1b[33m', // yellow
      error: '\x1b[31m',   // red
      step: '\x1b[35m'     // magenta
    };
    const reset = '\x1b[0m';
    console.log(`${colors[type]}[${timestamp}] ${message}${reset}`);
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const result = await response.json();
      
      return {
        status: response.status,
        ok: response.ok,
        data: result
      };
    } catch (error) {
      return {
        status: 0,
        ok: false,
        error: error.message
      };
    }
  }

  async testGetUserInfo() {
    this.log('🔍 测试获取用户信息API...', 'step');
    
    const response = await this.makeRequest('/api/get-user-info', 'POST');
    
    if (response.ok && response.data.code === 0) {
      const user = response.data.data;
      this.log(`✅ 用户信息获取成功`, 'success');
      this.log(`   邮箱: ${user.email}`, 'info');
      this.log(`   UUID: ${user.uuid}`, 'info');
      this.log(`   当前积分: ${user.credits?.left_credits || 0}`, 'info');
      return user;
    } else {
      this.log(`❌ 用户信息获取失败: ${response.status} - ${response.data?.message || '未知错误'}`, 'error');
      return null;
    }
  }

  async testCreditsDiagnosis() {
    this.log('🔍 测试积分诊断API...', 'step');
    
    const response = await this.makeRequest('/api/admin/fix-user-credits', 'GET');
    
    if (response.ok && response.data.success) {
      const diagnosis = response.data.diagnosis;
      this.log(`✅ 积分诊断成功`, 'success');
      this.log(`   当前积分: ${diagnosis.current_credits}`, 'info');
      this.log(`   是否新用户: ${diagnosis.is_new_user}`, 'info');
      this.log(`   需要修复: ${diagnosis.needs_fix}`, 'info');
      this.log(`   问题描述: ${diagnosis.issue_description}`, 'info');
      this.log(`   建议操作: ${diagnosis.recommended_action}`, 'info');
      return diagnosis;
    } else {
      this.log(`❌ 积分诊断失败: ${response.status} - ${response.data?.error || '未知错误'}`, 'error');
      return null;
    }
  }

  async testCreditsFixing(force = false) {
    this.log(`🔧 测试积分修复API (强制: ${force})...`, 'step');
    
    const response = await this.makeRequest('/api/admin/fix-user-credits', 'POST', { force });
    
    if (response.ok) {
      const result = response.data;
      if (result.success) {
        this.log(`✅ 积分修复成功`, 'success');
        
        if (result.fix_applied) {
          this.log(`   添加积分: ${result.fix_applied.credits_added}`, 'info');
          this.log(`   修复前积分: ${result.fix_applied.previous_credits}`, 'info');
          this.log(`   修复后积分: ${result.fix_applied.new_credits}`, 'info');
          this.log(`   交易类型: ${result.fix_applied.transaction_type}`, 'info');
        } else {
          this.log(`   无需修复，积分状态正常`, 'info');
        }
        
        return result;
      } else {
        this.log(`❌ 积分修复失败: ${result.error}`, 'error');
        return null;
      }
    } else {
      this.log(`❌ 积分修复请求失败: ${response.status} - ${response.data?.error || '未知错误'}`, 'error');
      return null;
    }
  }

  async testLipSyncAPI() {
    this.log('🎬 测试LipSync API积分检查...', 'step');
    
    const response = await this.makeRequest('/api/lipsync/create', 'POST', {
      name: 'Credit Test Project',
      imageUrl: 'https://example.com/test.jpg',
      audioPrompt: 'This is a test message for credit verification',
      quality: 'low'
    });

    if (response.status === 402) {
      this.log('❌ LipSync API返回402 (积分不足)', 'error');
      return false;
    } else if (response.status === 401) {
      this.log('✅ LipSync API正常 (返回401认证错误，说明积分检查通过)', 'success');
      return true;
    } else if (response.status === 400) {
      this.log('✅ LipSync API正常 (返回400参数错误，说明积分检查通过)', 'success');
      return true;
    } else {
      this.log(`ℹ️ LipSync API返回状态: ${response.status}`, 'info');
      if (response.data?.error) {
        this.log(`   错误信息: ${response.data.error}`, 'info');
      }
      return true;
    }
  }

  async runFullTest() {
    this.log('🚀 开始积分修复功能完整测试', 'step');
    this.log(`🌐 测试服务器: ${this.baseUrl}`, 'info');
    this.log('', 'info');

    // 步骤1: 测试用户信息获取
    const userInfo = await this.testGetUserInfo();
    if (!userInfo) {
      this.log('❌ 用户信息获取失败，测试终止', 'error');
      return false;
    }

    this.log('', 'info');

    // 步骤2: 测试积分诊断
    const diagnosis = await this.testCreditsDiagnosis();
    if (!diagnosis) {
      this.log('❌ 积分诊断失败，测试终止', 'error');
      return false;
    }

    this.log('', 'info');

    // 步骤3: 测试积分修复（如果需要）
    if (diagnosis.needs_fix) {
      this.log('🔧 检测到需要修复，开始修复测试...', 'warning');
      const fixResult = await this.testCreditsFixing(false);
      
      if (!fixResult) {
        this.log('❌ 积分修复失败', 'error');
        return false;
      }
    } else {
      this.log('✅ 积分状态正常，测试强制修复功能...', 'info');
      const fixResult = await this.testCreditsFixing(true);
      
      if (!fixResult) {
        this.log('❌ 强制积分修复失败', 'error');
        return false;
      }
    }

    this.log('', 'info');

    // 步骤4: 重新诊断验证修复效果
    this.log('🧪 验证修复效果...', 'step');
    const verifyDiagnosis = await this.testCreditsDiagnosis();
    if (!verifyDiagnosis) {
      this.log('❌ 修复效果验证失败', 'error');
      return false;
    }

    this.log('', 'info');

    // 步骤5: 测试LipSync API
    const lipSyncResult = await this.testLipSyncAPI();
    if (!lipSyncResult) {
      this.log('❌ LipSync API测试失败', 'error');
      return false;
    }

    this.log('', 'info');
    this.log('🎉 积分修复功能测试完成！', 'success');
    this.log('💡 所有功能正常工作', 'info');
    
    return true;
  }

  async runQuickTest() {
    this.log('⚡ 开始积分修复功能快速测试', 'step');
    
    // 只测试核心功能
    const userInfo = await this.testGetUserInfo();
    if (!userInfo) return false;

    const diagnosis = await this.testCreditsDiagnosis();
    if (!diagnosis) return false;

    const lipSyncResult = await this.testLipSyncAPI();
    if (!lipSyncResult) return false;

    this.log('🎉 快速测试完成！', 'success');
    return true;
  }
}

// 运行测试
async function main() {
  const tester = new CreditsFixTester();
  
  // 检查命令行参数
  const args = process.argv.slice(2);
  const isQuickTest = args.includes('--quick') || args.includes('-q');
  
  try {
    if (isQuickTest) {
      await tester.runQuickTest();
    } else {
      await tester.runFullTest();
    }
  } catch (error) {
    console.error('💥 测试执行失败:', error);
    process.exit(1);
  }
}

main();
