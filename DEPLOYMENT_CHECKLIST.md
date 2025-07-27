
# 🚀 Vercel部署清单

## 📋 部署前准备
- [ ] 代码已推送到GitHub
- [ ] Vercel项目已连接GitHub仓库
- [ ] Supabase项目正常运行

## 🗄️ 数据库设置
- [ ] 访问 https://kaaidnmoyhcffsgrpcge.supabase.co/project/default/sql
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
