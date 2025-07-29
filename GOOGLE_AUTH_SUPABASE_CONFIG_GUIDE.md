# 🔐 谷歌登录 & Supabase 配置完整指南

## 📋 问题诊断

**症状**: 用户使用谷歌登录后返回页面仍显示未登录状态

**可能原因**:
1. 环境变量配置不正确
2. 谷歌 OAuth 应用配置问题
3. Supabase 数据库连接问题
4. NextAuth 会话配置问题
5. 回调 URL 配置错误

## 🔧 配置检查清单

### 1. 环境变量配置 (.env.local)

```bash
# 基础配置
NEXT_PUBLIC_WEB_URL="https://your-domain.com"  # 生产环境域名
AUTH_SECRET="your-secret-key"                   # 使用 openssl rand -base64 32 生成
AUTH_URL="https://your-domain.com/api/auth"     # 生产环境 URL
AUTH_TRUST_HOST=true

# 谷歌认证配置
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
NEXT_PUBLIC_AUTH_GOOGLE_ID="your-google-client-id"  # 公开客户端ID
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED="true"              # 启用谷歌登录
NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED="false"     # 可选：一键登录

# Supabase 数据库
DATABASE_URL="postgresql://user:password@host:port/database"
```

### 2. 谷歌 OAuth 应用配置

#### 2.1 创建 Google Cloud 项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API 和 OAuth2 API

#### 2.2 配置 OAuth 同意屏幕
```
应用名称: LipSyncVideo (或您的应用名称)
用户支持电子邮件: your-email@domain.com
开发者联系信息: your-email@domain.com
授权域: your-domain.com
```

#### 2.3 创建 OAuth 2.0 客户端 ID
```
应用类型: Web 应用
名称: LipSyncVideo Web Client

已获授权的 JavaScript 来源:
- https://your-domain.com
- http://localhost:3000 (开发环境)

已获授权的重定向 URI:
- https://your-domain.com/api/auth/callback/google
- http://localhost:3000/api/auth/callback/google (开发环境)
```

### 3. Supabase 数据库配置

#### 3.1 创建 Supabase 项目
1. 访问 [Supabase](https://supabase.com/)
2. 创建新项目
3. 获取数据库连接字符串

#### 3.2 数据库表结构验证
确保以下表存在并正确配置：

```sql
-- 用户表
CREATE TABLE users (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nickname VARCHAR(255),
  avatar_url TEXT,
  signin_type VARCHAR(50),
  signin_provider VARCHAR(50),
  signin_openid VARCHAR(255),
  signin_ip VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 积分表
CREATE TABLE credits (
  id SERIAL PRIMARY KEY,
  user_uuid UUID REFERENCES users(uuid),
  trans_type VARCHAR(50),
  credits INTEGER,
  expired_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔍 故障排除步骤

### 步骤 1: 验证环境变量
```bash
# 检查环境变量是否正确加载
console.log('AUTH_GOOGLE_ID:', process.env.AUTH_GOOGLE_ID);
console.log('AUTH_GOOGLE_SECRET:', process.env.AUTH_GOOGLE_SECRET ? '✓ Set' : '✗ Missing');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing');
```

### 步骤 2: 测试数据库连接
```bash
# 运行数据库迁移
npm run db:migrate

# 测试数据库连接
npm run db:studio
```

### 步骤 3: 验证谷歌 OAuth 配置
1. 检查客户端 ID 和密钥是否正确
2. 验证重定向 URI 是否匹配
3. 确认 OAuth 同意屏幕已发布

### 步骤 4: 检查 NextAuth 配置
确认以下文件配置正确：
- `src/auth/config.ts` - 提供商配置
- `src/app/api/auth/[...nextauth]/route.ts` - API 路由
- `src/app/[locale]/layout.tsx` - SessionProvider 包装

## 🚨 常见问题解决

### 问题 1: 登录后立即退出
**原因**: JWT 回调函数出错
**解决**: 检查 `handleSignInUser` 函数和数据库保存逻辑

### 问题 2: 重定向 URI 不匹配
**原因**: Google OAuth 配置的重定向 URI 与实际不符
**解决**: 确保 Google Console 中的重定向 URI 为:
```
https://your-domain.com/api/auth/callback/google
```

### 问题 3: 数据库连接失败
**原因**: DATABASE_URL 配置错误或网络问题
**解决**: 验证 Supabase 连接字符串格式:
```
postgresql://postgres:[password]@[host]:5432/postgres
```

### 问题 4: 会话不持久
**原因**: AUTH_SECRET 未设置或不一致
**解决**: 生成并设置稳定的 AUTH_SECRET:
```bash
openssl rand -base64 32
```

## ✅ 验证测试

### 1. 本地测试
```bash
# 启动开发服务器
npm run dev

# 访问登录页面
http://localhost:3000/auth/signin

# 测试谷歌登录流程
```

### 2. 生产环境测试
```bash
# 部署到 Vercel
vercel --prod

# 测试生产环境登录
https://your-domain.com/auth/signin
```

### 3. 调试日志
在 `src/auth/config.ts` 中添加调试日志：
```typescript
callbacks: {
  async jwt({ token, user, account }) {
    console.log('JWT Callback:', { token, user, account });
    // ... 现有逻辑
  },
  async session({ session, token }) {
    console.log('Session Callback:', { session, token });
    // ... 现有逻辑
  }
}
```

## 📞 技术支持

如果问题仍然存在，请提供以下信息：
1. 完整的错误日志
2. 环境变量配置（隐藏敏感信息）
3. 谷歌 OAuth 应用配置截图
4. Supabase 项目设置
5. 浏览器开发者工具的网络请求日志

---

**配置完成后，用户应该能够**:
- ✅ 点击谷歌登录按钮
- ✅ 跳转到谷歌授权页面
- ✅ 授权后返回应用
- ✅ 显示已登录状态
- ✅ 用户信息保存到数据库
- ✅ 会话持久化
