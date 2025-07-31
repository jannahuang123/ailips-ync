# 分享积分系统指南 (Share Credits System Guide)

## 概述 (Overview)

本项目已将复杂的分佣机制简化为简单的分享积分奖励系统，以降低运营成本并提高用户参与度。

## 主要变更 (Key Changes)

### 1. 移除分佣机制 (Removed Commission System)
- ❌ 删除了复杂的 affiliate 系统
- ❌ 移除了百分比分成机制
- ❌ 取消了付费订单分佣

### 2. 新增分享奖励系统 (New Share Reward System)
- ✅ 简单的积分奖励机制
- ✅ 每成功邀请一人获得 20 积分
- ✅ 前10个邀请每5人额外获得 50 积分奖励
- ✅ 无邀请数量限制

## 功能特性 (Features)

### 分享积分页面 (`/share-credits`)
- 🎁 积分奖励说明
- 🔗 个人分享链接生成
- 📊 分享统计数据
- 📱 社交媒体分享按钮

### 积分奖励规则 (Reward Rules)
```typescript
// 基础奖励
ShareRewardAmount = 20 // 每个成功邀请

// 额外奖励
ReferralBonusAmount = 50 // 每5个邀请的额外奖励（前10个邀请）
```

### 奖励触发条件 (Reward Triggers)
1. 新用户通过邀请链接注册
2. 邀请人获得基础积分奖励
3. 达到里程碑时获得额外奖励

## 技术实现 (Technical Implementation)

### 核心文件 (Core Files)
```
src/
├── services/share-reward.ts          # 分享奖励核心逻辑
├── components/share/                 # 分享积分组件
│   └── share-credits-form.tsx
├── app/[locale]/(default)/share-credits/
│   └── page.tsx                      # 分享积分页面
└── app/api/
    ├── update-invite/route.ts        # 更新邀请关系API
    ├── share-reward-summary/route.ts # 分享统计API
    └── test-share-reward/route.ts    # 测试API（开发用）
```

### 数据库变更 (Database Changes)
- 复用现有 `users` 表的 `invite_code` 和 `invited_by` 字段
- 使用 `credits` 表记录积分变动
- 新增积分类型：`ShareReward` 和 `ReferralBonus`

### API 端点 (API Endpoints)
```
GET  /api/share-reward-summary     # 获取分享统计
POST /api/update-invite           # 处理邀请关系
POST /api/update-invite-code      # 生成/更新邀请码
POST /api/test-share-reward       # 测试API（开发用）
```

## 用户流程 (User Flow)

### 1. 生成邀请码 (Generate Invite Code)
```
用户访问 /share-credits → 点击生成邀请码 → 获得个人分享链接
```

### 2. 分享获得积分 (Share and Earn)
```
分享链接 → 新用户注册 → 自动处理奖励 → 邀请人获得积分
```

### 3. 查看统计 (View Statistics)
```
访问 /share-credits → 查看邀请数量、获得积分、奖励状态
```

## 配置更新 (Configuration Updates)

### 首页按钮更新 (Homepage Button Updates)
```json
// src/i18n/pages/landing/en.json
{
  "header": {
    "buttons": [
      {
        "title": "Share & Get Credits",
        "url": "/share-credits",
        "icon": "RiShareLine"
      }
    ]
  },
  "hero": {
    "tip": "🎁 Share to earn free credits - No payment required!",
    "buttons": [
      {
        "title": "Share & Get Free Credits",
        "url": "/share-credits"
      }
    ]
  }
}
```

## 测试指南 (Testing Guide)

### 开发测试 (Development Testing)
```bash
# 启动开发服务器
npm run dev

# 测试分享奖励处理
curl -X POST http://localhost:3000/api/test-share-reward \
  -H "Content-Type: application/json" \
  -d '{"action":"test-reward","inviteCode":"TEST123","userEmail":"test@example.com"}'

# 测试分享统计
curl -X POST http://localhost:3000/api/test-share-reward \
  -H "Content-Type: application/json" \
  -d '{"action":"test-summary","userEmail":"test@example.com"}'
```

### 功能测试 (Feature Testing)
1. 访问 `/share-credits` 页面
2. 生成邀请码
3. 使用邀请链接注册新用户
4. 检查积分是否正确增加

## 部署注意事项 (Deployment Notes)

### 环境变量 (Environment Variables)
确保以下环境变量正确配置：
```
NEXT_PUBLIC_WEB_URL=https://your-domain.com
```

### 生产环境清理 (Production Cleanup)
部署前移除测试API：
```bash
rm src/app/api/test-share-reward/route.ts
```

## 监控和维护 (Monitoring & Maintenance)

### 关键指标 (Key Metrics)
- 邀请码生成数量
- 成功邀请数量
- 积分发放总量
- 用户参与率

### 日志监控 (Log Monitoring)
关注以下日志：
- 分享奖励处理成功/失败
- 邀请码生成
- 积分发放记录

## 开发进度 (Development Progress)

### ✅ 已完成 (Completed)
- [x] 分享积分系统核心功能实现
- [x] 首页按钮更新 (Free Trial → Share & Get Credits)
- [x] 分享积分页面创建 (/share-credits)
- [x] 邀请码生成和管理功能
- [x] 社交媒体分享集成 (Twitter/Facebook/WhatsApp)
- [x] 分享统计数据展示
- [x] API 端点实现 (share-reward-summary, update-invite)
- [x] TypeScript 类型问题修复
- [x] 国际化路由支持
- [x] 代码提交和推送到 GitHub

### 🔄 进行中 (In Progress)
- [ ] Vercel 生产环境部署验证
- [ ] Google OAuth 生产环境测试
- [ ] 完整用户流程测试

### 📋 待办事项 (Todo)
- [ ] 移除开发测试 API (/api/test-share-reward)
- [ ] 性能优化和缓存策略
- [ ] 错误处理和日志完善
- [ ] 用户文档和帮助页面

## 部署状态 (Deployment Status)

### 最新提交 (Latest Commits)
```
89e0542 - fix(types): 修复分享积分页面的 TypeScript 类型错误
e3cdafa - feat(share-credits): 实现简化分享积分系统，替代复杂分佣机制
```

### Vercel 部署
- **状态**: 🔄 自动部署中
- **分支**: main
- **最新提交**: 89e0542

## 未来优化 (Future Improvements)

1. **邀请码优化**: 更友好的邀请码生成算法
2. **社交分享**: 更多社交平台集成
3. **奖励层级**: 基于邀请数量的不同奖励层级
4. **分析面板**: 管理员分享数据分析面板
5. **A/B 测试**: 不同奖励策略的效果测试

---

## 技术支持 (Technical Support)

如有问题，请检查：
1. 数据库连接是否正常
2. 环境变量是否配置正确
3. 用户认证是否正常工作
4. 积分系统是否正常运行

### 常见问题排查
- **TypeScript 编译错误**: 检查类型定义和接口匹配
- **路由重定向问题**: 验证 locale 参数和 callbackUrl 设置
- **API 调用失败**: 检查认证状态和请求参数
