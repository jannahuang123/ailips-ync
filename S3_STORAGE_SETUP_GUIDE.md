# 🗄️ S3存储配置完整指南

## 📋 **概览**

LipSync视频生成平台需要S3存储来保存：
- ✅ **用户上传的图片** (头像照片)
- ✅ **用户上传的音频文件** (语音文件)
- ✅ **TTS生成的音频** (文本转语音结果)
- ✅ **AI生成的视频** (最终LipSync视频)

## 🎯 **为什么需要S3存储？**

### **问题**
- Vercel有文件大小限制 (50MB)
- 本地存储不适合生产环境
- 需要CDN加速文件访问
- 需要可靠的文件备份

### **解决方案**
- 使用AWS S3或兼容服务
- 支持大文件存储 (最大5TB)
- 全球CDN分发
- 99.999999999% (11个9) 数据持久性

## 🚀 **推荐的S3服务商**

### **1. AWS S3 (推荐)**
```
✅ 优点: 最稳定、功能最全、全球覆盖
❌ 缺点: 价格较高、配置复杂
💰 价格: $0.023/GB/月 + 流量费
🌍 地区: 全球多个区域
```

### **2. Cloudflare R2 (性价比最高)**
```
✅ 优点: 免费流量、价格便宜、速度快
❌ 缺点: 功能相对简单
💰 价格: $0.015/GB/月，流量免费
🌍 地区: 全球边缘网络
```

### **3. 阿里云OSS (国内推荐)**
```
✅ 优点: 国内速度快、价格便宜
❌ 缺点: 海外访问较慢
💰 价格: ¥0.12/GB/月
🌍 地区: 中国大陆多个区域
```

### **4. 腾讯云COS**
```
✅ 优点: 国内速度快、与微信生态集成
❌ 缺点: 海外访问较慢
💰 价格: ¥0.118/GB/月
🌍 地区: 中国大陆多个区域
```

## 📝 **AWS S3 配置步骤 (详细)**

### **Step 1: 创建AWS账号**
1. 访问 https://aws.amazon.com/
2. 点击 "Create an AWS Account"
3. 填写邮箱、密码、账号名称
4. 验证邮箱和手机号码
5. 绑定信用卡 (用于计费)

### **Step 2: 创建S3存储桶**
```bash
1. 登录AWS控制台
2. 搜索并进入 "S3" 服务
3. 点击 "Create bucket"
4. 配置存储桶:
   - Bucket name: lipsyncvideo-storage-[random]
   - Region: us-east-1 (或离用户最近的区域)
   - Block all public access: 取消勾选
   - Versioning: 启用 (可选)
   - Encryption: 启用 AES-256
5. 点击 "Create bucket"
```

### **Step 3: 配置CORS策略**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "https://your-vercel-domain.vercel.app",
      "http://localhost:3001"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### **Step 4: 创建IAM用户**
```bash
1. 进入 IAM 服务
2. 点击 "Users" → "Add user"
3. 用户名: lipsyncvideo-s3-user
4. Access type: Programmatic access
5. 权限: 创建新策略或使用 AmazonS3FullAccess
6. 记录 Access Key ID 和 Secret Access Key
```

### **Step 5: 配置存储桶策略**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

## 🔧 **Cloudflare R2 配置步骤 (推荐)**

### **Step 1: 创建Cloudflare账号**
1. 访问 https://cloudflare.com/
2. 注册账号并验证邮箱
3. 进入 Dashboard

### **Step 2: 创建R2存储桶**
```bash
1. 在Dashboard中点击 "R2 Object Storage"
2. 点击 "Create bucket"
3. 配置:
   - Bucket name: lipsyncvideo-storage
   - Location: Automatic (全球分布)
4. 点击 "Create bucket"
```

### **Step 3: 获取API密钥**
```bash
1. 进入 "Manage R2 API tokens"
2. 点击 "Create API token"
3. 权限: Object Read & Write
4. 记录 Access Key ID 和 Secret Access Key
```

### **Step 4: 配置CORS**
```bash
1. 进入存储桶设置
2. 找到 "CORS policy"
3. 添加规则:
   - Allowed origins: https://your-vercel-domain.vercel.app
   - Allowed methods: GET, PUT, POST, DELETE
   - Allowed headers: *
```

## 🌐 **环境变量配置**

### **AWS S3 配置**
```bash
# AWS S3 配置
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY=AKIA...your-access-key
STORAGE_SECRET_KEY=your-secret-access-key
STORAGE_BUCKET=lipsyncvideo-storage
STORAGE_DOMAIN=https://lipsyncvideo-storage.s3.amazonaws.com
```

### **Cloudflare R2 配置**
```bash
# Cloudflare R2 配置
STORAGE_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
STORAGE_REGION=auto
STORAGE_ACCESS_KEY=your-r2-access-key
STORAGE_SECRET_KEY=your-r2-secret-key
STORAGE_BUCKET=lipsyncvideo-storage
STORAGE_DOMAIN=https://pub-your-bucket-id.r2.dev
```

### **阿里云OSS配置**
```bash
# 阿里云OSS配置
STORAGE_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
STORAGE_REGION=oss-cn-hangzhou
STORAGE_ACCESS_KEY=your-access-key-id
STORAGE_SECRET_KEY=your-access-key-secret
STORAGE_BUCKET=lipsyncvideo-storage
STORAGE_DOMAIN=https://lipsyncvideo-storage.oss-cn-hangzhou.aliyuncs.com
```

## 📁 **文件存储结构**

### **目录结构**
```
lipsyncvideo-storage/
├── images/
│   └── {user-uuid}/
│       ├── avatar-001.jpg
│       ├── photo-002.png
│       └── ...
├── audio/
│   └── {user-uuid}/
│       ├── voice-001.mp3
│       ├── tts-002.wav
│       └── ...
├── videos/
│   └── {user-uuid}/
│       ├── input-001.mp4
│       └── ...
└── results/
    └── {user-uuid}/
        ├── lipsync-001.mp4
        ├── lipsync-002.mp4
        └── ...
```

### **文件命名规则**
```typescript
// 图片文件
images/{user-uuid}/{uuid}.{ext}

// 音频文件  
audio/{user-uuid}/{uuid}.{ext}

// 视频文件
videos/{user-uuid}/{uuid}.{ext}

// 生成结果
results/{user-uuid}/lipsync-{project-id}.mp4
```

## 🔒 **安全配置**

### **访问控制**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket/results/*"
    },
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::your-bucket/images/*",
        "arn:aws:s3:::your-bucket/audio/*"
      ]
    }
  ]
}
```

### **生命周期管理**
```json
{
  "Rules": [
    {
      "ID": "DeleteTempFiles",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "temp/"
      },
      "Expiration": {
        "Days": 7
      }
    },
    {
      "ID": "ArchiveOldResults",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "results/"
      },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

## 💰 **成本估算**

### **AWS S3 成本 (月)**
```
存储成本:
- 100GB 存储: $2.30
- 1000次PUT请求: $0.005
- 10000次GET请求: $0.004
- 100GB流量: $9.00
总计: ~$11.31/月
```

### **Cloudflare R2 成本 (月)**
```
存储成本:
- 100GB 存储: $1.50
- 1000次PUT请求: $0.0045
- 10000次GET请求: $0.0036
- 100GB流量: $0 (免费)
总计: ~$1.51/月
```

## 🧪 **测试存储配置**

### **测试脚本**
```bash
# 添加到package.json
npm run test:storage

# 或直接运行
node scripts/test-storage-config.js
```

### **测试内容**
```
✅ S3连接测试
✅ 文件上传测试
✅ 文件下载测试
✅ 权限验证测试
✅ CORS配置测试
```

## 🚨 **常见问题**

### **问题1: CORS错误**
```
错误: Access to fetch blocked by CORS policy
解决: 检查CORS配置，确保包含正确的域名
```

### **问题2: 403 Forbidden**
```
错误: Access Denied
解决: 检查IAM权限和存储桶策略
```

### **问题3: 文件上传失败**
```
错误: SignatureDoesNotMatch
解决: 检查Access Key和Secret Key是否正确
```

### **问题4: 文件无法访问**
```
错误: NoSuchKey
解决: 检查文件路径和存储桶名称
```

## 📊 **监控和优化**

### **监控指标**
- 存储使用量
- 请求次数
- 流量消耗
- 错误率

### **优化建议**
- 启用压缩
- 使用CDN
- 设置缓存策略
- 定期清理临时文件

## 🎉 **配置完成检查清单**

- [ ] S3服务商账号已创建
- [ ] 存储桶已创建并配置
- [ ] IAM用户和权限已设置
- [ ] CORS策略已配置
- [ ] 环境变量已设置到Vercel
- [ ] 文件上传测试通过
- [ ] 文件访问测试通过
- [ ] 成本监控已设置

**🚀 完成以上配置后，您的LipSync平台就具备了完整的文件存储能力！**

---

## 📚 **相关文档**

- `scripts/test-storage-config.js` - 存储配置测试脚本
- `.env.vercel.template` - 环境变量模板
- `src/lib/storage.ts` - 存储客户端实现

**下一步**: 配置完成后运行测试脚本验证配置！ 🎯
