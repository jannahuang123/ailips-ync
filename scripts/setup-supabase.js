#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🗄️ Supabase数据库设置向导\n');

// 检查环境变量
function checkEnvironment() {
  console.log('📋 检查环境配置...');
  
  const envPath = '.env.development';
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.development 文件不存在');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const databaseUrl = envContent.match(/DATABASE_URL\s*=\s*"([^"]*)"/);
  
  if (!databaseUrl || !databaseUrl[1]) {
    console.log('⚠️  DATABASE_URL 未配置');
    console.log('\n📝 请按以下步骤配置：');
    console.log('1. 访问 https://supabase.com/dashboard/projects');
    console.log('2. 选择项目: hzzloyal\'s Project');
    console.log('3. 进入 Settings → Database');
    console.log('4. 复制 Connection string (URI format)');
    console.log('5. 更新 .env.development 中的 DATABASE_URL');
    console.log('\n格式示例:');
    console.log('DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.hqdberrfnpamslupzvwt.supabase.co:5432/postgres"');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL 已配置');
  return databaseUrl[1];
}

// 测试数据库连接
function testConnection(databaseUrl) {
  console.log('\n🔌 测试数据库连接...');
  
  try {
    // 使用 node-postgres 测试连接
    const testScript = `
      const { Client } = require('pg');
      const client = new Client({ connectionString: '${databaseUrl}' });
      
      client.connect()
        .then(() => {
          console.log('✅ 数据库连接成功');
          return client.query('SELECT version()');
        })
        .then((result) => {
          console.log('📊 PostgreSQL版本:', result.rows[0].version.split(' ')[1]);
          client.end();
        })
        .catch((err) => {
          console.error('❌ 数据库连接失败:', err.message);
          process.exit(1);
        });
    `;
    
    // 临时创建测试文件
    fs.writeFileSync('/tmp/test-db.js', testScript);
    execSync('node /tmp/test-db.js', { stdio: 'inherit' });
    fs.unlinkSync('/tmp/test-db.js');
    
  } catch (error) {
    console.error('❌ 连接测试失败:', error.message);
    console.log('\n🔧 请检查：');
    console.log('1. DATABASE_URL 格式是否正确');
    console.log('2. 数据库密码是否正确');
    console.log('3. 网络连接是否正常');
    process.exit(1);
  }
}

// 推送数据库表结构
function pushSchema() {
  console.log('\n📊 创建数据库表...');
  
  try {
    console.log('正在推送表结构到Supabase...');
    execSync('pnpm db:push', { stdio: 'inherit' });
    console.log('✅ 数据库表创建成功');
  } catch (error) {
    console.log('⚠️  db:push 失败，尝试使用迁移方式...');
    
    try {
      console.log('生成迁移文件...');
      execSync('pnpm db:generate', { stdio: 'inherit' });
      
      console.log('执行迁移...');
      execSync('pnpm db:migrate', { stdio: 'inherit' });
      
      console.log('✅ 数据库迁移成功');
    } catch (migrateError) {
      console.error('❌ 数据库表创建失败');
      console.log('\n🔧 手动解决方案：');
      console.log('1. 访问 Supabase 控制台');
      console.log('2. 进入 SQL Editor');
      console.log('3. 执行 SUPABASE_SETUP_GUIDE.md 中的 SQL 语句');
      process.exit(1);
    }
  }
}

// 验证表结构
function verifyTables() {
  console.log('\n🔍 验证表结构...');
  
  const expectedTables = [
    'users', 'orders', 'apikeys', 'credits', 
    'posts', 'affiliates', 'feedbacks', 
    'projects', 'lipsync_tasks'
  ];
  
  const verifyScript = `
    const { Client } = require('pg');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    
    async function verifyTables() {
      await client.connect();
      
      const result = await client.query(\`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      \`);
      
      const tables = result.rows.map(row => row.table_name);
      const expectedTables = ${JSON.stringify(expectedTables)};
      
      console.log('📋 发现的表:', tables.join(', '));
      
      const missingTables = expectedTables.filter(table => !tables.includes(table));
      if (missingTables.length > 0) {
        console.log('❌ 缺少表:', missingTables.join(', '));
        process.exit(1);
      }
      
      console.log('✅ 所有表都已创建');
      await client.end();
    }
    
    verifyTables().catch(console.error);
  `;
  
  try {
    fs.writeFileSync('/tmp/verify-tables.js', verifyScript);
    execSync('node /tmp/verify-tables.js', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: checkEnvironment() }
    });
    fs.unlinkSync('/tmp/verify-tables.js');
  } catch (error) {
    console.error('❌ 表验证失败');
    process.exit(1);
  }
}

// 初始化测试数据
function initializeTestData() {
  console.log('\n🎯 初始化测试数据...');
  
  const initScript = `
    const { Client } = require('pg');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    
    async function initData() {
      await client.connect();
      
      // 检查是否已有测试数据
      const existingCredits = await client.query(
        "SELECT COUNT(*) FROM credits WHERE trans_no LIKE 'TEST_%'"
      );
      
      if (parseInt(existingCredits.rows[0].count) > 0) {
        console.log('✅ 测试数据已存在');
        await client.end();
        return;
      }
      
      // 插入测试积分记录
      await client.query(\`
        INSERT INTO credits (trans_no, user_uuid, trans_type, credits, created_at) 
        VALUES ('TEST_INIT_001', 'test-user-uuid', 'new_user', 50, NOW())
      \`);
      
      console.log('✅ 测试数据初始化完成');
      await client.end();
    }
    
    initData().catch(console.error);
  `;
  
  try {
    fs.writeFileSync('/tmp/init-data.js', initScript);
    execSync('node /tmp/init-data.js', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: checkEnvironment() }
    });
    fs.unlinkSync('/tmp/init-data.js');
  } catch (error) {
    console.log('⚠️  测试数据初始化失败，但不影响主要功能');
  }
}

// 主执行流程
async function main() {
  try {
    const databaseUrl = checkEnvironment();
    testConnection(databaseUrl);
    pushSchema();
    verifyTables();
    initializeTestData();
    
    console.log('\n🎉 Supabase数据库设置完成！');
    console.log('\n📋 后续步骤：');
    console.log('1. 运行 pnpm db:studio 查看数据库');
    console.log('2. 访问 http://localhost:3001 测试网站');
    console.log('3. 查看 SUPABASE_SETUP_GUIDE.md 了解更多');
    
  } catch (error) {
    console.error('\n❌ 设置过程中出现错误:', error.message);
    console.log('\n📖 请查看 SUPABASE_SETUP_GUIDE.md 获取详细帮助');
    process.exit(1);
  }
}

// 检查依赖
function checkDependencies() {
  try {
    require('pg');
  } catch (error) {
    console.log('📦 安装必要依赖...');
    execSync('npm install pg', { stdio: 'inherit' });
  }
}

checkDependencies();
main();
