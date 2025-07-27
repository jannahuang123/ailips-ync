# 🌐 LipSyncVideo.net 域名配置指南

## 📋 **配置步骤概览**

### **步骤1: 域名购买和DNS配置**

#### 1.1 域名注册
- 在域名注册商（如 Namecheap, GoDaddy, Cloudflare）购买 `lipsyncvideo.net`
- 推荐使用 Cloudflare 作为DNS服务商（免费SSL + CDN）

#### 1.2 DNS记录配置
```bash
# A记录配置 (指向Vercel)
Type: A
Name: @
Value: 76.76.19.61

# CNAME记录配置 (www子域名)
Type: CNAME  
Name: www
Value: cname.vercel-dns.com

# 可选：API子域名
Type: CNAME
Name: api
Value: cname.vercel-dns.com
```

### **步骤2: Vercel自定义域名配置**

#### 2.1 在Vercel Dashboard添加域名
```bash
# 登录Vercel Dashboard
1. 进入项目设置 → Domains
2. 添加域名: lipsyncvideo.net
3. 添加域名: www.lipsyncvideo.net
4. 等待DNS验证完成
```

#### 2.2 SSL证书自动配置
- Vercel会自动为自定义域名申请Let's Encrypt SSL证书
- 通常在DNS配置正确后5-10分钟内完成

### **步骤3: 环境变量更新**

#### 3.1 更新生产环境变量
```bash
# 在Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_WEB_URL=https://lipsyncvideo.net
NEXT_PUBLIC_API_URL=https://lipsyncvideo.net/api
NEXT_PUBLIC_DOMAIN=lipsyncvideo.net
```

#### 3.2 更新本地开发环境
```bash
# .env.development
NEXT_PUBLIC_WEB_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_DOMAIN=localhost
```

### **步骤4: 代码配置更新**

#### 4.1 更新Next.js配置
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    CUSTOM_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.lipsyncvideo.net',
          },
        ],
        destination: 'https://lipsyncvideo.net/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
```

### **步骤5: 验证和测试**

#### 5.1 域名解析验证
```bash
# 使用dig命令验证DNS解析
dig lipsyncvideo.net
dig www.lipsyncvideo.net

# 验证SSL证书
curl -I https://lipsyncvideo.net
```

#### 5.2 功能测试清单
- [ ] 主域名访问正常
- [ ] www子域名重定向正常  
- [ ] SSL证书有效
- [ ] 所有页面路由正常
- [ ] API接口正常
- [ ] 用户认证功能正常
- [ ] 支付功能正常

## ⚠️ **注意事项**

1. **DNS传播时间**: 全球DNS传播可能需要24-48小时
2. **缓存清理**: 配置完成后清理浏览器缓存
3. **监控设置**: 配置域名监控确保服务可用性
4. **备份配置**: 保存所有DNS和Vercel配置记录

## 🔧 **故障排除**

### 常见问题解决方案
1. **DNS解析失败**: 检查A记录和CNAME配置
2. **SSL证书错误**: 等待Vercel自动重新申请
3. **重定向循环**: 检查next.config.js重定向规则
4. **API调用失败**: 验证NEXT_PUBLIC_API_URL配置
