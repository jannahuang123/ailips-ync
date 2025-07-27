# 🤖 APICore.ai 服务集成指南

## 📋 **APICore.ai 概览**

APICore.ai (https://api.apicore.ai/panel) 是我们 LipSyncVideo.net 项目的主要 AI 服务提供商，提供多种 AI 能力的统一 API 接口。

## 🔑 **API 密钥获取**

### **注册和获取密钥步骤**
1. **访问控制面板**: https://api.apicore.ai/panel
2. **注册账户**: 使用邮箱注册并完成验证
3. **登录控制面板**: 进入用户 Dashboard
4. **创建 API 密钥**: 
   - 找到 "API Keys" 或 "密钥管理" 页面
   - 点击 "创建新密钥" 或 "Generate New Key"
   - 复制生成的密钥（格式：`ak-xxxxxxxxxx`）
5. **查看配额**: 检查账户的 API 调用配额和余额

## 🎯 **可用的 AI 服务**

### **1. 🎬 LipSync 视频生成服务**
- **功能**: 图片 + 音频 → 唇语同步视频
- **API 端点**: `/v1/lipsync/generate`
- **输入格式**:
  - 图片: JPG, PNG, WebP (最大 10MB)
  - 音频: MP3, WAV, M4A (最大 50MB)
- **输出格式**: MP4 视频文件
- **处理时间**: 通常 2-5 分钟
- **质量选项**: 标准、高清、4K

### **2. 🎬 视频生成服务 (核心推荐)**
- **功能**: 图片 + 音频 → 唇语同步视频
- **推荐模型**:
  - **Veo3**: Google 最新视频生成模型 ⭐ **最适合 LipSync**
  - **Runway Gen-3**: 专业视频生成
  - **Pika Labs**: 快速视频原型
- **API 端点**: `/v1/video/generate` 或 `/v1/lipsync/veo3`
- **输入格式**:
  - 图片: JPG, PNG, WebP (最大 10MB)
  - 音频: MP3, WAV, M4A (最大 50MB)
- **输出格式**: MP4, WebM
- **Veo3 优势**:
  - 🎯 原生支持图片到视频转换
  - 🎵 内置音频同步能力
  - 🎭 精准的面部表情控制
  - ⚡ 更快的处理速度
  - 💰 更高的成本效益

### **3. 🖼️ 图像生成服务 (辅助功能)**
- **功能**: 文本提示词 → AI 生成图像
- **可用模型**:
  - **DALL-E 3**: 高质量创意图像
  - **Stable Diffusion**: 多样化风格图像
  - **Midjourney**: 艺术风格图像
- **API 端点**: `/v1/image/generate`
- **输出格式**: PNG, JPG
- **用途**: 为没有合适图片的用户生成人物头像

### **4. 📝 文本生成服务**
- **功能**: 提示词 → AI 生成文本
- **可用模型**:
  - GPT-4: 高质量文本生成
  - Claude: 长文本处理
  - GPT-3.5: 快速文本生成
- **API 端点**: `/v1/text/generate`
- **应用场景**: 文案生成、内容创作、翻译

### **5. 🎵 音频处理服务**
- **功能**: 音频分析、语音识别、音频增强
- **API 端点**: `/v1/audio/process`
- **支持格式**: MP3, WAV, M4A, OGG
- **处理能力**:
  - 语音转文字
  - 音频降噪
  - 音频格式转换
  - 音频特征提取

## 🎯 **针对 LipSyncVideo.net 的模型选择建议**

### **🏆 推荐配置 (基于 Veo3)**

#### **核心 LipSync 功能**
- **主要服务**: APICore.ai Veo3 视频生成 API
- **输入**: 用户上传的图片 + 音频
- **输出**: 唇语同步视频
- **技术优势**:
  - 🎯 **原生视频生成**: 直接从图片生成视频，无需中间步骤
  - 🎵 **音频同步**: 内置音频分析和唇语映射
  - 🎭 **表情控制**: 精准的面部表情和口型控制
  - ⚡ **处理效率**: 比传统 LipSync 方案快 2-3 倍
  - 💰 **成本优化**: 单次 API 调用完成整个流程

#### **辅助功能配置**
- **图像生成**: DALL-E 3 (为无图片用户生成头像)
- **音频处理**: 语音增强和格式转换
- **文本生成**: 为用户生成视频脚本和描述

#### **Veo3 的潜在用途**
- **场景**: 创建背景视频、动画效果
- **不推荐**: 替代核心 LipSync 功能
- **原因**: 成本高，与项目核心价值不匹配

### **💡 建议的产品功能层次**

```typescript
// 产品功能优先级
const featurePriority = {
  core: "图片 + 音频 → LipSync 视频",           // 核心功能
  enhanced: "文本 → DALL-E 图片 → LipSync 视频", // 增强功能
  premium: "Veo3 背景视频 + LipSync 合成",      // 高级功能
};
```

## 🔧 **在 LipSyncVideo.net 中的集成**

### **环境变量配置**
```bash
# 在 Vercel 中配置以下环境变量
APICORE_API_KEY=ak-your-api-key-here
APICORE_BASE_URL=https://api.apicore.ai
APICORE_VERSION=v1

# 可选的服务端点配置
APICORE_LIPSYNC_ENDPOINT=/v1/lipsync/generate
APICORE_UPLOAD_ENDPOINT=/v1/files/upload
APICORE_STATUS_ENDPOINT=/v1/jobs/status
APICORE_DOWNLOAD_ENDPOINT=/v1/files/download
```

### **API 调用示例**

#### **Veo3 LipSync 视频生成 (推荐)**
```typescript
// 使用 Veo3 模型生成唇语同步视频
const response = await fetch('https://api.apicore.ai/v1/video/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.APICORE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'veo3',
    mode: 'image_to_video_with_audio',
    inputs: {
      image_url: 'https://example.com/portrait.jpg',
      audio_url: 'https://example.com/speech.mp3',
      duration: 'auto', // 根据音频长度自动确定
      quality: 'hd',
      aspect_ratio: '16:9',
      fps: 30
    },
    options: {
      lip_sync: true,
      face_enhancement: true,
      audio_sync_precision: 'high'
    }
  })
});

const result = await response.json();
// 返回: { job_id: "veo3_xxx", status: "processing", estimated_time: "2min" }
```

#### **传统 LipSync API (备用方案)**
```typescript
// 传统 LipSync API 调用
const response = await fetch('https://api.apicore.ai/v1/lipsync/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.APICORE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    image_url: 'https://example.com/image.jpg',
    audio_url: 'https://example.com/audio.mp3',
    quality: 'hd',
    format: 'mp4'
  })
});
```

#### **任务状态查询**
```typescript
// 查询处理状态
const statusResponse = await fetch(`https://api.apicore.ai/v1/jobs/status/${jobId}`, {
  headers: {
    'Authorization': `Bearer ${process.env.APICORE_API_KEY}`,
  }
});

const status = await statusResponse.json();
// 返回: { status: "completed", progress: 100, result_url: "https://..." }
```

## 💰 **定价和配额**

### **计费模式**
- **按使用量计费**: 根据 API 调用次数和处理时长
- **预付费积分**: 购买积分包，按需消费
- **订阅套餐**: 月度/年度固定费用

### **典型费用（参考）**
- **LipSync 视频生成**: 0.1-0.5 积分/次（根据质量和时长）
- **图像生成**: 0.05-0.2 积分/张
- **文本生成**: 0.01-0.05 积分/1000 tokens
- **音频处理**: 0.02-0.1 积分/分钟

### **免费额度**
- 新用户通常有免费试用积分
- 每月可能有少量免费配额
- 具体额度请查看控制面板

## 🔒 **安全和最佳实践**

### **API 密钥安全**
- ✅ 将 API 密钥存储在环境变量中
- ✅ 不要在客户端代码中暴露密钥
- ✅ 定期轮换 API 密钥
- ✅ 为不同环境使用不同的密钥

### **错误处理**
```typescript
try {
  const response = await fetch(apiEndpoint, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`APICore.ai Error: ${error.message}`);
  }
  
  return await response.json();
} catch (error) {
  console.error('APICore.ai API call failed:', error);
  // 实施重试逻辑或降级方案
}
```

### **速率限制**
- 遵守 API 速率限制（通常 60 请求/分钟）
- 实施请求队列和重试机制
- 监控 API 使用量避免超额

## 📊 **监控和优化**

### **性能监控**
- 监控 API 响应时间
- 跟踪成功率和错误率
- 记录积分消耗情况

### **成本优化**
- 选择合适的质量设置
- 实施结果缓存机制
- 批量处理减少 API 调用

## 🆘 **故障排除**

### **常见错误**
1. **401 Unauthorized**: 检查 API 密钥是否正确
2. **429 Too Many Requests**: 触发速率限制，需要等待
3. **400 Bad Request**: 检查请求参数格式
4. **500 Internal Server Error**: APICore.ai 服务端问题

### **调试技巧**
- 启用详细日志记录
- 使用 API 测试工具验证请求
- 检查网络连接和防火墙设置
- 查看 APICore.ai 状态页面

## 📞 **技术支持**

### **获取帮助**
- **官方文档**: https://api.apicore.ai/docs
- **控制面板**: https://api.apicore.ai/panel
- **技术支持**: 通过控制面板提交工单
- **社区论坛**: 查看常见问题和解决方案

### **联系方式**
- 在控制面板中查看具体的联系方式
- 通常提供邮件和在线客服支持
- 响应时间通常为 24-48 小时

---

## 🎯 **总结**

APICore.ai 为 LipSyncVideo.net 提供了强大的 AI 能力支持，特别是核心的唇语同步视频生成功能。通过合理配置和使用这些服务，您可以为用户提供高质量的 AI 视频处理体验。

记住要：
- ✅ 安全地管理 API 密钥
- ✅ 监控使用量和成本
- ✅ 实施适当的错误处理
- ✅ 优化 API 调用效率

这样您就可以充分利用 APICore.ai 的强大功能来构建出色的 LipSyncVideo 应用了！
