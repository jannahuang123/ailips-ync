# 🗄️ Supabase与网站对接指南

## 📋 **当前状态**
- ✅ Supabase项目已创建: `kaaidnmoyhcffsgrpcge`
- ✅ 项目URL: `https://kaaidnmoyhcffsgrpcge.supabase.co`
- ✅ 已配置到Vercel
- ❌ 需要配置本地开发环境
- ❌ 需要推送数据库表结构

## 🔧 **Step 1: 获取Supabase连接信息**

### **1.1 访问Supabase控制台**
```
https://supabase.com/dashboard/project/kaaidnmoyhcffsgrpcge
```

### **1.2 获取数据库连接字符串**
```
1. 进入项目控制台
2. 点击左侧 Settings → Database
3. 找到 "Connection string" 部分
4. 选择 "URI" 格式
5. 复制连接字符串
```

**连接字符串格式**:
```
postgresql://postgres:[YOUR-PASSWORD]@db.kaaidnmoyhcffsgrpcge.supabase.co:5432/postgres
```

⚠️ **重要**: 请使用您创建Supabase项目时设置的数据库密码替换 `[YOUR-PASSWORD]`

## 🔧 **Step 2: 配置本地环境变量**

### **2.1 更新 .env.development**
```bash
# 编辑 .env.development 文件，找到这一行：
DATABASE_URL = ""

# 替换为您的Supabase连接字符串：
DATABASE_URL = "postgresql://postgres:[YOUR-PASSWORD]@db.kaaidnmoyhcffsgrpcge.supabase.co:5432/postgres"
```

### **2.2 验证配置**
```bash
# 检查环境变量是否正确设置
grep DATABASE_URL .env.development
```

## 🚀 **Step 3: 推送数据库表结构**

### **3.1 推送ShipAny schema到Supabase**
```bash
# 推送所有表结构到Supabase
npm run db:push
```

如果遇到错误，尝试：
```bash
# 强制推送
npm run db:push -- --force
```

### **3.2 验证表创建成功**
```bash
# 打开数据库管理界面
npm run db:studio
```

或者访问Supabase控制台查看：
```
https://supabase.com/dashboard/project/kaaidnmoyhcffsgrpcge/editor
```

## 📊 **将创建的表 (基于ShipAny架构)**

### **用户系统表**
```sql
users          - 用户基础信息
apikeys        - API密钥管理
```

### **积分系统表**
```sql
credits        - 积分交易记录
orders         - 订单和支付记录
```

### **内容管理表**
```sql
posts          - 博客文章
feedbacks      - 用户反馈
affiliates     - 推荐系统
```

### **LipSync功能表**
```sql
projects       - LipSync项目管理
lipsync_tasks  - 异步任务队列
```

## ⚠️ **重要注意事项**

### **1. 密码安全**
- 🔒 **数据库密码**: 请妥善保管您的Supabase数据库密码
- 🔒 **环境变量**: 不要将 `.env.development` 提交到Git
- 🔒 **生产环境**: Vercel环境变量需要单独配置

### **2. Vercel环境变量配置**
由于您已经配置到Vercel，需要在Vercel控制台设置环境变量：

```
1. 访问 Vercel Dashboard
2. 选择您的项目
3. 进入 Settings → Environment Variables
4. 添加以下变量：

DATABASE_URL = "postgresql://postgres:[YOUR-PASSWORD]@db.kaaidnmoyhcffsgrpcge.supabase.co:5432/postgres"
```

### **3. 数据库权限**
```sql
-- 确保postgres用户有足够权限
-- 在Supabase SQL编辑器中执行：
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

### **4. 连接池限制**
- Supabase免费版有连接数限制
- 建议在生产环境使用连接池
- ShipAny已配置了合理的连接池设置

## 🔍 **验证对接成功**

### **4.1 测试数据库连接**
```bash
# 启动开发服务器
npm run dev

# 访问网站
open http://localhost:3001
```

### **4.2 检查功能**
- [ ] 用户可以正常注册/登录
- [ ] 积分系统正确显示余额
- [ ] LipSync编辑器可以正常使用
- [ ] 文件上传功能正常
- [ ] 数据正确保存到Supabase

### **4.3 查看数据库数据**
```bash
# 方法1: 使用Drizzle Studio
npm run db:studio

# 方法2: 访问Supabase控制台
# https://supabase.com/dashboard/project/kaaidnmoyhcffsgrpcge/editor
```

## 🚨 **常见问题排除**

### **问题1: 连接失败**
```bash
# 检查连接字符串格式
echo $DATABASE_URL

# 测试网络连接
ping db.kaaidnmoyhcffsgrpcge.supabase.co
```

**解决方案**:
- 确认密码正确
- 检查网络连接
- 验证Supabase项目状态

### **问题2: 表创建失败**
```bash
# 查看详细错误信息
npm run db:push --verbose
```

**解决方案**:
- 检查数据库权限
- 尝试手动在Supabase SQL编辑器中创建表
- 联系Supabase支持

### **问题3: Vercel部署失败**
**解决方案**:
- 确认Vercel环境变量正确设置
- 检查构建日志
- 验证数据库连接在生产环境中可用

## 🎯 **完全复用ShipAny功能**

### **认证系统** ✅
```typescript
// 完全复用NextAuth.js
import { useSession } from "next-auth/react";
const { data: session } = useSession();
```

### **积分系统** ✅
```typescript
// 完全复用积分服务
import { getUserCredits, decreaseCredits } from "@/services/credit";

// 获取用户积分
const credits = await getUserCredits(userUuid);

// LipSync消费积分
await decreaseCredits({
  user_uuid: userUuid,
  trans_type: "lipsync_medium",
  credits: 10
});
```

### **支付系统** ✅
```typescript
// 完全复用Stripe集成
// 积分不足时跳转到定价页面
router.push('/pricing');
```

## 📈 **生产环境部署清单**

### **Vercel配置**
- [ ] DATABASE_URL 环境变量已设置
- [ ] 其他必要环境变量已配置
- [ ] 构建成功
- [ ] 数据库连接正常

### **Supabase配置**
- [ ] 数据库表已创建
- [ ] 权限设置正确
- [ ] 备份策略已配置
- [ ] 监控已启用

### **安全检查**
- [ ] 数据库密码安全
- [ ] API密钥保护
- [ ] CORS设置正确
- [ ] SSL证书有效

## 🎉 **对接完成后的功能**

### **立即可用**
- ✅ 用户注册/登录系统
- ✅ 积分获取和消费
- ✅ LipSync视频生成
- ✅ 文件上传和管理
- ✅ 支付和充值
- ✅ 用户仪表板
- ✅ 项目历史记录

### **数据流程**
```
用户访问 → 登录认证 → 获取积分 → 使用LipSync → 扣除积分 → 保存到Supabase
```

## 📞 **需要帮助？**

### **文档资源**
- [Supabase文档](https://supabase.com/docs)
- [Vercel部署指南](https://vercel.com/docs)
- [ShipAny模板文档](./README.md)

### **支持渠道**
- Supabase Discord社区
- Vercel支持中心
- GitHub Issues

---

## 🔥 **快速设置命令**

```bash
# 1. 配置DATABASE_URL (编辑 .env.development)
# 2. 推送数据库表
npm run db:push
# 3. 启动开发服务器
npm run dev
# 4. 测试功能
open http://localhost:3001
```

**✅ 完成这些步骤后，您的网站就可以完美使用Supabase数据库了！**
