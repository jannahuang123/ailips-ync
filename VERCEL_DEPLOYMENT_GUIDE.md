# 🚀 Vercel在线部署指南

## 📋 **项目信息**
- **Supabase项目**: https://kaaidnmoyhcffsgrpcge.supabase.co
- **部署平台**: Vercel
- **代码框架**: 100% 复用ShipAny

## 🎯 **2步完成在线部署**

### **Step 1: 配置Supabase数据库表**

#### **1.1 访问Supabase SQL编辑器**
```
https://kaaidnmoyhcffsgrpcge.supabase.co/project/default/sql
```

#### **1.2 执行表创建脚本**
1. 打开项目中的 `SUPABASE_TABLES_SETUP.sql` 文件
2. **全选复制** 所有SQL代码
3. 粘贴到Supabase SQL编辑器
4. 点击 **"Run"** 执行

**✅ 执行成功后将创建9个表 + 索引优化**

### **Step 2: 配置Vercel环境变量**

#### **2.1 获取Supabase连接信息**
```
1. 访问: https://kaaidnmoyhcffsgrpcge.supabase.co/project/default/settings/database
2. 找到 "Connection string" 部分
3. 选择 "URI" 格式
4. 复制连接字符串
```

#### **2.2 在Vercel中配置环境变量**
访问您的Vercel项目设置页面，添加以下环境变量：

```bash
# 🗄️ 数据库配置
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.kaaidnmoyhcffsgrpcge.supabase.co:5432/postgres"

# 🔐 认证配置
AUTH_SECRET="Zt3BXVudzzRq2R2WBqhwRy1dNMq48Gg9zKAYq7YwSL0="
AUTH_URL="https://your-vercel-domain.vercel.app/api/auth"
AUTH_TRUST_HOST="true"

# 🌐 网站配置
NEXT_PUBLIC_WEB_URL="https://your-vercel-domain.vercel.app"
NEXT_PUBLIC_PROJECT_NAME="LipSyncVideo"

# 🎨 主题配置
NEXT_PUBLIC_DEFAULT_THEME="light"
NEXT_PUBLIC_LOCALE_DETECTION="false"

# 📧 管理员邮箱
ADMIN_EMAILS="your-email@example.com"

# 💳 支付配置 (可选)
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_PRIVATE_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# 支付回调URL
NEXT_PUBLIC_PAY_SUCCESS_URL="https://your-vercel-domain.vercel.app/my-orders"
NEXT_PUBLIC_PAY_FAIL_URL="https://your-vercel-domain.vercel.app/#pricing"
NEXT_PUBLIC_PAY_CANCEL_URL="https://your-vercel-domain.vercel.app/#pricing"

# 🔑 Google认证 (可选)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
NEXT_PUBLIC_AUTH_GOOGLE_ID="your-google-client-id"
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED="true"

# 🐙 GitHub认证 (可选)
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
NEXT_PUBLIC_AUTH_GITHUB_ENABLED="true"

# 🤖 AI服务配置 (可选)
HEYGEN_API_KEY="your-heygen-api-key"
DID_API_KEY="your-did-api-key"

# ☁️ 文件存储配置 (可选)
STORAGE_ENDPOINT="your-s3-endpoint"
STORAGE_REGION="your-region"
STORAGE_ACCESS_KEY="your-access-key"
STORAGE_SECRET_KEY="your-secret-key"
STORAGE_BUCKET="your-bucket-name"
STORAGE_DOMAIN="your-cdn-domain"
```

## 🔧 **必需的环境变量 (最小配置)**

### **核心配置 (必须)**
```bash
# 数据库连接 - 必须配置
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.kaaidnmoyhcffsgrpcge.supabase.co:5432/postgres"

# 认证密钥 - 必须配置
AUTH_SECRET="Zt3BXVudzzRq2R2WBqhwRy1dNMq48Gg9zKAYq7YwSL0="

# 网站URL - 必须配置
NEXT_PUBLIC_WEB_URL="https://your-vercel-domain.vercel.app"
AUTH_URL="https://your-vercel-domain.vercel.app/api/auth"
```

### **可选配置**
```bash
# Google登录 (推荐)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED="true"

# Stripe支付 (推荐)
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_PRIVATE_KEY="sk_test_..."
```

## 📱 **在Vercel中配置步骤**

### **方法1: 通过Vercel Dashboard**
```
1. 访问 https://vercel.com/dashboard
2. 选择您的项目
3. 进入 Settings → Environment Variables
4. 逐个添加上述环境变量
5. 点击 "Save" 保存
6. 重新部署项目
```

### **方法2: 通过Vercel CLI**
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 设置环境变量
vercel env add DATABASE_URL
vercel env add AUTH_SECRET
vercel env add NEXT_PUBLIC_WEB_URL

# 重新部署
vercel --prod
```

## 🎯 **部署后验证**

### **检查网站功能**
```
1. 访问您的Vercel域名
2. 测试用户注册/登录
3. 检查积分系统显示
4. 测试LipSync编辑器
5. 验证文件上传功能
```

### **检查数据库连接**
```
1. 尝试用户注册
2. 查看Supabase控制台中的users表
3. 测试积分显示功能
4. 检查credits表记录
```

## 🔍 **故障排除**

### **常见问题**

#### **1. 数据库连接失败**
```
错误: "Database connection failed"
解决: 检查 DATABASE_URL 格式和密码
```

#### **2. 认证失败**
```
错误: "Authentication error"
解决: 检查 AUTH_SECRET 和 AUTH_URL 配置
```

#### **3. 环境变量未生效**
```
解决: 在Vercel中重新部署项目
```

#### **4. Google登录失败**
```
解决: 
1. 检查Google OAuth配置
2. 确认回调URL设置正确
3. 验证客户端ID和密钥
```

## 🚀 **完整部署流程**

### **准备阶段**
```
✅ Supabase项目已创建
✅ 代码已推送到GitHub
✅ Vercel项目已连接GitHub
```

### **执行阶段**
```
1. 在Supabase中执行SQL脚本创建表
2. 在Vercel中配置环境变量
3. 触发重新部署
4. 验证网站功能
```

### **验证阶段**
```
1. 访问网站首页
2. 测试用户注册
3. 检查积分显示
4. 测试LipSync编辑器
5. 验证数据库记录
```

## 📊 **部署后的功能**

### **立即可用** ✅
- ✅ 用户注册/登录系统
- ✅ 积分系统 (显示/消费)
- ✅ LipSync编辑器界面
- ✅ 文件上传功能
- ✅ 响应式设计
- ✅ 多语言支持

### **需要配置API密钥后可用**
- 🔄 Google/GitHub登录
- 🔄 Stripe支付系统
- 🔄 AI视频生成 (HeyGen/D-ID)
- 🔄 文件云存储

## 🎉 **部署完成**

### **成功标志**
```
✅ 网站可以正常访问
✅ 用户可以注册/登录
✅ 积分系统正常显示
✅ LipSync编辑器加载正常
✅ 数据库表有数据记录
```

### **下一步**
```
1. 配置Google OAuth (用户登录)
2. 配置Stripe (支付系统)
3. 配置AI API (视频生成)
4. 配置文件存储 (媒体文件)
5. 设置域名和SSL
```

## 📚 **有用的链接**

### **管理控制台**
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Console**: https://kaaidnmoyhcffsgrpcge.supabase.co
- **GitHub Repository**: 您的GitHub仓库链接

### **文档参考**
- **Next.js部署**: https://nextjs.org/docs/deployment
- **Vercel环境变量**: https://vercel.com/docs/concepts/projects/environment-variables
- **Supabase连接**: https://supabase.com/docs/guides/database/connecting-to-postgres

**🚀 现在您可以直接在Vercel上部署和测试您的LipSync平台了！**

---

## ⚡ **快速部署检查清单**

- [ ] Supabase SQL脚本已执行
- [ ] Vercel环境变量已配置
- [ ] 项目已重新部署
- [ ] 网站可以正常访问
- [ ] 用户注册功能正常
- [ ] 积分系统显示正常
