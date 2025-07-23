# LipSyncVideo.net 基于 ShipAny 的技术实施优先级清单

## 🎯 项目启动策略

### 📋 **核心原则**
- **最大化复用**: 充分利用 ShipAny 现有功能，避免重复开发
- **渐进式开发**: 先实现 MVP，再逐步完善功能
- **AI 优先**: 重点关注 AI 服务集成和用户体验
- **SEO 并行**: 在开发过程中同步实施 SEO 策略

## 1️⃣ 技术实施优先级清单

### 🟢 **第一优先级 - MVP 核心功能 (2-3周)**

#### ✅ **可直接复用的 ShipAny 功能 (复用率 90%+)**
```typescript
const directReuse = {
  authentication: {
    files: ["src/auth/*", "src/components/sign/*"],
    effort: "0.5天",
    customization: "品牌样式调整"
  },
  
  userManagement: {
    files: ["src/services/user.ts", "src/models/user.ts"],
    effort: "0.5天", 
    customization: "添加订阅状态字段"
  },
  
  paymentSystem: {
    files: ["src/app/api/checkout/*", "src/services/order.ts"],
    effort: "1天",
    customization: "调整定价计划"
  },
  
  i18nSystem: {
    files: ["src/i18n/*"],
    effort: "1天",
    customization: "更新翻译内容"
  },
  
  uiComponents: {
    files: ["src/components/ui/*"],
    effort: "0.5天",
    customization: "主题色彩调整"
  }
};
```

#### 🔨 **需要新开发的核心模块**
```typescript
const newDevelopment = {
  aiServiceIntegration: {
    priority: "最高",
    effort: "5-7天",
    files: [
      "src/lib/ai/heygen-client.ts",
      "src/lib/ai/did-client.ts", 
      "src/lib/ai/provider-manager.ts"
    ],
    dependencies: ["HeyGen API", "D-ID API"]
  },
  
  fileUploadSystem: {
    priority: "最高",
    effort: "3-4天",
    files: [
      "src/components/upload/video-uploader.tsx",
      "src/lib/storage/file-manager.ts",
      "src/app/api/upload/video/route.ts"
    ],
    dependencies: ["AWS S3"]
  },
  
  projectManagement: {
    priority: "高",
    effort: "4-5天",
    files: [
      "src/models/project.ts",
      "src/services/project.ts",
      "src/app/api/lipsync/create/route.ts"
    ],
    dependencies: ["数据库扩展"]
  },
  
  taskQueue: {
    priority: "高", 
    effort: "3-4天",
    files: [
      "src/lib/queue/processor.ts",
      "src/lib/queue/redis-client.ts"
    ],
    dependencies: ["Redis"]
  }
};
```

### 🟡 **第二优先级 - 用户体验优化 (1-2周)**

#### 🎨 **页面定制开发**
```typescript
const pageCustomization = {
  landingPage: {
    basedOn: "src/app/[locale]/(default)/page.tsx",
    effort: "2天",
    changes: ["Hero 内容", "功能展示", "演示视频"]
  },
  
  dashboardPages: {
    basedOn: "src/components/dashboard/*",
    effort: "3天", 
    changes: ["项目列表", "使用统计", "积分显示"]
  },
  
  createProjectPage: {
    basedOn: "新开发",
    effort: "4天",
    features: ["文件上传", "参数设置", "预览功能"]
  }
};
```

### 🟠 **第三优先级 - 高级功能 (1-2周)**

#### 🚀 **功能增强模块**
```typescript
const advancedFeatures = {
  batchProcessing: {
    effort: "3天",
    description: "批量视频处理功能"
  },
  
  apiPlatform: {
    effort: "4天", 
    description: "开放 API 平台"
  },
  
  adminEnhancements: {
    effort: "2天",
    description: "管理后台项目管理"
  }
};
```

## 2️⃣ 关键集成任务

### 🤖 **AI 服务集成实施步骤**

#### **Step 1: HeyGen API 集成 (2天)**
```typescript
// src/lib/ai/heygen-client.ts
export class HeyGenClient {
  private apiKey: string;
  private baseUrl = 'https://api.heygen.com/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createLipSyncTask(params: {
    videoUrl: string;
    audioUrl: string;
    quality?: 'low' | 'medium' | 'high';
  }) {
    const response = await fetch(`${this.baseUrl}/video/translate`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_url: params.videoUrl,
        audio_url: params.audioUrl,
        quality: params.quality || 'medium',
        webhook_url: `${process.env.NEXT_PUBLIC_WEB_URL}/api/webhooks/heygen`
      })
    });

    return response.json();
  }

  async getTaskStatus(taskId: string) {
    const response = await fetch(`${this.baseUrl}/video/translate/${taskId}`, {
      headers: { 'X-API-Key': this.apiKey }
    });
    return response.json();
  }
}
```

#### **Step 2: 文件上传系统扩展 (2天)**
```typescript
// src/lib/storage/video-uploader.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export class VideoUploader {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.STORAGE_REGION,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY!,
        secretAccessKey: process.env.STORAGE_SECRET_KEY!,
      },
      endpoint: process.env.STORAGE_ENDPOINT,
    });
  }

  async uploadVideo(file: File, projectId: string): Promise<string> {
    const key = `projects/${projectId}/videos/${Date.now()}-${file.name}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET!,
      Key: key,
      Body: file,
      ContentType: file.type,
      Metadata: {
        projectId,
        uploadedAt: new Date().toISOString()
      }
    });

    await this.s3Client.send(command);
    return `${process.env.STORAGE_DOMAIN}/${key}`;
  }
}
```

#### **Step 3: 任务队列系统 (2天)**
```typescript
// src/lib/queue/lipsync-processor.ts
import Queue from 'bull';
import { HeyGenClient } from '@/lib/ai/heygen-client';

const lipSyncQueue = new Queue('lip sync processing', {
  redis: { 
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

lipSyncQueue.process('lipsync-task', async (job) => {
  const { projectId, videoUrl, audioUrl, options } = job.data;
  
  try {
    // 更新任务状态为处理中
    await updateProjectStatus(projectId, 'processing');
    
    // 调用 HeyGen API
    const heygenClient = new HeyGenClient(process.env.HEYGEN_API_KEY!);
    const result = await heygenClient.createLipSyncTask({
      videoUrl,
      audioUrl,
      quality: options.quality
    });
    
    // 保存外部任务ID
    await updateProjectExternalTaskId(projectId, result.task_id);
    
  } catch (error) {
    await updateProjectStatus(projectId, 'failed');
    throw error;
  }
});

export { lipSyncQueue };
```

### 💳 **Stripe 支付系统定制 (1天)**

基于现有的 `src/app/api/checkout/route.ts`，只需要调整定价计划：

```typescript
// src/lib/pricing/plans.ts
export const PRICING_PLANS = {
  free: {
    name: "免费试用",
    price: 0,
    credits: 50,
    features: ["基础画质", "水印输出", "社区支持"]
  },
  
  starter: {
    name: "入门版",
    price: 1900, // $19.00 in cents
    credits: 500,
    features: ["高清画质", "无水印", "邮件支持"]
  },
  
  professional: {
    name: "专业版", 
    price: 4900, // $49.00 in cents
    credits: 1500,
    features: ["超高清", "API访问", "优先处理"]
  }
};
```

## 3️⃣ 数据库扩展需求

### 📊 **新增数据表**
```sql
-- 基于现有 ShipAny schema 扩展

-- 项目表
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) UNIQUE NOT NULL,
  user_uuid VARCHAR(255) NOT NULL REFERENCES users(uuid),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  video_url VARCHAR(500),
  audio_url VARCHAR(500), 
  result_url VARCHAR(500),
  external_task_id VARCHAR(255), -- HeyGen/D-ID 任务ID
  provider VARCHAR(50), -- heygen, did
  quality VARCHAR(20) DEFAULT 'medium',
  credits_consumed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 任务处理记录表
CREATE TABLE lipsync_tasks (
  id SERIAL PRIMARY KEY,
  project_uuid VARCHAR(255) NOT NULL REFERENCES projects(uuid),
  status VARCHAR(50) DEFAULT 'queued',
  progress INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 🔄 **现有表扩展**
```sql
-- 扩展用户表
ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN total_videos_created INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_video_created_at TIMESTAMP WITH TIME ZONE;

-- 扩展订单表 (已有完整结构，无需修改)
-- orders 表已包含 credits 字段，可直接使用
```

## 4️⃣ 前端页面开发计划

### 🆕 **完全新开发页面**
```typescript
const newPages = [
  {
    path: "/create",
    component: "CreateProjectPage", 
    effort: "3天",
    features: ["文件上传", "参数设置", "实时预览"]
  },
  {
    path: "/projects",
    component: "ProjectListPage",
    effort: "2天", 
    features: ["项目列表", "状态显示", "操作按钮"]
  },
  {
    path: "/projects/[id]",
    component: "ProjectDetailPage",
    effort: "2天",
    features: ["详情展示", "结果下载", "重新处理"]
  }
];
```

### 🎨 **基于模板定制页面**
```typescript
const customizedPages = [
  {
    basePage: "src/app/[locale]/(default)/page.tsx",
    newPath: "主页",
    effort: "1天",
    changes: ["Hero内容", "功能展示", "演示视频"]
  },
  {
    basePage: "src/components/dashboard/*", 
    newPath: "/dashboard",
    effort: "2天",
    changes: ["项目统计", "使用情况", "快速操作"]
  },
  {
    basePage: "src/app/[locale]/(default)/pricing/page.tsx",
    newPath: "/pricing", 
    effort: "0.5天",
    changes: ["定价计划", "功能对比"]
  }
];
```

## 5️⃣ 部署和运维准备

### 🌐 **生产环境配置**
```bash
# .env.production
# 基于 ShipAny 现有配置扩展

# AI 服务配置
HEYGEN_API_KEY=your_heygen_api_key
DID_API_KEY=your_did_api_key

# Redis 配置 (任务队列)
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# 文件存储配置 (已有)
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_BUCKET=lipsyncvideo-storage

# Webhook 配置
WEBHOOK_SECRET=your_webhook_secret
```

### 📊 **监控系统设置**
```typescript
// src/lib/monitoring/metrics.ts
// 基于现有 ShipAny 监控扩展

export const trackVideoProcessing = (projectId: string, duration: number) => {
  // 集成到现有分析系统
  if (typeof window !== 'undefined') {
    gtag('event', 'video_processed', {
      project_id: projectId,
      processing_duration: duration,
      event_category: 'AI Processing'
    });
  }
};
```

## 🚀 **推荐开发起点**

### 📅 **第1周开发计划**
```markdown
Day 1-2: 环境搭建和基础配置
- [ ] 基于 ShipAny 创建新项目
- [ ] 配置 AI 服务 API 密钥
- [ ] 设置 Redis 和数据库

Day 3-4: AI 服务集成
- [ ] 开发 HeyGen 客户端
- [ ] 实现基础任务创建 API
- [ ] 测试 AI 服务连通性

Day 5-7: 核心功能开发
- [ ] 文件上传组件
- [ ] 项目创建页面
- [ ] 任务状态查询
```

### 🎯 **成功关键因素**
1. **充分复用**: 最大化利用 ShipAny 现有功能
2. **AI 优先**: 优先确保 AI 服务集成稳定
3. **渐进开发**: 先实现基础功能，再完善体验
4. **并行 SEO**: 开发过程中同步实施 SEO 策略

这个方案可以让您在 2-3 周内完成 MVP，充分利用 ShipAny 的成熟架构，专注于 AI 视频处理的核心价值。
