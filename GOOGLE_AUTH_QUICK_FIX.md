# 🚨 谷歌登录问题快速修复指南

## 🔍 问题诊断结果

根据诊断脚本，发现以下关键问题：

❌ **AUTH_GOOGLE_ID**: 使用的是占位符 `your-google-client-id.apps.googleusercontent.com`  
❌ **AUTH_GOOGLE_SECRET**: 使用的是占位符 `your-google-client-secret`  
⚠️ **NEXT_PUBLIC_WEB_URL**: 仍在使用本地开发地址

**这就是为什么用户登录后仍显示未登录状态的原因！**

## 🔧 立即修复步骤

### 步骤 1: 创建 Google OAuth 应用

1. **访问 Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **创建或选择项目**
   - 点击项目选择器
   - 创建新项目或选择现有项目

3. **启用必要的 API**
   ```
   导航到: APIs & Services > Library
   搜索并启用: Google+ API
   ```

4. **配置 OAuth 同意屏幕**
   ```
   导航到: APIs & Services > OAuth consent screen
   
   用户类型: External (外部)
   应用名称: LipSyncVideo
   用户支持电子邮件: 您的邮箱
   开发者联系信息: 您的邮箱
   
   授权域 (重要!):
   - ailips-ync.vercel.app (您的 Vercel 域名)
   - localhost (开发环境)
   ```

5. **创建 OAuth 2.0 客户端 ID**
   ```
   导航到: APIs & Services > Credentials
   点击: Create Credentials > OAuth 2.0 Client ID
   
   应用类型: Web application
   名称: LipSyncVideo Web Client
   
   已获授权的 JavaScript 来源:
   - https://ailips-ync.vercel.app
   - http://localhost:3000
   
   已获授权的重定向 URI (关键!):
   - https://ailips-ync.vercel.app/api/auth/callback/google
   - http://localhost:3000/api/auth/callback/google
   ```

6. **获取客户端 ID 和密钥**
   - 创建完成后，复制 `客户端 ID` 和 `客户端密钥`

### 步骤 2: 更新环境变量

编辑 `.env.local` 文件：

```bash
# 基础配置 (生产环境)
NEXT_PUBLIC_WEB_URL="https://ailips-ync.vercel.app"
AUTH_URL="https://ailips-ync.vercel.app/api/auth"
AUTH_SECRET="Zt3BXVudzzRq2R2WBqhwRy1dNMq48Gg9zKAYq7YwSL0="
AUTH_TRUST_HOST=true

# 谷歌认证 (替换为真实值)
AUTH_GOOGLE_ID="您的真实客户端ID.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="您的真实客户端密钥"
NEXT_PUBLIC_AUTH_GOOGLE_ID="您的真实客户端ID.apps.googleusercontent.com"
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED="true"

# 数据库 (已正确配置)
DATABASE_URL="postgresql://postgres.hqdberrfnpamslupzvwt:Hzz123456@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
```

### 步骤 3: 配置 Vercel 环境变量

在 Vercel 项目设置中添加相同的环境变量：

```bash
# 在 Vercel Dashboard > Project > Settings > Environment Variables 中添加:

NEXT_PUBLIC_WEB_URL = https://ailips-ync.vercel.app
AUTH_URL = https://ailips-ync.vercel.app/api/auth
AUTH_SECRET = Zt3BXVudzzRq2R2WBqhwRy1dNMq48Gg9zKAYq7YwSL0=
AUTH_TRUST_HOST = true

AUTH_GOOGLE_ID = 您的真实客户端ID.apps.googleusercontent.com
AUTH_GOOGLE_SECRET = 您的真实客户端密钥
NEXT_PUBLIC_AUTH_GOOGLE_ID = 您的真实客户端ID.apps.googleusercontent.com
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED = true

DATABASE_URL = postgresql://postgres.hqdberrfnpamslupzvwt:Hzz123456@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### 步骤 4: 验证修复

1. **本地测试**
   ```bash
   npm run dev
   # 访问 http://localhost:3000/auth/signin
   # 测试谷歌登录
   ```

2. **重新部署到 Vercel**
   ```bash
   git add .
   git commit -m "fix(auth): 配置真实的Google OAuth客户端ID和密钥"
   git push origin main
   ```

3. **生产环境测试**
   ```
   访问: https://ailips-ync.vercel.app/auth/signin
   点击谷歌登录按钮
   完成授权流程
   验证登录状态
   ```

## 🔍 故障排除

### 问题 1: "redirect_uri_mismatch" 错误
**解决**: 确保 Google Console 中的重定向 URI 完全匹配：
```
https://ailips-ync.vercel.app/api/auth/callback/google
```

### 问题 2: 登录后立即退出
**原因**: JWT 回调函数出错，通常是数据库保存失败
**解决**: 检查 Supabase 数据库连接和用户表结构

### 问题 3: "invalid_client" 错误
**解决**: 
1. 检查客户端 ID 和密钥是否正确
2. 确认 OAuth 同意屏幕已发布
3. 验证授权域配置

## ✅ 验证清单

- [ ] Google Cloud Console 项目已创建
- [ ] OAuth 同意屏幕已配置
- [ ] OAuth 2.0 客户端 ID 已创建
- [ ] 重定向 URI 配置正确
- [ ] 环境变量已更新 (本地和 Vercel)
- [ ] 代码已重新部署
- [ ] 登录流程测试通过

## 📞 需要帮助？

如果仍有问题，请提供：
1. Google Cloud Console 的 OAuth 配置截图
2. 浏览器开发者工具的错误日志
3. Vercel 部署日志
4. 完整的错误信息

---

**修复完成后，用户应该能够正常使用谷歌登录并保持登录状态！** 🎉
