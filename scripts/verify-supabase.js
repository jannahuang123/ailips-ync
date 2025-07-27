#!/usr/bin/env node

/**
 * Supabase数据库验证脚本
 * 验证所有表格是否正确创建
 */

const fs = require('fs');

console.log('🔍 Supabase数据库验证工具\n');

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
  
  if (!databaseUrl || !databaseUrl[1] || databaseUrl[1].includes('[YOUR-PASSWORD]')) {
    console.log('⚠️  DATABASE_URL 未正确配置');
    console.log('\n📝 请按以下步骤配置：');
    console.log('1. 访问 https://supabase.com/dashboard/project/kaaidnmoyhcffsgrpcge/settings/database');
    console.log('2. 复制 Connection string (URI format)');
    console.log('3. 替换 .env.development 中的 [YOUR-PASSWORD] 为实际密码');
    console.log('\n正确格式:');
    console.log('DATABASE_URL="postgresql://postgres:your_actual_password@db.kaaidnmoyhcffsgrpcge.supabase.co:5432/postgres"');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL 已配置');
  return databaseUrl[1];
}

// 验证表结构
async function verifyTables(databaseUrl) {
  console.log('\n🔍 验证数据库表...');
  
  const expectedTables = [
    'users', 'orders', 'apikeys', 'credits', 
    'posts', 'affiliates', 'feedbacks', 
    'projects', 'lipsync_tasks'
  ];
  
  const verifyScript = `
    const { Client } = require('pg');
    const client = new Client({ connectionString: '${databaseUrl}' });
    
    async function verifyTables() {
      try {
        await client.connect();
        console.log('✅ 数据库连接成功');
        
        const result = await client.query(\`
          SELECT table_name, 
                 (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
          FROM information_schema.tables t
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name
        \`);
        
        const tables = result.rows;
        const expectedTables = ${JSON.stringify(expectedTables)};
        
        console.log('\\n📊 发现的表:');
        tables.forEach(table => {
          const status = expectedTables.includes(table.table_name) ? '✅' : '❓';
          console.log(\`   \${status} \${table.table_name} (\${table.column_count} 列)\`);
        });
        
        const foundTableNames = tables.map(t => t.table_name);
        const missingTables = expectedTables.filter(table => !foundTableNames.includes(table));
        
        if (missingTables.length > 0) {
          console.log('\\n❌ 缺少表:', missingTables.join(', '));
          console.log('\\n🔧 解决方案:');
          console.log('1. 访问 https://supabase.com/dashboard/project/kaaidnmoyhcffsgrpcge/sql');
          console.log('2. 复制 SUPABASE_COMPLETE_SETUP.md 中的SQL脚本');
          console.log('3. 执行SQL脚本创建缺少的表');
          process.exit(1);
        }
        
        console.log('\\n✅ 所有必需的表都已创建');
        
        // 验证关键表的结构
        await verifyTableStructure();
        
        await client.end();
        
      } catch (error) {
        console.error('❌ 数据库验证失败:', error.message);
        console.log('\\n🔧 常见问题解决:');
        console.log('1. 检查数据库密码是否正确');
        console.log('2. 确认Supabase项目正在运行');
        console.log('3. 验证网络连接');
        process.exit(1);
      }
    }
    
    async function verifyTableStructure() {
      console.log('\\n🔍 验证关键表结构...');
      
      // 验证users表
      const usersColumns = await client.query(\`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      \`);
      
      const requiredUserColumns = ['uuid', 'email', 'created_at'];
      const userColumnNames = usersColumns.rows.map(col => col.column_name);
      const missingUserColumns = requiredUserColumns.filter(col => !userColumnNames.includes(col));
      
      if (missingUserColumns.length > 0) {
        console.log(\`❌ users表缺少列: \${missingUserColumns.join(', ')}\`);
      } else {
        console.log('✅ users表结构正确');
      }
      
      // 验证credits表
      const creditsColumns = await client.query(\`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'credits' 
        ORDER BY ordinal_position
      \`);
      
      const requiredCreditColumns = ['user_uuid', 'trans_type', 'credits'];
      const creditColumnNames = creditsColumns.rows.map(col => col.column_name);
      const missingCreditColumns = requiredCreditColumns.filter(col => !creditColumnNames.includes(col));
      
      if (missingCreditColumns.length > 0) {
        console.log(\`❌ credits表缺少列: \${missingCreditColumns.join(', ')}\`);
      } else {
        console.log('✅ credits表结构正确');
      }
      
      // 验证projects表
      const projectsColumns = await client.query(\`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'projects' 
        ORDER BY ordinal_position
      \`);
      
      const requiredProjectColumns = ['uuid', 'user_uuid', 'status'];
      const projectColumnNames = projectsColumns.rows.map(col => col.column_name);
      const missingProjectColumns = requiredProjectColumns.filter(col => !projectColumnNames.includes(col));
      
      if (missingProjectColumns.length > 0) {
        console.log(\`❌ projects表缺少列: \${missingProjectColumns.join(', ')}\`);
      } else {
        console.log('✅ projects表结构正确');
      }
    }
    
    verifyTables().catch(console.error);
  `;
  
  try {
    // 检查pg依赖
    try {
      require('pg');
    } catch (error) {
      console.log('📦 安装pg依赖...');
      const { execSync } = require('child_process');
      execSync('npm install pg --legacy-peer-deps', { stdio: 'inherit' });
    }
    
    fs.writeFileSync('/tmp/verify-supabase.js', verifyScript);
    const { execSync } = require('child_process');
    execSync('node /tmp/verify-supabase.js', { stdio: 'inherit' });
    fs.unlinkSync('/tmp/verify-supabase.js');
    
  } catch (error) {
    console.error('❌ 表验证失败');
    console.log('\n🔧 手动验证方法:');
    console.log('1. 访问 https://supabase.com/dashboard/project/kaaidnmoyhcffsgrpcge/editor');
    console.log('2. 检查左侧表列表是否包含所有9个表');
    console.log('3. 如果缺少表，请执行 SUPABASE_COMPLETE_SETUP.md 中的SQL脚本');
    process.exit(1);
  }
}

// 测试基本功能
async function testBasicFunctions() {
  console.log('\n🧪 测试基本功能...');
  
  try {
    // 测试drizzle连接
    const { execSync } = require('child_process');
    console.log('测试drizzle studio连接...');
    
    // 这里只是检查命令是否存在，不实际启动
    execSync('npx drizzle-kit --version', { stdio: 'pipe' });
    console.log('✅ Drizzle工具正常');
    
  } catch (error) {
    console.log('⚠️  Drizzle工具可能需要安装');
  }
}

// 主执行流程
async function main() {
  try {
    const databaseUrl = checkEnvironment();
    await verifyTables(databaseUrl);
    await testBasicFunctions();
    
    console.log('\n🎉 Supabase数据库验证完成！');
    console.log('\n📋 下一步操作：');
    console.log('1. 运行 npm run dev 启动开发服务器');
    console.log('2. 访问 http://localhost:3001 测试网站');
    console.log('3. 运行 npm run db:studio 查看数据库');
    console.log('\n🔗 有用的链接：');
    console.log('• Supabase控制台: https://supabase.com/dashboard/project/kaaidnmoyhcffsgrpcge');
    console.log('• 表编辑器: https://supabase.com/dashboard/project/kaaidnmoyhcffsgrpcge/editor');
    console.log('• SQL编辑器: https://supabase.com/dashboard/project/kaaidnmoyhcffsgrpcge/sql');
    
  } catch (error) {
    console.error('\n❌ 验证过程中出现错误:', error.message);
    console.log('\n📖 请查看 SUPABASE_COMPLETE_SETUP.md 获取详细帮助');
    process.exit(1);
  }
}

main();
