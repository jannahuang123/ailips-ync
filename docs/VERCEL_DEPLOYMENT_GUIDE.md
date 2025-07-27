# 🚀 Vercel 部署配置指南

## 📋 **第一阶段：Vercel 部署环境配置**

### **步骤1: 准备代码仓库**

#### 1.1 检查项目状态
```bash
# 确保所有更改已提交
git status
git add .
git commit -m "feat: Complete LipSyncVideo brand optimization and prepare for deployment"

# 推送到远程仓库
git push origin main
```

#### 1.2 验证项目构建
```bash
# 本地构建测试
npm run build

# 如果构建失败，检查错误并修复
npm run lint
```

### **步骤2: 创建 Vercel 项目**

#### 2.1 安装 Vercel CLI
```bash
# 全局安装 Vercel CLI
npm install -g vercel

# 登录 Vercel 账户
vercel login
```

#### 2.2 初始化 Vercel 项目
```bash
# 在项目根目录运行
vercel

# 按照提示操作：
# ? Set up and deploy "~/path/to/project"? [Y/n] y
# ? Which scope do you want to deploy to? [选择你的账户]
# ? Link to existing project? [N/y] n
# ? What's your project's name? lipsyncvideo-net
# ? In which directory is your code located? ./
# ? Want to modify these settings? [y/N] n
```

### **步骤3: 配置 Vercel 项目设置**

#### 3.1 项目基础配置
```bash
# 创建 vercel.json 配置文件
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
EOF
```

#### 3.2 环境变量配置
```bash
# 设置开发环境变量
vercel env add NEXT_PUBLIC_WEB_URL development
# 输入: http://localhost:3000

vercel env add NEXT_PUBLIC_PROJECT_NAME development
# 输入: LipSyncVideo

vercel env add AUTH_SECRET development
# 输入: Zt3BXVudzzRq2R2WBqhwRy1dNMq48Gg9zKAYq7YwSL0=

vercel env add AUTH_URL development
# 输入: http://localhost:3000/api/auth

vercel env add AUTH_TRUST_HOST development
# 输入: true

# 设置预览环境变量
vercel env add NEXT_PUBLIC_WEB_URL preview
# 输入: https://lipsyncvideo-net-git-main-yourusername.vercel.app

vercel env add AUTH_URL preview
# 输入: https://lipsyncvideo-net-git-main-yourusername.vercel.app/api/auth

# 设置生产环境变量（暂时使用预览URL）
vercel env add NEXT_PUBLIC_WEB_URL production
# 输入: https://lipsyncvideo-net.vercel.app

vercel env add AUTH_URL production
# 输入: https://lipsyncvideo-net.vercel.app/api/auth
```

### **步骤4: 部署和验证**

#### 4.1 执行部署
```bash
# 部署到预览环境
vercel --prod=false

# 部署到生产环境
vercel --prod
```

#### 4.2 验证部署状态
```bash
# 检查部署状态
vercel ls

# 查看部署日志
vercel logs [deployment-url]

# 检查域名状态
vercel domains ls
```

### **步骤5: 构建优化配置**

#### 5.1 创建 next.config.js 优化
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'cdn.lipsyncvideo.net',
    ],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
```

#### 5.2 性能监控配置
```bash
# 添加性能分析
vercel env add ANALYZE production
# 输入: false

# 启用 Vercel Analytics
vercel env add NEXT_PUBLIC_VERCEL_ANALYTICS_ID production
# 输入: [从 Vercel Dashboard 获取]
```

## ✅ **验证清单**

### **部署验证步骤**
- [ ] 项目成功构建
- [ ] 部署 URL 可以访问
- [ ] 首页正常加载
- [ ] 静态资源加载正常
- [ ] 环境变量正确设置
- [ ] API 路由响应正常
- [ ] 错误页面正常显示

### **性能验证**
```bash
# 使用 Lighthouse 检查性能
npx lighthouse https://your-deployment-url.vercel.app --output=html --output-path=./lighthouse-report.html

# 检查构建大小
npm run analyze
```

### **常见问题排查**

#### 构建失败
```bash
# 检查构建日志
vercel logs --follow

# 本地复现构建问题
npm run build
```

#### 环境变量问题
```bash
# 列出所有环境变量
vercel env ls

# 删除错误的环境变量
vercel env rm VARIABLE_NAME

# 重新添加正确的环境变量
vercel env add VARIABLE_NAME
```

#### 域名访问问题
```bash
# 检查 DNS 设置
nslookup your-domain.vercel.app

# 检查 SSL 证书
curl -I https://your-domain.vercel.app
```

## 🔧 **故障排除**

### **常见错误解决方案**

1. **构建超时**
   ```bash
   # 在 vercel.json 中增加构建时间
   {
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/node",
         "config": { "maxLambdaSize": "50mb" }
       }
     ]
   }
   ```

2. **内存不足**
   ```bash
   # 优化构建命令
   "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
   ```

3. **API 路由错误**
   ```bash
   # 检查 API 路由文件路径
   # 确保文件在 pages/api/ 或 app/api/ 目录下
   ```

## 📊 **监控和日志**

### **设置监控**
```bash
# 启用 Vercel 监控
vercel env add NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS_ID production

# 配置错误追踪
vercel env add SENTRY_DSN production
```

### **日志查看**
```bash
# 实时查看日志
vercel logs --follow

# 查看特定函数日志
vercel logs --function=api/auth

# 下载日志文件
vercel logs --output=logs.txt
```

完成第一阶段后，您的应用将成功部署到 Vercel，可以通过 .vercel.app 域名访问。
