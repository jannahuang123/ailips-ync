# 🚀 TTS修复版本 - Vercel部署指南

## 📊 部署状态总览

- **GitHub仓库**: `jannahuang123/ailips-ync`
- **最新提交**: `f6ad68b` - TTS API修复完成
- **分支**: `main`
- **推送状态**: ✅ 已成功推送到GitHub
- **准备状态**: ✅ 可立即部署到Vercel

## 🎯 本次修复内容

### 核心问题解决
- ❌ **修复前**: `Failed to load resource: 404/400 /api/tts/generate`
- ✅ **修复后**: 直接使用Veo3内置文本转语音，无需TTS配置

### 技术改进
1. **绕过TTS依赖**: 利用Veo3 API的`audio_prompt`功能
2. **增强API接口**: 支持`audioPrompt`参数用于文本输入
3. **智能提供商选择**: 自动跳过不支持TTS的提供商
4. **保持兼容性**: 继续支持音频文件上传模式

## 🔧 Vercel部署步骤

### 步骤1: 访问Vercel控制台
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到您的项目 (如果已存在) 或创建新项目

### 步骤2: 触发部署
**方法A: 自动部署 (推荐)**
- Vercel会自动检测到GitHub的新提交
- 等待自动构建和部署完成

**方法B: 手动重新部署**
- 在项目页面点击 "Redeploy"
- 选择最新的提交 `f6ad68b`
- 点击 "Deploy"

### 步骤3: 验证环境变量
确保以下关键环境变量已配置：

#### 🔑 必需变量
```bash
# AI服务 (核心)
VEO3_API_KEY=your_veo3_api_key
VEO3_BASE_URL=https://api.apicore.ai

# 数据库
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url

# 认证
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app

# 存储
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=your_region
```

#### 🔧 可选变量 (TTS相关 - 现已不必需)
```bash
# 这些现在是可选的，因为使用Veo3内置TTS
AZURE_SPEECH_KEY=optional
GOOGLE_CLOUD_TTS_KEY=optional
OPENAI_API_KEY=optional
```

## 🧪 部署后测试清单

### ✅ 基础功能测试
- [ ] 主页正常加载
- [ ] 用户登录/注册功能正常
- [ ] LipSync编辑器组件显示

### ✅ TTS修复验证
- [ ] 文本输入模式不再出现404错误
- [ ] 控制台无TTS相关错误信息
- [ ] 文本可以直接转换为语音视频

### ✅ API端点测试
使用浏览器开发者工具或Postman测试：

1. **TTS API端点**
   ```bash
   POST https://your-domain.vercel.app/api/tts/generate
   # 应返回: 401 (Unauthorized) 而非 404 (Not Found)
   ```

2. **LipSync API端点**
   ```bash
   POST https://your-domain.vercel.app/api/lipsync/create
   Body: {
     "name": "Test",
     "imageUrl": "https://example.com/test.jpg",
     "audioPrompt": "Hello world"
   }
   # 应返回: 401 (需要认证) 而非 400 (参数错误)
   ```

## 🎬 完整功能测试流程

### 测试场景1: 文本输入模式
1. 登录应用
2. 上传一张人物照片
3. 选择"文本输入"模式
4. 输入测试文本: "Hello, this is a test message"
5. 点击生成按钮
6. **预期结果**: 无404/400错误，开始处理

### 测试场景2: 音频上传模式
1. 登录应用
2. 上传一张人物照片
3. 选择"音频上传"模式
4. 上传音频文件
5. 点击生成按钮
6. **预期结果**: 正常处理，向后兼容

## 🚨 故障排查指南

### 问题1: 仍然出现TTS错误
**可能原因**: 浏览器缓存
**解决方案**: 
- 硬刷新页面 (Ctrl+F5 或 Cmd+Shift+R)
- 清除浏览器缓存
- 使用无痕模式测试

### 问题2: API返回500错误
**可能原因**: 环境变量配置错误
**解决方案**:
- 检查Vercel项目设置中的环境变量
- 确认VEO3_API_KEY是否正确配置
- 查看Vercel函数日志

### 问题3: 构建失败
**可能原因**: 依赖或类型错误
**解决方案**:
- 检查Vercel构建日志
- 确认所有依赖已正确安装
- 验证TypeScript类型定义

## 📈 性能监控建议

部署后建议关注：
- **错误率**: TTS相关错误应降至0
- **响应时间**: API端点响应速度
- **用户体验**: 文本到视频生成成功率
- **资源使用**: Vercel函数执行时间

## 🎉 部署成功标志

当看到以下情况时，说明部署成功：
- ✅ Vercel构建日志显示"Build Completed"
- ✅ 主页可以正常访问
- ✅ 控制台无TTS相关404/400错误
- ✅ 文本输入功能正常工作
- ✅ 用户可以成功生成LipSync视频

---

## 📞 需要帮助？

如果在部署过程中遇到问题，请：
1. 检查Vercel部署日志
2. 查看浏览器控制台错误
3. 确认环境变量配置
4. 验证GitHub最新代码已推送

**部署版本**: TTS修复版 (commit: f6ad68b)  
**文档更新时间**: 2025-07-28  
**状态**: ✅ 准备就绪，可立即部署
