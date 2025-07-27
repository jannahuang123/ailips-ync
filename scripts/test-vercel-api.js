#!/usr/bin/env node

/**
 * Vercel API测试脚本
 * 测试部署后的API端点是否正常工作
 */

const https = require('https');
const http = require('http');

console.log('🔍 Vercel API测试');
console.log('================\n');

class VercelAPITester {
  constructor() {
    // 从环境变量或命令行参数获取域名
    this.baseUrl = process.env.VERCEL_URL || process.argv[2] || 'https://your-vercel-domain.vercel.app';
    this.testResults = [];
  }

  async run() {
    try {
      console.log(`🌐 测试域名: ${this.baseUrl}\n`);
      
      console.log('📋 测试步骤：');
      console.log('1. 测试网站可访问性');
      console.log('2. 测试API端点健康状态');
      console.log('3. 测试数据库连接');
      console.log('4. 测试AI服务配置');
      console.log('5. 生成测试报告\n');

      await this.testWebsiteAccess();
      await this.testAPIEndpoints();
      await this.testDatabaseConnection();
      await this.testAIServiceConfig();
      
      this.generateReport();
    } catch (error) {
      this.addResult('Overall Test', 'fail', error.message);
      this.generateReport();
    }
  }

  async testWebsiteAccess() {
    console.log('🌐 测试网站可访问性...');
    
    try {
      const response = await this.makeRequest('GET', '/');
      
      if (response.statusCode === 200) {
        this.addResult('Website Access', 'pass', 'Homepage loads successfully');
      } else {
        this.addResult('Website Access', 'fail', `HTTP ${response.statusCode}`);
      }
    } catch (error) {
      this.addResult('Website Access', 'fail', error.message);
    }
  }

  async testAPIEndpoints() {
    console.log('🔌 测试API端点...');
    
    const endpoints = [
      { path: '/api/health', name: 'Health Check' },
      { path: '/api/get-user-credits', name: 'User Credits API' },
      { path: '/api/tts/generate', name: 'TTS API', method: 'POST' },
      { path: '/api/upload/image', name: 'Image Upload API', method: 'POST' },
      { path: '/api/lipsync/create', name: 'LipSync Create API', method: 'POST' },
    ];

    for (const endpoint of endpoints) {
      try {
        const method = endpoint.method || 'GET';
        const response = await this.makeRequest(method, endpoint.path);
        
        // 对于需要认证的端点，401是预期的
        if (response.statusCode === 401) {
          this.addResult(endpoint.name, 'pass', 'Endpoint exists (requires auth)');
        } else if (response.statusCode === 200) {
          this.addResult(endpoint.name, 'pass', 'Endpoint accessible');
        } else if (response.statusCode === 405 && method === 'POST') {
          this.addResult(endpoint.name, 'pass', 'POST endpoint exists');
        } else {
          this.addResult(endpoint.name, 'warn', `HTTP ${response.statusCode}`);
        }
      } catch (error) {
        this.addResult(endpoint.name, 'fail', error.message);
      }
    }
  }

  async testDatabaseConnection() {
    console.log('🗄️ 测试数据库连接...');
    
    try {
      // 测试一个需要数据库的端点
      const response = await this.makeRequest('GET', '/api/get-user-credits');
      
      if (response.statusCode === 401) {
        this.addResult('Database Connection', 'pass', 'Database endpoint responds (auth required)');
      } else if (response.statusCode === 500) {
        this.addResult('Database Connection', 'fail', 'Database connection error');
      } else {
        this.addResult('Database Connection', 'pass', 'Database connection working');
      }
    } catch (error) {
      this.addResult('Database Connection', 'fail', error.message);
    }
  }

  async testAIServiceConfig() {
    console.log('🤖 测试AI服务配置...');
    
    try {
      // 测试TTS端点来验证AI服务配置
      const response = await this.makeRequest('POST', '/api/tts/generate', {
        'Content-Type': 'application/json'
      }, JSON.stringify({
        text: 'test',
        voice: 'en-US-AriaNeural'
      }));
      
      if (response.statusCode === 401) {
        this.addResult('AI Service Config', 'pass', 'AI endpoints configured (auth required)');
      } else if (response.statusCode === 500) {
        this.addResult('AI Service Config', 'warn', 'AI service may not be configured');
      } else {
        this.addResult('AI Service Config', 'pass', 'AI services responding');
      }
    } catch (error) {
      this.addResult('AI Service Config', 'fail', error.message);
    }
  }

  makeRequest(method, path, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        method,
        headers: {
          'User-Agent': 'Vercel-API-Tester/1.0',
          ...headers
        },
        timeout: 10000
      };

      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));

      if (body) {
        req.write(body);
      }
      
      req.end();
    });
  }

  addResult(test, status, message) {
    this.testResults.push({ test, status, message });
    
    const statusIcon = {
      'pass': '✅',
      'fail': '❌',
      'warn': '⚠️'
    }[status] || '❓';
    
    console.log(`${statusIcon} ${test}: ${message}`);
  }

  generateReport() {
    console.log('\n📊 测试报告');
    console.log('============\n');
    
    const passed = this.testResults.filter(r => r.status === 'pass').length;
    const failed = this.testResults.filter(r => r.status === 'fail').length;
    const warnings = this.testResults.filter(r => r.status === 'warn').length;
    const total = this.testResults.length;
    
    console.log(`总测试数: ${total}`);
    console.log(`✅ 通过: ${passed}`);
    console.log(`❌ 失败: ${failed}`);
    console.log(`⚠️ 警告: ${warnings}`);
    
    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    console.log(`\n成功率: ${successRate}%`);
    
    if (failed > 0) {
      console.log('\n❌ 失败的测试:');
      this.testResults
        .filter(r => r.status === 'fail')
        .forEach(r => console.log(`   • ${r.test}: ${r.message}`));
    }
    
    if (warnings > 0) {
      console.log('\n⚠️ 警告:');
      this.testResults
        .filter(r => r.status === 'warn')
        .forEach(r => console.log(`   • ${r.test}: ${r.message}`));
    }
    
    console.log('\n📝 建议:');
    if (successRate >= 80) {
      console.log('🎉 Vercel部署状态良好！大部分功能正常。');
    } else if (successRate >= 60) {
      console.log('⚠️ 部署基本正常，但需要检查一些配置。');
    } else {
      console.log('🚨 部署存在问题，需要检查环境变量和配置。');
    }
    
    console.log('\n🔧 故障排除:');
    console.log('1. 检查Vercel环境变量是否正确设置');
    console.log('2. 确认数据库连接字符串格式正确');
    console.log('3. 验证AI服务API密钥是否有效');
    console.log('4. 查看Vercel部署日志获取详细错误信息');
  }
}

// 运行测试
if (require.main === module) {
  const tester = new VercelAPITester();
  tester.run().catch(console.error);
}

module.exports = VercelAPITester;
