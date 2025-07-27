# 🔑 环境变量配置指南

## 📋 **需要您自己设置的环境变量**

由于您已经在 Vercel 部署成功，现在只需要配置正确的环境变量即可。以下是需要您自己获取和设置的变量：

---

## 🔐 **第一步：生成 AUTH_SECRET（必需）**

### **生成方法1：使用 OpenSSL（推荐）**
```bash
# 在终端运行以下命令生成32字节的随机密钥
openssl rand -base64 32

# 示例输出（您的会不同）：
# K8Jx9vR2mN5pQ7wE3tY6uI8oP1aS4dF7gH0jK9lM2nB5vC8xZ
```

### **生成方法2：使用 Node.js**
```bash
# 在项目根目录运行
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 示例输出（您的会不同）：
# mF8kL3nR6qT9wE2yU5iO7pA0sD4gH1jK6lN9xC3vB8zM
```

### **生成方法3：在线生成器**
访问：https://generate-secret.vercel.app/32
点击生成按钮获取32字节的随机密钥

---

## 🗄️ **第二步：Supabase 数据库配置（必需）**

### **获取 Supabase 连接信息**
1. 访问 https://supabase.com
2. 登录并创建新项目（如果还没有）
3. 项目创建完成后，进入项目 Dashboard

### **获取数据库 URL**
```bash
# 在 Supabase Dashboard 中：
# 1. 点击左侧菜单 "Settings" → "Database"
# 2. 找到 "Connection string" 部分
# 3. 选择 "URI" 格式
# 4. 复制连接字符串，格式如下：
# postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# 注意：[YOUR-PASSWORD] 是您创建项目时设置的数据库密码
# [PROJECT-REF] 是您的项目唯一标识符
```

### **获取 Supabase API 密钥**
```bash
# 在 Supabase Dashboard 中：
# 1. 点击左侧菜单 "Settings" → "API"
# 2. 复制以下信息：
#    - Project URL: https://[PROJECT-REF].supabase.co
#    - anon public key: eyJ... (很长的字符串)
#    - service_role secret key: eyJ... (仅服务端使用，很长的字符串)
```

---

## 🔐 **第三步：Google OAuth 配置（必需）**

### **创建 Google OAuth 应用**
1. 访问 https://console.cloud.google.com
2. 创建新项目或选择现有项目
3. 启用 Google+ API

### **配置 OAuth 同意屏幕**
```bash
# 在 Google Cloud Console 中：
# 1. 进入 "APIs & Services" → "OAuth consent screen"
# 2. 选择 "External" 用户类型
# 3. 填写应用信息：
#    - App name: LipSyncVideo
#    - User support email: [您的邮箱]
#    - Authorized domains: [您的 Vercel 域名，如 your-app.vercel.app]
```

### **创建 OAuth 客户端 ID**
```bash
# 在 Google Cloud Console 中：
# 1. 进入 "APIs & Services" → "Credentials"
# 2. 点击 "Create Credentials" → "OAuth client ID"
# 3. 选择 "Web application"
# 4. 配置重定向 URI：
#    - 开发环境: http://localhost:3000/api/auth/callback/google
#    - 生产环境: https://your-app.vercel.app/api/auth/callback/google
# 5. 创建后会得到：
#    - Client ID: [很长的字符串].apps.googleusercontent.com
#    - Client Secret: [随机字符串]
```

---

## 🔑 **第四步：可选的外部服务（按需设置）**

### **HeyGen API（AI 视频生成）**
```bash
# 如果需要 AI 功能：
# 1. 访问 https://www.heygen.com
# 2. 注册账户并获取 API 密钥
# 3. 在 Dashboard 中找到 API Keys 部分
```

### **Stripe 支付（如需支付功能）**
```bash
# 如果需要支付功能：
# 1. 访问 https://dashboard.stripe.com
# 2. 注册账户
# 3. 在 Developers → API keys 中获取：
#    - Publishable key: pk_test_... 或 pk_live_...
#    - Secret key: sk_test_... 或 sk_live_...
```

---

## ⚙️ **在 Vercel 中设置环境变量**

### **方法1：使用 Vercel Dashboard（推荐）**
```bash
# 1. 登录 https://vercel.com
# 2. 进入您的项目
# 3. 点击 "Settings" → "Environment Variables"
# 4. 添加以下变量：
```

### **必需的环境变量**
```bash
# 基础配置
NEXT_PUBLIC_WEB_URL = https://your-app.vercel.app
NEXT_PUBLIC_PROJECT_NAME = LipSyncVideo

# 认证配置（使用您生成的值）
AUTH_SECRET = [您生成的32字节密钥]
AUTH_URL = https://your-app.vercel.app/api/auth
AUTH_TRUST_HOST = true

# Google OAuth（使用您获取的值）
AUTH_GOOGLE_ID = [您的 Google Client ID]
AUTH_GOOGLE_SECRET = [您的 Google Client Secret]
NEXT_PUBLIC_AUTH_GOOGLE_ID = [您的 Google Client ID]
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED = true

# Supabase 数据库（使用您获取的值）
DATABASE_URL = [您的 Supabase 数据库 URL]
NEXT_PUBLIC_SUPABASE_URL = [您的 Supabase 项目 URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [您的 Supabase 匿名密钥]
```

### **可选的环境变量**
```bash
# AI 服务（如果需要）
HEYGEN_API_KEY = [您的 HeyGen API 密钥]
HEYGEN_BASE_URL = https://api.heygen.com

# 支付服务（如果需要）
STRIPE_PUBLIC_KEY = [您的 Stripe 公钥]
STRIPE_PRIVATE_KEY = [您的 Stripe 私钥]

# 分析服务（如果需要）
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID = [您的 GA ID]
```

### **方法2：使用 Vercel CLI**
```bash
# 如果您已安装 Vercel CLI
vercel env add AUTH_SECRET production
# 然后输入您生成的密钥

vercel env add DATABASE_URL production
# 然后输入您的 Supabase 数据库 URL

# 对每个环境变量重复此过程
```

---

## ✅ **配置验证步骤**

### **1. 检查环境变量是否设置成功**
```bash
# 在 Vercel Dashboard 中：
# Settings → Environment Variables
# 确保所有必需的变量都已添加
```

### **2. 重新部署应用**
```bash
# 设置环境变量后需要重新部署
# 在 Vercel Dashboard 中：
# Deployments → 点击最新部署旁的三个点 → Redeploy
```

### **3. 测试应用功能**
```bash
# 访问您的 Vercel 应用 URL
# 测试以下功能：
# - 页面是否正常加载
# - 登录按钮是否出现
# - Google 登录是否工作
# - 数据库连接是否正常
```

---

## 🚨 **重要注意事项**

### **安全提醒**
- ❌ **绝对不要** 将真实的 API 密钥提交到 Git 仓库
- ✅ **务必使用** Vercel 的环境变量功能
- ✅ **定期轮换** API 密钥和密码
- ✅ **使用不同的密钥** 用于开发和生产环境

### **环境区分**
```bash
# 为不同环境设置不同的值：
# - Development: 用于本地开发
# - Preview: 用于预览部署
# - Production: 用于生产环境
```

---

## 🔧 **故障排除**

### **如果应用无法启动**
1. 检查 Vercel 部署日志
2. 确认所有必需的环境变量都已设置
3. 验证环境变量的值格式正确

### **如果登录不工作**
1. 检查 Google OAuth 重定向 URI 配置
2. 确认 AUTH_SECRET 已正确设置
3. 验证数据库连接正常

### **如果数据库连接失败**
1. 检查 DATABASE_URL 格式
2. 确认 Supabase 项目状态正常
3. 验证数据库密码正确

---

## 📞 **需要帮助？**

如果您在设置过程中遇到问题：

1. **检查 Vercel 部署日志** - 查看具体错误信息
2. **验证环境变量格式** - 确保没有多余的空格或引号
3. **测试单个服务** - 逐一验证每个外部服务的连接

**记住：只有标记为"必需"的环境变量是应用正常运行所必需的。可选的服务可以稍后添加。**
