# 🔌 APICore.ai 集成配置指南

## 📋 **环境变量配置清单**

### **完整的 .env.example 模板**

```bash
# ================================
# 🌐 基础网站配置
# ================================
NEXT_PUBLIC_WEB_URL=https://lipsyncvideo.net
NEXT_PUBLIC_API_URL=https://lipsyncvideo.net/api
NEXT_PUBLIC_DOMAIN=lipsyncvideo.net
NEXT_PUBLIC_APP_NAME=LipSyncVideo

# ================================
# 🔑 APICore.ai 配置
# ================================
# APICore.ai 主要配置
APICORE_API_KEY=your_apicore_api_key_here
APICORE_BASE_URL=https://api.apicore.ai
APICORE_VERSION=v1

# APICore.ai 服务端点
APICORE_LIPSYNC_ENDPOINT=/lipsync/generate
APICORE_UPLOAD_ENDPOINT=/files/upload
APICORE_STATUS_ENDPOINT=/jobs/status
APICORE_DOWNLOAD_ENDPOINT=/files/download

# APICore.ai 认证配置
APICORE_CLIENT_ID=your_client_id_here
APICORE_CLIENT_SECRET=your_client_secret_here
APICORE_WEBHOOK_SECRET=your_webhook_secret_here

# ================================
# 📁 文件处理配置
# ================================
# 文件上传限制
MAX_IMAGE_SIZE=10485760          # 10MB in bytes
MAX_AUDIO_SIZE=52428800          # 50MB in bytes
MAX_VIDEO_SIZE=104857600         # 100MB in bytes

# 支持的文件格式
SUPPORTED_IMAGE_FORMATS=jpg,jpeg,png,webp,heic
SUPPORTED_AUDIO_FORMATS=mp3,wav,m4a,ogg
SUPPORTED_VIDEO_FORMATS=mp4,mov,webm

# 文件存储配置
UPLOAD_STORAGE_PROVIDER=vercel    # vercel, aws, cloudinary
TEMP_FILE_RETENTION_HOURS=24
MAX_CONCURRENT_UPLOADS=3

# ================================
# 🔒 安全配置
# ================================
# API 安全
API_RATE_LIMIT_PER_MINUTE=60
API_RATE_LIMIT_PER_HOUR=1000
CORS_ALLOWED_ORIGINS=https://lipsyncvideo.net,http://localhost:3000

# 文件安全
ENABLE_VIRUS_SCAN=true
ENABLE_CONTENT_MODERATION=true
ALLOWED_MIME_TYPES=image/jpeg,image/png,audio/mpeg,audio/wav

# ================================
# 💳 积分和计费配置
# ================================
# 积分消耗规则
CREDITS_PER_LIPSYNC_GENERATION=10
CREDITS_PER_HD_EXPORT=5
CREDITS_PER_4K_EXPORT=15
FREE_TIER_MONTHLY_CREDITS=100

# 计费配置
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ================================
# 📊 监控和日志配置
# ================================
# 性能监控
ENABLE_ANALYTICS=true
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SENTRY_DSN=https://your-sentry-dsn

# 日志配置
LOG_LEVEL=info                   # debug, info, warn, error
ENABLE_API_LOGGING=true
LOG_RETENTION_DAYS=30

# ================================
# 🗄️ 数据库配置
# ================================
# 主数据库 (保持现有ShipAny配置)
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://user:password@host:port

# 数据库连接池
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_TIMEOUT_SECONDS=30

# ================================
# 📧 邮件服务配置
# ================================
# 邮件服务提供商
EMAIL_PROVIDER=resend            # resend, sendgrid, ses
EMAIL_API_KEY=your_email_api_key
EMAIL_FROM_ADDRESS=noreply@lipsyncvideo.net
EMAIL_FROM_NAME=LipSyncVideo

# ================================
# 🔄 队列和任务处理
# ================================
# 后台任务队列
QUEUE_PROVIDER=redis             # redis, sqs, memory
QUEUE_CONCURRENCY=5
MAX_JOB_ATTEMPTS=3
JOB_TIMEOUT_MINUTES=30

# ================================
# 🌍 CDN和存储配置
# ================================
# CDN配置
CDN_PROVIDER=cloudflare          # cloudflare, aws, vercel
CDN_BASE_URL=https://cdn.lipsyncvideo.net
ENABLE_CDN_CACHE=true

# 对象存储
STORAGE_PROVIDER=vercel          # vercel, aws-s3, gcs
STORAGE_BUCKET=lipsyncvideo-files
STORAGE_REGION=us-east-1

# ================================
# 🧪 开发和测试配置
# ================================
# 开发模式
NODE_ENV=production              # development, production, test
ENABLE_DEBUG_MODE=false
MOCK_API_RESPONSES=false

# 测试配置
TEST_API_KEY=test_key_for_development
ENABLE_TEST_WEBHOOKS=false
```

## 🔧 **API服务集成实现**

### **APICore.ai 服务类设计**

```typescript
// services/apicore.service.ts
interface APIcoreConfig {
  apiKey: string;
  baseUrl: string;
  version: string;
  timeout: number;
}

interface LipSyncRequest {
  imageFile: File;
  audioFile: File;
  options: {
    quality: 'standard' | 'hd' | '4k';
    format: 'mp4' | 'mov' | 'webm';
    frameRate: 24 | 30 | 60;
  };
}

interface LipSyncResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTime: number;
  resultUrl?: string;
  error?: string;
}

class APIcoreService {
  private config: APIcoreConfig;
  
  constructor(config: APIcoreConfig) {
    this.config = config;
  }

  async generateLipSync(request: LipSyncRequest): Promise<LipSyncResponse> {
    // 实现唇语同步生成
  }

  async getJobStatus(jobId: string): Promise<LipSyncResponse> {
    // 实现任务状态查询
  }

  async uploadFile(file: File, type: 'image' | 'audio'): Promise<string> {
    // 实现文件上传
  }
}
```

## 🔐 **环境变量安全管理**

### **开发环境配置**
```bash
# .env.development
APICORE_API_KEY=dev_test_key_safe_to_commit
APICORE_BASE_URL=https://api-dev.apicore.ai
ENABLE_DEBUG_MODE=true
MOCK_API_RESPONSES=true
```

### **生产环境配置**
```bash
# 在Vercel Dashboard中配置
# Settings → Environment Variables → Production

# 关键安全变量 (绝不提交到代码库)
APICORE_API_KEY=prod_live_key_keep_secret
APICORE_CLIENT_SECRET=prod_client_secret
STRIPE_SECRET_KEY=sk_live_production_key
DATABASE_URL=postgresql://prod_connection_string
```

### **环境变量验证**
```typescript
// lib/env.validation.ts
import { z } from 'zod';

const envSchema = z.object({
  APICORE_API_KEY: z.string().min(1, 'APICore API key is required'),
  APICORE_BASE_URL: z.string().url('Invalid APICore base URL'),
  MAX_IMAGE_SIZE: z.string().transform(Number),
  SUPPORTED_IMAGE_FORMATS: z.string().transform(s => s.split(',')),
});

export const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    process.exit(1);
  }
};
```

## 📡 **API集成代码实现建议**

### **1. API客户端封装**
```typescript
// lib/apicore.client.ts
import axios, { AxiosInstance } from 'axios';

export class APIcoreClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.APICORE_BASE_URL,
      headers: {
        'Authorization': `Bearer ${process.env.APICORE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }
}
```

### **2. 文件上传处理**
```typescript
// hooks/useFileUpload.ts
export const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, type: 'image' | 'audio') => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      return await response.json();
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, uploadProgress, isUploading };
};
```

### **3. 唇语同步生成Hook**
```typescript
// hooks/useLipSyncGeneration.ts
export const useLipSyncGeneration = () => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const generateLipSync = async (imageUrl: string, audioUrl: string) => {
    try {
      const response = await fetch('/api/lipsync/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, audioUrl }),
      });

      const data = await response.json();
      setJobId(data.jobId);
      setStatus('processing');
      
      // 开始轮询状态
      pollJobStatus(data.jobId);
    } catch (error) {
      console.error('Generation failed:', error);
      setStatus('failed');
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/lipsync/status/${jobId}`);
        const data = await response.json();
        
        setProgress(data.progress);
        setStatus(data.status);

        if (data.status === 'completed') {
          setResultUrl(data.resultUrl);
          clearInterval(interval);
        } else if (data.status === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Status polling failed:', error);
        clearInterval(interval);
      }
    }, 2000);
  };

  return {
    generateLipSync,
    jobId,
    status,
    progress,
    resultUrl,
  };
};
```

## 🚀 **部署和监控**

### **部署检查清单**
- [ ] 所有环境变量已在Vercel中配置
- [ ] APICore.ai API密钥有效且有足够配额
- [ ] 文件上传限制已正确设置
- [ ] 错误监控已启用 (Sentry)
- [ ] 性能监控已配置 (Google Analytics)
- [ ] API速率限制已设置
- [ ] 安全头已配置
- [ ] CORS策略已正确设置

### **监控指标**
```typescript
// 关键监控指标
interface MonitoringMetrics {
  apiResponseTime: number;
  uploadSuccessRate: number;
  generationSuccessRate: number;
  errorRate: number;
  activeUsers: number;
  creditsConsumed: number;
}
```
