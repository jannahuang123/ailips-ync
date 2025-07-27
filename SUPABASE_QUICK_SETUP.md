# 🚀 Supabase快速设置指南 (最大化复用ShipAny)

## ✅ **核心原则**
- **100% 复用ShipAny现有代码**
- **0 修改现有数据库schema**
- **仅配置Supabase连接**

## 📋 **当前状态**
- ✅ Supabase项目已创建: `hqdberrfnpamslupzvwt`
- ✅ ShipAny数据库schema已完整定义
- ❌ 需要配置DATABASE_URL连接

## 🔧 **3步快速设置**

### **Step 1: 获取Supabase连接字符串**

#### **1.1 访问Supabase控制台**
```
https://supabase.com/dashboard/project/hqdberrfnpamslupzvwt
```

#### **1.2 获取连接信息**
```
1. 点击 Settings (左侧菜单)
2. 点击 Database
3. 找到 "Connection string" 部分
4. 选择 "URI" 格式
5. 复制连接字符串
```

**连接字符串格式**:
```
postgresql://postgres:[YOUR-PASSWORD]@db.hqdberrfnpamslupzvwt.supabase.co:5432/postgres
```

### **Step 2: 配置环境变量**

#### **2.1 编辑 .env.development**
```bash
# 找到这一行并替换为您的连接字符串
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.hqdberrfnpamslupzvwt.supabase.co:5432/postgres"
```

**重要**: 将 `[YOUR-PASSWORD]` 替换为您创建Supabase项目时设置的数据库密码。

### **Step 3: 推送数据库表结构**

#### **3.1 推送ShipAny schema到Supabase**
```bash
# 推送所有表结构到Supabase
npm run db:push
```

#### **3.2 验证表创建成功**
```bash
# 打开数据库管理界面
npm run db:studio
```

## 📊 **将创建的表 (100% 复用ShipAny)**

### **用户系统** ✅
```
users          - 用户基础信息
apikeys        - API密钥管理
```

### **积分系统** ✅
```
credits        - 积分交易记录 (支持lipsync_medium等类型)
orders         - 订单和支付记录
```

### **内容系统** ✅
```
posts          - 博客文章
feedbacks      - 用户反馈
affiliates     - 推荐系统
```

### **LipSync系统** ✅
```
projects       - LipSync项目管理
lipsync_tasks  - 异步任务队列
```

## 🎯 **验证设置成功**

### **检查数据库连接**
```bash
# 方法1: 使用drizzle studio
npm run db:studio
# 访问 https://local.drizzle.studio 查看表

# 方法2: 访问Supabase控制台
# https://supabase.com/dashboard/project/hqdberrfnpamslupzvwt/editor
```

### **测试网站功能**
```bash
# 启动开发服务器
npm run dev

# 访问网站
open http://localhost:3001

# 测试功能:
# 1. 用户登录/注册
# 2. 积分系统显示
# 3. LipSync编辑器
```

## 🔄 **完全复用的ShipAny功能**

### **认证系统** ✅
```typescript
// 完全复用NextAuth.js
import { useSession } from "next-auth/react";
const { data: session } = useSession();
```

### **积分系统** ✅
```typescript
// 完全复用积分服务
import { getUserCredits, decreaseCredits } from "@/services/credit";

// 获取积分
const credits = await getUserCredits(userUuid);

// 扣除积分 (LipSync消费)
await decreaseCredits({
  user_uuid: userUuid,
  trans_type: "lipsync_medium", // 已定义的类型
  credits: 10
});
```

### **支付系统** ✅
```typescript
// 完全复用Stripe集成
// 用户积分不足时自动跳转到现有定价页面
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

## 🚨 **故障排除**

### **常见问题**

#### **1. DATABASE_URL格式错误**
```bash
# 正确格式
DATABASE_URL="postgresql://postgres:your_password@db.hqdberrfnpamslupzvwt.supabase.co:5432/postgres"

# 错误格式 (缺少密码)
DATABASE_URL="postgresql://postgres@db.hqdberrfnpamslupzvwt.supabase.co:5432/postgres"
```

#### **2. db:push失败**
```bash
# 如果推送失败，尝试强制推送
npm run db:push -- --force

# 或者使用迁移方式
npm run db:generate
npm run db:migrate
```

#### **3. 连接超时**
```bash
# 检查网络连接
ping db.hqdberrfnpamslupzvwt.supabase.co

# 检查Supabase项目状态
# 访问 https://supabase.com/dashboard/project/hqdberrfnpamslupzvwt
```

## 📈 **性能优化 (基于ShipAny)**

### **数据库索引** ✅
```sql
-- ShipAny已优化的索引
CREATE INDEX idx_credits_user_uuid ON credits(user_uuid);
CREATE INDEX idx_projects_user_uuid ON projects(user_uuid);
CREATE INDEX idx_lipsync_tasks_status ON lipsync_tasks(status);
```

### **连接池配置** ✅
```typescript
// ShipAny已配置的连接池
// src/db/config.ts 中的连接配置已优化
```

## 🎉 **设置完成后的功能**

### **立即可用的功能** ✅
- ✅ 用户注册/登录 (Google/GitHub)
- ✅ 积分系统 (获取/消费/充值)
- ✅ LipSync编辑器 (完整功能)
- ✅ 文件上传 (图片/视频/音频)
- ✅ 支付系统 (Stripe集成)
- ✅ 用户仪表板
- ✅ 积分历史查看
- ✅ 项目管理

### **数据流程** ✅
```
用户登录 → 获取积分余额 → 使用LipSync → 扣除积分 → 生成视频 → 保存项目
```

## 📚 **相关文档**

### **ShipAny文档**
- `src/db/schema.ts` - 完整数据库schema
- `src/services/credit.ts` - 积分系统服务
- `src/models/` - 数据模型定义

### **Supabase文档**
- [Supabase Dashboard](https://supabase.com/dashboard/project/hqdberrfnpamslupzvwt)
- [Connection Settings](https://supabase.com/dashboard/project/hqdberrfnpamslupzvwt/settings/database)

**✅ 通过3个简单步骤，您就可以完全复用ShipAny的所有功能，实现零重复开发的Supabase集成！**

---

## 🔥 **一键设置命令**

```bash
# 1. 配置DATABASE_URL (手动编辑 .env.development)
# 2. 推送数据库表
npm run db:push
# 3. 启动开发服务器
npm run dev
```

**就这么简单！** 🎉
