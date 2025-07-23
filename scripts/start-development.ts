#!/usr/bin/env tsx

/**
 * LipSyncVideo.net 开发启动脚本
 * 运行命令: npx tsx scripts/start-development.ts
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { EnvironmentVerifier } from './verify-environment';
import { HomepageCustomizer } from './customize-homepage';
import { AIServiceTester } from './test-ai-services';

interface StartupStep {
  name: string;
  description: string;
  required: boolean;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  action: () => Promise<void>;
}

class DevelopmentStarter {
  private steps: StartupStep[] = [
    {
      name: '环境检查',
      description: '验证开发环境配置',
      required: true,
      status: 'pending',
      action: this.checkEnvironment.bind(this)
    },
    {
      name: '依赖安装',
      description: '安装项目依赖包',
      required: true,
      status: 'pending',
      action: this.installDependencies.bind(this)
    },
    {
      name: '数据库初始化',
      description: '推送数据库结构',
      required: true,
      status: 'pending',
      action: this.initializeDatabase.bind(this)
    },
    {
      name: '首页定制',
      description: '应用 LipSync 品牌定制',
      required: false,
      status: 'pending',
      action: this.customizeHomepage.bind(this)
    },
    {
      name: 'AI 服务测试',
      description: '验证 AI 服务连接',
      required: false,
      status: 'pending',
      action: this.testAIServices.bind(this)
    },
    {
      name: '开发服务器启动',
      description: '启动开发服务器',
      required: true,
      status: 'pending',
      action: this.startDevServer.bind(this)
    }
  ];

  async start(): Promise<void> {
    console.log('🚀 LipSyncVideo.net 开发环境启动\n');
    console.log('基于 ShipAny Template One 的快速开发方案');
    console.log('=' .repeat(60));

    // 显示启动步骤
    console.log('\n📋 启动步骤:');
    this.steps.forEach((step, index) => {
      const requiredMark = step.required ? '🔴' : '🟡';
      console.log(`${index + 1}. ${requiredMark} ${step.name} - ${step.description}`);
    });

    console.log('\n🔴 = 必需步骤  🟡 = 可选步骤\n');
    console.log('=' .repeat(60));

    // 执行启动步骤
    for (const step of this.steps) {
      await this.executeStep(step);
      
      // 如果必需步骤失败，停止执行
      if (step.required && step.status === 'failed') {
        console.log(`\n🚨 必需步骤 "${step.name}" 失败，停止启动流程。`);
        console.log('请修复问题后重新运行此脚本。');
        return;
      }
    }

    this.printSummary();
  }

  private async executeStep(step: StartupStep): Promise<void> {
    console.log(`\n🔧 执行: ${step.name}`);
    console.log(`📝 描述: ${step.description}`);
    
    step.status = 'running';
    
    try {
      await step.action();
      step.status = 'completed';
      console.log(`✅ ${step.name} 完成`);
    } catch (error) {
      step.status = 'failed';
      console.log(`❌ ${step.name} 失败: ${error instanceof Error ? error.message : '未知错误'}`);
      
      if (!step.required) {
        console.log(`⚠️  这是可选步骤，继续执行后续步骤...`);
      }
    }
  }

  private async checkEnvironment(): Promise<void> {
    console.log('🔍 检查开发环境...');
    
    // 检查必需文件
    if (!existsSync('.env.development')) {
      console.log('⚠️  .env.development 不存在，请先配置环境变量');
      console.log('💡 提示: 复制 .env.development.template 并填入实际值');
      throw new Error('环境变量文件不存在');
    }

    // 运行环境验证
    const verifier = new EnvironmentVerifier();
    await verifier.verify();
    
    console.log('✅ 环境检查完成');
  }

  private async installDependencies(): Promise<void> {
    console.log('📦 安装项目依赖...');
    
    try {
      // 检查是否已安装依赖
      if (!existsSync('node_modules')) {
        console.log('正在安装依赖包...');
        execSync('pnpm install', { stdio: 'inherit' });
      } else {
        console.log('依赖包已存在，检查更新...');
        execSync('pnpm install --frozen-lockfile', { stdio: 'inherit' });
      }
      
      console.log('✅ 依赖安装完成');
    } catch (error) {
      throw new Error('依赖安装失败');
    }
  }

  private async initializeDatabase(): Promise<void> {
    console.log('🗄️  初始化数据库...');
    
    try {
      console.log('推送数据库结构...');
      execSync('pnpm db:push', { stdio: 'inherit' });
      
      console.log('✅ 数据库初始化完成');
    } catch (error) {
      throw new Error('数据库初始化失败，请检查 DATABASE_URL 配置');
    }
  }

  private async customizeHomepage(): Promise<void> {
    console.log('🎨 应用首页定制...');
    
    const customizer = new HomepageCustomizer();
    await customizer.customize();
    
    console.log('✅ 首页定制完成');
  }

  private async testAIServices(): Promise<void> {
    console.log('🤖 测试 AI 服务连接...');
    
    const tester = new AIServiceTester();
    await tester.runAllTests();
    
    console.log('✅ AI 服务测试完成');
  }

  private async startDevServer(): Promise<void> {
    console.log('🌐 准备启动开发服务器...');
    
    // 检查端口是否被占用
    try {
      execSync('lsof -ti:3000', { stdio: 'pipe' });
      console.log('⚠️  端口 3000 已被占用，请先关闭其他服务');
      throw new Error('端口被占用');
    } catch (error) {
      // 端口未被占用，继续
    }

    console.log('🚀 启动开发服务器...');
    console.log('📍 访问地址: http://localhost:3000');
    console.log('⏹️  按 Ctrl+C 停止服务器');
    
    // 启动开发服务器
    execSync('pnpm dev', { stdio: 'inherit' });
  }

  private printSummary(): void {
    console.log('\n📊 启动结果汇总\n');
    console.log('=' .repeat(60));

    const completed = this.steps.filter(s => s.status === 'completed').length;
    const failed = this.steps.filter(s => s.status === 'failed').length;
    const skipped = this.steps.filter(s => s.status === 'skipped').length;

    this.steps.forEach(step => {
      const statusIcon = {
        'completed': '✅',
        'failed': '❌',
        'skipped': '⏭️ ',
        'pending': '⏳',
        'running': '🔄'
      }[step.status];
      
      const requiredMark = step.required ? '🔴' : '🟡';
      console.log(`${statusIcon} ${requiredMark} ${step.name}`);
    });

    console.log(`\n📈 总计: ${this.steps.length} 个步骤`);
    console.log(`✅ 完成: ${completed} 个`);
    console.log(`❌ 失败: ${failed} 个`);
    console.log(`⏭️  跳过: ${skipped} 个`);

    if (failed === 0) {
      console.log('\n🎉 开发环境启动成功！');
      console.log('\n📋 下一步开发任务:');
      console.log('1. 查看首页效果: http://localhost:3000');
      console.log('2. 开发 AI 服务集成 (src/lib/ai/)');
      console.log('3. 创建文件上传功能 (src/app/api/upload/)');
      console.log('4. 实现项目管理 API (src/app/api/lipsync/)');
      console.log('5. 开发前端页面 (src/app/[locale]/create/)');
      
      console.log('\n📚 开发文档:');
      console.log('- DEVELOPMENT_GUIDE.md - 完整开发指南');
      console.log('- QUICK_REFERENCE.md - 快速参考手册');
      console.log('- PROJECT_STRUCTURE.md - 项目结构说明');
      
    } else {
      console.log('\n🚨 启动过程中遇到问题，请查看上述错误信息。');
      console.log('\n🔧 故障排除:');
      console.log('1. 检查环境变量配置 (.env.development)');
      console.log('2. 确认数据库连接正常');
      console.log('3. 验证 API 密钥有效');
      console.log('4. 查看详细错误日志');
    }

    console.log('\n💡 提示: 可以单独运行各个脚本进行调试:');
    console.log('- npx tsx scripts/verify-environment.ts');
    console.log('- npx tsx scripts/customize-homepage.ts');
    console.log('- npx tsx scripts/test-ai-services.ts');
  }
}

// 运行启动流程
async function main() {
  const starter = new DevelopmentStarter();
  await starter.start();
}

if (require.main === module) {
  main().catch(console.error);
}

export { DevelopmentStarter };
