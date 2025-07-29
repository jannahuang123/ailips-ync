# 🔍 Google OAuth 回调 URL 验证指南

## 🎯 问题定位

既然 Vercel 上已配置真实的 Google OAuth 信息，问题很可能出在：

1. **Google Cloud Console 回调 URL 配置错误** ⭐ (最可能)
2. **Supabase 数据库连接或表结构问题**
3. **NextAuth 会话处理异常**

## 🔧 立即验证步骤

### 步骤 1: 检查当前回调 URL

根据诊断脚本，您的应用当前配置：
- **域名**: `http://localhost:3000` (本地) / `https://ailips-ync.vercel.app` (生产)
- **预期回调 URL**: 
  - `https://ailips-ync.vercel.app/api/auth/callback/google` (生产环境)
  - `http://localhost:3000/api/auth/callback/google` (开发环境)

### 步骤 2: 验证 Google Cloud Console 配置

1. **访问 Google Cloud Console**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **检查 OAuth 2.0 客户端 ID 配置**
   - 找到您的 Web 应用客户端
   - 点击编辑 (铅笔图标)

3. **验证"已获授权的重定向 URI"**
   
   **必须包含以下 URI (完全匹配):**
   ```
   https://ailips-ync.vercel.app/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```

   **⚠️ 常见错误:**
   - 缺少 `https://` 或 `http://` 前缀
   - 域名拼写错误
   - 路径错误 (应该是 `/api/auth/callback/google`)
   - 多余的斜杠或参数

### 步骤 3: 检查 OAuth 同意屏幕

1. **导航到 OAuth 同意屏幕**
   ```
   APIs & Services > OAuth consent screen
   ```

2. **确认状态为"已发布"**
   - 如果状态是"测试中"，只有测试用户可以登录
   - 点击"发布应用"使其对所有用户可用

3. **验证授权域**
   ```
   授权域应包含:
   - ailips-ync.vercel.app
   - localhost (开发环境)
   ```

## 🧪 测试验证

### 方法 1: 使用测试页面

访问测试页面进行调试：
```
本地: http://localhost:3000/debug/auth-test
生产: https://ailips-ync.vercel.app/debug/auth-test
```

### 方法 2: 手动测试 API 端点

1. **检查认证提供商**
   ```
   GET https://ailips-ync.vercel.app/api/auth/providers
   ```
   应该返回包含 Google 提供商的 JSON

2. **检查会话状态**
   ```
   GET https://ailips-ync.vercel.app/api/auth/session
   ```

3. **测试登录流程**
   ```
   访问: https://ailips-ync.vercel.app/api/auth/signin/google
   ```

## 🐛 调试日志分析

现在代码中已添加详细的调试日志，登录时请观察控制台输出：

### 正常流程日志:
```
🚪 SignIn Callback 开始: { userEmail: "user@example.com", provider: "google" }
✅ SignIn 允许登录
🔍 JWT Callback 开始: { hasUser: true, hasAccount: true, provider: "google" }
🔧 handleSignInUser 开始: { userEmail: "user@example.com", provider: "google" }
💾 saveUser 开始: { email: "user@example.com", provider: "google" }
✅ saveUser 完成: { uuid: "xxx", email: "user@example.com" }
✅ JWT token.user 已设置
🎫 Session Callback: { hasSession: true, hasToken: true }
✅ Session 用户信息已设置: { email: "user@example.com", uuid: "xxx" }
```

### 异常情况日志:
```
❌ SignIn Callback 错误: [具体错误信息]
❌ JWT callback 错误: [具体错误信息]  
❌ handleSignInUser 失败: [具体错误信息]
❌ saveUser 失败: [具体错误信息]
```

## 🔍 常见问题诊断

### 问题 1: redirect_uri_mismatch
**症状**: 登录时跳转到 Google 错误页面
**原因**: 回调 URL 不匹配
**解决**: 
1. 检查 Google Console 中的重定向 URI 配置
2. 确保 URI 完全匹配，包括协议、域名、路径

### 问题 2: 登录成功但立即退出
**症状**: 能跳转到 Google 授权，但返回后仍显示未登录
**原因**: JWT 回调函数出错，通常是数据库问题
**解决**:
1. 检查 Supabase 数据库连接
2. 验证 `users` 表结构
3. 查看 `saveUser` 函数的错误日志

### 问题 3: invalid_client 错误
**症状**: 点击登录按钮后出现 Google 错误页面
**原因**: 客户端 ID 或密钥错误
**解决**:
1. 验证 Vercel 环境变量中的 `AUTH_GOOGLE_ID` 和 `AUTH_GOOGLE_SECRET`
2. 确认与 Google Console 中的值一致

## 📋 Supabase 数据库验证

在 Supabase SQL Editor 中运行以下查询：

```sql
-- 1. 检查用户表结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. 检查是否有用户数据
SELECT COUNT(*) as total_users FROM users;

-- 3. 检查最近的登录记录
SELECT email, signin_provider, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. 测试数据库连接
SELECT NOW() as current_time;
```

## ✅ 修复检查清单

- [ ] Google Cloud Console 回调 URL 配置正确
- [ ] OAuth 同意屏幕已发布
- [ ] 授权域包含正确的域名
- [ ] Vercel 环境变量配置正确
- [ ] Supabase 数据库连接正常
- [ ] 用户表结构完整
- [ ] 调试日志显示正常流程
- [ ] 测试页面登录成功

## 🚀 下一步行动

1. **立即检查**: Google Cloud Console 的回调 URL 配置
2. **运行测试**: 访问 `/debug/auth-test` 页面
3. **查看日志**: 观察浏览器控制台和 Vercel 日志
4. **验证数据库**: 在 Supabase 中运行验证查询

**最可能的问题是 Google Cloud Console 中的回调 URL 配置不正确！** 🎯
