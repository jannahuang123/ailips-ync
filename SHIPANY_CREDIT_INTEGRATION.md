# 💳 ShipAny积分系统集成指南

## ✅ **完全复用ShipAny积分系统**

### **核心原则**
- ❌ **不创建新的积分系统**
- ❌ **不修改现有积分逻辑**  
- ✅ **完全复用ShipAny现有积分架构**
- ✅ **仅扩展LipSync相关的积分类型**

## 🏗️ **现有积分系统架构**

### **1. 积分服务层**
```typescript
// src/services/credit.ts - 完全复用
export enum CreditsTransType {
  NewUser = "new_user",
  OrderPay = "order_pay", 
  SystemAdd = "system_add",
  Ping = "ping",
  LipSyncLow = "lipsync_low",        // ✅ 已存在
  LipSyncMedium = "lipsync_medium",  // ✅ 已存在  
  LipSyncHigh = "lipsync_high",      // ✅ 已存在
  LipSyncUltra = "lipsync_ultra",    // ✅ 已存在
}

export enum CreditsAmount {
  NewUserGet = 10,
  PingCost = 1,
  LipSyncMediumCost = 10,  // ✅ 使用此值
  LipSyncHighCost = 20,
  LipSyncUltraCost = 30,
}
```

### **2. 积分API端点**
```typescript
// src/app/api/get-user-credits/route.ts - 完全复用
export async function POST(req: Request) {
  const user_uuid = await getUserUuid();
  const credits = await getUserCredits(user_uuid);
  return respData(credits);
}
```

### **3. 积分数据模型**
```typescript
// src/models/credit.ts - 完全复用
export async function getUserValidCredits(user_uuid: string)
export async function insertCredit(data)
export async function decreaseCredits({user_uuid, trans_type, credits})
```

## 🎯 **LipSync编辑器集成**

### **1. 积分获取 (复用现有API)**
```typescript
// src/components/lipsync/LipSyncEditorWrapper.tsx
const fetchUserCredits = async () => {
  try {
    // ✅ 使用ShipAny现有API
    const response = await fetch('/api/get-user-credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.code === 0 && data.data) {
        setUserCredits(data.data.left_credits || 0);
      }
    }
  } catch (error) {
    console.error('Failed to fetch user credits:', error);
  }
};
```

### **2. 积分消耗 (复用现有逻辑)**
```typescript
// src/app/api/lipsync/create/route.ts - 已存在
const creditsNeeded = 10; // CreditsAmount.LipSyncMediumCost

// ✅ 使用ShipAny现有积分验证
const userCredits = await getUserCredits(session.user.uuid);
if (userCredits.left_credits < creditsNeeded) {
  return NextResponse.json({
    error: 'Insufficient credits',
    required: creditsNeeded,
    available: userCredits.left_credits
  }, { status: 402 });
}

// ✅ 使用ShipAny现有积分扣除
await decreaseCredits({
  user_uuid: session.user.uuid,
  trans_type: CreditsTransType.LipSyncMedium,
  credits: creditsNeeded
});
```

## 📊 **积分定价策略**

### **LipSync积分消耗标准**
```typescript
const LIPSYNC_CREDITS = {
  // 基于ShipAny现有定义
  medium: 10,    // $0.50 per video (标准质量)
  high: 20,      // $1.00 per video (高质量)
  ultra: 30,     // $1.50 per video (超高质量)
  
  // 编辑器默认使用medium质量
  default: 10
};
```

### **用户积分显示**
```typescript
// 编辑器中的积分显示
<div className="flex justify-between items-center text-sm">
  <span className="text-muted-foreground font-medium">
    Cost: 10 credits
  </span>
  <span className="text-foreground font-semibold">
    Your balance: {loading ? "..." : userCredits} credits
  </span>
</div>
```

## 🔄 **积分流程集成**

### **完整用户流程**
```
1. 用户访问编辑器
   ↓
2. 自动获取积分余额 (复用 /api/get-user-credits)
   ↓  
3. 显示积分余额和消耗预估
   ↓
4. 用户点击生成
   ↓
5. 验证积分充足 (复用 getUserCredits)
   ↓
6. 扣除积分 (复用 decreaseCredits)
   ↓
7. 开始AI处理
   ↓
8. 刷新积分余额显示
```

### **错误处理**
```typescript
// 积分不足处理
if (userCredits < creditsNeeded) {
  toast.error(`Insufficient credits. You need ${creditsNeeded} credits to generate.`);
  // 可选：引导用户到定价页面
  // router.push('/pricing');
  return;
}
```

## 💰 **支付系统集成**

### **复用ShipAny定价页面**
```typescript
// src/app/[locale]/(default)/pricing/page.tsx - 完全复用
// 用户积分不足时，引导到现有定价页面
// 无需修改任何支付逻辑
```

### **积分充值流程**
```
1. 用户积分不足
   ↓
2. 点击"Buy More Credits"
   ↓  
3. 跳转到 /pricing (ShipAny现有页面)
   ↓
4. 使用Stripe支付 (ShipAny现有流程)
   ↓
5. 支付成功后自动添加积分 (ShipAny现有逻辑)
   ↓
6. 返回编辑器，积分余额自动更新
```

## 📱 **用户界面集成**

### **积分余额显示**
```typescript
// 实时显示用户积分
const [userCredits, setUserCredits] = useState(0);
const [loading, setLoading] = useState(false);

// 组件加载时获取积分
useEffect(() => {
  if (session?.user) {
    fetchUserCredits();
  }
}, [session]);

// 生成完成后刷新积分
const handleGenerate = (data: any) => {
  if (session?.user) {
    fetchUserCredits(); // 刷新积分显示
  }
};
```

### **积分状态指示**
```typescript
// 根据积分余额显示不同状态
const canGenerate = userCredits >= 10;
const buttonText = isGenerating 
  ? "Generating..." 
  : canGenerate 
    ? "Generate" 
    : "Insufficient Credits";
```

## 🔍 **积分历史查看**

### **复用现有积分历史页面**
```typescript
// src/app/[locale]/(default)/(console)/my-credits/page.tsx - 完全复用
// 用户可以在"我的积分"页面查看：
// - 积分余额
// - 消费记录  
// - 充值历史
// - LipSync消费记录 (自动显示)
```

## ✅ **集成验证清单**

### **功能验证**
- [x] 积分余额正确显示
- [x] 积分消耗正确扣除 (10积分/次)
- [x] 积分不足时正确提示
- [x] 生成后积分余额自动刷新
- [x] 积分历史正确记录

### **API验证**
- [x] `/api/get-user-credits` 正常工作
- [x] `/api/lipsync/create` 正确扣除积分
- [x] 积分验证逻辑正确
- [x] 错误处理完善

### **用户体验验证**
- [x] 积分加载状态显示
- [x] 积分不足时引导充值
- [x] 生成成功后积分更新
- [x] 错误提示清晰明确

## 🚀 **部署注意事项**

### **环境变量**
```bash
# 无需新增环境变量
# 完全复用ShipAny现有配置
DATABASE_URL=your_database_url
STRIPE_PUBLIC_KEY=your_stripe_key
STRIPE_PRIVATE_KEY=your_stripe_secret
```

### **数据库**
```sql
-- 无需新增表结构
-- 完全复用ShipAny现有credits表
-- LipSync消费记录自动存储到现有表中
```

**✅ 积分系统集成完成！完全基于ShipAny现有架构，无任何重复建设。**
