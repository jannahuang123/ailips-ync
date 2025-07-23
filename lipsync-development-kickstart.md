# LipSyncVideo.net 开发启动指南

## 🚀 **从这里开始 - 推荐开发路径**

基于 ShipAny Template One 的成熟架构，我们可以在 **2-3 周内完成 MVP**。以下是最优的开发启动路径：

## 📋 **第一步：项目初始化 (Day 1)**

### 🔧 **环境搭建**
```bash
# 1. 克隆 ShipAny 模板
git clone https://github.com/shipanyai/shipany-template-one.git lipsyncvideo
cd lipsyncvideo

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env.development
```

### ⚙️ **核心配置文件修改**
```bash
# .env.development - 基于 ShipAny 扩展
NEXT_PUBLIC_PROJECT_NAME=LipSyncVideo
NEXT_PUBLIC_WEB_URL=http://localhost:3000

# AI 服务配置 (新增)
HEYGEN_API_KEY=your_heygen_api_key
DID_API_KEY=your_did_api_key

# Redis 配置 (新增 - 任务队列)
REDIS_HOST=localhost
REDIS_PORT=6379

# 现有配置保持不变
DATABASE_URL=your_database_url
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_PRIVATE_KEY=your_stripe_private_key
```

### 🎨 **品牌主题定制**
```css
/* src/app/theme.css - 更新为 LipSync 品牌色 */
@layer base {
  :root {
    --primary: 264 80% 57%; /* 蓝紫色主题 */
    --primary-foreground: 0 0% 98%;
    --secondary: 120 30% 65%; /* 绿色辅助色 */
    --accent: 280 65% 60%; /* 紫色强调色 */
  }
}
```

## 📋 **第二步：数据库扩展 (Day 1-2)**

### 🗄️ **创建数据库迁移**
```typescript
// src/db/migrations/001_add_lipsync_tables.sql
-- 基于现有 ShipAny schema 扩展

-- 项目表
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) UNIQUE NOT NULL,
  user_uuid VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  video_url VARCHAR(500),
  audio_url VARCHAR(500),
  result_url VARCHAR(500),
  external_task_id VARCHAR(255),
  provider VARCHAR(50) DEFAULT 'heygen',
  quality VARCHAR(20) DEFAULT 'medium',
  credits_consumed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (user_uuid) REFERENCES users(uuid)
);

-- 任务处理记录表
CREATE TABLE lipsync_tasks (
  id SERIAL PRIMARY KEY,
  project_uuid VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'queued',
  progress INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (project_uuid) REFERENCES projects(uuid)
);

-- 扩展用户表
ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN total_videos_created INTEGER DEFAULT 0;
```

### 📊 **更新 Drizzle Schema**
```typescript
// src/db/schema.ts - 在现有 schema 基础上添加
import { pgTable, varchar, integer, timestamp, text, boolean } from 'drizzle-orm/pg-core';

// 项目表
export const projects = pgTable('projects', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  userUuid: varchar('user_uuid', { length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 50 }).default('pending'),
  videoUrl: varchar('video_url', { length: 500 }),
  audioUrl: varchar('audio_url', { length: 500 }),
  resultUrl: varchar('result_url', { length: 500 }),
  externalTaskId: varchar('external_task_id', { length: 255 }),
  provider: varchar({ length: 50 }).default('heygen'),
  quality: varchar({ length: 20 }).default('medium'),
  creditsConsumed: integer('credits_consumed').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 任务表
export const lipsyncTasks = pgTable('lipsync_tasks', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  projectUuid: varchar('project_uuid', { length: 255 }).notNull(),
  status: varchar({ length: 50 }).default('queued'),
  progress: integer().default(0),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

## 📋 **第三步：AI 服务集成 (Day 2-4)**

### 🤖 **HeyGen 客户端开发**
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

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getTaskStatus(taskId: string) {
    const response = await fetch(`${this.baseUrl}/video/translate/${taskId}`, {
      headers: { 'X-API-Key': this.apiKey }
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.statusText}`);
    }

    return response.json();
  }
}
```

### 🔄 **AI 服务管理器**
```typescript
// src/lib/ai/provider-manager.ts
import { HeyGenClient } from './heygen-client';
import { DIDClient } from './did-client';

export class AIProviderManager {
  private heygenClient: HeyGenClient;
  private didClient: DIDClient;

  constructor() {
    this.heygenClient = new HeyGenClient(process.env.HEYGEN_API_KEY!);
    this.didClient = new DIDClient(process.env.DID_API_KEY!);
  }

  async processLipSync(params: {
    videoUrl: string;
    audioUrl: string;
    quality: string;
  }) {
    // 优先使用 HeyGen，失败时切换到 D-ID
    try {
      return await this.heygenClient.createLipSyncTask(params);
    } catch (error) {
      console.warn('HeyGen failed, switching to D-ID:', error);
      return await this.didClient.createLipSyncTask(params);
    }
  }
}
```

## 📋 **第四步：核心 API 开发 (Day 3-5)**

### 🔌 **项目创建 API**
```typescript
// src/app/api/lipsync/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import { db } from '@/db';
import { projects, lipsyncTasks } from '@/db/schema';
import { AIProviderManager } from '@/lib/ai/provider-manager';
import { generateUuid } from '@/lib/hash';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoUrl, audioUrl, quality = 'medium', name } = await request.json();

    if (!videoUrl || !audioUrl) {
      return NextResponse.json({ error: 'Video and audio URLs required' }, { status: 400 });
    }

    // 创建项目记录
    const projectUuid = generateUuid();
    const [project] = await db.insert(projects).values({
      uuid: projectUuid,
      userUuid: session.user.uuid,
      name: name || 'Untitled Project',
      videoUrl,
      audioUrl,
      quality,
      status: 'pending',
    }).returning();

    // 创建任务记录
    const [task] = await db.insert(lipsyncTasks).values({
      projectUuid,
      status: 'queued',
    }).returning();

    // 调用 AI 服务
    const aiManager = new AIProviderManager();
    const aiResult = await aiManager.processLipSync({
      videoUrl,
      audioUrl,
      quality
    });

    // 更新项目状态
    await db.update(projects)
      .set({ 
        externalTaskId: aiResult.task_id,
        status: 'processing',
        updatedAt: new Date()
      })
      .where(eq(projects.uuid, projectUuid));

    return NextResponse.json({
      projectId: projectUuid,
      taskId: task.id,
      status: 'processing',
      estimatedTime: '2-5 minutes'
    });

  } catch (error) {
    console.error('Create lipsync task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 📊 **任务状态查询 API**
```typescript
// src/app/api/lipsync/status/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/db';
import { projects, lipsyncTasks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    
    const project = await db.query.projects.findFirst({
      where: eq(projects.uuid, projectId),
      with: {
        tasks: {
          orderBy: desc(lipsyncTasks.createdAt),
          limit: 1
        }
      }
    });

    if (!project || project.userUuid !== session.user.uuid) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      projectId: project.uuid,
      status: project.status,
      progress: project.tasks[0]?.progress || 0,
      resultUrl: project.resultUrl,
      createdAt: project.createdAt,
      estimatedCompletion: project.tasks[0]?.completedAt
    });

  } catch (error) {
    console.error('Get task status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## 📋 **第五步：前端页面开发 (Day 4-7)**

### 🏠 **主页定制**
```typescript
// src/i18n/pages/landing/hero.ts - 更新 Hero 内容
export const heroContent = {
  en: {
    title: "AI-Powered Lip Sync Video Generator",
    subtitle: "Create perfect lip-synced videos in minutes with our advanced AI technology",
    cta: "Try Free Demo",
    features: [
      "Upload video and audio",
      "AI processes in 2-5 minutes", 
      "Download professional results"
    ]
  },
  zh: {
    title: "AI 智能唇语同步视频生成器",
    subtitle: "使用先进的AI技术，几分钟内创建完美的唇语同步视频",
    cta: "免费试用",
    features: [
      "上传视频和音频",
      "AI 2-5分钟处理",
      "下载专业级结果"
    ]
  }
};
```

### 📁 **项目创建页面**
```typescript
// src/app/[locale]/create/page.tsx
import { CreateProjectForm } from '@/components/create/create-project-form';

export default function CreatePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Lip Sync Video</h1>
        <CreateProjectForm />
      </div>
    </div>
  );
}
```

### 📤 **文件上传组件**
```typescript
// src/components/create/video-uploader.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, Video, Music } from 'lucide-react';

export function VideoUploader({ onUploadComplete }: { onUploadComplete: (urls: { video: string, audio: string }) => void }) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onVideoDrop = useCallback((acceptedFiles: File[]) => {
    setVideoFile(acceptedFiles[0]);
  }, []);

  const onAudioDrop = useCallback((acceptedFiles: File[]) => {
    setAudioFile(acceptedFiles[0]);
  }, []);

  const videoDropzone = useDropzone({
    onDrop: onVideoDrop,
    accept: { 'video/*': ['.mp4', '.avi', '.mov'] },
    maxFiles: 1
  });

  const audioDropzone = useDropzone({
    onDrop: onAudioDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.aac'] },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!videoFile || !audioFile) return;

    setUploading(true);
    setProgress(0);

    try {
      // 上传视频文件
      const videoFormData = new FormData();
      videoFormData.append('file', videoFile);
      
      const videoResponse = await fetch('/api/upload/video', {
        method: 'POST',
        body: videoFormData
      });
      const videoResult = await videoResponse.json();
      setProgress(50);

      // 上传音频文件
      const audioFormData = new FormData();
      audioFormData.append('file', audioFile);
      
      const audioResponse = await fetch('/api/upload/audio', {
        method: 'POST',
        body: audioFormData
      });
      const audioResult = await audioResponse.json();
      setProgress(100);

      onUploadComplete({
        video: videoResult.url,
        audio: audioResult.url
      });

    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Upload */}
      <div {...videoDropzone.getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500">
        <input {...videoDropzone.getInputProps()} />
        <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {videoFile ? (
          <p className="text-green-600">Video: {videoFile.name}</p>
        ) : (
          <p className="text-gray-600">Drop your video file here or click to browse</p>
        )}
      </div>

      {/* Audio Upload */}
      <div {...audioDropzone.getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500">
        <input {...audioDropzone.getInputProps()} />
        <Music className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {audioFile ? (
          <p className="text-green-600">Audio: {audioFile.name}</p>
        ) : (
          <p className="text-gray-600">Drop your audio file here or click to browse</p>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-gray-600 text-center">Uploading files... {progress}%</p>
        </div>
      )}

      {/* Upload Button */}
      <Button 
        onClick={handleUpload} 
        disabled={!videoFile || !audioFile || uploading}
        className="w-full"
      >
        {uploading ? 'Uploading...' : 'Upload and Process'}
      </Button>
    </div>
  );
}
```

## 🎯 **开发成功关键点**

### ✅ **第一周目标**
- [ ] 完成环境搭建和基础配置
- [ ] 实现 HeyGen API 集成
- [ ] 完成文件上传功能
- [ ] 创建基础的项目管理 API

### 🚀 **快速验证方案**
1. **Day 3**: 能够调用 HeyGen API 创建任务
2. **Day 5**: 能够上传文件并创建项目
3. **Day 7**: 能够查询任务状态并显示结果

### 📊 **成功指标**
- 用户可以上传视频和音频文件
- 系统可以调用 AI 服务处理
- 用户可以查看处理状态和下载结果
- 基础的用户认证和支付功能正常

这个开发路径充分利用了 ShipAny 的成熟架构，让您可以专注于 AI 视频处理的核心功能，快速实现 MVP 并验证市场需求。
