#!/usr/bin/env node

/**
 * LipSyncVideo 数据库初始化脚本
 * 使用方法: node scripts/init-database.js
 */

const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
require('dotenv').config({ path: '.env.local' });

async function initDatabase() {
  console.log('🗄️  LipSyncVideo 数据库初始化');
  console.log('================================\n');

  // 检查环境变量
  if (!process.env.DATABASE_URL) {
    console.error('❌ 错误: DATABASE_URL 环境变量未设置');
    console.log('请先运行: node scripts/setup-env.js');
    process.exit(1);
  }

  try {
    // 连接数据库
    console.log('📡 连接数据库...');
    const sql = postgres(process.env.DATABASE_URL, { max: 1 });
    const db = drizzle(sql);

    // 创建 LipSync 相关表的 SQL
    const createTablesSQL = `
      -- 确保 users 表有 LipSync 相关字段
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free',
      ADD COLUMN IF NOT EXISTS total_videos_created INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_video_created_at TIMESTAMP WITH TIME ZONE;

      -- 创建 projects 表
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 创建 lipsync_tasks 表
      CREATE TABLE IF NOT EXISTS lipsync_tasks (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        project_uuid VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'queued',
        progress INTEGER NOT NULL DEFAULT 0,
        error_message TEXT,
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 创建索引
      CREATE INDEX IF NOT EXISTS idx_projects_user_uuid ON projects(user_uuid);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
      CREATE INDEX IF NOT EXISTS idx_lipsync_tasks_project_uuid ON lipsync_tasks(project_uuid);
      CREATE INDEX IF NOT EXISTS idx_lipsync_tasks_status ON lipsync_tasks(status);

      -- 插入默认积分套餐数据
      INSERT INTO orders (order_no, user_uuid, user_email, amount, status, credits, currency, product_id, product_name, valid_months, created_at)
      VALUES 
        ('STARTER_PLAN', 'system', 'system@lipsyncvideo.net', 9900, 'completed', 100, 'USD', 'starter', 'Starter Plan - 100 Credits', 1, NOW()),
        ('STANDARD_PLAN', 'system', 'system@lipsyncvideo.net', 19900, 'completed', 300, 'USD', 'standard', 'Standard Plan - 300 Credits', 3, NOW()),
        ('PREMIUM_PLAN', 'system', 'system@lipsyncvideo.net', 39900, 'completed', 1000, 'USD', 'premium', 'Premium Plan - 1000 Credits', 12, NOW())
      ON CONFLICT (order_no) DO NOTHING;
    `;

    // 执行 SQL
    console.log('🔨 创建数据表...');
    await sql.unsafe(createTablesSQL);

    // 验证表创建
    console.log('✅ 验证表结构...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'orders', 'credits', 'projects', 'lipsync_tasks')
      ORDER BY table_name;
    `;

    console.log('📋 已创建的表:');
    tables.forEach(table => {
      console.log(`   ✓ ${table.table_name}`);
    });

    // 检查 projects 表结构
    const projectsColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      ORDER BY ordinal_position;
    `;

    console.log('\n📊 projects 表结构:');
    projectsColumns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    await sql.end();

    console.log('\n🎉 数据库初始化完成！');
    console.log('\n🚀 下一步操作:');
    console.log('1. 运行 npm run dev 启动开发服务器');
    console.log('2. 访问 http://localhost:3000 测试应用');
    console.log('3. 测试用户注册和登录功能');
    console.log('4. 测试积分系统和 LipSync 功能');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    console.log('\n🔧 故障排除建议:');
    console.log('1. 检查 DATABASE_URL 是否正确');
    console.log('2. 确保数据库服务正在运行');
    console.log('3. 检查数据库用户权限');
    process.exit(1);
  }
}

// 运行初始化
initDatabase();
