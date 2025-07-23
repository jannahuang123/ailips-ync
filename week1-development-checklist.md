# LipSyncVideo.net 第一周开发任务清单

## 🎯 **第一周目标**
在 ShipAny Template One 基础上，完成 AI 视频唇语同步的核心功能 MVP，让用户能够：
1. 上传视频和音频文件
2. 调用 AI 服务处理
3. 查看处理状态
4. 下载处理结果

## 📅 **Day 1: 项目初始化和环境配置**

### ✅ **任务清单**
- [ ] **项目克隆和基础设置** (2小时)
  ```bash
  git clone https://github.com/shipanyai/shipany-template-one.git lipsyncvideo
  cd lipsyncvideo
  pnpm install
  ```

- [ ] **环境变量配置** (1小时)
  ```bash
  # 复制并配置环境文件
  cp .env.example .env.development
  
  # 添加 AI 服务配置
  HEYGEN_API_KEY=your_heygen_api_key
  DID_API_KEY=your_did_api_key
  REDIS_HOST=localhost
  REDIS_PORT=6379
  ```

- [ ] **品牌主题定制** (2小时)
  - 更新 `src/app/theme.css` 为 LipSync 品牌色
  - 修改 `src/i18n/pages/landing/` 中的内容
  - 更新项目名称和描述

- [ ] **数据库连接测试** (1小时)
  ```bash
  # 确保数据库连接正常
  pnpm db:push
  pnpm dev
  ```

### 🎯 **Day 1 验收标准**
- ✅ 项目能够正常启动 (`pnpm dev`)
- ✅ 数据库连接正常
- ✅ 主页显示 LipSync 品牌内容
- ✅ 用户认证功能正常（基于 ShipAny）

---

## 📅 **Day 2: 数据库扩展和模型定义**

### ✅ **任务清单**
- [ ] **创建数据库迁移脚本** (2小时)
  ```sql
  -- src/db/migrations/001_add_lipsync_tables.sql
  CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    user_uuid VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    video_url VARCHAR(500),
    audio_url VARCHAR(500),
    result_url VARCHAR(500),
    external_task_id VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'heygen',
    quality VARCHAR(20) DEFAULT 'medium',
    credits_consumed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

- [ ] **更新 Drizzle Schema** (2小时)
  - 在 `src/db/schema.ts` 中添加新表定义
  - 定义表关系和索引
  - 运行数据库迁移

- [ ] **创建数据模型** (2小时)
  ```typescript
  // src/models/project.ts
  export interface Project {
    id: number;
    uuid: string;
    userUuid: string;
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    audioUrl?: string;
    resultUrl?: string;
    // ... 其他字段
  }
  ```

- [ ] **创建服务层** (2小时)
  ```typescript
  // src/services/project.ts
  export async function createProject(data: CreateProjectData) {
    // 项目创建逻辑
  }
  
  export async function getProjectsByUser(userUuid: string) {
    // 获取用户项目列表
  }
  ```

### 🎯 **Day 2 验收标准**
- ✅ 数据库表创建成功
- ✅ Drizzle Schema 更新完成
- ✅ 基础的项目 CRUD 操作可用
- ✅ 数据模型和服务层定义完成

---

## 📅 **Day 3: AI 服务集成开发**

### ✅ **任务清单**
- [ ] **HeyGen 客户端开发** (3小时)
  ```typescript
  // src/lib/ai/heygen-client.ts
  export class HeyGenClient {
    async createLipSyncTask(params: LipSyncParams) {
      // HeyGen API 调用逻辑
    }
    
    async getTaskStatus(taskId: string) {
      // 任务状态查询
    }
  }
  ```

- [ ] **D-ID 客户端开发** (2小时)
  ```typescript
  // src/lib/ai/did-client.ts
  export class DIDClient {
    async createLipSyncTask(params: LipSyncParams) {
      // D-ID API 调用逻辑
    }
  }
  ```

- [ ] **AI 服务管理器** (2小时)
  ```typescript
  // src/lib/ai/provider-manager.ts
  export class AIProviderManager {
    async processLipSync(params: LipSyncParams) {
      // 多提供商容错逻辑
    }
  }
  ```

- [ ] **API 调用测试** (1小时)
  - 创建测试脚本验证 AI 服务连通性
  - 测试错误处理和重试机制

### 🎯 **Day 3 验收标准**
- ✅ HeyGen API 调用成功
- ✅ D-ID API 作为备选方案可用
- ✅ 容错切换机制正常工作
- ✅ API 响应数据解析正确

---

## 📅 **Day 4: 文件上传系统开发**

### ✅ **任务清单**
- [ ] **文件上传 API** (3小时)
  ```typescript
  // src/app/api/upload/video/route.ts
  export async function POST(request: NextRequest) {
    // 视频文件上传到 S3
  }
  
  // src/app/api/upload/audio/route.ts
  export async function POST(request: NextRequest) {
    // 音频文件上传到 S3
  }
  ```

- [ ] **文件上传组件** (3小时)
  ```typescript
  // src/components/upload/video-uploader.tsx
  export function VideoUploader({ onUploadComplete }) {
    // 拖拽上传、进度显示、错误处理
  }
  ```

- [ ] **文件验证和处理** (2小时)
  - 文件格式验证
  - 文件大小限制
  - 安全检查

### 🎯 **Day 4 验收标准**
- ✅ 用户可以上传视频文件到 S3
- ✅ 用户可以上传音频文件到 S3
- ✅ 上传进度显示正常
- ✅ 文件验证和错误处理完善

---

## 📅 **Day 5: 核心业务 API 开发**

### ✅ **任务清单**
- [ ] **项目创建 API** (3小时)
  ```typescript
  // src/app/api/lipsync/create/route.ts
  export async function POST(request: NextRequest) {
    // 1. 验证用户权限
    // 2. 创建项目记录
    // 3. 调用 AI 服务
    // 4. 返回项目信息
  }
  ```

- [ ] **任务状态查询 API** (2小时)
  ```typescript
  // src/app/api/lipsync/status/[id]/route.ts
  export async function GET(request: NextRequest, { params }) {
    // 查询项目状态和进度
  }
  ```

- [ ] **结果下载 API** (2小时)
  ```typescript
  // src/app/api/lipsync/download/[id]/route.ts
  export async function GET(request: NextRequest, { params }) {
    // 生成安全的下载链接
  }
  ```

- [ ] **Webhook 处理** (1小时)
  ```typescript
  // src/app/api/webhooks/heygen/route.ts
  export async function POST(request: NextRequest) {
    // 处理 HeyGen 回调，更新项目状态
  }
  ```

### 🎯 **Day 5 验收标准**
- ✅ 用户可以创建 AI 处理任务
- ✅ 可以查询任务处理状态
- ✅ 可以下载处理完成的视频
- ✅ Webhook 回调处理正常

---

## 📅 **Day 6: 前端页面开发**

### ✅ **任务清单**
- [ ] **项目创建页面** (3小时)
  ```typescript
  // src/app/[locale]/create/page.tsx
  export default function CreatePage() {
    // 文件上传 + 参数设置 + 提交处理
  }
  ```

- [ ] **项目列表页面** (2小时)
  ```typescript
  // src/app/[locale]/projects/page.tsx
  export default function ProjectsPage() {
    // 显示用户的所有项目
  }
  ```

- [ ] **项目详情页面** (2小时)
  ```typescript
  // src/app/[locale]/projects/[id]/page.tsx
  export default function ProjectDetailPage({ params }) {
    // 显示项目详情、状态、下载链接
  }
  ```

- [ ] **仪表板更新** (1小时)
  - 基于 ShipAny 的仪表板添加项目统计
  - 显示最近的项目和使用情况

### 🎯 **Day 6 验收标准**
- ✅ 用户可以通过界面创建项目
- ✅ 可以查看项目列表和状态
- ✅ 可以查看项目详情和下载结果
- ✅ 仪表板显示相关统计信息

---

## 📅 **Day 7: 测试和优化**

### ✅ **任务清单**
- [ ] **端到端测试** (3小时)
  - 完整的用户流程测试
  - 从注册到创建项目到下载结果
  - 测试各种边界情况

- [ ] **错误处理优化** (2小时)
  - 完善错误提示信息
  - 添加重试机制
  - 优化用户体验

- [ ] **性能优化** (2小时)
  - 文件上传性能优化
  - API 响应时间优化
  - 前端加载速度优化

- [ ] **文档和部署准备** (1小时)
  - 更新 README
  - 准备部署配置
  - 创建演示数据

### 🎯 **Day 7 验收标准**
- ✅ 完整的用户流程可以正常工作
- ✅ 错误处理和用户体验良好
- ✅ 性能满足基本要求
- ✅ 准备好进行演示和部署

---

## 🚀 **第一周成功指标**

### 📊 **功能完成度**
- ✅ 用户认证系统 (基于 ShipAny)
- ✅ 文件上传功能
- ✅ AI 服务集成
- ✅ 项目管理功能
- ✅ 基础的用户界面

### 🎯 **技术指标**
- ✅ API 响应时间 < 2秒
- ✅ 文件上传成功率 > 95%
- ✅ AI 服务调用成功率 > 90%
- ✅ 页面加载时间 < 3秒

### 👥 **用户体验**
- ✅ 用户可以在 5 分钟内完成首个视频
- ✅ 界面直观易用，无需说明文档
- ✅ 错误信息清晰，用户知道如何解决
- ✅ 处理状态实时更新

## 🔧 **开发工具和资源**

### 📚 **必备工具**
- VS Code + TypeScript 插件
- Postman 或 Insomnia (API 测试)
- Redis Desktop Manager (队列监控)
- pgAdmin 或 TablePlus (数据库管理)

### 🔗 **重要链接**
- [HeyGen API 文档](https://docs.heygen.com/)
- [D-ID API 文档](https://docs.d-id.com/)
- [ShipAny 文档](https://docs.shipany.ai/)
- [Next.js 15 文档](https://nextjs.org/docs)

### 📞 **支持资源**
- ShipAny 社区支持
- AI 服务提供商技术支持
- 项目开发群组讨论

---

**记住：这是一个基于成熟模板的快速开发项目。重点是利用 ShipAny 的现有功能，专注于 AI 视频处理的核心价值。第一周结束后，您应该有一个可以演示的 MVP 产品！**
