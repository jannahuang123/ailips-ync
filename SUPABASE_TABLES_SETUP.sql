-- =====================================================
-- 🗄️ ShipAny + LipSync 数据库表创建脚本
-- 项目: https://kaaidnmoyhcffsgrpcge.supabase.co
-- 说明: 一键复制到Supabase SQL编辑器执行
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

-- 创建用户表索引
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

-- 创建订单表索引
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

-- 创建API密钥表索引
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

-- 创建积分表索引
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

-- 创建文章表索引
CREATE INDEX IF NOT EXISTS idx_posts_uuid ON posts(uuid);
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

-- 创建推荐表索引
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

-- 创建反馈表索引
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

-- 创建项目表索引
CREATE INDEX IF NOT EXISTS idx_projects_uuid ON projects(uuid);
CREATE INDEX IF NOT EXISTS idx_projects_user_uuid ON projects(user_uuid);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- 9. LipSync任务表 (LipSync Tasks) - 核心表
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

-- 创建任务表索引
CREATE INDEX IF NOT EXISTS idx_lipsync_tasks_project_uuid ON lipsync_tasks(project_uuid);
CREATE INDEX IF NOT EXISTS idx_lipsync_tasks_status ON lipsync_tasks(status);
CREATE INDEX IF NOT EXISTS idx_lipsync_tasks_created_at ON lipsync_tasks(created_at);

-- =====================================================
-- 🎯 插入测试数据 (可选)
-- =====================================================

-- 插入测试积分类型数据
INSERT INTO credits (trans_no, user_uuid, trans_type, credits, created_at) VALUES
('TEST_INIT_001', 'test-user-uuid', 'new_user', 50, NOW()),
('TEST_LIPSYNC_001', 'test-user-uuid', 'lipsync_medium', -10, NOW())
ON CONFLICT (trans_no) DO NOTHING;

-- =====================================================
-- 🔧 创建有用的视图 (可选)
-- =====================================================

-- 用户积分余额视图
CREATE OR REPLACE VIEW user_credit_balance AS
SELECT 
    user_uuid,
    SUM(credits) as total_credits,
    COUNT(*) as transaction_count,
    MAX(created_at) as last_transaction
FROM credits 
GROUP BY user_uuid;

-- 项目统计视图
CREATE OR REPLACE VIEW project_stats AS
SELECT 
    user_uuid,
    COUNT(*) as total_projects,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_projects,
    SUM(credits_consumed) as total_credits_used
FROM projects 
GROUP BY user_uuid;

-- =====================================================
-- ✅ 表创建完成！
-- 说明: 所有表已创建，包含完整的索引优化
-- 下一步: 更新 .env.development 中的 DATABASE_URL
-- =====================================================
