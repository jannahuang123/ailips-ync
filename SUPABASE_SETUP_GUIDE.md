# 🗄️ Supabase数据库对接指南

## 📋 **当前状态**
- ✅ Supabase项目已创建: `hqdberrfnpamslupzvwt`
- ✅ 数据库表结构已定义 (src/db/schema.ts)
- ❌ 数据库连接未配置
- ❌ 表格未创建

## 🔧 **第一步：获取数据库连接信息**

### **1. 登录Supabase控制台**
```
访问: https://supabase.com/dashboard/projects
选择项目: hzzloyal's Project (hqdberrfnpamslupzvwt)
```

### **2. 获取数据库连接字符串**
```
1. 进入项目 → Settings → Database
2. 找到 "Connection string" 部分
3. 选择 "URI" 格式
4. 复制连接字符串，格式如下：
   postgresql://postgres:[YOUR-PASSWORD]@db.hqdberrfnpamslupzvwt.supabase.co:5432/postgres
```

### **3. 更新环境变量**
```bash
# 编辑 .env.development 文件
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.hqdberrfnpamslupzvwt.supabase.co:5432/postgres"
```

## 🚀 **第二步：创建数据库表**

### **方法1：使用Drizzle推送 (推荐)**
```bash
# 推送表结构到Supabase
pnpm db:push
```

### **方法2：使用迁移文件**
```bash
# 生成迁移文件
pnpm db:generate

# 执行迁移
pnpm db:migrate
```

### **方法3：手动SQL创建**
如果上述方法失败，可以在Supabase SQL编辑器中执行以下SQL：

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ,
  nickname VARCHAR(255),
  avatar_url VARCHAR(255),
  locale VARCHAR(50),
  signin_type VARCHAR(50),
  signin_ip VARCHAR(255),
  signin_provider VARCHAR(50),
  signin_openid VARCHAR(255),
  invite_code VARCHAR(255) NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ,
  invited_by VARCHAR(255) NOT NULL DEFAULT '',
  is_affiliate BOOLEAN NOT NULL DEFAULT false,
  subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free',
  total_videos_created INTEGER NOT NULL DEFAULT 0,
  last_video_created_at TIMESTAMPTZ
);

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS email_provider_unique_idx ON users (email, signin_provider);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_no VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ,
  user_uuid VARCHAR(255) NOT NULL DEFAULT '',
  user_email VARCHAR(255) NOT NULL DEFAULT '',
  amount INTEGER NOT NULL,
  interval VARCHAR(50),
  expired_at TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL,
  stripe_session_id VARCHAR(255),
  credits INTEGER NOT NULL,
  currency VARCHAR(50),
  sub_id VARCHAR(255),
  sub_interval_count INTEGER,
  sub_cycle_anchor INTEGER,
  sub_period_end INTEGER,
  sub_period_start INTEGER,
  sub_times INTEGER,
  product_id VARCHAR(255),
  product_name VARCHAR(255),
  valid_months INTEGER,
  order_detail TEXT,
  paid_at TIMESTAMPTZ,
  paid_email VARCHAR(255),
  paid_detail TEXT
);

-- API Keys table
CREATE TABLE IF NOT EXISTS apikeys (
  id SERIAL PRIMARY KEY,
  api_key VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(100),
  user_uuid VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ,
  status VARCHAR(50)
);

-- Credits table
CREATE TABLE IF NOT EXISTS credits (
  id SERIAL PRIMARY KEY,
  trans_no VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ,
  user_uuid VARCHAR(255) NOT NULL,
  trans_type VARCHAR(50) NOT NULL,
  credits INTEGER NOT NULL,
  order_no VARCHAR(255),
  expired_at TIMESTAMPTZ
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  content TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  status VARCHAR(50),
  cover_url VARCHAR(255),
  author_name VARCHAR(255),
  author_avatar_url VARCHAR(255),
  locale VARCHAR(50)
);

-- Affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id SERIAL PRIMARY KEY,
  user_uuid VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT '',
  invited_by VARCHAR(255) NOT NULL,
  paid_order_no VARCHAR(255) NOT NULL DEFAULT '',
  paid_amount INTEGER NOT NULL DEFAULT 0,
  reward_percent INTEGER NOT NULL DEFAULT 0,
  reward_amount INTEGER NOT NULL DEFAULT 0
);

-- Feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ,
  status VARCHAR(50),
  user_uuid VARCHAR(255),
  content TEXT,
  rating INTEGER
);

-- LipSync Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  user_uuid VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  video_url VARCHAR(500),
  audio_url VARCHAR(500),
  result_url VARCHAR(500),
  external_task_id VARCHAR(255),
  provider VARCHAR(50) NOT NULL DEFAULT 'heygen',
  quality VARCHAR(20) NOT NULL DEFAULT 'medium',
  credits_consumed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LipSync Tasks table
CREATE TABLE IF NOT EXISTS lipsync_tasks (
  id SERIAL PRIMARY KEY,
  project_uuid VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  progress INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔍 **第三步：验证数据库连接**

### **1. 测试连接**
```bash
# 打开数据库管理界面
pnpm db:studio
```

### **2. 检查表是否创建成功**
```bash
# 运行数据库测试脚本
pnpm test:database
```

### **3. 手动验证**
在Supabase控制台中：
```
1. 进入项目 → Table Editor
2. 确认以下表已创建：
   - users
   - orders  
   - apikeys
   - credits
   - posts
   - affiliates
   - feedbacks
   - projects
   - lipsync_tasks
```

## ⚠️ **常见问题解决**

### **问题1：连接被拒绝**
```bash
# 检查DATABASE_URL格式
echo $DATABASE_URL

# 确保密码正确，特殊字符需要URL编码
# 例如：password@123 → password%40123
```

### **问题2：权限不足**
```sql
-- 在Supabase SQL编辑器中执行
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

### **问题3：表已存在错误**
```bash
# 删除现有迁移并重新生成
rm -rf src/db/migrations/*
pnpm db:generate
pnpm db:push
```

## 🎯 **第四步：初始化数据**

### **创建测试用户积分**
```sql
-- 插入测试积分记录
INSERT INTO credits (trans_no, user_uuid, trans_type, credits, created_at) 
VALUES ('TEST_001', 'test-user-uuid', 'new_user', 50, NOW());
```

### **验证积分系统**
```bash
# 测试积分API
curl -X POST http://localhost:3001/api/get-user-credits \
  -H "Content-Type: application/json"
```

## ✅ **完成检查清单**

- [ ] Supabase项目访问正常
- [ ] DATABASE_URL已配置
- [ ] 所有表已创建成功
- [ ] 数据库连接测试通过
- [ ] 积分系统正常工作
- [ ] 用户认证集成正常

## 🚀 **快速设置命令**

### **一键设置 (推荐)**
```bash
# 1. 测试数据库连接
pnpm test:db

# 2. 自动设置数据库 (如果连接成功)
pnpm setup:supabase
```

### **手动设置步骤**
```bash
# 1. 推送表结构
pnpm db:push

# 2. 查看数据库
pnpm db:studio

# 3. 启动开发服务器
pnpm dev
```

## 📋 **设置检查清单**

### **环境配置**
- [ ] 访问 https://supabase.com/dashboard/projects
- [ ] 选择项目: hzzloyal's Project (hqdberrfnpamslupzvwt)
- [ ] 获取数据库连接字符串
- [ ] 更新 .env.development 中的 DATABASE_URL

### **数据库设置**
- [ ] 运行 `pnpm test:db` 测试连接
- [ ] 运行 `pnpm db:push` 创建表
- [ ] 运行 `pnpm db:studio` 验证表结构

### **功能验证**
- [ ] 用户注册/登录正常
- [ ] 积分系统显示正确
- [ ] LipSync编辑器可以访问
- [ ] 文件上传功能正常

**🎉 完成后，您的网站就可以正常使用Supabase数据库了！**
