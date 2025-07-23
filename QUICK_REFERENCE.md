# 🚀 LipSyncVideo.net 快速参考手册

> **开发过程中的快速查阅指南**  
> 📌 **随时更新进度，保持开发节奏**

## ⚡ **快速启动命令**

```bash
# 项目启动
cd lipsyncvideo
pnpm dev

# 数据库操作
pnpm db:push          # 推送schema变更
pnpm db:studio        # 打开数据库管理界面
pnpm db:migrate       # 运行迁移

# 构建和部署
pnpm build           # 构建生产版本
pnpm start           # 启动生产服务器
```

## 📋 **开发进度追踪**

### 🗓️ **第一周任务状态**

#### **Day 1: 项目初始化** 
- [ ] 项目克隆和依赖安装
- [ ] 环境变量配置
- [ ] 品牌主题定制
- [ ] 数据库连接测试
- [ ] 基础功能验证

#### **Day 2: 数据库扩展**
- [ ] 创建数据库迁移脚本
- [ ] 更新Drizzle Schema
- [ ] 创建数据模型
- [ ] 创建服务层

#### **Day 3: AI服务集成**
- [ ] HeyGen客户端开发
- [ ] D-ID客户端开发
- [ ] AI服务管理器
- [ ] API调用测试

#### **Day 4: 文件上传系统**
- [ ] 文件上传API
- [ ] 文件上传组件
- [ ] 文件验证处理

#### **Day 5: 核心业务API**
- [ ] 项目创建API
- [ ] 任务状态查询API
- [ ] 结果下载API
- [ ] Webhook处理

#### **Day 6: 前端页面开发**
- [ ] 项目创建页面
- [ ] 项目列表页面
- [ ] 项目详情页面
- [ ] 仪表板更新

#### **Day 7: 测试和优化**
- [ ] 端到端测试
- [ ] 错误处理优化
- [ ] 性能优化
- [ ] 文档和部署准备

## 🔑 **关键配置速查**

### 📝 **环境变量清单**
```bash
# 必须配置的新增变量
HEYGEN_API_KEY=your_heygen_api_key
DID_API_KEY=your_did_api_key
REDIS_HOST=localhost
REDIS_PORT=6379

# ShipAny原有变量 (保持不变)
DATABASE_URL=your_database_url
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_PRIVATE_KEY=your_stripe_private_key
NEXTAUTH_SECRET=your_nextauth_secret
```

### 🎨 **品牌色彩配置**
```css
/* src/app/theme.css */
:root {
  --primary: 264 80% 57%;        /* 蓝紫色 #6366f1 */
  --secondary: 120 30% 65%;      /* 绿色 #84cc16 */
  --accent: 280 65% 60%;         /* 紫色 #a855f7 */
}
```

## 📁 **关键文件路径**

### 🔧 **核心开发文件**
```
src/
├── lib/ai/
│   ├── heygen-client.ts       # HeyGen API客户端
│   ├── did-client.ts          # D-ID API客户端
│   └── provider-manager.ts    # AI服务管理器
├── app/api/
│   ├── lipsync/
│   │   ├── create/route.ts    # 创建任务API
│   │   └── status/[id]/route.ts # 状态查询API
│   └── upload/
│       ├── video/route.ts     # 视频上传API
│       └── audio/route.ts     # 音频上传API
├── components/
│   ├── upload/
│   │   └── video-uploader.tsx # 文件上传组件
│   └── project/
│       └── project-status.tsx # 项目状态组件
└── db/
    └── schema.ts              # 数据库Schema
```

### 📄 **页面文件**
```
src/app/[locale]/
├── page.tsx                   # 主页 (定制)
├── create/page.tsx           # 项目创建页面 (新建)
├── projects/
│   ├── page.tsx              # 项目列表 (新建)
│   └── [id]/page.tsx         # 项目详情 (新建)
└── dashboard/page.tsx        # 仪表板 (定制)
```

## 🤖 **AI服务API速查**

### 🎯 **HeyGen API**
```typescript
// 创建任务
POST https://api.heygen.com/v2/video/translate
Headers: X-API-Key: your_api_key
Body: {
  "video_url": "https://...",
  "audio_url": "https://...",
  "quality": "medium"
}

// 查询状态
GET https://api.heygen.com/v2/video/translate/{task_id}
Headers: X-API-Key: your_api_key
```

### 🎬 **D-ID API**
```typescript
// 创建任务
POST https://api.d-id.com/talks
Headers: Authorization: Basic your_api_key
Body: {
  "source_url": "https://...",
  "script": {
    "type": "audio",
    "audio_url": "https://..."
  }
}
```

## 📊 **数据库Schema速查**

### 🗄️ **新增表结构**
```sql
-- 项目表
projects (
  id, uuid, user_uuid, name, status,
  video_url, audio_url, result_url,
  external_task_id, provider, quality,
  credits_consumed, created_at, updated_at
)

-- 任务表
lipsync_tasks (
  id, project_uuid, status, progress,
  error_message, started_at, completed_at, created_at
)
```

### 🔄 **状态枚举**
```typescript
// 项目状态
type ProjectStatus = 'pending' | 'processing' | 'completed' | 'failed';

// 任务状态  
type TaskStatus = 'queued' | 'processing' | 'completed' | 'failed';

// 质量等级
type Quality = 'low' | 'medium' | 'high' | 'ultra';
```

## 🧪 **测试命令**

### 🔍 **API测试**
```bash
# 测试文件上传
curl -X POST http://localhost:3000/api/upload/video \
  -F "file=@test-video.mp4"

# 测试项目创建
curl -X POST http://localhost:3000/api/lipsync/create \
  -H "Content-Type: application/json" \
  -d '{"videoUrl":"...","audioUrl":"...","quality":"medium"}'

# 测试状态查询
curl http://localhost:3000/api/lipsync/status/project-uuid
```

### 🎯 **功能验证清单**
- [ ] 用户注册登录正常
- [ ] 文件上传到S3成功
- [ ] AI服务调用返回任务ID
- [ ] 任务状态查询正常
- [ ] Webhook回调处理正确
- [ ] 结果文件下载成功

## ⚠️ **常见问题解决**

### 🔧 **开发问题**
```bash
# 数据库连接问题
pnpm db:push --force

# Redis连接问题
redis-cli ping

# 依赖安装问题
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 构建问题
pnpm build --debug
```

### 🚨 **错误处理**
```typescript
// API错误处理模板
try {
  const result = await apiCall();
  return NextResponse.json(result);
} catch (error) {
  console.error('API Error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

## 📈 **性能监控**

### 📊 **关键指标**
- API响应时间: < 2秒
- 文件上传成功率: > 95%
- AI服务成功率: > 90%
- 页面加载时间: < 3秒

### 🔍 **监控命令**
```bash
# 查看Redis队列状态
redis-cli LLEN "bull:lip sync processing:waiting"

# 查看数据库连接
psql $DATABASE_URL -c "SELECT count(*) FROM projects;"

# 查看日志
tail -f logs/app.log
```

## 🎯 **每日检查清单**

### 📋 **开发前检查**
- [ ] 拉取最新代码: `git pull`
- [ ] 安装新依赖: `pnpm install`
- [ ] 检查环境变量配置
- [ ] 启动开发服务器: `pnpm dev`

### 📋 **开发后检查**
- [ ] 运行测试: `pnpm test`
- [ ] 检查代码质量: `pnpm lint`
- [ ] 提交代码: `git add . && git commit -m "feat: ..."`
- [ ] 更新进度文档

## 🔗 **重要链接**

### 📚 **文档链接**
- [ShipAny文档](https://docs.shipany.ai/)
- [HeyGen API文档](https://docs.heygen.com/)
- [D-ID API文档](https://docs.d-id.com/)
- [Next.js文档](https://nextjs.org/docs)
- [Drizzle ORM文档](https://orm.drizzle.team/)

### 🛠️ **工具链接**
- [Vercel部署](https://vercel.com/dashboard)
- [Stripe仪表板](https://dashboard.stripe.com/)
- [AWS S3控制台](https://s3.console.aws.amazon.com/)
- [Redis Cloud](https://redis.com/)

## 📞 **紧急联系**

### 🆘 **技术支持**
- ShipAny社区: [Discord链接]
- HeyGen技术支持: support@heygen.com
- D-ID技术支持: support@d-id.com

### 📝 **开发笔记**
```
日期: ___________
完成任务: 
- [ ] 
- [ ] 
- [ ] 

遇到问题:
- 

解决方案:
- 

明天计划:
- [ ] 
- [ ] 
```

---

**💡 提示: 将此文档保持在开发环境中随时可见的位置，每天开发前后都检查一遍，确保不遗漏关键步骤！**
