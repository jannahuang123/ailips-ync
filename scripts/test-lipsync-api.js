#!/usr/bin/env node

/**
 * LipSync API功能测试脚本
 * 测试完整的LipSync工作流程：上传 -> TTS -> 生成 -> 状态查询
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

console.log('🧪 LipSync API功能测试');
console.log('===================\n');

class LipSyncAPITester {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001';
    this.testResults = [];
  }

  async run() {
    try {
      console.log('📋 测试步骤：');
      console.log('1. 测试图片上传API');
      console.log('2. 测试TTS生成API');
      console.log('3. 测试LipSync创建API');
      console.log('4. 测试状态查询API');
      console.log('5. 生成测试报告\n');

      await this.testImageUpload();
      await this.testTTSGeneration();
      await this.testLipSyncCreation();
      await this.testStatusQuery();
      
      this.generateReport();
    } catch (error) {
      this.addResult('Overall Test', 'fail', error.message);
      this.generateReport();
    }
  }

  async testImageUpload() {
    console.log('📤 测试图片上传API...');
    
    try {
      // 创建测试图片文件
      const testImagePath = this.createTestImage();
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testImagePath));

      const response = await fetch(`${this.baseUrl}/api/upload/image`, {
        method: 'POST',
        body: formData,
        headers: {
          // 需要添加认证头
          'Authorization': 'Bearer test-token'
        }
      });

      if (response.ok) {
        const result = await response.json();
        this.addResult('Image Upload API', 'pass', `File uploaded: ${result.filename}`);
        this.testImageUrl = result.url;
      } else {
        const error = await response.text();
        this.addResult('Image Upload API', 'fail', `HTTP ${response.status}: ${error}`);
      }

      // 清理测试文件
      fs.unlinkSync(testImagePath);
      
    } catch (error) {
      this.addResult('Image Upload API', 'fail', error.message);
    }
  }

  async testTTSGeneration() {
    console.log('🎤 测试TTS生成API...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/tts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          text: 'Hello, this is a test message for lip sync generation.',
          voice: 'en-US-AriaNeural',
          format: 'mp3'
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.addResult('TTS Generation API', 'pass', `Audio generated: ${result.audioUrl}`);
        this.testAudioUrl = result.audioUrl;
      } else {
        const error = await response.text();
        this.addResult('TTS Generation API', 'fail', `HTTP ${response.status}: ${error}`);
      }
      
    } catch (error) {
      this.addResult('TTS Generation API', 'fail', error.message);
    }
  }

  async testLipSyncCreation() {
    console.log('🎬 测试LipSync创建API...');
    
    if (!this.testImageUrl || !this.testAudioUrl) {
      this.addResult('LipSync Creation API', 'skip', 'Missing image or audio URL from previous tests');
      return;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/api/lipsync/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          name: 'Test LipSync Project',
          imageUrl: this.testImageUrl,
          audioUrl: this.testAudioUrl,
          quality: 'medium'
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.addResult('LipSync Creation API', 'pass', `Project created: ${result.projectId}`);
        this.testProjectId = result.projectId;
      } else {
        const error = await response.text();
        this.addResult('LipSync Creation API', 'fail', `HTTP ${response.status}: ${error}`);
      }
      
    } catch (error) {
      this.addResult('LipSync Creation API', 'fail', error.message);
    }
  }

  async testStatusQuery() {
    console.log('📊 测试状态查询API...');
    
    if (!this.testProjectId) {
      this.addResult('Status Query API', 'skip', 'Missing project ID from previous test');
      return;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/api/lipsync/status/${this.testProjectId}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      if (response.ok) {
        const result = await response.json();
        this.addResult('Status Query API', 'pass', `Status: ${result.status}, Progress: ${result.progress}%`);
      } else {
        const error = await response.text();
        this.addResult('Status Query API', 'fail', `HTTP ${response.status}: ${error}`);
      }
      
    } catch (error) {
      this.addResult('Status Query API', 'fail', error.message);
    }
  }

  createTestImage() {
    // 创建一个简单的测试图片文件（1x1像素PNG）
    const testImageData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x37, 0x6E, 0xF9, 0x24, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const testImagePath = path.join(__dirname, 'test-image.png');
    fs.writeFileSync(testImagePath, testImageData);
    return testImagePath;
  }

  addResult(test, status, message) {
    this.testResults.push({ test, status, message });
    
    const statusIcon = {
      'pass': '✅',
      'fail': '❌',
      'skip': '⏭️'
    }[status] || '❓';
    
    console.log(`${statusIcon} ${test}: ${message}`);
  }

  generateReport() {
    console.log('\n📊 测试报告');
    console.log('============\n');
    
    const passed = this.testResults.filter(r => r.status === 'pass').length;
    const failed = this.testResults.filter(r => r.status === 'fail').length;
    const skipped = this.testResults.filter(r => r.status === 'skip').length;
    const total = this.testResults.length;
    
    console.log(`总测试数: ${total}`);
    console.log(`✅ 通过: ${passed}`);
    console.log(`❌ 失败: ${failed}`);
    console.log(`⏭️ 跳过: ${skipped}`);
    
    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    console.log(`\n成功率: ${successRate}%`);
    
    if (failed > 0) {
      console.log('\n❌ 失败的测试:');
      this.testResults
        .filter(r => r.status === 'fail')
        .forEach(r => console.log(`   • ${r.test}: ${r.message}`));
    }
    
    if (successRate >= 75) {
      console.log('\n🎉 测试结果良好！API基本功能正常。');
    } else if (successRate >= 50) {
      console.log('\n⚠️ 测试结果一般，需要修复一些问题。');
    } else {
      console.log('\n🚨 测试结果较差，需要重点修复API问题。');
    }
    
    // 保存测试报告
    const reportPath = path.join(__dirname, '../test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: { total, passed, failed, skipped, successRate },
      results: this.testResults
    }, null, 2));
    
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
  }
}

// 运行测试
if (require.main === module) {
  const tester = new LipSyncAPITester();
  tester.run().catch(console.error);
}

module.exports = LipSyncAPITester;
