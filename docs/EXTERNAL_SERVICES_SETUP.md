# 🔑 外部服务和 API 密钥配置指南

## 📋 **第四阶段：API 密钥和外部服务配置**

### **步骤1: AI 服务配置**

#### 1.1 HeyGen API 配置
```bash
# 访问 HeyGen 官网
# https://www.heygen.com/

# 1. 注册 HeyGen 账户
# 2. 进入 Dashboard → API Keys
# 3. 创建新的 API Key
# 4. 复制 API Key 和 Base URL
```

#### 1.2 APICore.ai 配置（备用服务）
```bash
# 访问 APICore.ai 官网
# https://apicore.ai/

# 1. 注册账户
# 2. 获取 API 密钥
# 3. 查看 API 文档和限制
```

#### 1.3 D-ID API 配置（备用服务）
```bash
# 访问 D-ID 官网
# https://www.d-id.com/

# 1. 注册开发者账户
# 2. 获取 API 密钥
# 3. 查看定价和配额
```

### **步骤2: 支付系统配置（Stripe）**

#### 2.1 创建 Stripe 账户
```bash
# 访问 Stripe Dashboard
# https://dashboard.stripe.com/

# 1. 注册 Stripe 账户
# 2. 完成账户验证
# 3. 设置业务信息
```

#### 2.2 获取 Stripe API 密钥
```bash
# 在 Stripe Dashboard 中：
# 1. 进入 Developers → API keys
# 2. 复制以下密钥：
#    - Publishable key (pk_test_... 或 pk_live_...)
#    - Secret key (sk_test_... 或 sk_live_...)
# 3. 创建 Webhook 端点：
#    - URL: https://your-domain.com/api/webhooks/stripe
#    - Events: checkout.session.completed, invoice.payment_succeeded
```

#### 2.3 配置 Stripe 产品和价格
```bash
# 在 Stripe Dashboard 中：
# 1. 进入 Products
# 2. 创建产品：
#    - Name: LipSync Video Credits
#    - Description: Credits for AI lip sync video generation
# 3. 添加价格层级：
#    - Starter: $9.99 for 100 credits
#    - Standard: $19.99 for 250 credits  
#    - Premium: $39.99 for 600 credits
```

### **步骤3: 文件存储服务配置**

#### 3.1 配置 Vercel Blob 存储
```bash
# Vercel Blob 是推荐的文件存储方案
# 在 Vercel Dashboard 中：
# 1. 进入项目设置
# 2. 选择 Storage 标签
# 3. 创建 Blob Store
# 4. 获取连接令牌
```

#### 3.2 AWS S3 配置（可选）
```bash
# 如果需要使用 AWS S3：
# 1. 创建 AWS 账户
# 2. 创建 S3 存储桶
# 3. 配置 IAM 用户和权限
# 4. 获取访问密钥
```

### **步骤4: 更新环境变量配置**

#### 4.1 更新 .env.local 文件
```bash
# 添加所有外部服务配置到 .env.local
cat >> .env.local << 'EOF'

# ===========================================
# AI Services Configuration
# ===========================================
# HeyGen API (Primary AI Service)
HEYGEN_API_KEY="[你的 HeyGen API Key]"
HEYGEN_BASE_URL="https://api.heygen.com"

# APICore.ai (Backup Service)
APICORE_API_KEY="[你的 APICore API Key]"
APICORE_BASE_URL="https://api.apicore.ai"
APICORE_VERSION="v1"

# D-ID API (Backup Service)
DID_API_KEY="[你的 D-ID API Key]"
DID_BASE_URL="https://api.d-id.com"

# ===========================================
# Payment Configuration (Stripe)
# ===========================================
STRIPE_PUBLIC_KEY="pk_test_[你的测试公钥]"
STRIPE_PRIVATE_KEY="sk_test_[你的测试私钥]"
STRIPE_WEBHOOK_SECRET="whsec_[你的 Webhook 密钥]"

# Payment URLs
NEXT_PUBLIC_PAY_SUCCESS_URL="http://localhost:3000/payment/success"
NEXT_PUBLIC_PAY_FAIL_URL="http://localhost:3000/payment/failed"
NEXT_PUBLIC_PAY_CANCEL_URL="http://localhost:3000/pricing"

# ===========================================
# File Storage Configuration
# ===========================================
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="[你的 Vercel Blob 令牌]"

# AWS S3 (Optional)
STORAGE_ENDPOINT=""
STORAGE_REGION="us-east-1"
STORAGE_ACCESS_KEY=""
STORAGE_SECRET_KEY=""
STORAGE_BUCKET="lipsyncvideo-files"
STORAGE_DOMAIN=""

# ===========================================
# Analytics and Monitoring
# ===========================================
# Google Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-[你的 GA ID]"

# OpenPanel Analytics
NEXT_PUBLIC_OPENPANEL_CLIENT_ID="[你的 OpenPanel ID]"

# Sentry Error Tracking
SENTRY_DSN="https://[你的 Sentry DSN]"

# ===========================================
# Email Service Configuration
# ===========================================
# Resend Email Service
RESEND_API_KEY="re_[你的 Resend API Key]"
EMAIL_FROM_ADDRESS="noreply@lipsyncvideo.net"
EMAIL_FROM_NAME="LipSyncVideo"

# ===========================================
# Admin Configuration
# ===========================================
ADMIN_EMAILS="admin@lipsyncvideo.net,support@lipsyncvideo.net"
EOF
```

#### 4.2 配置 Vercel 环境变量
```bash
# AI Services
vercel env add HEYGEN_API_KEY development
vercel env add HEYGEN_BASE_URL development
vercel env add APICORE_API_KEY development
vercel env add APICORE_BASE_URL development

# Stripe Payment
vercel env add STRIPE_PUBLIC_KEY development
vercel env add STRIPE_PRIVATE_KEY development
vercel env add STRIPE_WEBHOOK_SECRET development

# File Storage
vercel env add BLOB_READ_WRITE_TOKEN development

# Analytics
vercel env add NEXT_PUBLIC_GOOGLE_ANALYTICS_ID development
vercel env add SENTRY_DSN development

# Email Service
vercel env add RESEND_API_KEY development
vercel env add EMAIL_FROM_ADDRESS development

# Admin
vercel env add ADMIN_EMAILS development

# 复制到预览和生产环境
# 对每个变量重复以下命令：
vercel env add [VARIABLE_NAME] preview
vercel env add [VARIABLE_NAME] production
```

### **步骤5: 创建 API 服务封装**

#### 5.1 创建 HeyGen 服务类
```typescript
// src/services/heygen.service.ts
export class HeyGenService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.HEYGEN_API_KEY!;
    this.baseUrl = process.env.HEYGEN_BASE_URL!;
  }

  async generateLipSync(imageUrl: string, audioUrl: string) {
    const response = await fetch(`${this.baseUrl}/v1/video/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        audio_url: audioUrl,
        quality: 'high',
      }),
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getJobStatus(jobId: string) {
    const response = await fetch(`${this.baseUrl}/v1/video/status/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    return response.json();
  }
}
```

#### 5.2 创建 Stripe 服务类
```typescript
// src/services/stripe.service.ts
import Stripe from 'stripe';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!, {
      apiVersion: '2024-06-20',
    });
  }

  async createCheckoutSession(priceId: string, userId: string) {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_WEB_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_WEB_URL}/pricing`,
      metadata: {
        userId,
      },
    });
  }

  async handleWebhook(body: string, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    return event;
  }
}
```

### **步骤6: 创建 API 测试脚本**

#### 6.1 创建服务测试脚本
```bash
# 创建 API 测试脚本
cat > scripts/test-external-services.js << 'EOF'
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function testHeyGenAPI() {
  try {
    console.log('Testing HeyGen API...');
    
    if (!process.env.HEYGEN_API_KEY) {
      console.log('⚠️  HeyGen API key not configured');
      return;
    }

    const response = await fetch(`${process.env.HEYGEN_BASE_URL}/v1/account`, {
      headers: {
        'Authorization': `Bearer ${process.env.HEYGEN_API_KEY}`,
      },
    });

    if (response.ok) {
      console.log('✅ HeyGen API connection successful');
    } else {
      console.log('❌ HeyGen API connection failed:', response.statusText);
    }
  } catch (error) {
    console.log('❌ HeyGen API test error:', error.message);
  }
}

async function testStripeAPI() {
  try {
    console.log('Testing Stripe API...');
    
    if (!process.env.STRIPE_PRIVATE_KEY) {
      console.log('⚠️  Stripe API key not configured');
      return;
    }

    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);
    
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe API connection successful');
    console.log('Account ID:', account.id);
  } catch (error) {
    console.log('❌ Stripe API test error:', error.message);
  }
}

async function testAllServices() {
  console.log('🧪 Testing External Services...\n');
  
  await testHeyGenAPI();
  await testStripeAPI();
  
  console.log('\n✅ External services test completed');
}

testAllServices();
EOF

# 运行测试
node scripts/test-external-services.js
```

### **步骤7: 配置 Webhook 端点**

#### 7.1 创建 Stripe Webhook 处理器
```typescript
// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/services/stripe.service';
import { headers } from 'next/headers';

const stripeService = new StripeService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature')!;

    const event = await stripeService.handleWebhook(body, signature);

    switch (event.type) {
      case 'checkout.session.completed':
        // 处理支付成功
        const session = event.data.object;
        console.log('Payment successful:', session.id);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}
```

### **步骤8: 部署和验证**

#### 8.1 部署更新
```bash
# 提交所有更改
git add .
git commit -m "feat: Configure external services and API integrations"
git push origin main

# 部署到 Vercel
vercel --prod
```

#### 8.2 验证外部服务集成
```bash
# 测试各项服务：
# 1. 访问应用并测试支付流程
# 2. 验证 AI 服务 API 调用
# 3. 测试文件上传功能
# 4. 检查 Webhook 接收
```

## ✅ **验证清单**

### **AI 服务配置验证**
- [ ] HeyGen API 密钥有效
- [ ] APICore.ai 配置正确
- [ ] D-ID 备用服务配置
- [ ] API 调用测试通过

### **支付系统验证**
- [ ] Stripe 账户设置完成
- [ ] API 密钥配置正确
- [ ] Webhook 端点工作正常
- [ ] 测试支付流程成功

### **文件存储验证**
- [ ] Vercel Blob 存储配置
- [ ] 文件上传功能正常
- [ ] 存储权限设置正确

### **监控和分析验证**
- [ ] Google Analytics 配置
- [ ] 错误追踪设置
- [ ] 性能监控启用

## 🔧 **故障排除**

### **常见问题解决方案**

1. **API 密钥无效**
   ```bash
   # 验证 API 密钥格式
   # 检查密钥是否过期
   # 确认服务账户权限
   ```

2. **Webhook 接收失败**
   ```bash
   # 检查 Webhook URL 配置
   # 验证签名验证逻辑
   # 查看 Vercel 函数日志
   ```

3. **文件上传失败**
   ```bash
   # 检查存储服务配置
   # 验证文件大小限制
   # 确认权限设置
   ```

完成第四阶段后，所有外部服务将正确配置并可以在您的应用中正常使用。
