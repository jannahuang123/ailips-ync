# 🚀 Supabase数据库对接完整指南

## 📋 **项目信息**
- **Supabase项目URL**: https://kaaidnmoyhcffsgrpcge.supabase.co
- **已配置到Vercel**: ✅
- **ShipAny代码框架**: 100% 复用

## 🎯 **3步完成对接**

### **Step 1: 创建数据库表 (一键复制)**

#### **1.1 访问Supabase SQL编辑器**
```
https://kaaidnmoyhcffsgrpcge.supabase.co/project/default/sql
```

#### **1.2 执行SQL脚本**
1. 打开项目根目录的 `SUPABASE_TABLES_SETUP.sql` 文件
2. **全选复制** 所有SQL代码
3. 粘贴到Supabase SQL编辑器中
4. 点击 **"Run"** 按钮执行

**执行结果**: 将创建9个表 + 索引 + 视图

### **Step 2: 配置数据库连接**

#### **2.1 获取连接字符串**
```
1. 访问: https://kaaidnmoyhcffsgrpcge.supabase.co/project/default/settings/database
2. 找到 "Connection string" 部分
3. 选择 "URI" 格式
4. 复制连接字符串
```

**连接字符串格式**:
```
postgresql://postgres:[YOUR-PASSWORD]@db.kaaidnmoyhcffsgrpcge.supabase.co:5432/postgres
```

#### **2.2 更新环境变量**
编辑 `.env.development` 文件:
```bash
# 替换这一行
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.kaaidnmoyhcffsgrpcge.supabase.co:5432/postgres"
```

**重要**: 将 `[YOUR-PASSWORD]` 替换为您的实际数据库密码

### **Step 3: 验证连接**

#### **3.1 测试数据库连接**
```bash
# 打开数据库管理界面
npm run db:studio
```

#### **3.2 启动网站**
```bash
# 启动开发服务器
npm run dev

# 访问网站
open http://localhost:3001
```

## 📊 **创建的表结构 (100% 复用ShipAny)**

### **核心业务表**
```
✅ users          - 用户管理 (登录/注册/资料)
✅ credits        - 积分系统 (获取/消费/历史)
✅ orders         - 订单系统 (支付/充值)
✅ projects       - LipSync项目管理
✅ lipsync_tasks  - 异步任务队列
```

### **辅助功能表**
```
✅ apikeys        - API密钥管理
✅ posts          - 博客文章
✅ feedbacks      - 用户反馈
✅ affiliates     - 推荐系统
```

### **优化索引**
```sql
-- 性能优化索引已自动创建
idx_users_uuid, idx_credits_user_uuid, 
idx_projects_user_uuid, idx_lipsync_tasks_status
```

## 🔄 **ShipAny功能完全复用**

### **用户认证系统** ✅
```typescript
// 完全复用NextAuth.js
import { useSession } from "next-auth/react";
const { data: session } = useSession();
```

### **积分系统** ✅
```typescript
// 完全复用积分服务
import { getUserCredits, decreaseCredits } from "@/services/credit";

// 获取用户积分
const credits = await getUserCredits(session.user.uuid);

// LipSync消费积分
await decreaseCredits({
  user_uuid: session.user.uuid,
  trans_type: "lipsync_medium",
  credits: 10
});
```

### **支付系统** ✅
```typescript
// 完全复用Stripe集成
// 积分不足时跳转充值
router.push('/pricing');
```

### **文件上传** ✅
```typescript
// 复用现有上传API
const response = await fetch('/api/upload/video', {
  method: 'POST',
  body: formData
});
```

## 🎨 **LipSync编辑器集成**

### **积分显示** ✅
```typescript
// 实时显示用户积分
const [userCredits, setUserCredits] = useState(0);

useEffect(() => {
  if (session?.user) {
    fetchUserCredits(); // 调用ShipAny积分API
  }
}, [session]);
```

### **项目创建** ✅
```typescript
// 创建LipSync项目
const project = await db.insert(projects).values({
  uuid: generateUUID(),
  user_uuid: session.user.uuid,
  name: "My LipSync Video",
  status: "pending",
  provider: "heygen",
  quality: "medium",
  credits_consumed: 10
});
```

### **任务管理** ✅
```typescript
// 创建异步任务
const task = await db.insert(lipsyncTasks).values({
  project_uuid: project.uuid,
  status: "queued",
  progress: 0
});
```

## 🔍 **验证设置成功**

### **检查表创建**
在Supabase控制台中验证:
```
https://kaaidnmoyhcffsgrpcge.supabase.co/project/default/editor
```

应该看到9个表:
- users, credits, orders, projects, lipsync_tasks
- apikeys, posts, feedbacks, affiliates

### **测试网站功能**
1. ✅ 用户登录/注册
2. ✅ 积分余额显示
3. ✅ LipSync编辑器加载
4. ✅ 文件上传功能
5. ✅ 生成按钮状态

## 🚨 **常见问题解决**

### **问题1: 连接失败**
```bash
# 检查连接字符串格式
echo $DATABASE_URL

# 测试连接
psql $DATABASE_URL -c "SELECT version();"
```

### **问题2: 表创建失败**
```sql
-- 在Supabase SQL编辑器中检查
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### **问题3: 权限错误**
```sql
-- 授予必要权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

## 📈 **性能优化 (已包含)**

### **数据库索引** ✅
```sql
-- 用户查询优化
CREATE INDEX idx_users_uuid ON users(uuid);
CREATE INDEX idx_users_email ON users(email);

-- 积分查询优化
CREATE INDEX idx_credits_user_uuid ON credits(user_uuid);
CREATE INDEX idx_credits_trans_type ON credits(trans_type);

-- 项目查询优化
CREATE INDEX idx_projects_user_uuid ON projects(user_uuid);
CREATE INDEX idx_projects_status ON projects(status);
```

### **有用的视图** ✅
```sql
-- 用户积分余额视图
SELECT * FROM user_credit_balance WHERE user_uuid = 'xxx';

-- 项目统计视图
SELECT * FROM project_stats WHERE user_uuid = 'xxx';
```

## 🎉 **完成后的功能**

### **立即可用** ✅
- ✅ 用户注册/登录 (Google/GitHub)
- ✅ 积分系统 (显示/消费/充值)
- ✅ LipSync编辑器 (完整功能)
- ✅ 文件上传 (图片/视频/音频)
- ✅ 项目管理 (创建/查看/历史)
- ✅ 支付系统 (Stripe集成)

### **数据流程** ✅
```
用户登录 → 获取积分 → 上传文件 → 生成视频 → 扣除积分 → 保存项目
```

## 📚 **相关文件**

### **数据库相关**
- `SUPABASE_TABLES_SETUP.sql` - 一键创建表脚本
- `src/db/schema.ts` - TypeScript类型定义
- `src/services/credit.ts` - 积分服务
- `src/models/` - 数据模型

### **API端点**
- `/api/get-user-credits` - 获取积分
- `/api/lipsync/create` - 创建LipSync项目
- `/api/upload/video` - 文件上传

## 🔥 **一键设置命令总结**

```bash
# 1. 复制SQL脚本到Supabase执行 (手动)
# 2. 配置DATABASE_URL (手动编辑 .env.development)
# 3. 启动网站
npm run dev
```

**🎉 就这么简单！您的Supabase数据库现在已完全集成ShipAny框架！**

---

## ⚡ **快速检查清单**

- [ ] SQL脚本已在Supabase执行
- [ ] DATABASE_URL已正确配置
- [ ] 网站可以正常启动
- [ ] 用户可以登录
- [ ] 积分余额正确显示
- [ ] LipSync编辑器正常工作

**全部完成后，您就拥有了一个完整的LipSync视频生成平台！** 🚀
