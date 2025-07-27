#!/usr/bin/env node

/**
 * S3存储配置测试脚本
 * 测试S3连接、上传、下载、权限等功能
 */

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

console.log('🗄️ S3存储配置测试');
console.log('==================\n');

class StorageConfigTester {
  constructor() {
    this.testResults = [];
    this.testFiles = [];
    
    // 从环境变量读取配置
    this.config = {
      endpoint: process.env.STORAGE_ENDPOINT,
      region: process.env.STORAGE_REGION || 'us-east-1',
      accessKey: process.env.STORAGE_ACCESS_KEY,
      secretKey: process.env.STORAGE_SECRET_KEY,
      bucket: process.env.STORAGE_BUCKET,
      domain: process.env.STORAGE_DOMAIN
    };
    
    // 初始化S3客户端
    if (this.config.accessKey && this.config.secretKey) {
      this.s3Client = new S3Client({
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.accessKey,
          secretAccessKey: this.config.secretKey,
        },
        endpoint: this.config.endpoint,
      });
    }
  }

  async run() {
    try {
      console.log('📋 测试步骤：');
      console.log('1. 检查环境变量配置');
      console.log('2. 测试S3连接');
      console.log('3. 测试文件上传');
      console.log('4. 测试文件下载');
      console.log('5. 测试文件删除');
      console.log('6. 清理测试文件');
      console.log('7. 生成测试报告\n');

      await this.checkEnvironmentVariables();
      await this.testS3Connection();
      await this.testFileUpload();
      await this.testFileDownload();
      await this.testFileDelete();
      await this.cleanupTestFiles();
      
      this.generateReport();
    } catch (error) {
      this.addResult('Overall Test', 'fail', error.message);
      this.generateReport();
    }
  }

  async checkEnvironmentVariables() {
    console.log('🔍 检查环境变量配置...');
    
    const requiredVars = [
      'STORAGE_ENDPOINT',
      'STORAGE_REGION', 
      'STORAGE_ACCESS_KEY',
      'STORAGE_SECRET_KEY',
      'STORAGE_BUCKET',
      'STORAGE_DOMAIN'
    ];
    
    const missingVars = [];
    
    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (!value) {
        missingVars.push(varName);
      } else {
        console.log(`✅ ${varName}: ${this.maskSensitive(varName, value)}`);
      }
    }
    
    if (missingVars.length > 0) {
      this.addResult('Environment Variables', 'fail', `Missing: ${missingVars.join(', ')}`);
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    } else {
      this.addResult('Environment Variables', 'pass', 'All required variables configured');
    }
  }

  async testS3Connection() {
    console.log('\n🔌 测试S3连接...');
    
    if (!this.s3Client) {
      this.addResult('S3 Connection', 'fail', 'S3 client not initialized');
      return;
    }
    
    try {
      const command = new HeadBucketCommand({
        Bucket: this.config.bucket
      });
      
      await this.s3Client.send(command);
      this.addResult('S3 Connection', 'pass', `Successfully connected to bucket: ${this.config.bucket}`);
    } catch (error) {
      this.addResult('S3 Connection', 'fail', `Connection failed: ${error.message}`);
      throw error;
    }
  }

  async testFileUpload() {
    console.log('\n📤 测试文件上传...');
    
    try {
      // 创建测试文件
      const testContent = `Test file created at ${new Date().toISOString()}`;
      const testKey = `test/upload-test-${Date.now()}.txt`;
      
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: testKey,
        Body: Buffer.from(testContent),
        ContentType: 'text/plain',
        Metadata: {
          testFile: 'true',
          createdAt: new Date().toISOString()
        }
      });
      
      await this.s3Client.send(command);
      this.testFiles.push(testKey);
      
      this.addResult('File Upload', 'pass', `File uploaded successfully: ${testKey}`);
      
      // 测试文件URL生成
      const fileUrl = `${this.config.domain}/${testKey}`;
      console.log(`📎 File URL: ${fileUrl}`);
      
    } catch (error) {
      this.addResult('File Upload', 'fail', `Upload failed: ${error.message}`);
    }
  }

  async testFileDownload() {
    console.log('\n📥 测试文件下载...');
    
    if (this.testFiles.length === 0) {
      this.addResult('File Download', 'skip', 'No test files to download');
      return;
    }
    
    try {
      const testKey = this.testFiles[0];
      
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: testKey
      });
      
      const response = await this.s3Client.send(command);
      
      if (response.Body) {
        const content = await this.streamToString(response.Body);
        this.addResult('File Download', 'pass', `File downloaded successfully, content length: ${content.length}`);
      } else {
        this.addResult('File Download', 'fail', 'Downloaded file has no content');
      }
      
    } catch (error) {
      this.addResult('File Download', 'fail', `Download failed: ${error.message}`);
    }
  }

  async testFileDelete() {
    console.log('\n🗑️ 测试文件删除...');
    
    if (this.testFiles.length === 0) {
      this.addResult('File Delete', 'skip', 'No test files to delete');
      return;
    }
    
    try {
      const testKey = this.testFiles[0];
      
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: testKey
      });
      
      await this.s3Client.send(command);
      this.addResult('File Delete', 'pass', `File deleted successfully: ${testKey}`);
      
      // 从测试文件列表中移除
      this.testFiles = this.testFiles.filter(key => key !== testKey);
      
    } catch (error) {
      this.addResult('File Delete', 'fail', `Delete failed: ${error.message}`);
    }
  }

  async cleanupTestFiles() {
    console.log('\n🧹 清理测试文件...');
    
    if (this.testFiles.length === 0) {
      this.addResult('Cleanup', 'pass', 'No files to cleanup');
      return;
    }
    
    let cleanedCount = 0;
    
    for (const testKey of this.testFiles) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: testKey
        });
        
        await this.s3Client.send(command);
        cleanedCount++;
      } catch (error) {
        console.warn(`Failed to cleanup file ${testKey}: ${error.message}`);
      }
    }
    
    this.addResult('Cleanup', 'pass', `Cleaned up ${cleanedCount} test files`);
  }

  maskSensitive(varName, value) {
    if (varName.includes('KEY') || varName.includes('SECRET')) {
      return value.substring(0, 8) + '***';
    }
    return value;
  }

  async streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
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
    
    console.log('\n📝 配置建议:');
    if (successRate === 100) {
      console.log('🎉 S3存储配置完美！所有功能正常。');
    } else if (successRate >= 80) {
      console.log('✅ S3存储配置良好，基本功能正常。');
    } else if (successRate >= 60) {
      console.log('⚠️ S3存储配置有问题，需要检查配置。');
    } else {
      console.log('🚨 S3存储配置严重错误，请重新配置。');
    }
    
    console.log('\n🔧 故障排除:');
    console.log('1. 检查环境变量是否正确设置');
    console.log('2. 验证S3访问密钥权限');
    console.log('3. 确认存储桶名称和区域正确');
    console.log('4. 检查网络连接和防火墙设置');
    console.log('5. 查看S3服务状态页面');
    
    console.log('\n📚 相关文档:');
    console.log('• S3_STORAGE_SETUP_GUIDE.md - 详细配置指南');
    console.log('• .env.vercel.template - 环境变量模板');
  }
}

// 运行测试
if (require.main === module) {
  const tester = new StorageConfigTester();
  tester.run().catch(console.error);
}

module.exports = StorageConfigTester;
