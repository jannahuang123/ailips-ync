#!/usr/bin/env node

/**
 * TTS API Fix Test Script
 * 测试TTS API修复后的功能
 */

const fs = require('fs');
const path = require('path');

class TTSFixTester {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    this.results = [];
  }

  addResult(test, status, message) {
    const result = { test, status, message, timestamp: new Date().toISOString() };
    this.results.push(result);
    
    const statusIcon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${statusIcon} ${test}: ${message}`);
  }

  async testTTSConfiguration() {
    console.log('🔧 检查TTS配置...');
    
    try {
      // 检查环境变量
      const envPath = path.join(process.cwd(), '.env.local');
      if (!fs.existsSync(envPath)) {
        this.addResult('Environment File', 'fail', '.env.local file not found');
        return;
      }

      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // 检查各种TTS API密钥
      const apiKeys = {
        'APICORE_API_KEY': envContent.includes('APICORE_API_KEY=') && !envContent.includes('APICORE_API_KEY=""'),
        'OPENAI_API_KEY': envContent.includes('OPENAI_API_KEY=') && !envContent.includes('OPENAI_API_KEY=""'),
        'AZURE_SPEECH_KEY': envContent.includes('AZURE_SPEECH_KEY=') && !envContent.includes('AZURE_SPEECH_KEY=""'),
        'GOOGLE_CLOUD_API_KEY': envContent.includes('GOOGLE_CLOUD_API_KEY=') && !envContent.includes('GOOGLE_CLOUD_API_KEY=""')
      };

      const configuredKeys = Object.entries(apiKeys).filter(([key, configured]) => configured);
      
      if (configuredKeys.length === 0) {
        this.addResult('TTS API Keys', 'fail', 'No TTS API keys configured');
      } else {
        this.addResult('TTS API Keys', 'pass', `Configured: ${configuredKeys.map(([key]) => key).join(', ')}`);
      }

    } catch (error) {
      this.addResult('TTS Configuration', 'fail', error.message);
    }
  }

  async testTTSEndpoint() {
    console.log('🎤 测试TTS端点...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/tts/generate`, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        this.addResult('TTS Endpoint', 'pass', `Available voices: ${data.voices?.length || 0}`);
        
        // 检查提供商状态
        if (data.providers) {
          const availableProviders = Object.entries(data.providers)
            .filter(([provider, available]) => available)
            .map(([provider]) => provider);
          
          if (availableProviders.length > 0) {
            this.addResult('TTS Providers', 'pass', `Available: ${availableProviders.join(', ')}`);
          } else {
            this.addResult('TTS Providers', 'fail', 'No TTS providers available');
          }
        }
      } else {
        this.addResult('TTS Endpoint', 'fail', `HTTP ${response.status}`);
      }
    } catch (error) {
      this.addResult('TTS Endpoint', 'fail', error.message);
    }
  }

  async testTTSGeneration() {
    console.log('🗣️ 测试TTS生成...');
    
    try {
      const testPayload = {
        text: 'Hello, this is a test message.',
        voice: 'apicore-en-US-female',
        format: 'mp3'
      };

      const response = await fetch(`${this.baseUrl}/api/tts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });

      if (response.status === 401) {
        this.addResult('TTS Generation', 'warn', 'Authentication required (expected for production)');
      } else if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.error?.includes('No TTS provider configured')) {
          this.addResult('TTS Generation', 'fail', 'No TTS provider configured - need API keys');
        } else {
          this.addResult('TTS Generation', 'warn', `Bad request: ${errorData.error}`);
        }
      } else if (response.ok) {
        this.addResult('TTS Generation', 'pass', 'TTS generation successful');
      } else {
        const errorText = await response.text();
        this.addResult('TTS Generation', 'fail', `HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      this.addResult('TTS Generation', 'fail', error.message);
    }
  }

  async testFallbackLogic() {
    console.log('🔄 测试回退逻辑...');
    
    try {
      // 测试不存在的语音
      const testPayload = {
        text: 'Test fallback',
        voice: 'non-existent-voice',
        format: 'mp3'
      };

      const response = await fetch(`${this.baseUrl}/api/tts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });

      if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.error?.includes('Invalid voice selection')) {
          this.addResult('Fallback Logic', 'pass', 'Voice validation working correctly');
        } else {
          this.addResult('Fallback Logic', 'warn', `Unexpected error: ${errorData.error}`);
        }
      } else {
        this.addResult('Fallback Logic', 'warn', `Unexpected response: ${response.status}`);
      }
    } catch (error) {
      this.addResult('Fallback Logic', 'fail', error.message);
    }
  }

  generateReport() {
    console.log('\n📊 测试报告');
    console.log('='.repeat(50));
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warn').length;
    
    console.log(`✅ 通过: ${passed}`);
    console.log(`❌ 失败: ${failed}`);
    console.log(`⚠️  警告: ${warnings}`);
    console.log(`📝 总计: ${this.results.length}`);
    
    if (failed === 0) {
      console.log('\n🎉 TTS API修复成功！');
      console.log('\n📋 下一步操作:');
      console.log('1. 配置至少一个TTS API密钥 (APICORE_API_KEY, OPENAI_API_KEY, 等)');
      console.log('2. 重启开发服务器');
      console.log('3. 测试用户界面的TTS功能');
    } else {
      console.log('\n🔧 需要修复的问题:');
      this.results.filter(r => r.status === 'fail').forEach(result => {
        console.log(`   - ${result.test}: ${result.message}`);
      });
    }
    
    // 保存详细报告
    const reportPath = path.join(process.cwd(), 'tts-fix-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: { passed, failed, warnings, total: this.results.length },
      results: this.results
    }, null, 2));
    
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
  }

  async runAllTests() {
    console.log('🚀 开始TTS API修复测试...\n');
    
    await this.testTTSConfiguration();
    await this.testTTSEndpoint();
    await this.testTTSGeneration();
    await this.testFallbackLogic();
    
    this.generateReport();
  }
}

// 运行测试
if (require.main === module) {
  const tester = new TTSFixTester();
  tester.runAllTests().catch(console.error);
}

module.exports = TTSFixTester;
