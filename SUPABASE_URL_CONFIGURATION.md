# 🔧 Supabase URL 配置指南

## 🎯 **问题背景**

当使用 NextAuth.js 与 Supabase 集成时，除了 Google OAuth 配置外，**Supabase 本身也需要配置认证 URL**。这是很多开发者容易忽略的关键步骤！

## 🚨 **必须配置的 Supabase URL**

### **步骤 1: 访问 Supabase 认证配置**

1. **登录 Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **选择您的项目**
   ```
   项目名称: [您的项目名称]
   项目 ID: [您的项目ID]
   ```

3. **导航到认证 URL 配置**
   ```
   左侧菜单: Authentication > URL Configuration
   或直接访问: https://supabase.com/dashboard/project/[PROJECT-ID]/auth/url-configuration
   ```

### **步骤 2: 配置 Site URL**

**Site URL** 是 Supabase 认证的默认重定向地址：

```
生产环境: https://ailips-ync.vercel.app
开发环境: http://localhost:3000
```

**⚠️ 重要**: 
- 生产环境设置为您的 Vercel 域名
- 开发时可以临时改为 `http://localhost:3000`

### **步骤 3: 配置 Redirect URLs**

**Redirect URLs** 是允许的重定向地址白名单。添加以下 URL：

```
# 生产环境 (必须)
https://ailips-ync.vercel.app/**

# 开发环境 (必须)
http://localhost:3000/**

# Vercel 预览环境 (推荐)
https://*-jannahuang123.vercel.app/**
```

### **步骤 4: 通配符说明**

| 通配符 | 说明 | 示例 |
|--------|------|------|
| `*` | 匹配任意字符 (不包含 `/`) | `https://ailips-ync.vercel.app/*` |
| `**` | 匹配任意字符 (包含 `/`) | `https://ailips-ync.vercel.app/**` |
| `?` | 匹配单个字符 | `https://ailips-ync.vercel.app/?` |

**推荐使用 `**`** 因为它支持所有子路径，包括：
- `/api/auth/callback/google`
- `/auth/signin`
- `/dashboard`
- 等等...

## 🔍 **为什么需要这些配置？**

### **1. Site URL 的作用**
- NextAuth.js 默认重定向地址
- Supabase 认证成功后的默认跳转
- 邮件验证链接的基础 URL

### **2. Redirect URLs 的作用**
- 防止重定向攻击 (Open Redirect)
- 限制认证回调的允许域名
- 支持多环境部署 (开发、预览、生产)

### **3. 与 Google OAuth 的关系**
```
用户点击登录 → Google OAuth → Google 回调到 NextAuth
                                      ↓
NextAuth 处理认证 → 保存到 Supabase → 重定向到应用
                                      ↓
                              必须在 Supabase 白名单中
```

## 🛠️ **配置示例**

### **生产环境配置**
```
Site URL: https://ailips-ync.vercel.app
Redirect URLs:
- https://ailips-ync.vercel.app/**
- http://localhost:3000/**
```

### **开发环境配置**
```
Site URL: http://localhost:3000
Redirect URLs:
- http://localhost:3000/**
- https://ailips-ync.vercel.app/**
```

### **多环境配置 (推荐)**
```
Site URL: https://ailips-ync.vercel.app
Redirect URLs:
- https://ailips-ync.vercel.app/**
- http://localhost:3000/**
- https://*-jannahuang123.vercel.app/**
```

## 🚨 **常见错误**

### **错误 1: 忘记配置 Supabase URL**
**症状**: Google 登录成功，但立即退出
**原因**: Supabase 拒绝了重定向请求
**解决**: 按上述步骤配置 Supabase URL

### **错误 2: 通配符使用错误**
**症状**: 某些页面重定向失败
**原因**: 使用 `*` 而不是 `**`
**解决**: 改用 `**` 支持所有子路径

### **错误 3: 缺少开发环境 URL**
**症状**: 本地开发时认证失败
**原因**: 只配置了生产环境 URL
**解决**: 添加 `http://localhost:3000/**`

### **错误 4: Site URL 与实际域名不匹配**
**症状**: 认证后跳转到错误页面
**原因**: Site URL 配置错误
**解决**: 确保 Site URL 与实际域名一致

## ✅ **验证配置**

### **方法 1: 使用测试页面**
```
访问: https://ailips-ync.vercel.app/debug/auth-test
点击 Google 登录，观察重定向流程
```

### **方法 2: 检查浏览器网络**
```
1. 打开开发者工具 → Network
2. 点击 Google 登录
3. 观察重定向请求是否成功
4. 检查是否有 4xx 错误
```

### **方法 3: 查看 Supabase 日志**
```
1. 访问 Supabase Dashboard
2. 导航到 Logs > Auth
3. 查看认证请求日志
4. 检查是否有重定向错误
```

## 🎯 **快速检查清单**

- [ ] Supabase Site URL 已设置为生产域名
- [ ] Redirect URLs 包含生产环境通配符
- [ ] Redirect URLs 包含开发环境通配符
- [ ] 使用 `**` 而不是 `*` 通配符
- [ ] Google OAuth 回调 URL 已配置
- [ ] Vercel 环境变量已设置
- [ ] 测试页面登录成功

## 🚀 **立即行动**

1. **访问 Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]/auth/url-configuration
   ```

2. **设置 Site URL**
   ```
   https://ailips-ync.vercel.app
   ```

3. **添加 Redirect URLs**
   ```
   https://ailips-ync.vercel.app/**
   http://localhost:3000/**
   ```

4. **保存配置并测试**
   ```
   访问: https://ailips-ync.vercel.app/debug/auth-test
   ```

**这很可能就是您 Google 登录问题的根本原因！** 🎯
