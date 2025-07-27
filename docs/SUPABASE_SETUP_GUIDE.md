# 🗄️ Supabase 数据库配置指南

## 📋 **第二阶段：Supabase 数据库配置**

### **步骤1: 创建 Supabase 项目**

#### 1.1 注册和登录 Supabase
```bash
# 访问 https://supabase.com
# 使用 GitHub 账户登录（推荐）
# 或创建新账户
```

#### 1.2 创建新项目
```bash
# 在 Supabase Dashboard 中：
# 1. 点击 "New Project"
# 2. 选择组织（或创建新组织）
# 3. 填写项目信息：
#    - Name: lipsyncvideo-production
#    - Database Password: [生成强密码并保存]
#    - Region: East US (Ohio) - 推荐
#    - Pricing Plan: Free tier（开始时）
# 4. 点击 "Create new project"
```

#### 1.3 等待项目初始化
```bash
# 项目创建需要 2-3 分钟
# 完成后会显示项目 Dashboard
```

### **步骤2: 获取数据库连接信息**

#### 2.1 获取连接字符串
```bash
# 在 Supabase Dashboard 中：
# 1. 进入 Settings → Database
# 2. 找到 "Connection string" 部分
# 3. 选择 "URI" 格式
# 4. 复制连接字符串，格式如下：
# postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### 2.2 获取 API 密钥
```bash
# 在 Supabase Dashboard 中：
# 1. 进入 Settings → API
# 2. 复制以下密钥：
#    - Project URL: https://[PROJECT-REF].supabase.co
#    - anon public key: eyJ...
#    - service_role secret key: eyJ... (仅服务端使用)
```

### **步骤3: 配置本地环境变量**

#### 3.1 创建 .env.local 文件
```bash
# 在项目根目录创建 .env.local
cat > .env.local << 'EOF'
# Supabase Database Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase API Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Web Configuration
NEXT_PUBLIC_WEB_URL="http://localhost:3000"
NEXT_PUBLIC_PROJECT_NAME="LipSyncVideo"

# Auth Configuration
AUTH_SECRET="Zt3BXVudzzRq2R2WBqhwRy1dNMq48Gg9zKAYq7YwSL0="
AUTH_URL="http://localhost:3000/api/auth"
AUTH_TRUST_HOST="true"
EOF
```

#### 3.2 验证数据库连接
```bash
# 测试数据库连接
npm run db:studio

# 如果成功，会在浏览器中打开 Drizzle Studio
# URL: https://local.drizzle.studio
```

### **步骤4: 运行数据库迁移**

#### 4.1 检查现有迁移文件
```bash
# 查看迁移文件
ls -la src/db/migrations/

# 应该看到类似文件：
# 0000_wealthy_squirrel_girl.sql
```

#### 4.2 执行数据库迁移
```bash
# 生成迁移（如果需要）
npm run db:generate

# 执行迁移到 Supabase
npm run db:migrate

# 推送 schema 到数据库
npm run db:push
```

#### 4.3 验证表结构
```bash
# 在 Supabase Dashboard 中：
# 1. 进入 Table Editor
# 2. 应该看到以下表：
#    - users
#    - orders
#    - invites
#    - blogs
#    - feedbacks
#    - lipsync_jobs (新增)
#    - user_credits (新增)
```

### **步骤5: 配置 Row Level Security (RLS)**

#### 5.1 启用 RLS 策略
```sql
-- 在 Supabase SQL Editor 中执行以下 SQL

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- 用户表策略：用户只能访问自己的数据
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = uuid);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = uuid);

-- 订单表策略：用户只能访问自己的订单
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid()::text = user_uuid);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid()::text = user_uuid);

-- 邀请表策略：用户可以查看和创建邀请
CREATE POLICY "Users can view invites" ON invites
  FOR SELECT USING (true);

CREATE POLICY "Users can create invites" ON invites
  FOR INSERT WITH CHECK (auth.uid()::text = user_uuid);

-- 博客表策略：所有人可以查看，管理员可以管理
CREATE POLICY "Anyone can view published blogs" ON blogs
  FOR SELECT USING (status = 'published');

-- 反馈表策略：用户可以创建反馈
CREATE POLICY "Users can create feedback" ON feedbacks
  FOR INSERT WITH CHECK (auth.uid()::text = user_uuid);
```

#### 5.2 创建 LipSync 相关表的 RLS 策略
```sql
-- LipSync 作业表策略
CREATE POLICY "Users can view own lipsync jobs" ON lipsync_jobs
  FOR SELECT USING (auth.uid()::text = user_uuid);

CREATE POLICY "Users can create own lipsync jobs" ON lipsync_jobs
  FOR INSERT WITH CHECK (auth.uid()::text = user_uuid);

CREATE POLICY "Users can update own lipsync jobs" ON lipsync_jobs
  FOR UPDATE USING (auth.uid()::text = user_uuid);

-- 用户积分表策略
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid()::text = user_uuid);

CREATE POLICY "System can update user credits" ON user_credits
  FOR UPDATE USING (true);
```

### **步骤6: 配置 Vercel 环境变量**

#### 6.1 添加数据库环境变量到 Vercel
```bash
# 添加数据库 URL
vercel env add DATABASE_URL development
# 输入完整的 PostgreSQL 连接字符串

vercel env add DATABASE_URL preview
# 输入相同的连接字符串

vercel env add DATABASE_URL production
# 输入相同的连接字符串

# 添加 Supabase API 配置
vercel env add NEXT_PUBLIC_SUPABASE_URL development
# 输入: https://[PROJECT-REF].supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
# 输入: 匿名密钥

vercel env add SUPABASE_SERVICE_ROLE_KEY development
# 输入: 服务角色密钥
```

#### 6.2 复制环境变量到其他环境
```bash
# 复制到预览环境
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview

# 复制到生产环境
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

### **步骤7: 测试数据库连接**

#### 7.1 本地测试
```bash
# 启动开发服务器
npm run dev

# 在浏览器中访问
# http://localhost:3000

# 检查控制台是否有数据库连接错误
```

#### 7.2 创建测试脚本
```bash
# 创建数据库测试脚本
cat > scripts/test-database.js << 'EOF'
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { users } = require('../src/db/schema');

async function testDatabase() {
  try {
    const client = postgres(process.env.DATABASE_URL);
    const db = drizzle(client);
    
    console.log('Testing database connection...');
    
    // 测试查询
    const result = await db.select().from(users).limit(1);
    console.log('✅ Database connection successful');
    console.log('Users table accessible:', result.length >= 0);
    
    await client.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testDatabase();
EOF

# 运行测试
node scripts/test-database.js
```

### **步骤8: 数据库备份和监控**

#### 8.1 配置自动备份
```bash
# 在 Supabase Dashboard 中：
# 1. 进入 Settings → Database
# 2. 找到 "Backups" 部分
# 3. 确认自动备份已启用（Free tier 有 7 天备份）
```

#### 8.2 设置监控告警
```bash
# 在 Supabase Dashboard 中：
# 1. 进入 Settings → Integrations
# 2. 配置 Webhook 通知（可选）
# 3. 设置数据库使用量告警
```

## ✅ **验证清单**

### **数据库连接验证**
- [ ] Supabase 项目创建成功
- [ ] 数据库连接字符串正确
- [ ] 本地可以连接数据库
- [ ] 迁移执行成功
- [ ] 表结构正确创建
- [ ] RLS 策略配置完成
- [ ] Vercel 环境变量设置完成

### **功能测试**
```bash
# 测试数据库操作
npm run db:studio

# 在 Drizzle Studio 中：
# 1. 查看所有表
# 2. 检查表结构
# 3. 尝试插入测试数据
# 4. 验证 RLS 策略
```

## 🔧 **故障排除**

### **常见问题解决方案**

1. **连接超时**
   ```bash
   # 检查网络连接
   ping db.[PROJECT-REF].supabase.co
   
   # 检查防火墙设置
   # 确保端口 5432 未被阻止
   ```

2. **认证失败**
   ```bash
   # 验证密码正确性
   # 在 Supabase Dashboard 重置数据库密码
   # 更新 DATABASE_URL 中的密码
   ```

3. **迁移失败**
   ```bash
   # 检查迁移文件语法
   cat src/db/migrations/*.sql
   
   # 手动执行 SQL
   # 在 Supabase SQL Editor 中逐条执行
   ```

4. **RLS 策略错误**
   ```bash
   # 临时禁用 RLS 进行测试
   ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
   
   # 测试完成后重新启用
   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
   ```

完成第二阶段后，您的数据库将完全配置并可以在本地和 Vercel 上正常工作。
