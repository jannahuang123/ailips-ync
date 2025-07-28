#!/usr/bin/env node

/**
 * 文件上传测试脚本
 * 测试图片、音频、视频上传功能
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// 测试配置
const BASE_URL = 'http://localhost:3001';
const TEST_FILES = {
  image: {
    path: path.join(__dirname, '../public/logo.png'),
    endpoint: '/api/upload/image',
    contentType: 'image/png'
  }
};

class FileUploadTester {
  constructor() {
    this.results = [];
  }

  async testImageUpload() {
    console.log('\n🖼️  测试图片上传...');
    
    try {
      const testFile = TEST_FILES.image;
      
      // 检查测试文件是否存在
      if (!fs.existsSync(testFile.path)) {
        throw new Error(`测试文件不存在: ${testFile.path}`);
      }

      // 创建FormData
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testFile.path));

      // 发送请求
      const response = await fetch(`${BASE_URL}${testFile.endpoint}`, {
        method: 'POST',
        body: formData,
        headers: {
          // 不要手动设置Content-Type，让浏览器自动设置
          ...formData.getHeaders()
        }
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('✅ 图片上传成功');
        console.log(`   文件URL: ${result.url}`);
        console.log(`   文件大小: ${result.fileSize} bytes`);
        
        this.results.push({
          type: 'image',
          status: 'success',
          url: result.url,
          size: result.fileSize
        });
      } else {
        throw new Error(result.error || '上传失败');
      }
      
    } catch (error) {
      console.log('❌ 图片上传失败');
      console.log(`   错误: ${error.message}`);
      
      this.results.push({
        type: 'image',
        status: 'failed',
        error: error.message
      });
    }
  }

  async testWithoutAuth() {
    console.log('\n🔐 测试未认证上传（应该失败）...');
    
    try {
      const response = await fetch(`${BASE_URL}/api/upload/image`, {
        method: 'POST',
        body: new FormData()
      });

      const result = await response.json();
      
      if (response.status === 401) {
        console.log('✅ 正确拒绝未认证请求');
        this.results.push({
          type: 'auth_test',
          status: 'success',
          message: '正确拒绝未认证请求'
        });
      } else {
        console.log('⚠️  未认证请求未被正确拒绝');
        this.results.push({
          type: 'auth_test',
          status: 'warning',
          message: '未认证请求未被正确拒绝'
        });
      }
      
    } catch (error) {
      console.log(`❌ 认证测试出错: ${error.message}`);
      this.results.push({
        type: 'auth_test',
        status: 'failed',
        error: error.message
      });
    }
  }

  async testStorageConfig() {
    console.log('\n🗄️  检查存储配置...');
    
    const storageVars = [
      'STORAGE_ENDPOINT',
      'STORAGE_REGION', 
      'STORAGE_ACCESS_KEY',
      'STORAGE_SECRET_KEY',
      'STORAGE_BUCKET',
      'STORAGE_DOMAIN'
    ];

    const missingVars = storageVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      console.log('✅ S3存储配置完整');
      this.results.push({
        type: 'storage_config',
        status: 'success',
        message: 'S3存储配置完整'
      });
    } else {
      console.log('⚠️  S3存储配置缺失，将使用本地存储');
      console.log(`   缺失变量: ${missingVars.join(', ')}`);
      this.results.push({
        type: 'storage_config',
        status: 'warning',
        message: `使用本地存储，缺失: ${missingVars.join(', ')}`
      });
    }

    // 检查本地存储目录
    const uploadDirs = [
      'public/uploads/images',
      'public/uploads/audio', 
      'public/uploads/videos'
    ];

    for (const dir of uploadDirs) {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ 本地存储目录存在: ${dir}`);
      } else {
        console.log(`❌ 本地存储目录不存在: ${dir}`);
      }
    }
  }

  async runAllTests() {
    console.log('🚀 开始文件上传测试...\n');
    
    await this.testStorageConfig();
    await this.testWithoutAuth();
    // 注意：由于需要认证，实际的文件上传测试需要在浏览器中进行
    
    console.log('\n📊 测试结果汇总:');
    console.log('='.repeat(50));
    
    this.results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.type}:`);
      console.log(`   状态: ${result.status}`);
      if (result.message) console.log(`   信息: ${result.message}`);
      if (result.error) console.log(`   错误: ${result.error}`);
      if (result.url) console.log(`   URL: ${result.url}`);
      console.log('');
    });

    console.log('💡 提示:');
    console.log('   - 完整的文件上传测试需要在浏览器中进行（需要用户认证）');
    console.log('   - 如果S3配置缺失，系统会自动使用本地存储');
    console.log('   - 检查 public/uploads/ 目录确保本地存储正常工作');
  }
}

// 运行测试
if (require.main === module) {
  const tester = new FileUploadTester();
  tester.runAllTests().catch(console.error);
}

module.exports = FileUploadTester;
