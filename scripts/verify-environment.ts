#!/usr/bin/env tsx

/**
 * LipSyncVideo.net 环境配置验证脚本
 * 运行命令: npx tsx scripts/verify-environment.ts
 */

import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

// 加载环境变量
config({ path: '.env.development' });

interface VerificationResult {
  category: string;
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    required: boolean;
  }>;
}

class EnvironmentVerifier {
  private results: VerificationResult[] = [];

  async verify(): Promise<void> {
    console.log('🔍 LipSyncVideo.net 环境配置验证\n');
    console.log('=' .repeat(50));

    await this.checkBasicEnvironment();
    await this.checkDatabaseConnection();
    await this.checkAuthConfiguration();
    await this.checkPaymentConfiguration();
    await this.checkStorageConfiguration();
    await this.checkAIServices();
    await this.checkRedisConnection();

    this.printResults();
  }

  private async checkBasicEnvironment(): Promise<void> {
    const checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
      required: boolean;
    }> = [];

    // 检查 Node.js 版本
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    checks.push({
      name: 'Node.js 版本',
      status: majorVersion >= 20 ? 'pass' : 'fail' as const,
      message: majorVersion >= 20 ? `✅ ${nodeVersion} (符合要求)` : `❌ ${nodeVersion} (需要 20+)`,
      required: true
    });

    // 检查环境变量文件
    const envExists = existsSync('.env.development');
    checks.push({
      name: '环境变量文件',
      status: envExists ? 'pass' : 'fail' as const,
      message: envExists ? '✅ .env.development 存在' : '❌ .env.development 不存在',
      required: true
    });

    // 检查项目名称配置
    const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME;
    checks.push({
      name: '项目名称配置',
      status: projectName === 'LipSyncVideo' ? 'pass' : 'warning' as const,
      message: projectName === 'LipSyncVideo' ? '✅ 已配置为 LipSyncVideo' : `⚠️  当前为: ${projectName || '未设置'}`,
      required: false
    });

    this.results.push({
      category: '基础环境',
      checks
    });
  }

  private async checkDatabaseConnection(): Promise<void> {
    const checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
      required: boolean;
    }> = [];
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      checks.push({
        name: '数据库连接字符串',
        status: 'fail' as const,
        message: '❌ DATABASE_URL 未配置',
        required: true
      });
    } else if (databaseUrl.includes('supabase.co')) {
      checks.push({
        name: '数据库连接字符串',
        status: 'pass' as const,
        message: '✅ Supabase 数据库已配置',
        required: true
      });

      // 尝试连接数据库
      try {
        // 这里可以添加实际的数据库连接测试
        // const { db } = await import('../src/db');
        // await db.query.users.findMany({ limit: 1 });
        
        checks.push({
          name: '数据库连接测试',
          status: 'warning' as const,
          message: '⚠️  需要运行 pnpm db:push 初始化数据库',
          required: true
        });
      } catch (error) {
        checks.push({
          name: '数据库连接测试',
          status: 'fail' as const,
          message: `❌ 连接失败: ${error instanceof Error ? error.message : '未知错误'}`,
          required: true
        });
      }
    } else {
      checks.push({
        name: '数据库连接字符串',
        status: 'warning' as const,
        message: '⚠️  数据库配置格式可能不正确',
        required: true
      });
    }

    this.results.push({
      category: '数据库配置',
      checks
    });
  }

  private async checkAuthConfiguration(): Promise<void> {
    const checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
      required: boolean;
    }> = [];

    // 检查 Auth Secret
    const authSecret = process.env.AUTH_SECRET;
    checks.push({
      name: 'Auth Secret',
      status: authSecret ? 'pass' : 'fail' as const,
      message: authSecret ? '✅ AUTH_SECRET 已配置' : '❌ AUTH_SECRET 未配置',
      required: true
    });

    // 检查 Google OAuth
    const googleId = process.env.AUTH_GOOGLE_ID;
    const googleSecret = process.env.AUTH_GOOGLE_SECRET;
    const googleEnabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === 'true';

    if (googleEnabled) {
      checks.push({
        name: 'Google OAuth',
        status: (googleId && googleSecret) ? 'pass' : 'fail' as const,
        message: (googleId && googleSecret) ? '✅ Google OAuth 已配置' : '❌ Google OAuth 配置不完整',
        required: true
      });
    } else {
      checks.push({
        name: 'Google OAuth',
        status: 'warning' as const,
        message: '⚠️  Google OAuth 未启用',
        required: false
      });
    }

    this.results.push({
      category: '认证配置',
      checks
    });
  }

  private async checkPaymentConfiguration(): Promise<void> {
    const checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
      required: boolean;
    }> = [];

    const stripePublic = process.env.STRIPE_PUBLIC_KEY;
    const stripePrivate = process.env.STRIPE_PRIVATE_KEY;

    if (stripePublic && stripePrivate) {
      const isTestMode = stripePublic.startsWith('pk_test_') && stripePrivate.startsWith('sk_test_');
      checks.push({
        name: 'Stripe 配置',
        status: 'pass' as const,
        message: isTestMode ? '✅ Stripe 测试模式已配置' : '✅ Stripe 生产模式已配置',
        required: true
      });
    } else {
      checks.push({
        name: 'Stripe 配置',
        status: 'fail' as const,
        message: '❌ Stripe 密钥未配置',
        required: true
      });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    checks.push({
      name: 'Stripe Webhook',
      status: webhookSecret ? 'pass' : 'warning' as const,
      message: webhookSecret ? '✅ Webhook Secret 已配置' : '⚠️  Webhook Secret 未配置',
      required: false
    });

    this.results.push({
      category: '支付配置',
      checks
    });
  }

  private async checkStorageConfiguration(): Promise<void> {
    const checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
      required: boolean;
    }> = [];

    const requiredStorageVars = [
      'STORAGE_ENDPOINT',
      'STORAGE_REGION', 
      'STORAGE_ACCESS_KEY',
      'STORAGE_SECRET_KEY',
      'STORAGE_BUCKET'
    ];

    const missingVars = requiredStorageVars.filter(varName => !process.env[varName]);

    if (missingVars.length === 0) {
      checks.push({
        name: 'AWS S3 配置',
        status: 'pass' as const,
        message: '✅ AWS S3 配置完整',
        required: true
      });

      // 可以添加实际的 S3 连接测试
      checks.push({
        name: 'S3 连接测试',
        status: 'warning' as const,
        message: '⚠️  需要测试 S3 连接和权限',
        required: true
      });
    } else {
      checks.push({
        name: 'AWS S3 配置',
        status: 'fail' as const,
        message: `❌ 缺少配置: ${missingVars.join(', ')}`,
        required: true
      });
    }

    this.results.push({
      category: '存储配置',
      checks
    });
  }

  private async checkAIServices(): Promise<void> {
    const checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
      required: boolean;
    }> = [];

    // 检查 HeyGen API
    const heygenKey = process.env.HEYGEN_API_KEY;
    checks.push({
      name: 'HeyGen API',
      status: heygenKey ? 'pass' : 'fail' as const,
      message: heygenKey ? '✅ HeyGen API 密钥已配置' : '❌ HeyGen API 密钥未配置',
      required: true
    });

    // 检查 D-ID API (备选)
    const didKey = process.env.DID_API_KEY;
    checks.push({
      name: 'D-ID API (备选)',
      status: didKey ? 'pass' : 'warning' as const,
      message: didKey ? '✅ D-ID API 密钥已配置' : '⚠️  D-ID API 密钥未配置 (备选方案)',
      required: false
    });

    this.results.push({
      category: 'AI 服务配置',
      checks
    });
  }

  private async checkRedisConnection(): Promise<void> {
    const checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
      required: boolean;
    }> = [];

    const redisHost = process.env.REDIS_HOST;
    const redisPort = process.env.REDIS_PORT;

    if (redisHost && redisPort) {
      checks.push({
        name: 'Redis 配置',
        status: 'pass' as const,
        message: `✅ Redis 配置: ${redisHost}:${redisPort}`,
        required: true
      });

      // 尝试连接 Redis
      try {
        // 这里可以添加实际的 Redis 连接测试
        // const Redis = require('ioredis');
        // const redis = new Redis({ host: redisHost, port: parseInt(redisPort) });
        // await redis.ping();
        
        checks.push({
          name: 'Redis 连接测试',
          status: 'warning' as const,
          message: '⚠️  需要启动 Redis 服务并测试连接',
          required: true
        });
      } catch (error) {
        checks.push({
          name: 'Redis 连接测试',
          status: 'fail' as const,
          message: `❌ Redis 连接失败`,
          required: true
        });
      }
    } else {
      checks.push({
        name: 'Redis 配置',
        status: 'fail' as const,
        message: '❌ Redis 配置不完整',
        required: true
      });
    }

    this.results.push({
      category: 'Redis 配置',
      checks
    });
  }

  private printResults(): void {
    console.log('\n📊 验证结果汇总\n');

    let totalChecks = 0;
    let passedChecks = 0;
    let failedChecks = 0;
    let warningChecks = 0;

    this.results.forEach(result => {
      console.log(`\n🔧 ${result.category}`);
      console.log('-'.repeat(30));

      result.checks.forEach(check => {
        console.log(`${check.message}`);
        totalChecks++;
        
        switch (check.status) {
          case 'pass':
            passedChecks++;
            break;
          case 'fail':
            failedChecks++;
            break;
          case 'warning':
            warningChecks++;
            break;
        }
      });
    });

    console.log('\n' + '='.repeat(50));
    console.log(`📈 总计: ${totalChecks} 项检查`);
    console.log(`✅ 通过: ${passedChecks} 项`);
    console.log(`⚠️  警告: ${warningChecks} 项`);
    console.log(`❌ 失败: ${failedChecks} 项`);

    if (failedChecks === 0) {
      console.log('\n🎉 环境配置验证通过！可以开始开发了。');
    } else {
      console.log('\n🚨 请修复失败的配置项后再开始开发。');
    }

    console.log('\n📚 参考文档:');
    console.log('- ENVIRONMENT_SETUP.md - 详细配置指导');
    console.log('- DEVELOPMENT_CHECKLIST.md - 开发检查清单');
    console.log('- .env.development.template - 环境变量模板');
  }
}

// 运行验证
async function main() {
  const verifier = new EnvironmentVerifier();
  await verifier.verify();
}

if (require.main === module) {
  main().catch(console.error);
}

export { EnvironmentVerifier };
