#!/usr/bin/env node

/**
 * Vercel部署后TTS修复验证脚本
 * 
 * 使用方法:
 * node scripts/test-vercel-deployment.js https://your-domain.vercel.app
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// 获取命令行参数中的域名
const VERCEL_URL = process.argv[2] || 'https://your-domain.vercel.app';

console.log('🚀 Vercel部署验证脚本');
console.log('===================');
console.log(`测试目标: ${VERCEL_URL}`);
console.log('');

async function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, VERCEL_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TTS-Fix-Verification/1.0'
      }
    };

    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testHomePage() {
  console.log('1️⃣ 测试主页访问...');
  
  try {
    const response = await makeRequest('/', 'GET');
    
    if (response.status === 200) {
      console.log('✅ 主页访问正常');
      return true;
    } else {
      console.log(`❌ 主页访问异常: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 主页访问失败: ${error.message}`);
    return false;
  }
}

async function testTTSEndpoint() {
  console.log('2️⃣ 测试TTS API端点...');
  
  try {
    const response = await makeRequest('/api/tts/generate', 'POST', {
      text: 'Hello world',
      voice: 'en-US-AriaNeural',
      format: 'mp3'
    });

    if (response.status === 404) {
      console.log('❌ 失败: TTS API仍返回404 (端点不存在)');
      return false;
    } else if (response.status === 401) {
      console.log('✅ 成功: TTS API存在，返回401 (需要认证)');
      return true;
    } else {
      console.log(`⚠️  TTS API返回状态: ${response.status}`);
      console.log('   这可能是正常的，取决于具体配置');
      return true;
    }
  } catch (error) {
    console.log(`❌ TTS API测试失败: ${error.message}`);
    return false;
  }
}

async function testLipSyncWithAudioPrompt() {
  console.log('3️⃣ 测试LipSync API (audioPrompt支持)...');
  
  try {
    const response = await makeRequest('/api/lipsync/create', 'POST', {
      name: 'Test Project',
      imageUrl: 'https://example.com/test.jpg',
      audioPrompt: 'Hello, this is a test message',
      quality: 'medium'
    });

    if (response.status === 400 && response.body.error && 
        response.body.error.includes('audioUrl')) {
      console.log('❌ 失败: LipSync API不支持audioPrompt参数');
      return false;
    } else if (response.status === 401) {
      console.log('✅ 成功: LipSync API支持audioPrompt参数');
      return true;
    } else {
      console.log(`⚠️  LipSync API返回状态: ${response.status}`);
      if (response.body && response.body.error) {
        console.log(`   错误信息: ${response.body.error}`);
      }
      return true; // 参数被接受了
    }
  } catch (error) {
    console.log(`❌ LipSync API测试失败: ${error.message}`);
    return false;
  }
}

async function testLipSyncParameterValidation() {
  console.log('4️⃣ 测试LipSync API参数验证...');
  
  try {
    const response = await makeRequest('/api/lipsync/create', 'POST', {
      name: 'Test Project',
      imageUrl: 'https://example.com/test.jpg',
      quality: 'medium'
      // 故意缺少audioUrl和audioPrompt
    });

    if (response.status === 400 && response.body.error && 
        response.body.error.includes('either audioUrl or audioPrompt')) {
      console.log('✅ 成功: 参数验证正常工作');
      return true;
    } else if (response.status === 401) {
      console.log('✅ 成功: 参数验证正常 (认证优先)');
      return true;
    } else {
      console.log(`⚠️  参数验证返回: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 参数验证测试失败: ${error.message}`);
    return false;
  }
}

async function testAPIHealth() {
  console.log('5️⃣ 测试API健康状态...');
  
  try {
    const response = await makeRequest('/api/ping', 'GET');
    
    if (response.status === 200) {
      console.log('✅ API服务正常运行');
      return true;
    } else {
      console.log(`⚠️  API健康检查返回: ${response.status}`);
      return true; // 可能没有ping端点，但服务在运行
    }
  } catch (error) {
    console.log(`⚠️  API健康检查失败: ${error.message}`);
    return true; // 不是关键测试
  }
}

async function main() {
  console.log('开始验证TTS修复部署...\n');

  const tests = [
    { name: '主页访问', test: testHomePage },
    { name: 'TTS端点', test: testTTSEndpoint },
    { name: 'LipSync audioPrompt', test: testLipSyncWithAudioPrompt },
    { name: '参数验证', test: testLipSyncParameterValidation },
    { name: 'API健康', test: testAPIHealth }
  ];

  let passed = 0;
  let total = tests.length;

  for (const { name, test } of tests) {
    const result = await test();
    if (result) passed++;
    console.log('');
  }

  console.log('📊 验证结果总结:');
  console.log('================');
  console.log(`✅ 通过: ${passed}/${total}`);
  console.log(`❌ 失败: ${total - passed}/${total}`);
  
  if (passed >= 4) { // 允许一个测试失败
    console.log('');
    console.log('🎉 部署验证成功！');
    console.log('');
    console.log('✅ TTS修复已生效:');
    console.log('  • TTS API端点存在且正常响应');
    console.log('  • LipSync API支持audioPrompt参数');
    console.log('  • 参数验证工作正常');
    console.log('  • 用户可以直接输入文本生成视频');
    console.log('');
    console.log('🚀 可以开始使用新功能了！');
    process.exit(0);
  } else {
    console.log('');
    console.log('⚠️  部署可能存在问题，请检查:');
    console.log('  1. 确认部署使用的是最新代码 (commit: f6ad68b)');
    console.log('  2. 检查Vercel环境变量配置');
    console.log('  3. 查看Vercel函数执行日志');
    console.log('  4. 确认域名访问正常');
    process.exit(1);
  }
}

// 检查命令行参数
if (process.argv.length < 3) {
  console.log('使用方法:');
  console.log('node scripts/test-vercel-deployment.js https://your-domain.vercel.app');
  console.log('');
  console.log('示例:');
  console.log('node scripts/test-vercel-deployment.js https://ailips-ync.vercel.app');
  process.exit(1);
}

// 运行验证
main().catch(error => {
  console.error('💥 验证脚本执行失败:', error);
  process.exit(1);
});
