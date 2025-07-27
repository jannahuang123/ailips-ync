# 💰 LipSync Video 积分定价策略

## 📊 **成本分析基础**

### **Veo3成本结构**
```
- Veo3 API成本: ¥1.00/视频 ≈ $0.14/视频
- 服务器成本: $0.02/视频 (存储+带宽)
- 总成本: $0.16/视频
```

### **目标利润率**
```
- 毛利率目标: 75-80%
- 单视频售价: $0.50-0.80
- 对应积分: 10-16积分
```

## 🎯 **积分消耗标准**

### **基础消耗 (每次生成)**
```typescript
export enum LipSyncCredits {
  // 基础质量等级
  Standard = 10,        // $0.50 (1080p, 基础同步)
  Premium = 15,         // $0.75 (4K, 精准同步) 
  Ultra = 20,           // $1.00 (8K, 完美同步)
  
  // 附加功能
  FaceEnhancement = 3,  // 面部增强
  BackgroundRemoval = 2, // 背景移除
  BackgroundReplace = 3, // 背景替换
  HighPrecisionSync = 5, // 超精准同步
  
  // 时长倍数 (基于10秒)
  // 20秒视频 = 基础积分 × 2
  // 30秒视频 = 基础积分 × 3
}
```

### **实际消耗计算**
```typescript
// 示例计算
const calculateCredits = (config) => {
  let base = config.quality; // 10/15/20
  
  // 时长倍数
  const durationMultiplier = config.duration / 10;
  base *= durationMultiplier;
  
  // 附加功能
  if (config.faceEnhancement) base += 3;
  if (config.backgroundRemoval) base += 2;
  if (config.highPrecision) base += 5;
  
  return Math.ceil(base);
}

// 典型场景
const examples = {
  basic: {
    quality: "Standard",
    duration: 10,
    cost: 10 // credits
  },
  popular: {
    quality: "Premium", 
    duration: 15,
    faceEnhancement: true,
    cost: 15 * 1.5 + 3 = 26 // credits
  },
  professional: {
    quality: "Ultra",
    duration: 30, 
    faceEnhancement: true,
    backgroundReplace: true,
    cost: 20 * 3 + 3 + 3 = 66 // credits
  }
}
```

## 🎁 **新用户赠送策略**

### **免费积分方案**
```typescript
const FREE_CREDITS = {
  newUser: 20,           // 注册即送 (2个标准视频)
  emailVerify: 10,       // 邮箱验证奖励
  firstShare: 5,         // 首次分享奖励
  dailyLogin: 2,         // 每日登录 (限前7天)
  
  total: 20 + 10 + 5 + 14 = 49 // 约5个标准视频
}
```

### **推荐奖励**
```typescript
const REFERRAL_REWARDS = {
  inviter: 30,           // 邀请人奖励
  invitee: 20,           // 被邀请人奖励
  condition: "被邀请人完成首次付费"
}
```

## 💳 **订阅套餐方案**

### **方案A: 积分包模式 (推荐)**
```typescript
const CREDIT_PACKAGES = {
  starter: {
    name: "入门包",
    price: "$9.99",
    credits: 50,           // 5个标准视频
    bonus: 10,             // 首购奖励
    total: 60,
    costPerCredit: "$0.17",
    validity: "3个月",
    features: [
      "50积分 + 10奖励积分",
      "支持所有质量等级", 
      "3个月有效期",
      "邮件客服支持"
    ]
  },
  
  popular: {
    name: "热门包",
    price: "$19.99", 
    credits: 120,          // 12个标准视频
    bonus: 30,             // 25%奖励
    total: 150,
    costPerCredit: "$0.13",
    validity: "6个月",
    popular: true,
    features: [
      "120积分 + 30奖励积分",
      "优先处理队列",
      "6个月有效期", 
      "高级功能解锁",
      "24小时客服支持"
    ]
  },
  
  professional: {
    name: "专业包",
    price: "$49.99",
    credits: 350,          // 35个标准视频  
    bonus: 100,            // 29%奖励
    total: 450,
    costPerCredit: "$0.11",
    validity: "12个月",
    features: [
      "350积分 + 100奖励积分",
      "即时处理 (无队列)",
      "12个月有效期",
      "所有高级功能",
      "API访问权限",
      "专属客服经理"
    ]
  }
}
```

### **方案B: 订阅模式 (备选)**
```typescript
const SUBSCRIPTION_PLANS = {
  basic: {
    name: "基础版",
    price: "$9.99/月",
    monthlyCredits: 50,
    features: [
      "每月50积分",
      "标准质量无限制",
      "邮件支持"
    ]
  },
  
  pro: {
    name: "专业版", 
    price: "$19.99/月",
    monthlyCredits: 120,
    features: [
      "每月120积分",
      "所有质量等级",
      "优先处理",
      "高级功能",
      "24小时支持"
    ]
  }
}
```

## 📈 **定价合理性验证**

### **竞品对比**
```
HeyGen: $30/月 (15个视频) = $2.00/视频
D-ID: $56/月 (20个视频) = $2.80/视频
Synthesia: $30/月 (10个视频) = $3.00/视频

我们: $19.99/150积分 = $0.13/积分
- 标准视频: $1.30 (10积分)
- 高级视频: $1.95 (15积分)
- 超级视频: $2.60 (20积分)

✅ 价格优势明显 (比竞品便宜30-50%)
```

### **用户价值分析**
```
用户获得:
- 高质量LipSync视频
- Veo3最新AI技术
- 多种输入方式
- 专业级音频
- 快速处理

成本对比:
- 自己制作: 时间成本高 + 技术门槛
- 外包制作: $50-200/视频
- 我们平台: $1.30-2.60/视频

✅ 性价比极高
```

## 🎯 **推荐最终方案**

### **积分消耗**
```
✅ 标准质量: 10积分 ($0.50成本, $1.30售价)
✅ 高级质量: 15积分 ($0.50成本, $1.95售价)  
✅ 超级质量: 20积分 ($0.50成本, $2.60售价)
```

### **新用户赠送**
```
✅ 注册赠送: 20积分 (2个标准视频体验)
✅ 完善资料: +10积分
✅ 邀请奖励: 30积分/成功邀请
```

### **套餐推荐**
```
✅ 入门包: $9.99 → 60积分 (6个标准视频)
✅ 热门包: $19.99 → 150积分 (15个标准视频) 
✅ 专业包: $49.99 → 450积分 (45个标准视频)
```

### **关键优势**
```
💰 价格: 比竞品便宜30-50%
🚀 技术: Veo3最新AI技术
⚡ 速度: 原生音频生成，无需上传
🎯 定位: 专注LipSync垂直领域
```

**请确认**: 这个积分消耗和定价策略是否合理？需要调整哪些部分？
