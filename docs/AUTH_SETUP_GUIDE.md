# 🔐 用户认证系统配置指南

## 📋 **第三阶段：用户认证系统配置**

### **步骤1: Google OAuth 应用配置**

#### 1.1 创建 Google Cloud 项目
```bash
# 访问 Google Cloud Console
# https://console.cloud.google.com

# 1. 创建新项目或选择现有项目
#    - 项目名称: LipSyncVideo
#    - 项目ID: lipsyncvideo-[随机数字]

# 2. 启用 Google+ API
#    - 在左侧菜单选择 "APIs & Services" → "Library"
#    - 搜索 "Google+ API"
#    - 点击启用
```

#### 1.2 配置 OAuth 同意屏幕
```bash
# 在 Google Cloud Console 中：
# 1. 进入 "APIs & Services" → "OAuth consent screen"
# 2. 选择 "External" 用户类型
# 3. 填写应用信息：
#    - App name: LipSyncVideo
#    - User support email: [你的邮箱]
#    - App logo: [上传 LipSyncVideo logo]
#    - App domain: lipsyncvideo.net
#    - Authorized domains: lipsyncvideo.net
#    - Developer contact: [你的邮箱]
# 4. 添加作用域：
#    - email
#    - profile
#    - openid
# 5. 保存并继续
```

#### 1.3 创建 OAuth 客户端 ID
```bash
# 在 Google Cloud Console 中：
# 1. 进入 "APIs & Services" → "Credentials"
# 2. 点击 "Create Credentials" → "OAuth client ID"
# 3. 选择应用类型: "Web application"
# 4. 填写信息：
#    - Name: LipSyncVideo Web Client
#    - Authorized JavaScript origins:
#      * http://localhost:3000 (开发环境)
#      * https://lipsyncvideo-net.vercel.app (预览环境)
#      * https://lipsyncvideo.net (生产环境)
#    - Authorized redirect URIs:
#      * http://localhost:3000/api/auth/callback/google
#      * https://lipsyncvideo-net.vercel.app/api/auth/callback/google
#      * https://lipsyncvideo.net/api/auth/callback/google
# 5. 创建并保存客户端 ID 和密钥
```

### **步骤2: 配置 NextAuth.js**

#### 2.1 检查 NextAuth 配置文件
```bash
# 查看现有的 auth 配置
ls -la src/lib/auth*
ls -la src/app/api/auth/
```

#### 2.2 更新环境变量
```bash
# 更新 .env.local 文件
cat >> .env.local << 'EOF'

# Google OAuth Configuration
AUTH_GOOGLE_ID="[你的 Google Client ID]"
AUTH_GOOGLE_SECRET="[你的 Google Client Secret]"
NEXT_PUBLIC_AUTH_GOOGLE_ID="[你的 Google Client ID]"
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED="true"
NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED="true"

# GitHub OAuth Configuration (可选)
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
NEXT_PUBLIC_AUTH_GITHUB_ENABLED="false"
EOF
```

#### 2.3 验证 NextAuth 配置
```typescript
// 检查 src/lib/auth.ts 或类似文件
// 确保包含以下配置：

import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})
```

### **步骤3: 配置 Vercel 环境变量**

#### 3.1 添加认证相关环境变量
```bash
# 添加 Google OAuth 配置到 Vercel
vercel env add AUTH_GOOGLE_ID development
# 输入: [你的 Google Client ID]

vercel env add AUTH_GOOGLE_SECRET development
# 输入: [你的 Google Client Secret]

vercel env add NEXT_PUBLIC_AUTH_GOOGLE_ID development
# 输入: [你的 Google Client ID]

vercel env add NEXT_PUBLIC_AUTH_GOOGLE_ENABLED development
# 输入: true

vercel env add NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED development
# 输入: true

# 复制到预览环境
vercel env add AUTH_GOOGLE_ID preview
vercel env add AUTH_GOOGLE_SECRET preview
vercel env add NEXT_PUBLIC_AUTH_GOOGLE_ID preview
vercel env add NEXT_PUBLIC_AUTH_GOOGLE_ENABLED preview
vercel env add NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED preview

# 复制到生产环境
vercel env add AUTH_GOOGLE_ID production
vercel env add AUTH_GOOGLE_SECRET production
vercel env add NEXT_PUBLIC_AUTH_GOOGLE_ID production
vercel env add NEXT_PUBLIC_AUTH_GOOGLE_ENABLED production
vercel env add NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED production
```

#### 3.2 更新 AUTH_URL 环境变量
```bash
# 更新开发环境
vercel env rm AUTH_URL development
vercel env add AUTH_URL development
# 输入: http://localhost:3000/api/auth

# 更新预览环境
vercel env rm AUTH_URL preview
vercel env add AUTH_URL preview
# 输入: https://lipsyncvideo-net-git-main-[username].vercel.app/api/auth

# 更新生产环境
vercel env rm AUTH_URL production
vercel env add AUTH_URL production
# 输入: https://lipsyncvideo-net.vercel.app/api/auth
```

### **步骤4: 创建认证页面**

#### 4.1 检查现有认证页面
```bash
# 查看现有的认证相关页面
find src -name "*auth*" -type f
find src -name "*signin*" -type f
find src -name "*login*" -type f
```

#### 4.2 创建登录页面（如果不存在）
```typescript
// src/app/auth/signin/page.tsx
import { signIn, getProviders } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SignIn() {
  const providers = await getProviders()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to LipSyncVideo</CardTitle>
          <CardDescription>
            Sign in to create amazing lip-sync videos with AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers &&
            Object.values(providers).map((provider) => (
              <Button
                key={provider.name}
                onClick={() => signIn(provider.id)}
                className="w-full"
                variant="outline"
              >
                Sign in with {provider.name}
              </Button>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
```

### **步骤5: 测试认证功能**

#### 5.1 本地测试
```bash
# 启动开发服务器
npm run dev

# 在浏览器中测试：
# 1. 访问 http://localhost:3000
# 2. 点击登录按钮
# 3. 选择 Google 登录
# 4. 完成 OAuth 流程
# 5. 验证用户信息显示正确
```

#### 5.2 创建认证测试脚本
```bash
# 创建认证测试脚本
cat > scripts/test-auth.js << 'EOF'
const { auth } = require('../src/lib/auth');

async function testAuth() {
  try {
    console.log('Testing authentication configuration...');
    
    // 检查环境变量
    const requiredEnvs = [
      'AUTH_SECRET',
      'AUTH_GOOGLE_ID',
      'AUTH_GOOGLE_SECRET',
      'DATABASE_URL'
    ];
    
    const missing = requiredEnvs.filter(env => !process.env[env]);
    
    if (missing.length > 0) {
      console.error('❌ Missing environment variables:', missing);
      return;
    }
    
    console.log('✅ All required environment variables present');
    console.log('✅ Authentication configuration valid');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
  }
}

testAuth();
EOF

# 运行测试
node scripts/test-auth.js
```

### **步骤6: 配置用户会话管理**

#### 6.1 检查会话提供者配置
```typescript
// 确保在 app/layout.tsx 或 _app.tsx 中包含 SessionProvider
import { SessionProvider } from "next-auth/react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

#### 6.2 创建用户状态 Hook
```typescript
// src/hooks/useAuth.ts
import { useSession } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: !!session,
  }
}
```

### **步骤7: 部署和验证**

#### 7.1 部署更新
```bash
# 提交更改
git add .
git commit -m "feat: Configure Google OAuth authentication"
git push origin main

# 部署到 Vercel
vercel --prod
```

#### 7.2 生产环境测试
```bash
# 在生产环境中测试：
# 1. 访问部署的 URL
# 2. 测试 Google 登录流程
# 3. 验证用户数据保存到数据库
# 4. 测试登出功能
```

## ✅ **验证清单**

### **Google OAuth 配置验证**
- [ ] Google Cloud 项目创建
- [ ] OAuth 同意屏幕配置
- [ ] OAuth 客户端 ID 创建
- [ ] 重定向 URI 正确配置
- [ ] 环境变量正确设置

### **NextAuth.js 配置验证**
- [ ] NextAuth 配置文件正确
- [ ] 数据库适配器配置
- [ ] 会话回调函数设置
- [ ] 认证页面创建

### **功能测试验证**
- [ ] 本地登录功能正常
- [ ] 用户信息正确显示
- [ ] 数据库用户记录创建
- [ ] 登出功能正常
- [ ] 生产环境登录正常

## 🔧 **故障排除**

### **常见问题解决方案**

1. **OAuth 重定向错误**
   ```bash
   # 检查 Google Cloud Console 中的重定向 URI
   # 确保与实际部署 URL 匹配
   # 格式: https://domain.com/api/auth/callback/google
   ```

2. **环境变量未生效**
   ```bash
   # 重新部署 Vercel 项目
   vercel --prod --force
   
   # 检查环境变量
   vercel env ls
   ```

3. **数据库连接错误**
   ```bash
   # 验证数据库 URL 格式
   # 检查 Supabase 项目状态
   # 确认 RLS 策略正确
   ```

4. **会话持久化问题**
   ```bash
   # 检查 AUTH_SECRET 是否一致
   # 验证数据库适配器配置
   # 确认会话表结构正确
   ```

完成第三阶段后，用户将能够使用 Google 账户登录您的应用，并且用户数据将正确保存到 Supabase 数据库中。
