# 🚀 LipSyncVideo.net 完整设置指南

## 📋 **设置步骤概览**

### **第一步: 环境变量配置**
```bash
# 1. 运行环境变量配置助手
node scripts/setup-env.js

# 2. 手动编辑 .env.local (如需要)
cp .env.example .env.local
nano .env.local
```

### **第二步: 数据库初始化**
```bash
# 初始化数据库表和数据
node scripts/init-database.js
```

### **第三步: API 服务验证**
```bash
# 验证所有 API 密钥和服务连接
node scripts/verify-apis.js
```

### **第四步: 启动开发服务器**
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 🔑 **必需的 API 密钥获取指南**

### **1. Supabase 数据库配置**

#### 获取 DATABASE_URL:
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目或选择现有项目
3. 进入 Settings → Database
4. 复制 Connection string (URI)
5. 格式: `postgresql://postgres:[password]@[host]:5432/postgres`

#### 配置示例:
```bash
DATABASE_URL="postgresql://postgres:your_password@db.your_project.supabase.co:5432/postgres"
```

### **2. Google OAuth 配置**

#### 获取 Google OAuth 密钥:
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 客户端 ID
5. 设置授权重定向 URI: `http://localhost:3000/api/auth/callback/google`

#### 配置示例:
```bash
AUTH_GOOGLE_ID="123456789-abcdefg.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="GOCSPX-your_google_client_secret"
NEXT_PUBLIC_AUTH_GOOGLE_ID="123456789-abcdefg.apps.googleusercontent.com"
```

### **3. APICore.ai 配置 (可选)**

#### 获取 APICore.ai API 密钥:
1. 访问 [APICore.ai](https://apicore.ai)
2. 注册账户并登录
3. 进入 Dashboard → API Keys
4. 创建新的 API 密钥
5. 复制密钥用于配置

#### 配置示例:
```bash
APICORE_API_KEY="your_apicore_api_key_here"
APICORE_BASE_URL="https://api.apicore.ai"
```

### **4. HeyGen API 配置 (可选)**

#### 获取 HeyGen API 密钥:
1. 访问 [HeyGen](https://heygen.com)
2. 注册企业账户
3. 进入 API 设置页面
4. 生成 API 密钥
5. 复制密钥用于配置

#### 配置示例:
```bash
HEYGEN_API_KEY="your_heygen_api_key_here"
HEYGEN_BASE_URL="https://api.heygen.com"
```

### **5. Stripe 支付配置 (可选)**

#### 获取 Stripe 密钥:
1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 注册账户并完成验证
3. 进入 Developers → API keys
4. 复制 Publishable key 和 Secret key
5. 配置 Webhook 端点: `http://localhost:3000/api/stripe/webhook`

#### 配置示例:
```bash
STRIPE_PUBLIC_KEY="pk_test_your_stripe_public_key"
STRIPE_PRIVATE_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

## 🗄️ **数据库表结构说明**

### **核心表结构**
```sql
-- 用户表 (已扩展 LipSync 字段)
users:
  - subscription_tier: 订阅层级 (free, starter, standard, premium)
  - total_videos_created: 已创建视频总数
  - last_video_created_at: 最后创建视频时间

-- LipSync 项目表
projects:
  - uuid: 项目唯一标识
  - user_uuid: 用户标识
  - name: 项目名称
  - status: 状态 (pending, processing, completed, failed)
  - video_url: 原始视频/图片 URL
  - audio_url: 音频文件 URL
  - result_url: 生成结果 URL
  - provider: AI 服务提供商 (heygen, did, apicore)
  - quality: 输出质量 (low, medium, high, ultra)
  - credits_consumed: 消耗积分数

-- LipSync 任务表
lipsync_tasks:
  - project_uuid: 关联项目
  - status: 任务状态 (queued, processing, completed, failed)
  - progress: 处理进度 (0-100)
  - error_message: 错误信息
```

## 🧪 **功能测试清单**

### **基础功能测试**
- [ ] 用户注册和登录
- [ ] Google OAuth 登录
- [ ] 用户积分显示
- [ ] 多语言切换 (中英文)

### **LipSync 功能测试**
- [ ] 图片文件上传
- [ ] 音频文件上传
- [ ] 文件格式验证
- [ ] 文件大小限制
- [ ] LipSync 视频生成
- [ ] 生成进度显示
- [ ] 结果视频下载

### **支付功能测试**
- [ ] 积分套餐显示
- [ ] Stripe 支付流程
- [ ] 支付成功后积分增加
- [ ] 订单记录保存

## 🔧 **常见问题解决**

### **数据库连接问题**
```bash
# 错误: connection refused
# 解决: 检查 Supabase 项目状态和网络连接

# 错误: authentication failed
# 解决: 检查数据库密码是否正确

# 错误: database does not exist
# 解决: 确保 Supabase 项目已创建并激活
```

### **Google OAuth 问题**
```bash
# 错误: redirect_uri_mismatch
# 解决: 在 Google Console 中添加正确的重定向 URI

# 错误: invalid_client
# 解决: 检查 CLIENT_ID 和 CLIENT_SECRET 是否正确
```

### **API 服务问题**
```bash
# 错误: API key invalid
# 解决: 检查 API 密钥是否正确且有效

# 错误: quota exceeded
# 解决: 检查 API 服务的配额使用情况

# 错误: network timeout
# 解决: 检查网络连接和防火墙设置
```

## 📊 **开发环境验证**

### **验证步骤**
1. **环境变量检查**
   ```bash
   node scripts/verify-apis.js
   ```

2. **数据库连接测试**
   ```bash
   node scripts/init-database.js
   ```

3. **应用启动测试**
   ```bash
   npm run dev
   ```

4. **功能测试**
   - 访问 http://localhost:3000
   - 测试用户注册/登录
   - 测试文件上传功能
   - 测试 LipSync 生成功能

### **成功标志**
- ✅ 所有 API 验证通过
- ✅ 数据库表创建成功
- ✅ 应用正常启动 (端口 3000)
- ✅ 用户可以正常登录
- ✅ 文件上传功能正常
- ✅ LipSync 生成功能可用

## 🚀 **生产环境部署准备**

### **环境变量更新**
```bash
# 生产环境 URL
NEXT_PUBLIC_WEB_URL="https://lipsyncvideo.net"
AUTH_URL="https://lipsyncvideo.net/api/auth"

# 生产环境 API 密钥
STRIPE_PUBLIC_KEY="pk_live_..."
STRIPE_PRIVATE_KEY="sk_live_..."

# 安全设置
ENABLE_VIRUS_SCAN="true"
ENABLE_CONTENT_MODERATION="true"
```

### **部署检查清单**
- [ ] 所有生产环境变量已配置
- [ ] 数据库已迁移到生产环境
- [ ] API 密钥已更新为生产密钥
- [ ] SSL 证书已配置
- [ ] 域名 DNS 已正确设置
- [ ] 监控和日志已启用

完成以上所有步骤后，您的 LipSyncVideo.net 应用就可以正常运行了！ 🎉
