#!/usr/bin/env node

/**
 * Supabase设置验证脚本
 * 检查数据库连接和表创建状态
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Supabase设置验证');
console.log('==================\n');

class SupabaseVerifier {
  constructor() {
    this.envPath = '.env.development';
    this.expectedTables = [
      'users', 'credits', 'orders', 'projects', 'lipsync_tasks',
      'apikeys', 'posts', 'feedbacks', 'affiliates'
    ];
  }

  async run() {
    try {
      console.log('📋 验证步骤：');
      console.log('1. 检查环境变量配置');
      console.log('2. 验证数据库连接');
      console.log('3. 检查表结构');
      console.log('4. 测试基本功能\n');

      await this.checkEnvironment();
      await this.verifyConnection();
      await this.checkTables();
      await this.testBasicFunctions();
      
      this.printSuccess();
    } catch (error) {
      this.printError(error);
    }
  }

  async checkEnvironment() {
    console.log('🔍 检查环境变量...');
    
    if (!fs.existsSync(this.envPath)) {
      throw new Error(`环境变量文件不存在: ${this.envPath}`);
    }

    const envContent = fs.readFileSync(this.envPath, 'utf-8');
    const databaseUrlMatch = envContent.match(/DATABASE_URL\s*=\s*"([^"]*)"/);
    
    if (!databaseUrlMatch || !databaseUrlMatch[1]) {
      throw new Error('DATABASE_URL 未配置');
    }

    const databaseUrl = databaseUrlMatch[1];
    
    if (databaseUrl.includes('[YOUR-PASSWORD]')) {
      console.log('⚠️  DATABASE_URL 包含占位符');
      console.log('\n📝 请更新 .env.development 文件：');
      console.log('将 [YOUR-PASSWORD] 替换为您的实际Supabase数据库密码\n');
      throw new Error('DATABASE_URL 需要配置实际密码');
    }

    if (!databaseUrl.includes('kaaidnmoyhcffsgrpcge.supabase.co')) {
      console.log('⚠️  DATABASE_URL 项目ID不匹配');
      console.log('期望包含: kaaidnmoyhcffsgrpcge.supabase.co');
      console.log('实际配置:', databaseUrl);
      throw new Error('DATABASE_URL 项目ID不正确');
    }

    console.log('✅ 环境变量配置正确');
    console.log(`📊 项目: kaaidnmoyhcffsgrpcge.supabase.co`);
  }

  async verifyConnection() {
    console.log('\n🔌 验证数据库连接...');
    
    try {
      // 检查是否安装了pg依赖
      try {
        require('pg');
      } catch (error) {
        console.log('📦 安装数据库依赖...');
        const { execSync } = require('child_process');
        execSync('npm install pg --legacy-peer-deps', { stdio: 'inherit' });
      }

      // 测试连接
      const { Client } = require('pg');
      const envContent = fs.readFileSync(this.envPath, 'utf-8');
      const databaseUrlMatch = envContent.match(/DATABASE_URL\s*=\s*"([^"]*)"/);
      const databaseUrl = databaseUrlMatch[1];

      const client = new Client({ connectionString: databaseUrl });
      
      await client.connect();
      const result = await client.query('SELECT version()');
      await client.end();

      console.log('✅ 数据库连接成功');
      console.log(`📊 PostgreSQL版本: ${result.rows[0].version.split(' ')[1]}`);
      
    } catch (error) {
      console.log('❌ 数据库连接失败');
      console.log('\n🔧 请检查：');
      console.log('1. DATABASE_URL 格式是否正确');
      console.log('2. 数据库密码是否正确');
      console.log('3. 网络连接是否正常');
      console.log('4. Supabase项目是否正常运行');
      throw error;
    }
  }

  async checkTables() {
    console.log('\n📊 检查数据库表...');
    
    try {
      const { Client } = require('pg');
      const envContent = fs.readFileSync(this.envPath, 'utf-8');
      const databaseUrlMatch = envContent.match(/DATABASE_URL\s*=\s*"([^"]*)"/);
      const databaseUrl = databaseUrlMatch[1];

      const client = new Client({ connectionString: databaseUrl });
      await client.connect();

      // 查询所有表
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);

      const existingTables = result.rows.map(row => row.table_name);
      const missingTables = this.expectedTables.filter(table => !existingTables.includes(table));

      await client.end();

      console.log(`📋 发现 ${existingTables.length} 个表:`, existingTables.join(', '));

      if (missingTables.length > 0) {
        console.log(`❌ 缺少 ${missingTables.length} 个表:`, missingTables.join(', '));
        console.log('\n🔧 解决方案：');
        console.log('1. 访问 Supabase SQL编辑器:');
        console.log('   https://kaaidnmoyhcffsgrpcge.supabase.co/project/default/sql');
        console.log('2. 复制 SUPABASE_TABLES_SETUP.sql 文件内容');
        console.log('3. 粘贴到SQL编辑器并执行');
        throw new Error(`缺少必要的数据库表: ${missingTables.join(', ')}`);
      }

      console.log('✅ 所有必要的表都已创建');

    } catch (error) {
      if (error.message.includes('缺少必要的数据库表')) {
        throw error;
      }
      console.log('❌ 表检查失败:', error.message);
      throw new Error('无法检查数据库表结构');
    }
  }

  async testBasicFunctions() {
    console.log('\n🧪 测试基本功能...');
    
    try {
      const { Client } = require('pg');
      const envContent = fs.readFileSync(this.envPath, 'utf-8');
      const databaseUrlMatch = envContent.match(/DATABASE_URL\s*=\s*"([^"]*)"/);
      const databaseUrl = databaseUrlMatch[1];

      const client = new Client({ connectionString: databaseUrl });
      await client.connect();

      // 测试插入和查询
      const testUuid = `test-${Date.now()}`;
      
      // 插入测试积分记录
      await client.query(`
        INSERT INTO credits (trans_no, user_uuid, trans_type, credits) 
        VALUES ($1, $2, 'test', 100)
      `, [`TEST-${testUuid}`, testUuid]);

      // 查询测试记录
      const result = await client.query(`
        SELECT * FROM credits WHERE user_uuid = $1
      `, [testUuid]);

      // 清理测试数据
      await client.query(`
        DELETE FROM credits WHERE user_uuid = $1
      `, [testUuid]);

      await client.end();

      if (result.rows.length > 0) {
        console.log('✅ 数据库读写功能正常');
      } else {
        throw new Error('数据库写入测试失败');
      }

    } catch (error) {
      console.log('❌ 基本功能测试失败:', error.message);
      throw new Error('数据库基本功能异常');
    }
  }

  printSuccess() {
    console.log('\n🎉 Supabase设置验证通过！');
    console.log('========================\n');
    
    console.log('✅ 验证结果：');
    console.log('   • 环境变量配置正确');
    console.log('   • 数据库连接正常');
    console.log('   • 所有表已创建');
    console.log('   • 基本功能正常');
    
    console.log('\n🚀 下一步操作：');
    console.log('   1. 启动开发服务器: npm run dev');
    console.log('   2. 访问网站: http://localhost:3001');
    console.log('   3. 测试用户登录和LipSync功能');
    
    console.log('\n📚 有用的链接：');
    console.log('   • Supabase控制台: https://kaaidnmoyhcffsgrpcge.supabase.co');
    console.log('   • 数据库管理: npm run db:studio');
    console.log('   • SQL编辑器: https://kaaidnmoyhcffsgrpcge.supabase.co/project/default/sql');
  }

  printError(error) {
    console.log('\n❌ 验证失败');
    console.log('============\n');
    console.log('错误信息:', error.message);
    
    console.log('\n🔧 故障排除步骤：');
    console.log('1. 检查 .env.development 中的 DATABASE_URL');
    console.log('2. 确认 Supabase 项目正常运行');
    console.log('3. 执行 SUPABASE_TABLES_SETUP.sql 创建表');
    console.log('4. 重新运行此验证脚本');
    
    console.log('\n📖 详细指南：');
    console.log('   查看 SUPABASE_CONNECTION_GUIDE.md');
  }
}

// 运行验证
if (require.main === module) {
  const verifier = new SupabaseVerifier();
  verifier.run().catch(() => process.exit(1));
}

module.exports = SupabaseVerifier;
