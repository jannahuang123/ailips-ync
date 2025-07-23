# 🚀 LipSyncVideo.net 快速启动指南

## 📋 **5分钟快速启动**

### 1️⃣ **克隆项目**
```bash
git clone https://github.com/jannahuang123/ailips-ync.git
cd ailips-ync
```

### 2️⃣ **安装依赖**
```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 3️⃣ **环境配置**
```bash
# 复制环境变量模板
cp .env.example .env.development

# 编辑环境变量 (必需配置)
nano .env.development
```

**最小化配置 (用于本地开发测试):**
```bash
# 基础配置
NEXT_PUBLIC_WEB_URL="http://localhost:3000"
NEXT_PUBLIC_PROJECT_NAME="LipSyncVideo"

# 数据库 (使用 Supabase 免费版)
DATABASE_URL="your-supabase-database-url"

# 认证密钥 (随机生成)
AUTH_SECRET="your-random-secret-key"

# AI 服务 (HeyGen 免费试用)
HEYGEN_API_KEY="your-heygen-api-key"

# 文件存储 (AWS S3 或兼容服务)
STORAGE_BUCKET="your-s3-bucket"
STORAGE_ACCESS_KEY="your-access-key"
STORAGE_SECRET_KEY="your-secret-key"
```

### 4️⃣ **数据库初始化**
```bash
# 推送数据库结构
pnpm db:push

# 验证数据库连接
pnpm db:studio
```

### 5️⃣ **启动开发服务器**
```bash
pnpm dev
```

访问 http://localhost:3000 查看项目！

## 🔧 **详细配置步骤**

### 📊 **Supabase 数据库设置**
1. 访问 [Supabase](https://supabase.com/)
2. 创建新项目
3. 获取数据库连接字符串
4. 更新 `DATABASE_URL`

### 🤖 **HeyGen API 设置**
1. 访问 [HeyGen](https://app.heygen.com/)
2. 注册账号并验证
3. 获取 API 密钥
4. 更新 `HEYGEN_API_KEY`

### 📤 **AWS S3 存储设置**
1. 创建 AWS 账号
2. 创建 S3 存储桶
3. 创建 IAM 用户和访问密钥
4. 配置 CORS 策略
5. 更新存储相关环境变量

### 🔐 **Google OAuth 设置 (可选)**
1. 访问 Google Cloud Console
2. 创建 OAuth 2.0 客户端
3. 设置回调 URL: `http://localhost:3000/api/auth/callback/google`
4. 更新 `AUTH_GOOGLE_ID` 和 `AUTH_GOOGLE_SECRET`

## 🧪 **功能测试**

### 1️⃣ **基础功能测试**
```bash
# 运行环境验证脚本
npx tsx scripts/verify-setup.ts

# 检查所有服务连接状态
pnpm test:connections
```

### 2️⃣ **AI 服务测试**
```bash
# 测试 HeyGen API 连接
pnpm test:heygen

# 测试文件上传功能
pnpm test:upload
```

### 3️⃣ **完整流程测试**
1. 访问 http://localhost:3000
2. 注册/登录账号
3. 上传测试视频和音频文件
4. 创建 LipSync 项目
5. 查看处理状态
6. 下载结果视频

## 📚 **开发资源**

### 🔗 **重要链接**
- **项目文档**: 查看 `DEVELOPMENT_GUIDE.md`
- **API 文档**: 查看 `API_TESTING_GUIDE.md`
- **环境配置**: 查看 `ENVIRONMENT_SETUP.md`
- **项目结构**: 查看 `PROJECT_STRUCTURE.md`

### 🛠️ **开发命令**
```bash
# 开发服务器
pnpm dev

# 构建项目
pnpm build

# 数据库操作
pnpm db:push          # 推送 schema
pnpm db:studio        # 打开数据库管理界面
pnpm db:generate      # 生成类型定义

# 代码检查
pnpm lint             # ESLint 检查
pnpm type-check       # TypeScript 类型检查

# 测试命令
pnpm test:env         # 环境验证
pnpm test:api         # API 测试
pnpm test:ai          # AI 服务测试
```

## 🚨 **常见问题解决**

### ❓ **数据库连接失败**
```bash
# 检查 DATABASE_URL 格式
echo $DATABASE_URL

# 测试数据库连接
pnpm db:studio
```

### ❓ **AI API 调用失败**
```bash
# 检查 API 密钥
echo $HEYGEN_API_KEY

# 测试 API 连接
npx tsx scripts/test-heygen.ts
```

### ❓ **文件上传失败**
```bash
# 检查 S3 配置
echo $STORAGE_BUCKET
echo $STORAGE_ACCESS_KEY

# 验证 S3 权限和 CORS 设置
```

### ❓ **页面显示异常**
```bash
# 清除缓存重新启动
rm -rf .next
pnpm dev
```

## 🎯 **下一步开发**

### 📅 **第一周任务**
- [ ] 完善用户界面设计
- [ ] 添加项目管理页面
- [ ] 实现批量处理功能
- [ ] 优化移动端体验

### 📅 **第二周任务**
- [ ] 集成支付系统
- [ ] 添加用户通知功能
- [ ] 实现视频预览功能
- [ ] 性能优化和监控

### 📅 **第三周任务**
- [ ] SEO 优化
- [ ] 多语言支持
- [ ] 用户分析系统
- [ ] 客服聊天功能

## 🎉 **部署到生产环境**

### 🚀 **Vercel 部署 (推荐)**
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署到 Vercel
vercel

# 配置环境变量
vercel env add
```

### 🐳 **Docker 部署**
```bash
# 构建 Docker 镜像
docker build -t lipsyncvideo .

# 运行容器
docker run -p 3000:3000 lipsyncvideo
```

### ☁️ **云服务部署**
- **Vercel**: 最简单，自动 CI/CD
- **Netlify**: 静态部署，适合前端
- **AWS**: 完整云服务，可扩展性强
- **Google Cloud**: 企业级部署

## 📞 **获取帮助**

### 🔗 **资源链接**
- **GitHub Issues**: 报告问题和建议
- **文档中心**: 完整的开发文档
- **社区讨论**: 开发者交流

### 📧 **联系方式**
- **技术支持**: 查看项目 README
- **商务合作**: 通过 GitHub 联系
- **功能建议**: 提交 GitHub Issue

---

**🎯 快速启动完成！现在您可以开始使用 LipSyncVideo.net 进行 AI 视频唇语同步了！**
