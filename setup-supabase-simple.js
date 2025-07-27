#!/usr/bin/env node

/**
 * 简化的Supabase设置脚本
 * 项目: kaaidnmoyhcffsgrpcge
 * URL: https://kaaidnmoyhcffsgrpcge.supabase.co
 */

const fs = require('fs');
const path = require('path');

console.log('🗄️ Supabase数据库对接指南');
console.log('项目ID: kaaidnmoyhcffsgrpcge');
console.log('项目URL: https://kaaidnmoyhcffsgrpcge.supabase.co\n');

// 检查环境变量配置
function checkEnvironmentConfig() {
  console.log('📋 Step 1: 检查环境配置...');
  
  const envPath = '.env.development';
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.development 文件不存在');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const databaseUrl = envContent.match(/DATABASE_URL\s*=\s*"([^"]*)"/);
  
  if (!databaseUrl || !databaseUrl[1]) {
    console.log('⚠️  DATABASE_URL 未配置\n');
    printSetupInstructions();
    return false;
  }

  // 检查是否是正确的Supabase URL
  if (!databaseUrl[1].includes('kaaidnmoyhcffsgrpcge')) {
    console.log('⚠️  DATABASE_URL 不匹配当前Supabase项目\n');
    printSetupInstructions();
    return false;
  }

  console.log('✅ DATABASE_URL 已正确配置');
  return true;
}

// 打印设置说明
function printSetupInstructions() {
  console.log('📝 请按以下步骤配置Supabase连接：\n');
  
  console.log('🔧 Step 1: 获取数据库连接字符串');
  console.log('1. 访问: https://supabase.com/dashboard/project/kaaidnmoyhcffsgrpcge');
  console.log('2. 点击左侧 Settings → Database');
  console.log('3. 找到 "Connection string" 部分');
  console.log('4. 选择 "URI" 格式');
  console.log('5. 复制连接字符串\n');
  
  console.log('📝 Step 2: 更新环境变量');
  console.log('编辑 .env.development 文件，找到这一行：');
  console.log('DATABASE_URL = ""');
  console.log('\n替换为您的连接字符串：');
  console.log('DATABASE_URL = "postgresql://postgres:[YOUR-PASSWORD]@db.kaaidnmoyhcffsgrpcge.supabase.co:5432/postgres"');
  console.log('\n⚠️  重要: 将 [YOUR-PASSWORD] 替换为您的实际数据库密码\n');
  
  console.log('🚀 Step 3: 推送数据库表');
  console.log('配置完成后运行：');
  console.log('npm run db:push\n');
  
  console.log('🔍 Step 4: 验证设置');
  console.log('npm run db:studio');
  console.log('npm run dev\n');
}

// 显示数据库表信息
function showDatabaseSchema() {
  console.log('📊 将创建的数据库表 (基于ShipAny架构):\n');
  
  const tables = [
    { name: 'users', description: '用户基础信息 (包含LipSync扩展字段)' },
    { name: 'orders', description: '订单和支付记录' },
    { name: 'apikeys', description: 'API密钥管理' },
    { name: 'credits', description: '积分交易记录 (支持lipsync类型)' },
    { name: 'posts', description: '博客文章' },
    { name: 'affiliates', description: '推荐系统' },
    { name: 'feedbacks', description: '用户反馈' },
    { name: 'projects', description: 'LipSync项目管理' },
    { name: 'lipsync_tasks', description: '异步任务队列' }
  ];
  
  tables.forEach(table => {
    console.log(`✅ ${table.name.padEnd(15)} - ${table.description}`);
  });
  console.log('');
}

// 显示Vercel配置提醒
function showVercelReminder() {
  console.log('☁️  Vercel环境变量配置提醒:\n');
  console.log('由于您已经配置到Vercel，请确保在Vercel控制台设置环境变量：');
  console.log('1. 访问 Vercel Dashboard');
  console.log('2. 选择您的项目');
  console.log('3. 进入 Settings → Environment Variables');
  console.log('4. 添加 DATABASE_URL 环境变量');
  console.log('5. 值为相同的Supabase连接字符串\n');
}

// 显示重要注意事项
function showImportantNotes() {
  console.log('⚠️  重要注意事项:\n');
  
  console.log('🔒 安全提醒:');
  console.log('• 妥善保管数据库密码');
  console.log('• 不要将 .env.development 提交到Git');
  console.log('• 生产环境和开发环境使用相同的数据库连接\n');
  
  console.log('📊 数据库限制:');
  console.log('• Supabase免费版有连接数限制');
  console.log('• 建议监控数据库使用情况');
  console.log('• ShipAny已配置合理的连接池设置\n');
  
  console.log('🔧 故障排除:');
  console.log('• 连接失败: 检查密码和网络');
  console.log('• 表创建失败: 检查数据库权限');
  console.log('• Vercel部署失败: 检查环境变量配置\n');
}

// 显示完成后的功能
function showAvailableFeatures() {
  console.log('🎉 对接完成后可用的功能:\n');
  
  const features = [
    '用户注册/登录系统 (Google/GitHub)',
    '积分获取和消费系统',
    'LipSync视频生成功能',
    '文件上传和管理',
    'Stripe支付和充值',
    '用户仪表板',
    '积分历史记录',
    '项目管理和历史'
  ];
  
  features.forEach(feature => {
    console.log(`✅ ${feature}`);
  });
  console.log('');
}

// 主函数
function main() {
  const isConfigured = checkEnvironmentConfig();
  
  if (!isConfigured) {
    showDatabaseSchema();
    showVercelReminder();
    showImportantNotes();
    console.log('📖 详细说明请查看: SUPABASE_INTEGRATION_GUIDE.md\n');
    return;
  }
  
  console.log('✅ 环境配置检查通过!\n');
  
  console.log('🚀 下一步操作:');
  console.log('1. npm run db:push    # 推送数据库表结构');
  console.log('2. npm run db:studio  # 查看数据库');
  console.log('3. npm run dev        # 启动开发服务器');
  console.log('4. 访问 http://localhost:3001 测试功能\n');
  
  showDatabaseSchema();
  showAvailableFeatures();
  
  console.log('🎯 完全复用ShipAny架构，零重复开发！');
  console.log('📖 详细文档: SUPABASE_INTEGRATION_GUIDE.md');
}

// 运行
main();
