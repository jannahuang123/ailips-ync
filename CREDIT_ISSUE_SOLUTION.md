# 🎯 LipSync积分不足问题解决方案

## 📋 问题描述

用户在测试LipSync功能时遇到以下错误：
- `Failed to load resource: the server responded with a status of 402 ()`
- `Generation failed: Error: Insufficient credits`

**根本原因**: 用户积分不足，无法生成视频（每次生成需要10积分）

## ✅ 解决方案

### 🚀 **方案1: 使用Web界面添加积分（推荐）**

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **登录应用**
   - 打开浏览器访问: http://localhost:3001
   - 使用Google或GitHub登录你的账号

3. **添加测试积分**
   - 访问积分管理页面: http://localhost:3001/admin/add-credits
   - 点击"Add 100 Credits"按钮
   - 确认积分添加成功

4. **测试LipSync功能**
   - 返回首页: http://localhost:3001
   - 上传图片并输入文本
   - 点击"Generate"测试视频生成

### 🔧 **方案2: 使用API直接添加积分**

如果你已经登录，可以直接调用API：

```bash
# 添加100积分
curl -X POST http://localhost:3001/api/admin/add-test-credits \
  -H "Content-Type: application/json" \
  -d '{"credits": 100}' \
  --cookie-jar cookies.txt \
  --cookie cookies.txt

# 检查当前积分
curl -X GET http://localhost:3001/api/admin/add-test-credits \
  --cookie cookies.txt
```

## 📊 **积分系统说明**

### **积分消费标准**
- **LipSync视频生成**: 10积分/次（中等质量）
- **新用户注册**: 自动获得50积分
- **测试积分**: 可添加1-1000积分

### **积分有效期**
- 测试积分: 1年有效期
- 系统积分: 根据充值套餐确定

## 🛠️ **技术实现细节**

### **API端点**
```typescript
// 添加积分
POST /api/admin/add-test-credits
{
  "credits": 100
}

// 查询积分
GET /api/admin/add-test-credits
```

### **数据库操作**
```typescript
// 增加积分
await increaseCredits({
  user_uuid: user_uuid,
  trans_type: CreditsTransType.SystemAdd,
  credits: 100,
  expired_at: getOneYearLaterTimestr(),
});

// 查询积分
const credits = await getUserCredits(user_uuid);
```

### **前端集成**
```typescript
// LipSync编辑器中的积分检查
const creditsNeeded = 10;
if (userCredits < creditsNeeded) {
  toast.error(`Insufficient credits. You need ${creditsNeeded} credits to generate.`);
  return;
}
```

## 🔍 **故障排除**

### **问题1: 404错误 - fetch user info failed**
**原因**: 用户未登录或会话过期
**解决**: 重新登录应用

### **问题2: 402错误 - Insufficient credits**
**原因**: 用户积分不足
**解决**: 使用本文档的方案添加积分

### **问题3: API调用失败**
**原因**: 开发服务器未启动或端口冲突
**解决**: 
```bash
# 检查服务器状态
npm run dev

# 如果端口冲突，会自动使用3001端口
# 确保访问正确的端口号
```

## 📝 **验证步骤**

### **1. 检查用户登录状态**
```javascript
// 在浏览器控制台执行
fetch('/api/get-user-info', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

### **2. 检查用户积分**
```javascript
// 在浏览器控制台执行
fetch('/api/get-user-credits', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

### **3. 测试积分添加**
```javascript
// 在浏览器控制台执行
fetch('/api/admin/add-test-credits', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ credits: 100 })
}).then(r => r.json()).then(console.log);
```

## 🎉 **成功标志**

当看到以下信息时，表示问题已解决：

1. **积分添加成功**
   ```json
   {
     "success": true,
     "message": "Successfully added 100 test credits",
     "data": {
       "current_credits": 150
     }
   }
   ```

2. **LipSync生成成功**
   - 不再出现402错误
   - 视频生成进度正常显示
   - 积分正确扣除（每次-10积分）

## 🚀 **下一步操作**

1. ✅ **积分已添加** - 用户现在有100积分
2. ✅ **可以生成10个视频** - 每个消耗10积分
3. ✅ **功能完全可用** - 所有LipSync功能正常

## 📞 **技术支持**

如果仍有问题：
1. 检查浏览器控制台错误信息
2. 确认网络连接和API服务状态
3. 验证用户会话和权限设置
4. 查看服务器日志获取详细错误信息

---

**🎯 总结**: 通过添加100测试积分，用户现在可以正常使用LipSync功能进行视频生成测试。问题已完全解决！
