# 🔧 Vercel 环境变量配置指南

## 📋 **配置概览**

您的应用已经成功部署到 Vercel，现在需要配置环境变量。以下是详细的获取和设置步骤。

---

## 🔑 **需要您自己获取的环境变量**

### **1. 数据库配置 (Supabase) - 必需**

#### 获取步骤：
```bash
# 1. 访问 https://supabase.com
# 2. 创建新项目或使用现有项目
# 3. 项目创建完成后，进入项目 Dashboard
```

#### 需要获取的信息：
```bash
# 在 Supabase Dashboard → Settings → Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# 在 Supabase Dashboard → Settings → API  
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

### **2. Google OAuth 配置 - 必需**

#### 获取步骤：
```bash
# 1. 访问 https://console.cloud.google.com
# 2. 创建新项目或选择现有项目
# 3. 启用 Google+ API
# 4. 配置 OAuth 同意屏幕
# 5. 创建 OAuth 2.0 客户端 ID
```

#### 重定向 URI 配置：
```bash
# 在 Google Cloud Console 中添加以下重定向 URI：
http://localhost:3000/api/auth/callback/google                    # 开发环境
https://your-vercel-app.vercel.app/api/auth/callback/google      # 生产环境
```

#### 需要获取的信息：
```bash
AUTH_GOOGLE_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="GOCSPX-abcdefghijklmnopqrstuvwxyz"
NEXT_PUBLIC_AUTH_GOOGLE_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
```

### **3. AI 服务配置 - 可选但推荐**

#### HeyGen API (推荐的主要 AI 服务)：
```bash
# 1. 访问 https://www.heygen.com
# 2. 注册账户并完成验证
# 3. 进入 Dashboard → API Keys
# 4. 创建新的 API Key

HEYGEN_API_KEY="your-heygen-api-key-here"
HEYGEN_BASE_URL="https://api.heygen.com"
```

#### APICore.ai (备用服务)：
```bash
# 1. 访问 https://apicore.ai
# 2. 注册账户
# 3. 获取 API 密钥

APICORE_API_KEY="your-apicore-api-key-here"
APICORE_BASE_URL="https://api.apicore.ai"
```

### **4. 支付系统配置 - 可选**

#### Stripe 配置：
```bash
# 1. 访问 https://dashboard.stripe.com
# 2. 注册账户并完成验证
# 3. 进入 Developers → API keys

STRIPE_PUBLIC_KEY="pk_test_51..."  # 测试环境
STRIPE_PRIVATE_KEY="sk_test_51..." # 测试环境
STRIPE_WEBHOOK_SECRET="whsec_..."  # 创建 Webhook 后获取
```

---

## 🔄 **可以自动生成的环境变量**

### **1. 认证密钥 - 自动生成**

```bash
# 使用以下命令生成 AUTH_SECRET
openssl rand -base64 32

# 或者使用 Node.js 生成
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 示例结果：
AUTH_SECRET="Zt3BXVudzzRq2R2WBqhwRy1dNMq48Gg9zKAYq7YwSL0="
```

### **2. 基础配置 - 根据您的部署自动设置**

```bash
# 根据您的 Vercel 部署 URL 设置
NEXT_PUBLIC_WEB_URL="https://your-vercel-app.vercel.app"
AUTH_URL="https://your-vercel-app.vercel.app/api/auth"
AUTH_TRUST_HOST="true"
NEXT_PUBLIC_PROJECT_NAME="LipSyncVideo"
```

---

## 🛠️ **Vercel 环境变量设置步骤**

### **方法1: 使用 Vercel CLI (推荐)**

```bash
# 1. 安装并登录 Vercel CLI
npm install -g vercel
vercel login

# 2. 进入项目目录
cd your-project-directory

# 3. 设置必需的环境变量

# 生成并设置 AUTH_SECRET
AUTH_SECRET=$(openssl rand -base64 32)
vercel env add AUTH_SECRET production
# 粘贴生成的密钥

# 设置基础配置
vercel env add NEXT_PUBLIC_WEB_URL production
# 输入: https://your-vercel-app.vercel.app

vercel env add AUTH_URL production  
# 输入: https://your-vercel-app.vercel.app/api/auth

vercel env add AUTH_TRUST_HOST production
# 输入: true

vercel env add NEXT_PUBLIC_PROJECT_NAME production
# 输入: LipSyncVideo

# 设置数据库配置 (需要您先获取)
vercel env add DATABASE_URL production
# 输入您的 Supabase DATABASE_URL

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# 输入您的 Supabase 项目 URL

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# 输入您的 Supabase 匿名密钥

# 设置 Google OAuth (需要您先获取)
vercel env add AUTH_GOOGLE_ID production
# 输入您的 Google Client ID

vercel env add AUTH_GOOGLE_SECRET production
# 输入您的 Google Client Secret

vercel env add NEXT_PUBLIC_AUTH_GOOGLE_ID production
# 输入您的 Google Client ID

vercel env add NEXT_PUBLIC_AUTH_GOOGLE_ENABLED production
# 输入: true

# 设置 AI 服务 (可选)
vercel env add HEYGEN_API_KEY production
# 输入您的 HeyGen API Key (如果有)

# 设置支付服务 (可选)
vercel env add STRIPE_PUBLIC_KEY production
# 输入您的 Stripe 公钥 (如果需要支付功能)

vercel env add STRIPE_PRIVATE_KEY production
# 输入您的 Stripe 私钥 (如果需要支付功能)
```

### **方法2: 使用 Vercel Dashboard**

```bash
# 1. 访问 https://vercel.com/dashboard
# 2. 选择您的项目
# 3. 进入 Settings → Environment Variables
# 4. 点击 "Add New" 添加每个环境变量
# 5. 选择环境: Production (生产环境)
```

---

## ✅ **最小必需配置清单**

### **必须配置的环境变量 (应用才能正常运行):**

```bash
# 基础配置
✅ NEXT_PUBLIC_WEB_URL
✅ AUTH_SECRET  
✅ AUTH_URL
✅ AUTH_TRUST_HOST

# 数据库配置
✅ DATABASE_URL
✅ NEXT_PUBLIC_SUPABASE_URL  
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY

# 认证配置
✅ AUTH_GOOGLE_ID
✅ AUTH_GOOGLE_SECRET
✅ NEXT_PUBLIC_AUTH_GOOGLE_ID
✅ NEXT_PUBLIC_AUTH_GOOGLE_ENABLED
```

### **可选配置 (增强功能):**

```bash
# AI 服务
⚪ HEYGEN_API_KEY
⚪ APICORE_API_KEY

# 支付系统  
⚪ STRIPE_PUBLIC_KEY
⚪ STRIPE_PRIVATE_KEY

# 分析监控
⚪ NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
⚪ SENTRY_DSN
```

---

## 🧪 **配置验证**

### **验证环境变量设置**

```bash
# 查看已设置的环境变量
vercel env ls

# 重新部署以应用新的环境变量
vercel --prod

# 检查部署日志
vercel logs
```

### **测试应用功能**

```bash
# 1. 访问您的 Vercel 应用 URL
# 2. 测试页面是否正常加载
# 3. 测试 Google 登录功能
# 4. 检查浏览器控制台是否有错误
```

---

## 🔧 **故障排除**

### **常见问题**

1. **AUTH_SECRET 未设置导致认证失败**
   ```bash
   # 生成新的密钥
   openssl rand -base64 32
   
   # 添加到 Vercel
   vercel env add AUTH_SECRET production
   ```

2. **Google OAuth 重定向错误**
   ```bash
   # 检查 Google Cloud Console 中的重定向 URI
   # 确保包含: https://your-vercel-app.vercel.app/api/auth/callback/google
   ```

3. **数据库连接失败**
   ```bash
   # 验证 DATABASE_URL 格式正确
   # 检查 Supabase 项目状态
   ```

---

## 📝 **快速配置脚本**

创建一个本地脚本来快速生成必需的环境变量：

```bash
# 创建 generate-env.sh
cat > generate-env.sh << 'EOF'
#!/bin/bash
echo "🔑 生成 LipSyncVideo 环境变量"
echo "================================"

# 生成 AUTH_SECRET
AUTH_SECRET=$(openssl rand -base64 32)
echo "AUTH_SECRET=\"$AUTH_SECRET\""

# 提示用户输入其他必需信息
echo ""
echo "请手动获取以下信息："
echo "1. Supabase DATABASE_URL"
echo "2. Google OAuth Client ID 和 Secret"
echo "3. (可选) HeyGen API Key"
echo "4. (可选) Stripe API Keys"
EOF

chmod +x generate-env.sh
./generate-env.sh
```

现在您知道了哪些环境变量需要自己获取，哪些可以自动生成。按照这个指南逐步配置即可！
