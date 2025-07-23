# 🔧 LipSyncVideo.net 开发环境配置指导

## 🚀 **环境配置总览**

### 📋 **配置清单**
```bash
# 必需服务
✅ Node.js 20+ 和 pnpm
✅ PostgreSQL 数据库 (Supabase推荐)
✅ Redis 服务器 (任务队列)
✅ AWS S3 存储 (文件存储)

# AI服务账号
✅ HeyGen API 账号
✅ D-ID API 账号 (备选)

# 第三方服务
✅ Stripe 支付账号
✅ Google OAuth 应用
✅ GitHub OAuth 应用 (可选)
```

## 📝 **详细配置步骤**

### 1️⃣ **基础环境准备**

#### **Node.js 和包管理器**
```bash
# 安装 Node.js 20+
curl -fsSL https://fnm.vercel.app/install | bash
fnm install 20
fnm use 20

# 安装 pnpm
npm install -g pnpm

# 验证安装
node --version  # 应该显示 v20.x.x
pnpm --version  # 应该显示最新版本
```

#### **项目克隆和依赖安装**
```bash
# 克隆项目
git clone https://github.com/shipanyai/shipany-template-one.git lipsyncvideo
cd lipsyncvideo

# 安装依赖
pnpm install

# 复制环境变量模板
cp .env.example .env.development
```

### 2️⃣ **数据库配置 (Supabase)**

#### **创建 Supabase 项目**
1. 访问 [Supabase](https://supabase.com/)
2. 创建新项目
3. 等待项目初始化完成
4. 获取数据库连接信息

#### **配置数据库连接**
```bash
# .env.development
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

#### **初始化数据库**
```bash
# 推送数据库结构
pnpm db:push

# 验证数据库连接
pnpm db:studio
```

### 3️⃣ **Redis 配置**

#### **本地 Redis 安装**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server

# 验证 Redis 运行
redis-cli ping  # 应该返回 PONG
```

#### **云端 Redis (推荐生产环境)**
```bash
# 推荐使用 Upstash Redis
# 1. 访问 https://upstash.com/
# 2. 创建 Redis 数据库
# 3. 获取连接信息

# .env.development
REDIS_HOST="your-redis-host"
REDIS_PORT="6379"
REDIS_PASSWORD="your-redis-password"  # 如果需要
```

### 4️⃣ **AWS S3 存储配置**

#### **创建 S3 存储桶**
```bash
# 1. 登录 AWS 控制台
# 2. 创建 S3 存储桶
# 3. 配置 CORS 策略
# 4. 创建 IAM 用户和访问密钥
```

#### **S3 CORS 配置**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

#### **环境变量配置**
```bash
# .env.development
STORAGE_ENDPOINT="https://s3.amazonaws.com"
STORAGE_REGION="us-east-1"
STORAGE_ACCESS_KEY="your-access-key"
STORAGE_SECRET_KEY="your-secret-key"
STORAGE_BUCKET="lipsyncvideo-storage"
STORAGE_DOMAIN="https://your-bucket.s3.amazonaws.com"
```

### 5️⃣ **AI 服务账号申请**

#### **HeyGen API 配置**
```bash
# 1. 访问 https://app.heygen.com/
# 2. 注册账号并完成验证
# 3. 进入 API 设置页面
# 4. 创建 API 密钥

# .env.development
HEYGEN_API_KEY="your-heygen-api-key"
```

#### **D-ID API 配置 (备选)**
```bash
# 1. 访问 https://www.d-id.com/
# 2. 注册开发者账号
# 3. 获取 API 密钥

# .env.development
DID_API_KEY="your-did-api-key"
```

### 6️⃣ **Stripe 支付配置**

#### **创建 Stripe 账号**
```bash
# 1. 访问 https://stripe.com/
# 2. 注册账号
# 3. 获取测试密钥

# .env.development
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_PRIVATE_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."  # 稍后配置
```

#### **配置 Webhook**
```bash
# 1. 在 Stripe 控制台创建 Webhook
# 2. 设置端点 URL: http://localhost:3000/api/stripe/webhook
# 3. 选择事件类型:
#    - checkout.session.completed
#    - invoice.payment_succeeded
#    - customer.subscription.deleted
```

### 7️⃣ **OAuth 认证配置**

#### **Google OAuth**
```bash
# 1. 访问 Google Cloud Console
# 2. 创建新项目或选择现有项目
# 3. 启用 Google+ API
# 4. 创建 OAuth 2.0 客户端 ID

# 授权重定向 URI:
# http://localhost:3000/api/auth/callback/google

# .env.development
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
NEXT_PUBLIC_AUTH_GOOGLE_ID="your-google-client-id"
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED="true"
NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED="true"
```

#### **GitHub OAuth (可选)**
```bash
# 1. 访问 GitHub Settings > Developer settings
# 2. 创建新的 OAuth App
# 3. 设置回调 URL: http://localhost:3000/api/auth/callback/github

# .env.development
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
NEXT_PUBLIC_AUTH_GITHUB_ENABLED="true"
```

## 📄 **完整环境变量配置**

### 🔧 **.env.development 完整配置**
```bash
# -----------------------------------------------------------------------------
# Web Information
# -----------------------------------------------------------------------------
NEXT_PUBLIC_WEB_URL="http://localhost:3000"
NEXT_PUBLIC_PROJECT_NAME="LipSyncVideo"

# -----------------------------------------------------------------------------
# Database with Supabase
# -----------------------------------------------------------------------------
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# -----------------------------------------------------------------------------
# Auth with next-auth
# -----------------------------------------------------------------------------
AUTH_SECRET="Zt3BXVudzzRq2R2WBqhwRy1dNMq48Gg9zKAYq7YwSL0="
AUTH_URL="http://localhost:3000/api/auth"
AUTH_TRUST_HOST=true

# Google Auth
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
NEXT_PUBLIC_AUTH_GOOGLE_ID="your-google-client-id"
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED="true"
NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED="true"

# GitHub Auth (可选)
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
NEXT_PUBLIC_AUTH_GITHUB_ENABLED="false"

# -----------------------------------------------------------------------------
# Payment with Stripe
# -----------------------------------------------------------------------------
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_PRIVATE_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

NEXT_PUBLIC_PAY_SUCCESS_URL="http://localhost:3000/dashboard"
NEXT_PUBLIC_PAY_FAIL_URL="http://localhost:3000/pricing"
NEXT_PUBLIC_PAY_CANCEL_URL="http://localhost:3000/pricing"

# -----------------------------------------------------------------------------
# Storage with AWS S3
# -----------------------------------------------------------------------------
STORAGE_ENDPOINT="https://s3.amazonaws.com"
STORAGE_REGION="us-east-1"
STORAGE_ACCESS_KEY="your-access-key"
STORAGE_SECRET_KEY="your-secret-key"
STORAGE_BUCKET="lipsyncvideo-storage"
STORAGE_DOMAIN="https://your-bucket.s3.amazonaws.com"

# -----------------------------------------------------------------------------
# AI Services (新增)
# -----------------------------------------------------------------------------
HEYGEN_API_KEY="your-heygen-api-key"
DID_API_KEY="your-did-api-key"

# -----------------------------------------------------------------------------
# Redis for Task Queue (新增)
# -----------------------------------------------------------------------------
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""  # 本地开发通常不需要密码

# -----------------------------------------------------------------------------
# Other Settings
# -----------------------------------------------------------------------------
NEXT_PUBLIC_LOCALE_DETECTION="false"
ADMIN_EMAILS="your-admin-email@example.com"
NEXT_PUBLIC_DEFAULT_THEME="light"

# Analytics (可选)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=""
NEXT_PUBLIC_OPENPANEL_CLIENT_ID=""
```

## 🧪 **环境验证测试**

### ✅ **验证命令清单**
```bash
# 1. 基础环境验证
node --version
pnpm --version

# 2. 项目启动测试
pnpm dev
# 访问 http://localhost:3000 确认页面正常

# 3. 数据库连接测试
pnpm db:studio
# 确认能够打开数据库管理界面

# 4. Redis 连接测试
redis-cli ping
# 应该返回 PONG

# 5. S3 存储测试
# 在项目中创建测试上传功能

# 6. AI 服务测试
# 创建简单的 API 调用测试
```

### 🔍 **测试脚本**
```typescript
// scripts/test-environment.ts
import { db } from '@/db';
import Redis from 'ioredis';

async function testEnvironment() {
  console.log('🧪 Testing environment configuration...\n');

  // 测试数据库连接
  try {
    await db.query.users.findMany({ limit: 1 });
    console.log('✅ Database connection: OK');
  } catch (error) {
    console.log('❌ Database connection: FAILED');
    console.error(error);
  }

  // 测试 Redis 连接
  try {
    const redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined
    });
    await redis.ping();
    console.log('✅ Redis connection: OK');
    redis.disconnect();
  } catch (error) {
    console.log('❌ Redis connection: FAILED');
    console.error(error);
  }

  // 测试环境变量
  const requiredEnvs = [
    'DATABASE_URL',
    'AUTH_SECRET',
    'STRIPE_PUBLIC_KEY',
    'HEYGEN_API_KEY',
    'STORAGE_BUCKET'
  ];

  let envOK = true;
  for (const env of requiredEnvs) {
    if (!process.env[env]) {
      console.log(`❌ Missing environment variable: ${env}`);
      envOK = false;
    }
  }

  if (envOK) {
    console.log('✅ Environment variables: OK');
  }

  console.log('\n🎉 Environment test completed!');
}

testEnvironment().catch(console.error);
```

### 🏃‍♂️ **运行测试**
```bash
# 运行环境测试脚本
npx tsx scripts/test-environment.ts

# 或者创建 package.json 脚本
pnpm test:env
```

## 🚨 **常见问题解决**

### ❓ **数据库连接失败**
```bash
# 检查 DATABASE_URL 格式
# 确保 Supabase 项目已启动
# 检查网络连接和防火墙设置
```

### ❓ **Redis 连接失败**
```bash
# 确保 Redis 服务正在运行
brew services restart redis  # macOS
sudo systemctl restart redis-server  # Linux

# 检查端口是否被占用
lsof -i :6379
```

### ❓ **S3 上传失败**
```bash
# 检查 AWS 凭证
# 验证 S3 存储桶权限
# 确认 CORS 配置正确
```

### ❓ **AI API 调用失败**
```bash
# 检查 API 密钥是否正确
# 确认账户余额充足
# 验证 API 端点可访问性
```

---

**🎯 配置完成后，您应该能够成功启动项目并看到 ShipAny 的默认首页。接下来就可以开始定制化开发了！**
