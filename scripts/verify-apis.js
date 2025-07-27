#!/usr/bin/env node

/**
 * LipSyncVideo API 密钥验证脚本
 * 使用方法: node scripts/verify-apis.js
 */

const https = require('https');
const http = require('http');
require('dotenv').config({ path: '.env.local' });

console.log('🔑 LipSyncVideo API 密钥验证');
console.log('============================\n');

// API 验证配置
const apiTests = [
  {
    name: 'Google OAuth',
    required: true,
    envVars: ['AUTH_GOOGLE_ID', 'AUTH_GOOGLE_SECRET'],
    test: async () => {
      const clientId = process.env.AUTH_GOOGLE_ID;
      if (!clientId || !clientId.includes('.apps.googleusercontent.com')) {
        throw new Error('Google Client ID 格式不正确');
      }
      return 'Google OAuth 配置正确';
    }
  },
  {
    name: 'Database Connection',
    required: true,
    envVars: ['DATABASE_URL'],
    test: async () => {
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl || !dbUrl.startsWith('postgresql://')) {
        throw new Error('数据库连接字符串格式不正确');
      }
      return '数据库连接配置正确';
    }
  },
  {
    name: 'APICore.ai',
    required: false,
    envVars: ['APICORE_API_KEY'],
    test: async () => {
      const apiKey = process.env.APICORE_API_KEY;
      if (!apiKey) {
        throw new Error('API 密钥未设置');
      }
      
      // 测试 API 连接
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.apicore.ai',
          port: 443,
          path: '/v1/health',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        };

        const req = https.request(options, (res) => {
          if (res.statusCode === 200 || res.statusCode === 401) {
            resolve('APICore.ai 连接正常');
          } else {
            reject(new Error(`API 返回状态码: ${res.statusCode}`));
          }
        });

        req.on('error', (error) => {
          reject(new Error(`连接失败: ${error.message}`));
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new Error('连接超时'));
        });

        req.end();
      });
    }
  },
  {
    name: 'HeyGen API',
    required: false,
    envVars: ['HEYGEN_API_KEY'],
    test: async () => {
      const apiKey = process.env.HEYGEN_API_KEY;
      if (!apiKey) {
        throw new Error('HeyGen API 密钥未设置');
      }
      
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.heygen.com',
          port: 443,
          path: '/v1/user/remaining_quota',
          method: 'GET',
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            if (res.statusCode === 200) {
              try {
                const response = JSON.parse(data);
                resolve(`HeyGen API 正常，剩余配额: ${response.remaining_quota || 'N/A'}`);
              } catch (e) {
                resolve('HeyGen API 连接正常');
              }
            } else {
              reject(new Error(`HeyGen API 返回状态码: ${res.statusCode}`));
            }
          });
        });

        req.on('error', (error) => {
          reject(new Error(`HeyGen 连接失败: ${error.message}`));
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new Error('HeyGen 连接超时'));
        });

        req.end();
      });
    }
  },
  {
    name: 'Stripe Payment',
    required: false,
    envVars: ['STRIPE_PUBLIC_KEY', 'STRIPE_PRIVATE_KEY'],
    test: async () => {
      const publicKey = process.env.STRIPE_PUBLIC_KEY;
      const privateKey = process.env.STRIPE_PRIVATE_KEY;
      
      if (!publicKey || !privateKey) {
        throw new Error('Stripe 密钥未完整设置');
      }
      
      if (!publicKey.startsWith('pk_')) {
        throw new Error('Stripe 公钥格式不正确');
      }
      
      if (!privateKey.startsWith('sk_')) {
        throw new Error('Stripe 私钥格式不正确');
      }
      
      return 'Stripe 密钥格式正确';
    }
  }
];

async function verifyAPI(apiTest) {
  console.log(`🔍 检查 ${apiTest.name}...`);
  
  // 检查环境变量
  const missingVars = apiTest.envVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    if (apiTest.required) {
      console.log(`   ❌ 缺少必需的环境变量: ${missingVars.join(', ')}`);
      return false;
    } else {
      console.log(`   ⚠️  可选服务未配置: ${missingVars.join(', ')}`);
      return true;
    }
  }

  try {
    const result = await apiTest.test();
    console.log(`   ✅ ${result}`);
    return true;
  } catch (error) {
    if (apiTest.required) {
      console.log(`   ❌ ${error.message}`);
      return false;
    } else {
      console.log(`   ⚠️  ${error.message} (可选服务)`);
      return true;
    }
  }
}

async function main() {
  let allPassed = true;
  let requiredPassed = true;

  for (const apiTest of apiTests) {
    const passed = await verifyAPI(apiTest);
    if (!passed) {
      allPassed = false;
      if (apiTest.required) {
        requiredPassed = false;
      }
    }
    console.log(''); // 空行分隔
  }

  console.log('📊 验证结果汇总:');
  console.log('================');

  if (requiredPassed) {
    console.log('✅ 所有必需服务配置正确');
  } else {
    console.log('❌ 部分必需服务配置有问题');
  }

  if (allPassed) {
    console.log('🎉 所有服务验证通过！');
  } else {
    console.log('⚠️  部分可选服务需要配置');
  }

  console.log('\n🚀 下一步操作:');
  if (requiredPassed) {
    console.log('1. 运行 npm run dev 启动开发服务器');
    console.log('2. 访问 http://localhost:3000 测试应用');
    console.log('3. 测试用户登录功能');
    console.log('4. 测试 LipSync 视频生成功能');
  } else {
    console.log('1. 修复上述必需服务的配置问题');
    console.log('2. 重新运行此验证脚本');
    console.log('3. 运行 node scripts/setup-env.js 重新配置');
  }

  if (!requiredPassed) {
    process.exit(1);
  }
}

main().catch(console.error);
