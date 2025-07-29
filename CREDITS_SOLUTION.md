# 🎯 积分不足问题解决方案

## 🚨 **问题描述**

用户在测试LipSync编辑器时遇到以下错误：
```
Failed to load resource: the server responded with a status of 402 ()
Generation failed: Error: Insufficient credits
```

**根本原因**: 用户积分不足，无法生成视频（需要10积分，但用户可能只有0积分）

## ✅ **解决方案**

我已经为您创建了完整的测试积分管理系统，提供3种方式为用户增加积分：

### 🎮 **方法1: Web界面 (推荐)**

1. **登录应用**
2. **访问测试积分页面**: `https://your-domain.vercel.app/admin/test-credits`
3. **增加积分**: 
   - 输入积分数量 (建议100积分)
   - 点击"增加积分"按钮
   - 系统会自动为当前登录用户增加积分

### 🖥️ **方法2: API调用**

```bash
# 为当前登录用户增加100积分
curl -X POST https://your-domain.vercel.app/api/admin/add-test-credits \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"credits": 100}'

# 查询当前用户积分
curl -X GET https://your-domain.vercel.app/api/admin/add-test-credits \
  -H "Cookie: your-session-cookie"
```

### 💻 **方法3: 命令行脚本**

```bash
# 为特定用户增加积分
node scripts/add-test-credits.js user@example.com 100

# 为所有用户增加积分
node scripts/add-test-credits.js --all 100

# 查询用户积分
node scripts/add-test-credits.js --check user@example.com
```

## 🎯 **快速解决步骤**

### 立即解决积分不足问题：

1. **部署到Vercel** (如果还没有)
   - 代码已推送到GitHub
   - Vercel会自动检测并部署

2. **登录应用**
   - 访问您的Vercel域名
   - 使用Google或GitHub登录

3. **增加测试积分**
   - 访问 `/admin/test-credits` 页面
   - 点击"100积分"快捷按钮
   - 点击"增加积分"

4. **验证积分增加**
   - 页面会显示更新后的积分余额
   - 确认积分 ≥ 10 (足够生成1个视频)

5. **测试LipSync功能**
   - 返回主页，进入LipSync编辑器
   - 上传图片，输入文本
   - 生成视频 (消耗10积分)

## 📊 **积分消耗说明**

| 功能 | 消耗积分 | 说明 |
|------|----------|------|
| 中等质量视频 | 10积分 | 默认设置 |
| 高质量视频 | 20积分 | 更好的画质 |
| 超高质量视频 | 30积分 | 最佳效果 |

## 🔧 **系统特性**

### ✅ **安全性**
- 只有登录用户可以为自己增加积分
- 每次最多增加1000积分
- 积分有1年有效期

### ✅ **便利性**
- Web界面操作简单
- 实时显示积分余额
- 支持快捷金额选择

### ✅ **兼容性**
- 完全复用ShipAny积分系统
- 不影响现有功能
- 支持多种增加方式

## 🚀 **部署后验证**

部署完成后，请验证以下功能：

1. **积分页面访问**: `/admin/test-credits` 正常加载
2. **积分增加功能**: 可以成功增加积分
3. **积分显示**: 实时更新积分余额
4. **LipSync测试**: 积分足够时可以生成视频

## 🎉 **预期结果**

完成积分增加后：
- ✅ 用户积分余额 ≥ 10
- ✅ 402错误消失
- ✅ 可以正常生成LipSync视频
- ✅ 积分会根据使用情况扣除

## 📞 **如需帮助**

如果遇到问题：
1. 检查用户是否已登录
2. 确认Vercel部署成功
3. 查看浏览器控制台错误
4. 验证数据库连接正常

---

**解决方案状态**: ✅ 已完成并推送到GitHub  
**部署就绪**: ✅ 可立即在Vercel中测试  
**预计解决时间**: 5分钟内完成积分增加
