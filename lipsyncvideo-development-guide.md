# LipSyncVideo.net 完整开发文档

## 📋 项目概述

### 🎯 产品定位
**LipSyncVideo.net** 是一个基于 AI 技术的视频唇语同步 SaaS 平台，专注于为内容创作者、教育工作者、营销人员和企业用户提供高质量的视频唇语同步服务。

### 🏆 核心价值主张
- **AI 驱动**: 采用先进的深度学习算法，实现精准的唇语同步
- **多语言支持**: 支持全球主要语言的音频处理和同步
- **高质量输出**: 提供多种质量等级，满足不同场景需求
- **简单易用**: 直观的用户界面，3步完成视频制作
- **快速处理**: 平均处理时间 2-5 分钟，支持批量处理

### 🎯 目标用户群体
- **内容创作者**: YouTube、TikTok、Instagram 创作者
- **教育工作者**: 在线教育平台、培训机构
- **营销人员**: 品牌推广、产品演示、广告制作
- **企业用户**: 内部培训、客户服务、产品介绍
- **开发者**: 通过 API 集成唇语同步功能

## 🏗️ 技术架构

### 📚 技术栈选择

#### 前端技术栈
```typescript
// 基于 ShipAny Template One 架构
- Framework: Next.js 15 (App Router)
- UI Library: React 19 + TypeScript
- Styling: TailwindCSS 4 + shadcn/ui
- State Management: React Context + Zustand
- Form Handling: React Hook Form + Zod
- File Upload: React Dropzone + AWS S3
- Internationalization: next-intl
- Animation: Framer Motion
```

#### 后端技术栈
```typescript
// API 和服务层
- Runtime: Node.js 20+
- Framework: Next.js API Routes
- Database: PostgreSQL + Drizzle ORM
- Authentication: NextAuth.js 5.0
- Payment: Stripe
- File Storage: AWS S3 + CloudFront
- Task Queue: Redis + Bull Queue
- Monitoring: Sentry + Analytics
```

#### AI 服务集成
```typescript
// 第三方 AI 服务
- Primary: HeyGen API (唇语同步)
- Fallback: D-ID API (备选方案)
- Audio Processing: AssemblyAI (语音识别)
- Video Processing: FFmpeg (格式转换)
```

### 🗄️ 数据库设计

#### 核心数据表结构
```sql
-- 扩展现有 ShipAny 用户表
ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN total_videos_created INTEGER DEFAULT 0;

-- 项目表
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) UNIQUE NOT NULL,
  user_uuid VARCHAR(255) NOT NULL REFERENCES users(uuid),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  video_url VARCHAR(500),
  audio_url VARCHAR(500),
  result_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  duration_seconds INTEGER,
  file_size_mb DECIMAL(10,2),
  quality_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, ultra
  language_code VARCHAR(10),
  credits_consumed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 任务队列表
CREATE TABLE lipsync_tasks (
  id SERIAL PRIMARY KEY,
  project_uuid VARCHAR(255) NOT NULL REFERENCES projects(uuid),
  external_task_id VARCHAR(255), -- HeyGen/D-ID 任务ID
  provider VARCHAR(50) NOT NULL, -- heygen, did, synthesia
  status VARCHAR(50) DEFAULT 'queued', -- queued, processing, completed, failed
  progress INTEGER DEFAULT 0, -- 0-100
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  webhook_received_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 使用统计表
CREATE TABLE usage_stats (
  id SERIAL PRIMARY KEY,
  user_uuid VARCHAR(255) NOT NULL REFERENCES users(uuid),
  date DATE NOT NULL,
  videos_created INTEGER DEFAULT 0,
  credits_consumed INTEGER DEFAULT 0,
  processing_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 模板表
CREATE TABLE video_templates (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- education, marketing, entertainment
  thumbnail_url VARCHAR(500),
  preview_video_url VARCHAR(500),
  template_data JSONB, -- 模板配置数据
  is_premium BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 🔌 API 架构设计

#### RESTful API 端点
```typescript
// 核心业务 API
POST   /api/lipsync/create           // 创建唇语同步任务
GET    /api/lipsync/status/[id]      // 查询任务状态
GET    /api/lipsync/download/[id]    // 下载结果视频
DELETE /api/lipsync/[id]             // 删除项目
POST   /api/lipsync/preview          // 生成预览

// 文件管理 API
POST   /api/upload/video             // 上传视频文件
POST   /api/upload/audio             // 上传音频文件
GET    /api/files/[id]               // 获取文件信息
DELETE /api/files/[id]               // 删除文件

// 用户管理 API (基于 ShipAny)
GET    /api/user/profile             // 获取用户信息
PUT    /api/user/profile             // 更新用户信息
GET    /api/user/projects            // 获取用户项目列表
GET    /api/user/usage               // 获取使用统计

// 支付和积分 API (基于 ShipAny)
POST   /api/stripe/create-checkout   // 创建支付会话
POST   /api/stripe/webhook           // Stripe Webhook
GET    /api/credits/balance          // 查询积分余额
POST   /api/credits/consume          // 消耗积分

// Webhook 端点
POST   /api/webhooks/heygen          // HeyGen 回调
POST   /api/webhooks/did             // D-ID 回调
```

## 🎨 页面架构设计

### 🌐 完整页面列表

#### 公开页面 (Public Pages)
```typescript
// 营销页面
https://lipsyncvideo.net/                    // 主页
https://lipsyncvideo.net/zh/                 // 中文主页
https://lipsyncvideo.net/pricing             // 定价页面
https://lipsyncvideo.net/showcase            // 作品展示
https://lipsyncvideo.net/demo                // 在线演示
https://lipsyncvideo.net/features            // 功能特性
https://lipsyncvideo.net/use-cases           // 使用场景

// 内容页面
https://lipsyncvideo.net/blog                // 博客
https://lipsyncvideo.net/tutorials           // 教程中心
https://lipsyncvideo.net/help                // 帮助中心
https://lipsyncvideo.net/api-docs            // API 文档

// 认证页面
https://lipsyncvideo.net/auth/signin         // 登录
https://lipsyncvideo.net/auth/signup         // 注册

// 法律页面
https://lipsyncvideo.net/privacy-policy      // 隐私政策
https://lipsyncvideo.net/terms-of-service    // 服务条款
```

#### 用户页面 (User Dashboard)
```typescript
// 核心功能
https://lipsyncvideo.net/dashboard           // 用户仪表板
https://lipsyncvideo.net/create              // 创建项目
https://lipsyncvideo.net/projects            // 项目管理
https://lipsyncvideo.net/projects/[id]       // 项目详情
https://lipsyncvideo.net/studio              // 创作工作室

// 账户管理
https://lipsyncvideo.net/account             // 账户设置
https://lipsyncvideo.net/billing             // 账单管理
https://lipsyncvideo.net/credits             // 积分管理
https://lipsyncvideo.net/subscription        // 订阅管理
```

#### 管理员页面 (Admin Panel)
```typescript
https://lipsyncvideo.net/admin               // 管理员仪表板
https://lipsyncvideo.net/admin/users         // 用户管理
https://lipsyncvideo.net/admin/projects      // 项目管理
https://lipsyncvideo.net/admin/analytics     // 业务分析
```

## 🔧 AI 服务集成方案

### 🥇 主要 AI 服务提供商

#### HeyGen API 集成 (主要方案)
```typescript
// src/lib/ai/heygen.ts
export class HeyGenService {
  private static readonly BASE_URL = 'https://api.heygen.com/v2';
  private static readonly API_KEY = process.env.HEYGEN_API_KEY;

  static async createLipSyncTask(params: {
    videoUrl: string;
    audioUrl: string;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    language?: string;
  }) {
    const response = await fetch(`${this.BASE_URL}/video/translate`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_url: params.videoUrl,
        audio_url: params.audioUrl,
        target_language: params.language || 'auto-detect',
        quality: params.quality,
        webhook_url: `${process.env.NEXT_PUBLIC_WEB_URL}/api/webhooks/heygen`
      })
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.statusText}`);
    }

    return response.json();
  }

  static async getTaskStatus(taskId: string) {
    const response = await fetch(`${this.BASE_URL}/video/translate/${taskId}`, {
      headers: { 'X-API-Key': this.API_KEY! }
    });

    return response.json();
  }
}
```

#### 容错机制设计
```typescript
// src/lib/ai/provider-manager.ts
export class AIProviderManager {
  private providers = [
    new HeyGenProvider(),
    new DIDProvider(),
    new SynthesiaProvider()
  ];

  async processWithFallback(params: LipSyncParams): Promise<TaskResult> {
    let lastError: Error;

    for (const provider of this.providers) {
      try {
        if (await provider.isHealthy()) {
          return await provider.process(params);
        }
      } catch (error) {
        lastError = error;
        console.warn(`Provider ${provider.name} failed:`, error);
        continue;
      }
    }

    throw new Error(`All providers failed. Last error: ${lastError?.message}`);
  }
}
```

## 📊 业务逻辑实现

### 💳 积分系统设计
```typescript
// src/lib/credits.ts
export const CREDIT_RATES = {
  video_processing: {
    low: 1,      // 1 credit per MB
    medium: 2,   // 2 credits per MB
    high: 3,     // 3 credits per MB
    ultra: 5     // 5 credits per MB
  },
  api_usage: {
    create_task: 1,
    preview: 0.5,
    download: 0
  }
};

export function calculateCredits(
  fileSizeMB: number, 
  quality: string
): number {
  const rate = CREDIT_RATES.video_processing[quality] || 2;
  return Math.ceil(fileSizeMB * rate);
}
```

### 🔄 任务队列处理
```typescript
// src/lib/queue/processor.ts
import Queue from 'bull';

const lipSyncQueue = new Queue('lip sync processing', {
  redis: { host: 'localhost', port: 6379 }
});

lipSyncQueue.process('lipsync-task', async (job) => {
  const { projectId, videoUrl, audioUrl, options } = job.data;
  
  try {
    // 更新任务状态
    await updateTaskStatus(projectId, 'processing', 10);
    
    // 调用 AI 服务
    const result = await AIProviderManager.processWithFallback({
      videoUrl,
      audioUrl,
      quality: options.quality
    });
    
    // 处理结果
    await handleTaskCompletion(projectId, result);
    
  } catch (error) {
    await handleTaskFailure(projectId, error);
  }
});
```

## 🚀 部署指南

### 🌐 Vercel 部署配置
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 300
    }
  },
  "env": {
    "NEXT_PUBLIC_WEB_URL": "https://lipsyncvideo.net",
    "DATABASE_URL": "@database_url",
    "HEYGEN_API_KEY": "@heygen_api_key",
    "STRIPE_SECRET_KEY": "@stripe_secret_key"
  }
}
```

### 🔧 环境变量配置
```bash
# .env.production
NEXT_PUBLIC_WEB_URL=https://lipsyncvideo.net
NEXT_PUBLIC_PROJECT_NAME=LipSyncVideo

# Database
DATABASE_URL=postgresql://user:pass@host:5432/lipsyncvideo

# AI Services
HEYGEN_API_KEY=your_heygen_api_key
DID_API_KEY=your_did_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_key

# File Storage
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_REGION=us-east-1
STORAGE_BUCKET=lipsyncvideo-storage
STORAGE_ACCESS_KEY=your_access_key
STORAGE_SECRET_KEY=your_secret_key

# Payment
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_PRIVATE_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Queue
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

## 📈 性能优化策略

### ⚡ 前端优化
- 使用 Next.js 15 的 Turbopack 构建
- 实施代码分割和懒加载
- 优化图片和视频资源
- 使用 CDN 加速静态资源

### 🔄 后端优化
- 实施 Redis 缓存策略
- 数据库查询优化
- API 响应压缩
- 任务队列负载均衡

### 📊 监控和分析
- 集成 Sentry 错误监控
- 使用 Vercel Analytics
- 实施自定义业务指标追踪

## 🔒 安全考虑

### 🛡️ 数据安全
- 文件上传安全验证
- API 访问频率限制
- 用户数据加密存储
- 定期安全审计

### 🔐 访问控制
- JWT Token 认证
- 基于角色的权限控制
- API 密钥管理
- Webhook 签名验证

## 📋 开发里程碑

### 第一阶段 (MVP - 8周)
- [ ] 基础页面架构搭建
- [ ] 用户认证系统
- [ ] 文件上传功能
- [ ] HeyGen API 集成
- [ ] 基础支付系统

### 第二阶段 (功能完善 - 4周)
- [ ] 高级编辑功能
- [ ] 多语言支持
- [ ] 管理后台
- [ ] 性能优化

### 第三阶段 (生态扩展 - 4周)
- [ ] API 开放平台
- [ ] 移动端适配
- [ ] 企业版功能
- [ ] 第三方集成

## 🎨 UI/UX 设计规范

### 🎯 设计系统
```typescript
// src/lib/design-tokens.ts
export const designTokens = {
  colors: {
    primary: {
      50: 'oklch(0.97 0.02 264)',
      500: 'oklch(0.57 0.15 264)',
      900: 'oklch(0.25 0.08 264)'
    },
    accent: {
      50: 'oklch(0.96 0.03 120)',
      500: 'oklch(0.65 0.12 120)',
      900: 'oklch(0.30 0.06 120)'
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem'
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    }
  }
};
```

### 📱 响应式设计断点
```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --breakpoint-sm: 640px;
    --breakpoint-md: 768px;
    --breakpoint-lg: 1024px;
    --breakpoint-xl: 1280px;
    --breakpoint-2xl: 1536px;
  }
}
```

## 🧪 测试策略

### 🔬 单元测试
```typescript
// src/__tests__/lib/credits.test.ts
import { calculateCredits } from '@/lib/credits';

describe('Credits Calculation', () => {
  test('should calculate credits correctly for different quality levels', () => {
    expect(calculateCredits(10, 'low')).toBe(10);
    expect(calculateCredits(10, 'medium')).toBe(20);
    expect(calculateCredits(10, 'high')).toBe(30);
    expect(calculateCredits(10, 'ultra')).toBe(50);
  });

  test('should handle edge cases', () => {
    expect(calculateCredits(0.5, 'medium')).toBe(1); // 向上取整
    expect(calculateCredits(0, 'high')).toBe(0);
  });
});
```

### 🎭 E2E 测试
```typescript
// src/__tests__/e2e/lipsync-flow.test.ts
import { test, expect } from '@playwright/test';

test('complete lip sync workflow', async ({ page }) => {
  // 登录
  await page.goto('/auth/signin');
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'password');
  await page.click('[data-testid=signin-button]');

  // 创建项目
  await page.goto('/create');
  await page.setInputFiles('[data-testid=video-upload]', 'test-video.mp4');
  await page.setInputFiles('[data-testid=audio-upload]', 'test-audio.mp3');
  await page.click('[data-testid=create-project]');

  // 验证项目创建
  await expect(page.locator('[data-testid=project-status]')).toContainText('Processing');
});
```

## 📊 监控和日志

### 📈 应用监控
```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

export function initMonitoring() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      // 过滤敏感信息
      if (event.user) {
        delete event.user.email;
      }
      return event;
    }
  });
}

export function trackUserAction(action: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    // 发送到分析平台
    gtag('event', action, properties);
  }
}
```

### 📝 结构化日志
```typescript
// src/lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

## 🔐 安全最佳实践

### 🛡️ API 安全
```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  // API 频率限制
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const identifier = request.ip || 'anonymous';
    const { success } = await rateLimit.limit(identifier);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
  }

  // 安全头设置
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}
```

### 🔒 数据验证
```typescript
// src/lib/validation.ts
import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  videoFile: z.object({
    size: z.number().max(100 * 1024 * 1024), // 100MB 限制
    type: z.string().regex(/^video\/(mp4|avi|mov|wmv)$/)
  }),
  audioFile: z.object({
    size: z.number().max(50 * 1024 * 1024), // 50MB 限制
    type: z.string().regex(/^audio\/(mp3|wav|aac|m4a)$/)
  }),
  quality: z.enum(['low', 'medium', 'high', 'ultra']).default('medium')
});
```

## 📚 API 文档生成

### 📖 OpenAPI 规范
```yaml
# docs/api-spec.yaml
openapi: 3.0.0
info:
  title: LipSyncVideo.net API
  version: 1.0.0
  description: AI-powered lip sync video generation API

paths:
  /api/lipsync/create:
    post:
      summary: Create a new lip sync task
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                video:
                  type: string
                  format: binary
                audio:
                  type: string
                  format: binary
                options:
                  type: object
                  properties:
                    quality:
                      type: string
                      enum: [low, medium, high, ultra]
      responses:
        '200':
          description: Task created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  projectId:
                    type: string
                  taskId:
                    type: number
                  status:
                    type: string
```

## 🚀 CI/CD 流水线

### 🔄 GitHub Actions 配置
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test
      - run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📋 项目管理

### 🎯 开发工作流
1. **功能开发**: 基于 feature branch 开发
2. **代码审查**: 必须通过 PR review
3. **自动化测试**: CI/CD 流水线验证
4. **部署发布**: 自动部署到生产环境

### 📊 质量门禁
- 代码覆盖率 > 80%
- 性能测试通过
- 安全扫描无高危漏洞
- UI/UX 设计评审通过

---

*本文档将随着项目进展持续更新，确保开发团队始终有最新的技术指导。*
