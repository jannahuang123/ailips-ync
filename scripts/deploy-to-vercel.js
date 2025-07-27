#!/usr/bin/env node

/**
 * Vercel部署助手脚本
 * 帮助检查部署前的配置和准备工作
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel部署准备检查');
console.log('===================\n');

class VercelDeployHelper {
  constructor() {
    this.requiredFiles = [
      'SUPABASE_TABLES_SETUP.sql',
      '.env.vercel.template',
      'VERCEL_DEPLOYMENT_GUIDE.md'
    ];
    
    this.supabaseProjectUrl = 'https://kaaidnmoyhcffsgrpcge.supabase.co';
  }

  async run() {
    try {
      console.log('📋 检查步骤：');
      console.log('1. 验证必需文件');
      console.log('2. 检查项目配置');
      console.log('3. 生成部署清单');
      console.log('4. 提供部署指导\n');

      await this.checkRequiredFiles();
      await this.checkProjectConfig();
      await this.generateDeploymentChecklist();
      await this.provideDeploymentGuidance();
      
      this.printSuccess();
    } catch (error) {
      this.printError(error);
    }
  }

  async checkRequiredFiles() {
    console.log('📁 检查必需文件...');
    
    const missingFiles = [];
    
    for (const file of this.requiredFiles) {
      if (!fs.existsSync(file)) {
        missingFiles.push(file);
      } else {
        console.log(`✅ ${file}`);
      }
    }
    
    if (missingFiles.length > 0) {
      throw new Error(`缺少必需文件: ${missingFiles.join(', ')}`);
    }
    
    console.log('✅ 所有必需文件都存在');
  }

  async checkProjectConfig() {
    console.log('\n🔧 检查项目配置...');
    
    // 检查package.json
    if (!fs.existsSync('package.json')) {
      throw new Error('package.json 文件不存在');
    }
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    console.log(`✅ 项目名称: ${packageJson.name}`);
    console.log(`✅ Next.js版本: ${packageJson.dependencies.next || '未知'}`);
    
    // 检查vercel.json
    if (fs.existsSync('vercel.json')) {
      console.log('✅ vercel.json 配置存在');
    } else {
      console.log('⚠️  vercel.json 不存在，将使用默认配置');
    }
    
    // 检查数据库schema
    if (fs.existsSync('src/db/schema.ts')) {
      console.log('✅ 数据库schema定义存在');
    } else {
      throw new Error('数据库schema文件不存在');
    }
  }

  async generateDeploymentChecklist() {
    console.log('\n📋 生成部署清单...');
    
    const checklist = `
# 🚀 Vercel部署清单

## 📋 部署前准备
- [ ] 代码已推送到GitHub
- [ ] Vercel项目已连接GitHub仓库
- [ ] Supabase项目正常运行

## 🗄️ 数据库设置
- [ ] 访问 ${this.supabaseProjectUrl}/project/default/sql
- [ ] 复制 SUPABASE_TABLES_SETUP.sql 内容
- [ ] 在SQL编辑器中执行脚本
- [ ] 验证9个表已创建成功

## 🔧 Vercel环境变量配置
- [ ] DATABASE_URL (必须)
- [ ] AUTH_SECRET (必须)  
- [ ] NEXT_PUBLIC_WEB_URL (必须)
- [ ] AUTH_URL (必须)
- [ ] AUTH_GOOGLE_ID (推荐)
- [ ] AUTH_GOOGLE_SECRET (推荐)
- [ ] STRIPE_PUBLIC_KEY (推荐)
- [ ] STRIPE_PRIVATE_KEY (推荐)

## 🚀 部署执行
- [ ] 在Vercel中触发重新部署
- [ ] 等待部署完成
- [ ] 访问部署后的网站

## ✅ 功能验证
- [ ] 网站首页正常加载
- [ ] 用户注册功能正常
- [ ] 积分系统显示正常
- [ ] LipSync编辑器加载正常
- [ ] 数据库连接正常

## 📊 后续配置 (可选)
- [ ] 配置自定义域名
- [ ] 设置SSL证书
- [ ] 配置AI API密钥
- [ ] 设置文件存储
- [ ] 配置支付系统
`;

    fs.writeFileSync('DEPLOYMENT_CHECKLIST.md', checklist);
    console.log('✅ 部署清单已生成: DEPLOYMENT_CHECKLIST.md');
  }

  async provideDeploymentGuidance() {
    console.log('\n🎯 部署指导...');
    
    console.log('📖 详细步骤请查看:');
    console.log('   • VERCEL_DEPLOYMENT_GUIDE.md - 完整部署指南');
    console.log('   • .env.vercel.template - 环境变量模板');
    console.log('   • DEPLOYMENT_CHECKLIST.md - 部署清单');
    
    console.log('\n🔗 重要链接:');
    console.log(`   • Supabase项目: ${this.supabaseProjectUrl}`);
    console.log(`   • SQL编辑器: ${this.supabaseProjectUrl}/project/default/sql`);
    console.log('   • Vercel Dashboard: https://vercel.com/dashboard');
    
    console.log('\n⚡ 快速开始:');
    console.log('1. 在Supabase中执行SQL脚本创建表');
    console.log('2. 在Vercel中配置环境变量');
    console.log('3. 触发重新部署');
    console.log('4. 访问网站验证功能');
  }

  printSuccess() {
    console.log('\n🎉 部署准备完成！');
    console.log('================\n');
    
    console.log('✅ 检查结果：');
    console.log('   • 所有必需文件已准备');
    console.log('   • 项目配置检查通过');
    console.log('   • 部署清单已生成');
    console.log('   • 部署指导已提供');
    
    console.log('\n🚀 下一步操作：');
    console.log('1. 📖 阅读 VERCEL_DEPLOYMENT_GUIDE.md');
    console.log('2. 🗄️ 在Supabase中执行SQL脚本');
    console.log('3. 🔧 在Vercel中配置环境变量');
    console.log('4. 🚀 触发部署并验证功能');
    
    console.log('\n📋 使用清单：');
    console.log('   • DEPLOYMENT_CHECKLIST.md - 逐项检查');
    console.log('   • .env.vercel.template - 环境变量参考');
    console.log('   • SUPABASE_TABLES_SETUP.sql - 数据库脚本');
    
    console.log('\n🎯 目标：');
    console.log('   完成部署后，您将拥有一个完整的在线LipSync平台！');
  }

  printError(error) {
    console.log('\n❌ 准备检查失败');
    console.log('================\n');
    console.log('错误信息:', error.message);
    
    console.log('\n🔧 解决方案：');
    console.log('1. 确保所有必需文件存在');
    console.log('2. 检查项目结构完整性');
    console.log('3. 验证数据库配置文件');
    console.log('4. 重新运行此脚本');
    
    console.log('\n📖 获取帮助：');
    console.log('   查看 VERCEL_DEPLOYMENT_GUIDE.md 获取详细指导');
  }
}

// 运行部署助手
if (require.main === module) {
  const helper = new VercelDeployHelper();
  helper.run().catch(() => process.exit(1));
}

module.exports = VercelDeployHelper;
