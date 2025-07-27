# 🚀 Vercel部署状态检查

## 📋 **检查清单**

### **1. Vercel API测试**
```bash
# 测试Vercel部署的API端点
npm run test:vercel https://your-vercel-domain.vercel.app

# 检查内容:
✅ 网站可访问性
✅ API端点响应
✅ 数据库连接
✅ AI服务配置
```

### **2. S3存储配置测试**
```bash
# 测试S3存储配置
npm run test:storage

# 检查内容:
✅ 环境变量配置
✅ S3连接测试
✅ 文件上传功能
✅ 文件下载功能
✅ 权限配置
```

### **3. 数据库连接测试**
```bash
# 测试Supabase数据库
npm run test:db

# 检查内容:
✅ 数据库连接
✅ 表结构完整性
✅ 基本CRUD操作
```

## 🔧 **必需的环境变量**

### **核心配置 (必须)**
```bash
# 数据库
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.kaaidnmoyhcffsgrpcge.supabase.co:5432/postgres

# 认证
AUTH_SECRET=Zt3BXVudzzRq2R2WBqhwRy1dNMq48Gg9zKAYq7YwSL0=
AUTH_URL=https://your-vercel-domain.vercel.app/api/auth
AUTH_TRUST_HOST=true

# 网站
NEXT_PUBLIC_WEB_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_PROJECT_NAME=LipSyncVideo
ADMIN_EMAILS=your-email@example.com
```

### **S3存储配置 (必须)**
```bash
# 文件存储 - LipSync功能必需
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY=your-access-key
STORAGE_SECRET_KEY=your-secret-key
STORAGE_BUCKET=your-bucket-name
STORAGE_DOMAIN=https://your-bucket.s3.amazonaws.com
```

### **AI服务配置 (推荐)**
```bash
# AI服务 - LipSync生成功能
VEO3_API_KEY=your-veo3-api-key
DID_API_KEY=your-did-api-key

# Google认证 (用户登录)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true

# Stripe支付 (积分充值)
STRIPE_PUBLIC_KEY=pk_test_your-stripe-key
STRIPE_PRIVATE_KEY=sk_test_your-stripe-key
```

## 🎯 **功能测试步骤**

### **Step 1: 基础功能测试**
```
1. 访问网站首页
2. 检查LipSync编辑器是否加载
3. 测试用户注册/登录
4. 验证积分余额显示
```

### **Step 2: 文件上传测试**
```
1. 上传测试图片 (JPG/PNG)
2. 检查文件是否保存到S3
3. 验证文件URL可访问
4. 测试文件大小限制
```

### **Step 3: LipSync功能测试**
```
1. 选择文本输入模式
2. 输入测试文本
3. 点击生成按钮
4. 检查积分是否扣除
5. 验证任务是否创建
```

### **Step 4: API端点测试**
```
1. /api/get-user-credits - 积分查询
2. /api/upload/image - 图片上传
3. /api/tts/generate - 文本转语音
4. /api/lipsync/create - 创建项目
5. /api/lipsync/status/[id] - 状态查询
```

## 🚨 **常见问题排查**

### **问题1: 网站无法访问**
```
症状: 404 或 500 错误
排查:
1. 检查Vercel部署状态
2. 查看部署日志
3. 验证域名配置
4. 检查环境变量
```

### **问题2: 数据库连接失败**
```
症状: "Database connection failed"
排查:
1. 检查DATABASE_URL格式
2. 验证Supabase项目状态
3. 确认密码正确
4. 测试网络连接
```

### **问题3: 文件上传失败**
```
症状: "Upload failed" 或 403错误
排查:
1. 检查S3配置
2. 验证访问密钥权限
3. 确认存储桶CORS设置
4. 检查文件大小限制
```

### **问题4: AI服务不可用**
```
症状: "AI service unavailable"
排查:
1. 检查API密钥有效性
2. 验证服务商状态
3. 确认账户余额
4. 检查网络连接
```

### **问题5: 积分系统异常**
```
症状: 积分不显示或扣除失败
排查:
1. 检查数据库连接
2. 验证用户认证状态
3. 确认credits表结构
4. 检查API权限
```

## 📊 **性能监控**

### **关键指标**
```
🌐 网站响应时间: < 2秒
📤 文件上传速度: > 1MB/s
🗄️ 数据库查询: < 500ms
🤖 AI处理时间: 2-7分钟
💳 积分操作: < 1秒
```

### **监控工具**
```
• Vercel Analytics - 网站性能
• Supabase Dashboard - 数据库监控
• S3 CloudWatch - 存储监控
• 自定义日志 - 业务指标
```

## 🔍 **调试工具**

### **Vercel调试**
```bash
# 查看部署日志
vercel logs https://your-vercel-domain.vercel.app

# 查看函数日志
vercel logs --follow

# 本地调试
vercel dev
```

### **数据库调试**
```bash
# 连接数据库
psql $DATABASE_URL

# 查看表结构
\dt

# 查看用户数据
SELECT * FROM users LIMIT 5;
```

### **S3调试**
```bash
# 测试存储配置
npm run test:storage

# 查看存储桶内容
aws s3 ls s3://your-bucket-name --recursive
```

## 📈 **优化建议**

### **性能优化**
```
1. 启用Vercel Edge Functions
2. 配置CDN缓存策略
3. 优化图片压缩
4. 使用数据库连接池
5. 实现API响应缓存
```

### **成本优化**
```
1. 选择合适的S3存储类别
2. 设置文件生命周期策略
3. 监控API调用次数
4. 优化数据库查询
5. 使用免费额度服务
```

### **安全优化**
```
1. 启用HTTPS强制跳转
2. 配置CSP安全策略
3. 限制文件上传类型
4. 实现访问频率限制
5. 定期更新依赖包
```

## 🎉 **部署成功标志**

### **基础功能正常** ✅
- 网站可以正常访问
- 用户可以注册和登录
- 积分系统正常显示
- LipSync编辑器界面完整

### **核心功能可用** ✅
- 文件上传功能正常
- S3存储连接成功
- 数据库读写正常
- API端点响应正确

### **高级功能就绪** ✅
- AI服务配置完成
- 支付系统集成
- 错误处理完善
- 性能监控到位

## 📞 **技术支持**

### **获取帮助**
```
1. 查看详细文档和指南
2. 运行自动化测试脚本
3. 检查服务状态页面
4. 联系技术支持团队
```

### **报告问题**
```
请提供以下信息:
• 错误截图或日志
• 复现步骤
• 环境配置信息
• 浏览器和设备信息
```

**🚀 完成以上检查后，您的LipSync平台就可以正式投入使用了！**

---

## 📚 **相关文档**

- `S3_STORAGE_SETUP_GUIDE.md` - S3存储配置指南
- `VERCEL_DEPLOYMENT_GUIDE.md` - Vercel部署指南
- `scripts/test-vercel-api.js` - API测试脚本
- `scripts/test-storage-config.js` - 存储测试脚本
