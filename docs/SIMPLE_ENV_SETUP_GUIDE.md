# 🔧 LipSyncVideo.net 环境变量配置指南（无命令行版本）

既然您已经成功部署到 Vercel，现在只需要在 Vercel Dashboard 中配置环境变量即可。

## 📋 **需要配置的环境变量清单**

### **🔑 必须配置的变量（应用无法运行）**

#### **1. AUTH_SECRET - 认证密钥**
- **作用**: NextAuth.js 用于加密会话的密钥
- **获取方式**: 需要生成一个随机字符串
- **生成方法**: 
  - 访问 https://generate-secret.vercel.app/32
  - 或使用在线工具生成 32 位随机字符串
- **示例值**: `Zt3BXVudzzRq2R2WBqhwRy1dNMq48Gg9zKAYq7YwSL0=`

#### **2. DATABASE_URL - 数据库连接**
- **作用**: 连接 Supabase 数据库
- **获取方式**: 从 Supabase 项目获取
- **获取步骤**:
  1. 登录 https://supabase.com
  2. 选择您的项目
  3. 进入 Settings → Database
  4. 复制 "Connection string" 中的 URI 格式
- **格式**: `postgresql://postgres:[密码]@db.[项目ID].supabase.co:5432/postgres`

#### **3. Google OAuth 配置**
- **AUTH_GOOGLE_ID** - Google 客户端 ID
- **AUTH_GOOGLE_SECRET** - Google 客户端密钥
- **获取步骤**:
  1. 访问 https://console.cloud.google.com
  2. 创建新项目或选择现有项目
  3. 启用 Google+ API
  4. 创建 OAuth 2.0 客户端 ID
  5. 配置授权重定向 URI

### **🌐 基础配置变量**

#### **4. 网站 URL 配置**
- **NEXT_PUBLIC_WEB_URL**: 您的 Vercel 部署 URL
- **AUTH_URL**: `[您的域名]/api/auth`
- **示例**: 
  - `NEXT_PUBLIC_WEB_URL`: `https://lipsyncvideo-net.vercel.app`
  - `AUTH_URL`: `https://lipsyncvideo-net.vercel.app/api/auth`

#### **5. Supabase 公开配置**
- **NEXT_PUBLIC_SUPABASE_URL**: Supabase 项目 URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Supabase 匿名密钥
- **获取位置**: Supabase Dashboard → Settings → API

### **💳 可选配置变量（支付功能）**

#### **6. Stripe 支付配置**
- **STRIPE_PUBLIC_KEY**: Stripe 公开密钥
- **STRIPE_PRIVATE_KEY**: Stripe 私有密钥
- **获取步骤**:
  1. 注册 https://stripe.com
  2. 进入 Dashboard → Developers → API keys
  3. 复制测试环境的密钥

### **🤖 可选配置变量（AI 服务）**

#### **7. APICore.ai AI 服务**
- **APICORE_API_KEY**: APICore.ai API 密钥
- **获取步骤**:
  1. 访问 https://api.apicore.ai/panel
  2. 注册账户并完成验证
  3. 进入 API Keys 页面
  4. 创建新的 API 密钥
- **可用服务**:
  - 唇语同步视频生成 (LipSync)
  - 图像生成 (DALL-E、Stable Diffusion)
  - 文本生成 (GPT、Claude)
  - 音频处理和分析

---

## 🔧 **在 Vercel 中配置环境变量**

### **步骤1: 进入 Vercel 项目设置**
1. 登录 https://vercel.com
2. 选择您的 `lipsyncvideo-net` 项目
3. 点击 "Settings" 标签
4. 选择左侧的 "Environment Variables"

### **步骤2: 添加必需的环境变量**

按照以下格式添加每个变量：

#### **必需变量（按优先级）**

```
变量名: AUTH_SECRET
值: [生成的32位随机字符串]
环境: Production, Preview, Development
```

```
变量名: DATABASE_URL
值: postgresql://postgres:[密码]@db.[项目ID].supabase.co:5432/postgres
环境: Production, Preview, Development
```

```
变量名: NEXT_PUBLIC_WEB_URL
值: https://lipsyncvideo-net.vercel.app
环境: Production, Preview, Development
```

```
变量名: AUTH_URL
值: https://lipsyncvideo-net.vercel.app/api/auth
环境: Production, Preview, Development
```

```
变量名: AUTH_TRUST_HOST
值: true
环境: Production, Preview, Development
```

```
变量名: AUTH_GOOGLE_ID
值: [您的 Google 客户端 ID]
环境: Production, Preview, Development
```

```
变量名: AUTH_GOOGLE_SECRET
值: [您的 Google 客户端密钥]
环境: Production, Preview, Development
```

```
变量名: NEXT_PUBLIC_AUTH_GOOGLE_ID
值: [您的 Google 客户端 ID]
环境: Production, Preview, Development
```

```
变量名: NEXT_PUBLIC_AUTH_GOOGLE_ENABLED
值: true
环境: Production, Preview, Development
```

```
变量名: NEXT_PUBLIC_SUPABASE_URL
值: https://[项目ID].supabase.co
环境: Production, Preview, Development
```

```
变量名: NEXT_PUBLIC_SUPABASE_ANON_KEY
值: [Supabase 匿名密钥]
环境: Production, Preview, Development
```

```
变量名: NEXT_PUBLIC_PROJECT_NAME
值: LipSyncVideo
环境: Production, Preview, Development
```

#### **可选：APICore.ai AI 服务配置**

```
变量名: APICORE_API_KEY
值: [您的 APICore.ai API 密钥]
环境: Production, Preview, Development
```

```
变量名: APICORE_BASE_URL
值: https://api.apicore.ai
环境: Production, Preview, Development
```

```
变量名: APICORE_VERSION
值: v1
环境: Production, Preview, Development
```

### **步骤3: 重新部署**
1. 配置完所有环境变量后
2. 在 Vercel Dashboard 中点击 "Deployments" 标签
3. 点击最新部署右侧的三个点
4. 选择 "Redeploy"
5. 等待重新部署完成

---

## 📝 **详细获取步骤**

### **🔐 生成 AUTH_SECRET**
1. 访问 https://generate-secret.vercel.app/32
2. 点击 "Generate" 按钮
3. 复制生成的字符串
4. 在 Vercel 中添加为 `AUTH_SECRET`

### **🗄️ 获取 Supabase 配置**
1. 登录 https://supabase.com
2. 如果没有项目，点击 "New Project" 创建
3. 项目创建完成后，进入 Settings → Database
4. 复制 "Connection string" 的 URI 格式
5. 进入 Settings → API
6. 复制 "Project URL" 和 "anon public" 密钥

### **🔑 配置 Google OAuth**
1. 访问 https://console.cloud.google.com
2. 创建新项目或选择现有项目
3. 在左侧菜单选择 "APIs & Services" → "Credentials"
4. 点击 "Create Credentials" → "OAuth client ID"
5. 选择 "Web application"
6. 在 "Authorized redirect URIs" 中添加：
   - `https://lipsyncvideo-net.vercel.app/api/auth/callback/google`
7. 创建后复制 "Client ID" 和 "Client secret"

### **🤖 获取 APICore.ai API 密钥**
1. 访问 https://api.apicore.ai/panel
2. 注册账户（支持邮箱注册）
3. 完成邮箱验证
4. 登录后进入控制面板
5. 在左侧菜单找到 "API Keys" 或"密钥管理"
6. 点击 "创建新密钥" 或 "Generate New Key"
7. 复制生成的 API 密钥（格式通常为：`ak-...`）
8. 查看可用的 API 服务：
   - **LipSync 视频生成**: 图片+音频生成唇语同步视频
   - **图像生成**: DALL-E、Stable Diffusion 等模型
   - **文本生成**: GPT、Claude 等大语言模型
   - **音频处理**: 语音识别、音频分析等

---

## ✅ **配置完成验证**

### **检查清单**
- [ ] AUTH_SECRET 已生成并配置
- [ ] DATABASE_URL 已从 Supabase 获取并配置
- [ ] Google OAuth 客户端 ID 和密钥已配置
- [ ] 网站 URL 配置正确
- [ ] Supabase 公开配置已添加
- [ ] 所有变量都设置为 Production, Preview, Development 环境
- [ ] 已重新部署应用

### **测试步骤**
1. 访问您的 Vercel 部署 URL
2. 页面应该能正常加载
3. 尝试点击登录按钮
4. 应该能看到 Google 登录选项
5. 完成登录流程测试

---

## 🚨 **常见问题**

### **Q: AUTH_SECRET 可以随便填写吗？**
A: 不可以。必须是一个安全的随机字符串，建议使用在线生成器生成。

### **Q: Google OAuth 重定向 URI 应该填什么？**
A: 格式为：`https://[您的域名]/api/auth/callback/google`

### **Q: 配置完环境变量后需要重新部署吗？**
A: 是的，必须重新部署才能使新的环境变量生效。

### **Q: 如何知道配置是否成功？**
A: 访问您的网站，如果页面正常加载且登录功能可用，说明配置成功。

---

## 🎯 **下一步**

配置完成后，您的 LipSyncVideo.net 应用就可以正常运行了！您可以：

1. 测试用户注册和登录功能
2. 开始开发核心的 LipSync 视频编辑功能
3. 根据需要添加更多的外部服务集成

如果遇到任何问题，请检查 Vercel 的 "Functions" 标签中的日志信息。
