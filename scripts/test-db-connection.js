#!/usr/bin/env node

const fs = require('fs');

console.log('🔌 测试Supabase数据库连接\n');

// 读取环境变量
function getDatabaseUrl() {
  const envPath = '.env.development';
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.development 文件不存在');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/DATABASE_URL\s*=\s*"([^"]*)"/);
  
  if (!match || !match[1]) {
    console.error('❌ DATABASE_URL 未配置');
    console.log('\n📝 请在 .env.development 中配置：');
    console.log('DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.hqdberrfnpamslupzvwt.supabase.co:5432/postgres"');
    process.exit(1);
  }

  return match[1];
}

// 测试连接
async function testConnection() {
  const databaseUrl = getDatabaseUrl();
  
  try {
    // 动态导入 pg
    const { Client } = await import('pg');
    const client = new Client.default({ connectionString: databaseUrl });
    
    console.log('🔌 正在连接数据库...');
    await client.connect();
    
    console.log('✅ 数据库连接成功！');
    
    // 测试查询
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL版本:', result.rows[0].version.split(' ')[1]);
    
    // 检查现有表
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log('📋 现有表:', tables.rows.map(row => row.table_name).join(', '));
    } else {
      console.log('📋 数据库中暂无表，需要运行 pnpm db:push 创建表');
    }
    
    await client.end();
    console.log('\n🎉 数据库连接测试完成！');
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.log('\n🔧 请检查：');
    console.log('1. DATABASE_URL 格式是否正确');
    console.log('2. 数据库密码是否正确');
    console.log('3. 网络连接是否正常');
    console.log('4. Supabase项目是否处于活跃状态');
    process.exit(1);
  }
}

testConnection();
