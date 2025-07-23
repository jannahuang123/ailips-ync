# 📁 LipSyncVideo.net 项目结构说明

> **基于 ShipAny Template One 的项目文件组织**  
> 🎯 **目标**: 清晰了解每个文件的作用，便于开发和维护

## 🏗️ **项目根目录结构**

```
lipsyncvideo/
├── 📄 DEVELOPMENT_GUIDE.md      # 主开发指南 (新增)
├── 📄 QUICK_REFERENCE.md        # 快速参考手册 (新增)
├── 📄 PROJECT_STRUCTURE.md      # 项目结构说明 (新增)
├── 📄 README.md                 # 项目说明文档
├── 📄 package.json              # 项目依赖配置
├── 📄 .env.example              # 环境变量模板
├── 📄 .env.development          # 开发环境变量 (需创建)
├── 📄 next.config.js            # Next.js 配置
├── 📄 tailwind.config.ts        # TailwindCSS 配置
├── 📄 drizzle.config.ts         # Drizzle ORM 配置
└── 📁 src/                      # 源代码目录
```

## 📂 **src/ 目录详细结构**

### 🎨 **应用程序核心 (app/)**
```
src/app/
├── 📄 globals.css               # 全局样式
├── 📄 theme.css                 # 主题配置 (需定制)
├── 📄 layout.tsx                # 根布局组件
├── 📄 loading.tsx               # 全局加载组件
├── 📄 not-found.tsx             # 404页面
├── 📁 [locale]/                 # 国际化路由
│   ├── 📄 layout.tsx            # 本地化布局
│   ├── 📄 page.tsx              # 主页 (需定制)
│   ├── 📁 (default)/            # 默认布局组
│   │   ├── 📄 page.tsx          # 主页内容
│   │   ├── 📁 pricing/          # 定价页面 (需调整)
│   │   ├── 📁 showcase/         # 作品展示 (需定制)
│   │   └── 📁 demo/             # 演示页面 (需新建)
│   ├── 📁 create/               # 项目创建页面 (需新建)
│   │   └── 📄 page.tsx
│   ├── 📁 projects/             # 项目管理页面 (需新建)
│   │   ├── 📄 page.tsx          # 项目列表
│   │   └── 📁 [id]/             # 项目详情
│   │       └── 📄 page.tsx
│   ├── 📁 dashboard/            # 用户仪表板 (需定制)
│   │   └── 📄 page.tsx
│   └── 📁 admin/                # 管理后台 (基于ShipAny)
└── 📁 api/                      # API路由
    ├── 📁 auth/                 # 认证API (ShipAny原有)
    ├── 📁 checkout/             # 支付API (ShipAny原有)
    ├── 📁 lipsync/              # 唇语同步API (需新建)
    │   ├── 📁 create/
    │   │   └── 📄 route.ts      # 创建任务API
    │   ├── 📁 status/
    │   │   └── 📁 [id]/
    │   │       └── 📄 route.ts  # 状态查询API
    │   └── 📁 download/
    │       └── 📁 [id]/
    │           └── 📄 route.ts  # 下载API
    ├── 📁 upload/               # 文件上传API (需新建)
    │   ├── 📁 video/
    │   │   └── 📄 route.ts
    │   └── 📁 audio/
    │       └── 📄 route.ts
    └── 📁 webhooks/             # Webhook处理 (需新建)
        ├── 📁 heygen/
        │   └── 📄 route.ts
        └── 📁 did/
            └── 📄 route.ts
```

### 🧩 **组件库 (components/)**
```
src/components/
├── 📁 ui/                       # 基础UI组件 (ShipAny原有)
│   ├── 📄 button.tsx
│   ├── 📄 input.tsx
│   ├── 📄 card.tsx
│   └── 📄 ...
├── 📁 dashboard/                # 仪表板组件 (ShipAny原有)
├── 📁 sign/                     # 登录注册组件 (ShipAny原有)
├── 📁 upload/                   # 文件上传组件 (需新建)
│   ├── 📄 video-uploader.tsx
│   ├── 📄 audio-uploader.tsx
│   └── 📄 upload-progress.tsx
├── 📁 project/                  # 项目相关组件 (需新建)
│   ├── 📄 project-card.tsx
│   ├── 📄 project-status.tsx
│   ├── 📄 project-list.tsx
│   └── 📄 create-project-form.tsx
├── 📁 ai/                       # AI相关组件 (需新建)
│   ├── 📄 processing-status.tsx
│   ├── 📄 quality-selector.tsx
│   └── 📄 provider-status.tsx
└── 📁 coming-soon/              # 占位页面组件 (需新建)
    ├── 📄 blog.tsx
    └── 📄 tutorials.tsx
```

### 🔧 **核心库 (lib/)**
```
src/lib/
├── 📄 utils.ts                  # 工具函数 (ShipAny原有)
├── 📄 hash.ts                   # 哈希函数 (ShipAny原有)
├── 📄 email.ts                  # 邮件服务 (ShipAny原有)
├── 📁 ai/                       # AI服务集成 (需新建)
│   ├── 📄 heygen-client.ts      # HeyGen API客户端
│   ├── 📄 did-client.ts         # D-ID API客户端
│   ├── 📄 provider-manager.ts   # AI服务管理器
│   └── 📄 types.ts              # AI相关类型定义
├── 📁 storage/                  # 文件存储 (需新建)
│   ├── 📄 s3-client.ts          # S3客户端
│   ├── 📄 file-validator.ts     # 文件验证
│   └── 📄 upload-manager.ts     # 上传管理器
├── 📁 queue/                    # 任务队列 (需新建)
│   ├── 📄 redis-client.ts       # Redis客户端
│   ├── 📄 task-processor.ts     # 任务处理器
│   └── 📄 job-scheduler.ts      # 任务调度器
└── 📁 monitoring/               # 监控日志 (需新建)
    ├── 📄 logger.ts             # 日志系统
    ├── 📄 metrics.ts            # 指标收集
    └── 📄 alerts.ts             # 告警系统
```

### 🗄️ **数据层 (db/ & models/ & services/)**
```
src/db/
├── 📄 index.ts                  # 数据库连接 (ShipAny原有)
├── 📄 schema.ts                 # 数据库Schema (需扩展)
└── 📁 migrations/               # 数据库迁移 (需新建)
    └── 📄 001_add_lipsync_tables.sql

src/models/
├── 📄 user.ts                   # 用户模型 (ShipAny原有)
├── 📄 order.ts                  # 订单模型 (ShipAny原有)
├── 📄 project.ts                # 项目模型 (需新建)
├── 📄 lipsync-task.ts           # 任务模型 (需新建)
└── 📄 video-template.ts         # 模板模型 (需新建)

src/services/
├── 📄 user.ts                   # 用户服务 (ShipAny原有)
├── 📄 order.ts                  # 订单服务 (ShipAny原有)
├── 📄 project.ts                # 项目服务 (需新建)
├── 📄 lipsync.ts                # 唇语同步服务 (需新建)
└── 📄 notification.ts           # 通知服务 (需新建)
```

### 🌍 **国际化 (i18n/)**
```
src/i18n/
├── 📄 config.ts                 # 国际化配置 (ShipAny原有)
├── 📄 request.ts                # 请求处理 (ShipAny原有)
├── 📁 messages/                 # 翻译文件 (需更新)
│   ├── 📄 en.json               # 英文翻译
│   ├── 📄 zh.json               # 中文翻译
│   ├── 📄 ja.json               # 日文翻译 (需新建)
│   └── 📄 ko.json               # 韩文翻译 (需新建)
└── 📁 pages/                    # 页面内容 (需更新)
    ├── 📁 landing/              # 主页内容
    │   ├── 📄 hero.ts           # Hero区域 (需定制)
    │   ├── 📄 features.ts       # 功能介绍 (需定制)
    │   └── 📄 testimonials.ts   # 用户评价 (需定制)
    ├── 📁 dashboard/            # 仪表板内容
    └── 📁 pricing/              # 定价页面内容 (需调整)
```

### 🔐 **认证配置 (auth/)**
```
src/auth/
├── 📄 config.ts                 # NextAuth配置 (ShipAny原有)
├── 📄 providers.ts              # 认证提供商 (ShipAny原有)
└── 📄 callbacks.ts              # 认证回调 (ShipAny原有)
```

### 🎨 **AI SDK集成 (aisdk/)**
```
src/aisdk/
├── 📄 index.ts                  # AI SDK入口 (ShipAny原有)
├── 📁 lipsync/                  # 唇语同步模块 (需新建)
│   ├── 📄 heygen.ts
│   ├── 📄 did.ts
│   └── 📄 index.ts
├── 📁 image/                    # 图像处理 (ShipAny原有)
├── 📁 text/                     # 文本处理 (ShipAny原有)
└── 📁 video/                    # 视频处理 (需扩展)
    ├── 📄 processor.ts
    └── 📄 converter.ts
```

## 🔄 **开发工作流程**

### 📝 **文件修改优先级**

#### **🟢 高优先级 - 必须修改**
```
✅ 需要新建的文件:
- src/lib/ai/* (AI服务集成)
- src/app/api/lipsync/* (核心API)
- src/app/api/upload/* (文件上传API)
- src/components/upload/* (上传组件)
- src/components/project/* (项目组件)
- src/app/[locale]/create/* (创建页面)
- src/app/[locale]/projects/* (项目页面)

✅ 需要修改的文件:
- src/db/schema.ts (数据库扩展)
- src/app/theme.css (品牌定制)
- src/i18n/pages/landing/* (主页内容)
- src/i18n/messages/* (翻译更新)
```

#### **🟡 中优先级 - 建议修改**
```
🔧 需要定制的文件:
- src/app/[locale]/(default)/page.tsx (主页定制)
- src/app/[locale]/dashboard/page.tsx (仪表板定制)
- src/app/[locale]/(default)/pricing/page.tsx (定价调整)
- src/components/dashboard/* (仪表板组件)
```

#### **🟠 低优先级 - 可选修改**
```
⚙️ 可选优化的文件:
- src/lib/monitoring/* (监控系统)
- src/components/coming-soon/* (占位页面)
- src/app/[locale]/admin/* (管理后台扩展)
```

### 🚫 **禁止修改的文件**
```
❌ 不要修改这些核心文件:
- src/auth/* (认证系统)
- src/components/ui/* (基础UI组件)
- src/lib/utils.ts (工具函数)
- src/lib/email.ts (邮件服务)
- next.config.js (Next.js配置)
- tailwind.config.ts (TailwindCSS配置)
```

## 📊 **文件状态追踪**

### ✅ **完成状态标记**
```
📁 src/lib/ai/
├── [ ] heygen-client.ts         # HeyGen API客户端
├── [ ] did-client.ts            # D-ID API客户端
└── [ ] provider-manager.ts      # AI服务管理器

📁 src/app/api/lipsync/
├── [ ] create/route.ts          # 创建任务API
├── [ ] status/[id]/route.ts     # 状态查询API
└── [ ] download/[id]/route.ts   # 下载API

📁 src/components/upload/
├── [ ] video-uploader.tsx       # 视频上传组件
└── [ ] audio-uploader.tsx       # 音频上传组件

📁 src/app/[locale]/
├── [ ] create/page.tsx          # 项目创建页面
└── [ ] projects/page.tsx        # 项目列表页面
```

## 🔍 **快速定位指南**

### 🎯 **按功能查找文件**
```
🤖 AI服务相关:
- src/lib/ai/* (AI客户端)
- src/aisdk/lipsync/* (AI SDK集成)
- src/app/api/lipsync/* (AI API)

📤 文件上传相关:
- src/lib/storage/* (存储服务)
- src/components/upload/* (上传组件)
- src/app/api/upload/* (上传API)

📊 项目管理相关:
- src/models/project.ts (项目模型)
- src/services/project.ts (项目服务)
- src/components/project/* (项目组件)
- src/app/[locale]/projects/* (项目页面)

💳 支付积分相关:
- src/app/api/checkout/* (支付API - ShipAny原有)
- src/services/order.ts (订单服务 - ShipAny原有)
- src/models/order.ts (订单模型 - ShipAny原有)
```

### 🔧 **按开发阶段查找**
```
第1-2天 (项目初始化):
- package.json, .env.development
- src/app/theme.css
- src/i18n/pages/landing/*

第3-4天 (AI服务集成):
- src/lib/ai/*
- src/app/api/lipsync/*
- src/aisdk/lipsync/*

第5-6天 (文件上传):
- src/lib/storage/*
- src/components/upload/*
- src/app/api/upload/*

第7天 (前端页面):
- src/app/[locale]/create/*
- src/app/[locale]/projects/*
- src/components/project/*
```

---

**💡 提示: 开发过程中，建议将此文档和 QUICK_REFERENCE.md 保持在编辑器的侧边栏中，随时查阅文件位置和作用！**
