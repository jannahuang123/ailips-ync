# 🗄️ Supabase完整对接指南 - 一键复制创建所有表格

## 📋 **您的Supabase项目信息**
- **项目URL**: https://kaaidnmoyhcffsgrpcge.supabase.co
- **已配置到Vercel**: ✅
- **需要创建**: 数据库表格

## 🚀 **一键设置步骤**

### **Step 1: 访问Supabase SQL编辑器**
```
1. 访问: https://supabase.com/dashboard/project/kaaidnmoyhcffsgrpcge
2. 点击左侧菜单 "SQL Editor"
3. 点击 "New query" 创建新查询
```

### **Step 2: 复制并执行以下SQL脚本**

#### **🔥 一键复制 - 完整数据库创建脚本**

```sql
-- =====================================================
-- ShipAny + LipSync 完整数据库表创建脚本
-- 基于 src/db/schema.ts 100% 复用
-- =====================================================

-- 1. 用户表 (Users)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    nickname VARCHAR(255),
    avatar_url VARCHAR(255),
    locale VARCHAR(50),
    signin_type VARCHAR(50),
    signin_ip VARCHAR(255),
    signin_provider VARCHAR(50),
    signin_openid VARCHAR(255),
    invite_code VARCHAR(255) NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    invited_by VARCHAR(255) NOT NULL DEFAULT '',
    is_affiliate BOOLEAN NOT NULL DEFAULT false,
    -- LipSync 专用字段
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free',
    total_videos_created INTEGER NOT NULL DEFAULT 0,
    last_video_created_at TIMESTAMPTZ
);

-- 用户表索引
CREATE UNIQUE INDEX IF NOT EXISTS email_provider_unique_idx ON users(email, signin_provider);
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. 订单表 (Orders)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
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

-- 订单表索引
CREATE INDEX IF NOT EXISTS idx_orders_user_uuid ON orders(user_uuid);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);

-- 3. API密钥表 (API Keys)
CREATE TABLE IF NOT EXISTS apikeys (
    id SERIAL PRIMARY KEY,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(100),
    user_uuid VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50)
);

-- API密钥表索引
CREATE INDEX IF NOT EXISTS idx_apikeys_user_uuid ON apikeys(user_uuid);
CREATE INDEX IF NOT EXISTS idx_apikeys_api_key ON apikeys(api_key);

-- 4. 积分表 (Credits) - 核心表
CREATE TABLE IF NOT EXISTS credits (
    id SERIAL PRIMARY KEY,
    trans_no VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_uuid VARCHAR(255) NOT NULL,
    trans_type VARCHAR(50) NOT NULL,
    credits INTEGER NOT NULL,
    order_no VARCHAR(255),
    expired_at TIMESTAMPTZ
);

-- 积分表索引
CREATE INDEX IF NOT EXISTS idx_credits_user_uuid ON credits(user_uuid);
CREATE INDEX IF NOT EXISTS idx_credits_trans_type ON credits(trans_type);
CREATE INDEX IF NOT EXISTS idx_credits_created_at ON credits(created_at);

-- 5. 博客文章表 (Posts)
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255),
    title VARCHAR(255),
    description TEXT,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50),
    cover_url VARCHAR(255),
    author_name VARCHAR(255),
    author_avatar_url VARCHAR(255),
    locale VARCHAR(50)
);

-- 博客表索引
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- 6. 推荐系统表 (Affiliates)
CREATE TABLE IF NOT EXISTS affiliates (
    id SERIAL PRIMARY KEY,
    user_uuid VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT '',
    invited_by VARCHAR(255) NOT NULL,
    paid_order_no VARCHAR(255) NOT NULL DEFAULT '',
    paid_amount INTEGER NOT NULL DEFAULT 0,
    reward_percent INTEGER NOT NULL DEFAULT 0,
    reward_amount INTEGER NOT NULL DEFAULT 0
);

-- 推荐表索引
CREATE INDEX IF NOT EXISTS idx_affiliates_user_uuid ON affiliates(user_uuid);
CREATE INDEX IF NOT EXISTS idx_affiliates_invited_by ON affiliates(invited_by);

-- 7. 用户反馈表 (Feedbacks)
CREATE TABLE IF NOT EXISTS feedbacks (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50),
    user_uuid VARCHAR(255),
    content TEXT,
    rating INTEGER
);

-- 反馈表索引
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_uuid ON feedbacks(user_uuid);
CREATE INDEX IF NOT EXISTS idx_feedbacks_rating ON feedbacks(rating);

-- 8. LipSync项目表 (Projects) - 核心表
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

-- 项目表索引
CREATE INDEX IF NOT EXISTS idx_projects_user_uuid ON projects(user_uuid);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_uuid ON projects(uuid);

-- 9. LipSync任务表 (LipSync Tasks)
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

-- 任务表索引
CREATE INDEX IF NOT EXISTS idx_lipsync_tasks_project_uuid ON lipsync_tasks(project_uuid);
CREATE INDEX IF NOT EXISTS idx_lipsync_tasks_status ON lipsync_tasks(status);

-- =====================================================
-- 初始化数据
-- =====================================================

-- 插入测试积分类型数据 (用于验证)
INSERT INTO credits (trans_no, user_uuid, trans_type, credits, created_at) 
VALUES ('INIT_TEST_001', 'system', 'system_init', 0, NOW())
ON CONFLICT (trans_no) DO NOTHING;

-- =====================================================
-- 权限设置 (Supabase RLS)
-- =====================================================

-- 启用行级安全 (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lipsync_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = uuid);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = uuid);

CREATE POLICY "Users can view own credits" ON credits FOR SELECT USING (auth.uid()::text = user_uuid);
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid()::text = user_uuid);
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid()::text = user_uuid);

-- =====================================================
-- 完成提示
-- =====================================================
SELECT 'ShipAny + LipSync 数据库创建完成! 🎉' as message;
```

### **Step 3: 执行SQL脚本**
```
1. 将上面的完整SQL脚本复制到Supabase SQL编辑器
2. 点击 "Run" 按钮执行
3. 等待执行完成 (大约30秒)
4. 看到 "ShipAny + LipSync 数据库创建完成! 🎉" 消息
```

### **Step 4: 验证表创建成功**
```
1. 点击左侧菜单 "Table Editor"
2. 确认看到以下9个表:
   ✅ users (用户表)
   ✅ orders (订单表)  
   ✅ apikeys (API密钥表)
   ✅ credits (积分表)
   ✅ posts (博客表)
   ✅ affiliates (推荐表)
   ✅ feedbacks (反馈表)
   ✅ projects (项目表)
   ✅ lipsync_tasks (任务表)
```

## 🔧 **配置环境变量**

### **更新 .env.development**
```bash
# 您的Supabase项目配置
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.kaaidnmoyhcffsgrpcge.supabase.co:5432/postgres"

# Supabase 公共配置 (如果需要)
NEXT_PUBLIC_SUPABASE_URL="https://kaaidnmoyhcffsgrpcge.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
```

**获取密钥位置**:
```
1. 访问: https://supabase.com/dashboard/project/kaaidnmoyhcffsgrpcge/settings/api
2. 复制 "anon public" 密钥
3. 复制数据库密码 (创建项目时设置的)
```

## ✅ **验证对接成功**

### **测试数据库连接**
```bash
# 在项目根目录运行
npm run db:studio
```

### **测试网站功能**
```bash
# 启动开发服务器
npm run dev

# 访问网站测试
open http://localhost:3001
```

### **功能验证清单**
- [ ] 用户可以注册/登录
- [ ] 积分系统正常显示
- [ ] LipSync编辑器可以使用
- [ ] 文件上传功能正常
- [ ] 积分扣除正常工作

## 🎯 **完全复用ShipAny功能**

### **立即可用的功能** ✅
- ✅ **用户系统**: 注册、登录、个人资料
- ✅ **积分系统**: 获取、消费、充值、历史
- ✅ **支付系统**: Stripe集成、订单管理
- ✅ **LipSync功能**: 视频生成、项目管理
- ✅ **文件上传**: 图片、视频、音频
- ✅ **用户仪表板**: 项目列表、积分余额

### **数据流程** ✅
```
用户注册 → 获得初始积分 → 使用LipSync → 扣除积分 → 生成视频 → 保存到projects表
```

**🎉 一键复制SQL脚本，30秒完成所有表格创建！完全基于ShipAny架构，零重复开发！**
