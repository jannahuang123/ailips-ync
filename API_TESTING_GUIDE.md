# 🧪 LipSyncVideo.net API 测试指南

## 🎯 **测试目标**

验证以下核心功能：
- ✅ AI 服务集成 (HeyGen, D-ID)
- ✅ 文件上传功能 (视频/音频)
- ✅ 项目管理 API
- ✅ 任务状态查询
- ✅ Webhook 回调处理

## 🔧 **测试环境准备**

### 📁 **创建测试文件夹**
```bash
mkdir -p tests/api
mkdir -p tests/fixtures
mkdir -p tests/scripts
```

### 📄 **准备测试数据**
```bash
# 下载测试文件到 tests/fixtures/
curl -o tests/fixtures/test-video.mp4 "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
curl -o tests/fixtures/test-audio.mp3 "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3"

# 或者使用本地测试文件
# 视频文件: 30秒以内，MP4格式，< 50MB
# 音频文件: 对应长度，MP3格式，< 20MB
```

## 🤖 **AI 服务集成测试**

### 🎬 **HeyGen API 测试脚本**
```typescript
// tests/scripts/test-heygen.ts
import fetch from 'node-fetch';

interface HeyGenResponse {
  code: number;
  data?: {
    task_id: string;
    status: string;
  };
  message?: string;
}

class HeyGenTester {
  private apiKey: string;
  private baseUrl = 'https://api.heygen.com/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing HeyGen API connection...');
      
      // 测试 API 连通性 - 获取账户信息
      const response = await fetch(`${this.baseUrl}/user/remaining_quota`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json() as any;
      
      if (response.ok && data.code === 100) {
        console.log('✅ HeyGen API connection successful');
        console.log(`📊 Remaining quota: ${data.data?.remaining_quota || 'N/A'}`);
        return true;
      } else {
        console.log('❌ HeyGen API connection failed');
        console.log('Response:', data);
        return false;
      }
    } catch (error) {
      console.log('❌ HeyGen API connection error:', error);
      return false;
    }
  }

  async testLipSyncCreation(videoUrl: string, audioUrl: string): Promise<string | null> {
    try {
      console.log('🎬 Testing HeyGen lip sync creation...');
      
      const response = await fetch(`${this.baseUrl}/video/translate`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          video_url: videoUrl,
          audio_url: audioUrl,
          quality: 'medium',
          webhook_url: `${process.env.NEXT_PUBLIC_WEB_URL}/api/webhooks/heygen`
        })
      });

      const data = await response.json() as HeyGenResponse;
      
      if (response.ok && data.code === 100) {
        console.log('✅ HeyGen task created successfully');
        console.log(`📝 Task ID: ${data.data?.task_id}`);
        return data.data?.task_id || null;
      } else {
        console.log('❌ HeyGen task creation failed');
        console.log('Response:', data);
        return null;
      }
    } catch (error) {
      console.log('❌ HeyGen task creation error:', error);
      return null;
    }
  }

  async testTaskStatus(taskId: string): Promise<void> {
    try {
      console.log(`🔍 Testing HeyGen task status for: ${taskId}`);
      
      const response = await fetch(`${this.baseUrl}/video/translate/${taskId}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey
        }
      });

      const data = await response.json() as any;
      
      if (response.ok) {
        console.log('✅ Task status retrieved successfully');
        console.log(`📊 Status: ${data.data?.status || 'Unknown'}`);
        console.log(`📈 Progress: ${data.data?.progress || 0}%`);
        
        if (data.data?.result_url) {
          console.log(`🎥 Result URL: ${data.data.result_url}`);
        }
      } else {
        console.log('❌ Task status retrieval failed');
        console.log('Response:', data);
      }
    } catch (error) {
      console.log('❌ Task status error:', error);
    }
  }
}

// 运行测试
async function runHeyGenTests() {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    console.log('❌ HEYGEN_API_KEY not found in environment variables');
    return;
  }

  const tester = new HeyGenTester(apiKey);
  
  // 测试连接
  const connectionOK = await tester.testConnection();
  if (!connectionOK) return;

  // 测试任务创建 (需要实际的文件URL)
  const videoUrl = 'https://your-test-video-url.mp4';
  const audioUrl = 'https://your-test-audio-url.mp3';
  
  const taskId = await tester.testLipSyncCreation(videoUrl, audioUrl);
  if (taskId) {
    // 等待几秒后查询状态
    setTimeout(() => {
      tester.testTaskStatus(taskId);
    }, 5000);
  }
}

export { HeyGenTester, runHeyGenTests };
```

### 🎭 **D-ID API 测试脚本**
```typescript
// tests/scripts/test-did.ts
import fetch from 'node-fetch';

class DIDTester {
  private apiKey: string;
  private baseUrl = 'https://api.d-id.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing D-ID API connection...');
      
      const response = await fetch(`${this.baseUrl}/credits`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json() as any;
        console.log('✅ D-ID API connection successful');
        console.log(`💰 Remaining credits: ${data.remaining || 'N/A'}`);
        return true;
      } else {
        console.log('❌ D-ID API connection failed');
        console.log('Status:', response.status);
        return false;
      }
    } catch (error) {
      console.log('❌ D-ID API connection error:', error);
      return false;
    }
  }

  async testTalkCreation(sourceUrl: string, audioUrl: string): Promise<string | null> {
    try {
      console.log('🎭 Testing D-ID talk creation...');
      
      const response = await fetch(`${this.baseUrl}/talks`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_url: sourceUrl,
          script: {
            type: 'audio',
            audio_url: audioUrl
          },
          config: {
            fluent: false,
            pad_audio: 0.0
          },
          webhook: `${process.env.NEXT_PUBLIC_WEB_URL}/api/webhooks/did`
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        console.log('✅ D-ID talk created successfully');
        console.log(`📝 Talk ID: ${data.id}`);
        return data.id;
      } else {
        console.log('❌ D-ID talk creation failed');
        console.log('Status:', response.status);
        const errorData = await response.json();
        console.log('Error:', errorData);
        return null;
      }
    } catch (error) {
      console.log('❌ D-ID talk creation error:', error);
      return null;
    }
  }
}

export { DIDTester };
```

## 📤 **文件上传测试**

### 🎥 **文件上传测试脚本**
```typescript
// tests/scripts/test-upload.ts
import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

class UploadTester {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async testVideoUpload(filePath: string): Promise<string | null> {
    try {
      console.log('📤 Testing video upload...');
      
      if (!fs.existsSync(filePath)) {
        console.log(`❌ Test file not found: ${filePath}`);
        return null;
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const response = await fetch(`${this.baseUrl}/api/upload/video`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json() as any;
        console.log('✅ Video upload successful');
        console.log(`🔗 File URL: ${data.url}`);
        return data.url;
      } else {
        console.log('❌ Video upload failed');
        console.log('Status:', response.status);
        const errorData = await response.text();
        console.log('Error:', errorData);
        return null;
      }
    } catch (error) {
      console.log('❌ Video upload error:', error);
      return null;
    }
  }

  async testAudioUpload(filePath: string): Promise<string | null> {
    try {
      console.log('🎵 Testing audio upload...');
      
      if (!fs.existsSync(filePath)) {
        console.log(`❌ Test file not found: ${filePath}`);
        return null;
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const response = await fetch(`${this.baseUrl}/api/upload/audio`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json() as any;
        console.log('✅ Audio upload successful');
        console.log(`🔗 File URL: ${data.url}`);
        return data.url;
      } else {
        console.log('❌ Audio upload failed');
        console.log('Status:', response.status);
        return null;
      }
    } catch (error) {
      console.log('❌ Audio upload error:', error);
      return null;
    }
  }
}

export { UploadTester };
```

## 🎯 **项目管理 API 测试**

### 📋 **项目 API 测试脚本**
```typescript
// tests/scripts/test-project-api.ts
import fetch from 'node-fetch';

class ProjectAPITester {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async authenticate(email: string, password: string): Promise<boolean> {
    try {
      console.log('🔐 Authenticating user...');
      
      // 这里需要根据实际的认证流程调整
      // ShipAny 使用 NextAuth，可能需要不同的认证方式
      
      console.log('ℹ️  Authentication method depends on NextAuth setup');
      console.log('ℹ️  For testing, you may need to manually get session token');
      
      return true; // 临时返回 true，实际需要实现认证逻辑
    } catch (error) {
      console.log('❌ Authentication error:', error);
      return false;
    }
  }

  async testCreateProject(videoUrl: string, audioUrl: string): Promise<string | null> {
    try {
      console.log('📝 Testing project creation...');
      
      const response = await fetch(`${this.baseUrl}/api/lipsync/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${this.authToken}` // 如果需要
        },
        body: JSON.stringify({
          name: 'Test Project',
          videoUrl,
          audioUrl,
          quality: 'medium'
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        console.log('✅ Project created successfully');
        console.log(`📝 Project ID: ${data.projectId}`);
        console.log(`⏱️  Estimated time: ${data.estimatedTime}`);
        return data.projectId;
      } else {
        console.log('❌ Project creation failed');
        console.log('Status:', response.status);
        const errorData = await response.text();
        console.log('Error:', errorData);
        return null;
      }
    } catch (error) {
      console.log('❌ Project creation error:', error);
      return null;
    }
  }

  async testProjectStatus(projectId: string): Promise<void> {
    try {
      console.log(`🔍 Testing project status for: ${projectId}`);
      
      const response = await fetch(`${this.baseUrl}/api/lipsync/status/${projectId}`, {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${this.authToken}` // 如果需要
        }
      });

      if (response.ok) {
        const data = await response.json() as any;
        console.log('✅ Project status retrieved successfully');
        console.log(`📊 Status: ${data.status}`);
        console.log(`📈 Progress: ${data.progress}%`);
        
        if (data.resultUrl) {
          console.log(`🎥 Result URL: ${data.resultUrl}`);
        }
      } else {
        console.log('❌ Project status retrieval failed');
        console.log('Status:', response.status);
      }
    } catch (error) {
      console.log('❌ Project status error:', error);
    }
  }
}

export { ProjectAPITester };
```

## 🔄 **完整测试套件**

### 🧪 **主测试脚本**
```typescript
// tests/scripts/run-all-tests.ts
import { HeyGenTester, runHeyGenTests } from './test-heygen';
import { DIDTester } from './test-did';
import { UploadTester } from './test-upload';
import { ProjectAPITester } from './test-project-api';

async function runAllTests() {
  console.log('🚀 Starting LipSyncVideo.net API Tests\n');
  console.log('=' .repeat(50));

  // 1. 测试 AI 服务连接
  console.log('\n1️⃣  Testing AI Services...');
  await runHeyGenTests();

  if (process.env.DID_API_KEY) {
    const didTester = new DIDTester(process.env.DID_API_KEY);
    await didTester.testConnection();
  }

  // 2. 测试文件上传
  console.log('\n2️⃣  Testing File Upload...');
  const uploadTester = new UploadTester();
  
  const videoUrl = await uploadTester.testVideoUpload('tests/fixtures/test-video.mp4');
  const audioUrl = await uploadTester.testAudioUpload('tests/fixtures/test-audio.mp3');

  // 3. 测试项目 API
  if (videoUrl && audioUrl) {
    console.log('\n3️⃣  Testing Project API...');
    const projectTester = new ProjectAPITester();
    
    const projectId = await projectTester.testCreateProject(videoUrl, audioUrl);
    if (projectId) {
      // 等待几秒后查询状态
      setTimeout(() => {
        projectTester.testProjectStatus(projectId);
      }, 3000);
    }
  }

  console.log('\n🎉 All tests completed!');
  console.log('=' .repeat(50));
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests };
```

## 📋 **测试执行指南**

### 🏃‍♂️ **运行测试**
```bash
# 安装测试依赖
pnpm add -D node-fetch form-data @types/node-fetch

# 运行单个测试
npx tsx tests/scripts/test-heygen.ts
npx tsx tests/scripts/test-upload.ts

# 运行完整测试套件
npx tsx tests/scripts/run-all-tests.ts

# 添加到 package.json scripts
{
  "scripts": {
    "test:api": "tsx tests/scripts/run-all-tests.ts",
    "test:heygen": "tsx tests/scripts/test-heygen.ts",
    "test:upload": "tsx tests/scripts/test-upload.ts"
  }
}
```

### 📊 **测试结果示例**
```bash
🚀 Starting LipSyncVideo.net API Tests

==================================================

1️⃣  Testing AI Services...
🔍 Testing HeyGen API connection...
✅ HeyGen API connection successful
📊 Remaining quota: 100 minutes

🎬 Testing HeyGen lip sync creation...
✅ HeyGen task created successfully
📝 Task ID: abc123def456

2️⃣  Testing File Upload...
📤 Testing video upload...
✅ Video upload successful
🔗 File URL: https://your-bucket.s3.amazonaws.com/videos/test-video.mp4

🎵 Testing audio upload...
✅ Audio upload successful
🔗 File URL: https://your-bucket.s3.amazonaws.com/audio/test-audio.mp3

3️⃣  Testing Project API...
📝 Testing project creation...
✅ Project created successfully
📝 Project ID: proj_abc123
⏱️  Estimated time: 2-5 minutes

🎉 All tests completed!
==================================================
```

## 🔧 **测试配置文件**

### 📄 **Jest 配置 (可选)**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

---

**🎯 通过这套完整的测试方案，您可以在开发过程中快速验证各个 API 的功能是否正常，确保集成的稳定性和可靠性。**
