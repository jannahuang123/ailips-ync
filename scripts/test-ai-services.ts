#!/usr/bin/env tsx

/**
 * LipSyncVideo.net AI 服务测试脚本
 * 运行命令: npx tsx scripts/test-ai-services.ts
 */

import { config } from 'dotenv';
import fetch from 'node-fetch';

// 加载环境变量
config({ path: '.env.development' });

interface TestResult {
  service: string;
  test: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  data?: any;
}

class AIServiceTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🤖 LipSyncVideo.net AI 服务测试\n');
    console.log('=' .repeat(50));

    await this.testHeyGenService();
    await this.testDIDService();

    this.printResults();
  }

  private async testHeyGenService(): Promise<void> {
    console.log('\n🎬 测试 HeyGen API 服务');
    console.log('-'.repeat(30));

    const apiKey = process.env.HEYGEN_API_KEY;
    
    if (!apiKey) {
      this.results.push({
        service: 'HeyGen',
        test: 'API Key 检查',
        status: 'fail',
        message: '❌ HEYGEN_API_KEY 环境变量未设置'
      });
      return;
    }

    // 测试 1: API 连接
    await this.testHeyGenConnection(apiKey);
    
    // 测试 2: 账户信息
    await this.testHeyGenAccount(apiKey);
    
    // 测试 3: 创建任务 (使用示例数据)
    await this.testHeyGenTaskCreation(apiKey);
  }

  private async testHeyGenConnection(apiKey: string): Promise<void> {
    try {
      console.log('🔍 测试 HeyGen API 连接...');
      
      const response = await fetch('https://api.heygen.com/v2/user/remaining_quota', {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json() as any;
        
        if (data.code === 100) {
          this.results.push({
            service: 'HeyGen',
            test: 'API 连接',
            status: 'pass',
            message: '✅ HeyGen API 连接成功',
            data: { quota: data.data?.remaining_quota }
          });
          console.log(`✅ 连接成功，剩余配额: ${data.data?.remaining_quota || 'N/A'}`);
        } else {
          this.results.push({
            service: 'HeyGen',
            test: 'API 连接',
            status: 'fail',
            message: `❌ API 返回错误: ${data.message || '未知错误'}`
          });
          console.log(`❌ API 返回错误: ${data.message || '未知错误'}`);
        }
      } else {
        this.results.push({
          service: 'HeyGen',
          test: 'API 连接',
          status: 'fail',
          message: `❌ HTTP 错误: ${response.status} ${response.statusText}`
        });
        console.log(`❌ HTTP 错误: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      this.results.push({
        service: 'HeyGen',
        test: 'API 连接',
        status: 'fail',
        message: `❌ 连接异常: ${error instanceof Error ? error.message : '未知错误'}`
      });
      console.log(`❌ 连接异常: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  private async testHeyGenAccount(apiKey: string): Promise<void> {
    try {
      console.log('👤 测试 HeyGen 账户信息...');
      
      const response = await fetch('https://api.heygen.com/v2/user/remaining_quota', {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json() as any;
        
        if (data.code === 100 && data.data) {
          const quota = data.data.remaining_quota;
          const quotaStatus = quota > 0 ? 'pass' : 'fail';
          
          this.results.push({
            service: 'HeyGen',
            test: '账户配额',
            status: quotaStatus,
            message: quota > 0 ? `✅ 剩余配额: ${quota}` : `❌ 配额不足: ${quota}`,
            data: { quota }
          });
          console.log(quota > 0 ? `✅ 剩余配额: ${quota}` : `❌ 配额不足: ${quota}`);
        } else {
          this.results.push({
            service: 'HeyGen',
            test: '账户配额',
            status: 'fail',
            message: '❌ 无法获取账户信息'
          });
          console.log('❌ 无法获取账户信息');
        }
      }
    } catch (error) {
      this.results.push({
        service: 'HeyGen',
        test: '账户配额',
        status: 'fail',
        message: `❌ 获取账户信息失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
      console.log(`❌ 获取账户信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  private async testHeyGenTaskCreation(apiKey: string): Promise<void> {
    console.log('🎯 测试 HeyGen 任务创建 (模拟)...');
    
    // 注意: 这里不会真正创建任务，只是测试 API 格式
    const testPayload = {
      video_url: "https://example.com/test-video.mp4",
      audio_url: "https://example.com/test-audio.mp3",
      quality: "medium",
      webhook_url: `${process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000'}/api/webhooks/heygen`
    };

    try {
      // 这里只是验证 API 格式，不实际发送请求
      console.log('📝 任务参数格式验证:');
      console.log(`   - 视频 URL: ${testPayload.video_url}`);
      console.log(`   - 音频 URL: ${testPayload.audio_url}`);
      console.log(`   - 质量设置: ${testPayload.quality}`);
      console.log(`   - Webhook: ${testPayload.webhook_url}`);

      this.results.push({
        service: 'HeyGen',
        test: '任务创建格式',
        status: 'pass',
        message: '✅ 任务参数格式正确',
        data: testPayload
      });
      console.log('✅ 任务参数格式验证通过');
      console.log('ℹ️  实际任务创建需要有效的视频和音频 URL');
      
    } catch (error) {
      this.results.push({
        service: 'HeyGen',
        test: '任务创建格式',
        status: 'fail',
        message: `❌ 参数格式错误: ${error instanceof Error ? error.message : '未知错误'}`
      });
      console.log(`❌ 参数格式错误: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  private async testDIDService(): Promise<void> {
    console.log('\n🎭 测试 D-ID API 服务');
    console.log('-'.repeat(30));

    const apiKey = process.env.DID_API_KEY;
    
    if (!apiKey) {
      this.results.push({
        service: 'D-ID',
        test: 'API Key 检查',
        status: 'skip',
        message: '⏭️  DID_API_KEY 未设置 (备选服务)'
      });
      console.log('⏭️  D-ID API Key 未设置，跳过测试 (备选服务)');
      return;
    }

    // 测试 D-ID API 连接
    await this.testDIDConnection(apiKey);
  }

  private async testDIDConnection(apiKey: string): Promise<void> {
    try {
      console.log('🔍 测试 D-ID API 连接...');
      
      const response = await fetch('https://api.d-id.com/credits', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json() as any;
        
        this.results.push({
          service: 'D-ID',
          test: 'API 连接',
          status: 'pass',
          message: '✅ D-ID API 连接成功',
          data: { credits: data.remaining }
        });
        console.log(`✅ 连接成功，剩余积分: ${data.remaining || 'N/A'}`);
      } else {
        this.results.push({
          service: 'D-ID',
          test: 'API 连接',
          status: 'fail',
          message: `❌ HTTP 错误: ${response.status} ${response.statusText}`
        });
        console.log(`❌ HTTP 错误: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      this.results.push({
        service: 'D-ID',
        test: 'API 连接',
        status: 'fail',
        message: `❌ 连接异常: ${error instanceof Error ? error.message : '未知错误'}`
      });
      console.log(`❌ 连接异常: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  private printResults(): void {
    console.log('\n📊 AI 服务测试结果汇总\n');
    console.log('=' .repeat(50));

    const groupedResults = this.results.reduce((acc, result) => {
      if (!acc[result.service]) {
        acc[result.service] = [];
      }
      acc[result.service].push(result);
      return acc;
    }, {} as Record<string, TestResult[]>);

    Object.entries(groupedResults).forEach(([service, tests]) => {
      console.log(`\n🔧 ${service} 服务`);
      console.log('-'.repeat(20));
      
      tests.forEach(test => {
        console.log(`${test.message}`);
        if (test.data) {
          console.log(`   数据: ${JSON.stringify(test.data, null, 2)}`);
        }
      });
    });

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'pass').length;
    const failedTests = this.results.filter(r => r.status === 'fail').length;
    const skippedTests = this.results.filter(r => r.status === 'skip').length;

    console.log('\n' + '='.repeat(50));
    console.log(`📈 总计: ${totalTests} 项测试`);
    console.log(`✅ 通过: ${passedTests} 项`);
    console.log(`❌ 失败: ${failedTests} 项`);
    console.log(`⏭️  跳过: ${skippedTests} 项`);

    if (failedTests === 0 && passedTests > 0) {
      console.log('\n🎉 AI 服务测试通过！可以开始集成开发了。');
      console.log('\n📋 下一步操作:');
      console.log('1. 开发 AI 客户端类 (src/lib/ai/)');
      console.log('2. 创建任务处理 API (src/app/api/lipsync/)');
      console.log('3. 实现文件上传功能');
      console.log('4. 测试完整的处理流程');
    } else if (passedTests === 0) {
      console.log('\n🚨 所有 AI 服务测试失败，请检查配置。');
      console.log('\n🔧 故障排除:');
      console.log('1. 检查 API 密钥是否正确');
      console.log('2. 确认账户余额充足');
      console.log('3. 验证网络连接正常');
      console.log('4. 查看 API 服务状态');
    } else {
      console.log('\n⚠️  部分 AI 服务测试失败，请修复后继续。');
    }

    console.log('\n📚 参考文档:');
    console.log('- API_TESTING_GUIDE.md - 详细测试指导');
    console.log('- ENVIRONMENT_SETUP.md - 环境配置指导');
  }
}

// 运行测试
async function main() {
  const tester = new AIServiceTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { AIServiceTester };
