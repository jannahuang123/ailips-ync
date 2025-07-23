# LipSyncVideo.net Stripe 支付系统与定价策略

## 🏆 竞争对手定价分析

### 📊 主要竞争对手当前定价 (2024年)

#### HeyGen 定价结构
```typescript
const heygenPricing = {
  free: {
    name: "Free",
    price: 0,
    credits: "1 minute/month",
    features: ["Basic avatars", "Watermark", "720p quality"]
  },
  
  creator: {
    name: "Creator", 
    price: 24, // $24/month (annual) or $29/month
    credits: "15 minutes/month",
    features: ["Premium avatars", "No watermark", "1080p", "Priority support"]
  },
  
  business: {
    name: "Business",
    price: 120, // $120/month (annual) or $144/month  
    credits: "90 minutes/month",
    features: ["All avatars", "API access", "Team collaboration", "Custom avatars"]
  },
  
  enterprise: {
    name: "Enterprise",
    price: "Custom",
    credits: "Custom",
    features: ["Unlimited", "Dedicated support", "Custom integration", "SLA"]
  }
};
```

#### D-ID 定价结构
```typescript
const didPricing = {
  trial: {
    name: "Trial",
    price: 0,
    credits: "20 credits (≈5.6 minutes)",
    features: ["Basic quality", "Watermark", "Limited avatars"]
  },
  
  lite: {
    name: "Lite",
    price: 5.99,
    credits: "15 minutes/month", 
    features: ["HD quality", "No watermark", "Basic support"]
  },
  
  pro: {
    name: "Pro", 
    price: 29.99,
    credits: "75 minutes/month",
    features: ["Premium quality", "API access", "Priority support", "Custom avatars"]
  },
  
  advanced: {
    name: "Advanced",
    price: 199.99,
    credits: "600 minutes/month", 
    features: ["Ultra quality", "Bulk processing", "White-label", "Dedicated support"]
  }
};
```

#### Synthesia 定价结构
```typescript
const synthesiaPricing = {
  free: {
    name: "Free",
    price: 0,
    credits: "3 minutes/month",
    features: ["9 avatars", "Watermark", "Basic quality"]
  },
  
  starter: {
    name: "Starter",
    price: 18, // $18/month (annual) or $22/month
    credits: "30 minutes/month",
    features: ["90+ avatars", "No watermark", "1080p", "Basic support"]
  },
  
  creator: {
    name: "Creator", 
    price: 67, // $67/month (annual) or $80/month
    credits: "90 minutes/month",
    features: ["140+ avatars", "Custom avatars", "API access", "Priority support"]
  },
  
  enterprise: {
    name: "Enterprise",
    price: "Custom",
    credits: "Custom", 
    features: ["Unlimited", "SSO", "Analytics", "Dedicated CSM"]
  }
};
```

## 💰 LipSyncVideo.net 定价策略设计

### 🎯 我们的竞争优势定价策略

基于竞争对手分析，我们的定价策略重点：
- **更具竞争力的价格点**
- **更灵活的积分制度**
- **更好的免费试用体验**
- **专注唇语同步的专业化定位**

```typescript
const lipsyncVideoPricing = {
  free: {
    name: "免费试用",
    nameEn: "Free Trial",
    price: 0,
    credits: 50, // 约5-10个短视频
    duration: "永久",
    features: [
      "基础画质 (720p)",
      "水印输出", 
      "5MB文件限制",
      "社区支持",
      "3种语言支持"
    ],
    limitations: [
      "每月最多5个项目",
      "单个视频最长30秒",
      "标准处理速度"
    ]
  },
  
  starter: {
    name: "入门版",
    nameEn: "Starter",
    price: 19, // 比竞争对手低20-30%
    priceAnnual: 15, // 年付8折
    credits: 500, // 约50-100个短视频
    duration: "月付/年付",
    features: [
      "高清画质 (1080p)",
      "无水印输出",
      "50MB文件限制", 
      "邮件支持",
      "10种语言支持",
      "批量处理 (最多5个)"
    ],
    popular: false
  },
  
  professional: {
    name: "专业版", 
    nameEn: "Professional",
    price: 49, // 市场中位价格
    priceAnnual: 39, // 年付8折
    credits: 1500, // 约150-300个短视频
    duration: "月付/年付",
    features: [
      "超高清画质 (4K)",
      "无水印输出",
      "200MB文件限制",
      "优先处理队列",
      "20种语言支持", 
      "批量处理 (最多20个)",
      "API访问 (1000次/月)",
      "优先客服支持",
      "高级编辑功能"
    ],
    popular: true // 主推套餐
  },
  
  enterprise: {
    name: "企业版",
    nameEn: "Enterprise", 
    price: 199,
    priceAnnual: 159, // 年付8折
    credits: 8000, // 约800-1600个短视频
    duration: "月付/年付",
    features: [
      "超高清画质 (4K)",
      "无水印输出",
      "无文件大小限制",
      "最高优先级处理",
      "50种语言支持",
      "无限批量处理", 
      "无限API访问",
      "专属客户经理",
      "白标解决方案",
      "SLA保证 (99.9%)",
      "自定义集成",
      "团队协作功能"
    ],
    popular: false
  }
};
```

### 💎 积分包补充方案 (Pay-as-you-go)
```typescript
const creditPacks = {
  small: {
    name: "小包装",
    nameEn: "Small Pack",
    credits: 200,
    price: 9.99,
    pricePerCredit: 0.05, // $0.05 per credit
    bonus: 0,
    validDays: 90
  },
  
  medium: {
    name: "中包装", 
    nameEn: "Medium Pack",
    credits: 500,
    price: 19.99,
    pricePerCredit: 0.04, // $0.04 per credit
    bonus: 50, // 10% bonus credits
    validDays: 180,
    popular: true
  },
  
  large: {
    name: "大包装",
    nameEn: "Large Pack", 
    credits: 1200,
    price: 39.99,
    pricePerCredit: 0.033, // $0.033 per credit
    bonus: 200, // 16.7% bonus credits
    validDays: 365
  },
  
  bulk: {
    name: "批量包",
    nameEn: "Bulk Pack",
    credits: 3000, 
    price: 79.99,
    pricePerCredit: 0.027, // $0.027 per credit
    bonus: 600, // 20% bonus credits
    validDays: 365
  }
};
```

## 🔧 Stripe 集成技术实现

### 📦 Stripe 配置和产品设置

#### 1. Stripe 产品和价格配置
```typescript
// src/lib/stripe/products.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// 创建订阅产品
export const createSubscriptionProducts = async () => {
  // 入门版产品
  const starterProduct = await stripe.products.create({
    name: 'LipSyncVideo Starter',
    description: 'Perfect for content creators and small businesses',
    metadata: {
      plan: 'starter',
      credits: '500',
      features: JSON.stringify([
        'HD Quality (1080p)',
        'No Watermark', 
        'Email Support',
        '10 Languages'
      ])
    }
  });

  // 入门版价格 (月付)
  const starterPriceMonthly = await stripe.prices.create({
    product: starterProduct.id,
    unit_amount: 1900, // $19.00
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    metadata: {
      credits: '500'
    }
  });

  // 入门版价格 (年付)
  const starterPriceYearly = await stripe.prices.create({
    product: starterProduct.id,
    unit_amount: 15000, // $150.00 (年付8折)
    currency: 'usd', 
    recurring: {
      interval: 'year',
    },
    metadata: {
      credits: '6000' // 12个月 * 500积分
    }
  });

  // 专业版产品
  const professionalProduct = await stripe.products.create({
    name: 'LipSyncVideo Professional',
    description: 'Advanced features for professional creators',
    metadata: {
      plan: 'professional',
      credits: '1500',
      popular: 'true'
    }
  });

  // 专业版价格配置...
  return {
    starter: {
      product: starterProduct.id,
      priceMonthly: starterPriceMonthly.id,
      priceYearly: starterPriceYearly.id
    },
    professional: {
      product: professionalProduct.id,
      // ... 其他价格ID
    }
  };
};

// 创建积分包产品
export const createCreditPackProducts = async () => {
  const creditPackProduct = await stripe.products.create({
    name: 'LipSyncVideo Credits',
    description: 'Pay-as-you-go credits for video processing',
    type: 'good' // 一次性购买
  });

  // 中包装积分
  const mediumPackPrice = await stripe.prices.create({
    product: creditPackProduct.id,
    unit_amount: 1999, // $19.99
    currency: 'usd',
    metadata: {
      credits: '500',
      bonus: '50',
      validDays: '180'
    }
  });

  return {
    creditPack: {
      product: creditPackProduct.id,
      mediumPack: mediumPackPrice.id
    }
  };
};
```

#### 2. 订阅管理 API
```typescript
// src/app/api/stripe/create-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import Stripe from 'stripe';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, planType } = await request.json();

    // 获取用户信息
    const user = await db.query.users.findFirst({
      where: eq(users.uuid, session.user.uuid)
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 创建或获取 Stripe 客户
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.nickname || undefined,
        metadata: {
          userUuid: user.uuid
        }
      });
      
      customerId = customer.id;
      
      // 更新用户的 Stripe 客户ID
      await db.update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.uuid, user.uuid));
    }

    // 创建订阅
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userUuid: user.uuid,
        planType: planType
      }
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      status: subscription.status
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
```

#### 3. 积分包购买 API
```typescript
// src/app/api/stripe/buy-credits/route.ts
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packType } = await request.json();
    const creditPack = creditPacks[packType];
    
    if (!creditPack) {
      return NextResponse.json({ error: 'Invalid pack type' }, { status: 400 });
    }

    // 创建 Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${creditPack.name} - ${creditPack.credits + creditPack.bonus} Credits`,
              description: `Valid for ${creditPack.validDays} days`,
              metadata: {
                packType: packType,
                credits: creditPack.credits.toString(),
                bonus: creditPack.bonus.toString()
              }
            },
            unit_amount: creditPack.price * 100, // 转换为分
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_WEB_URL}/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_WEB_URL}/credits?canceled=true`,
      metadata: {
        userUuid: session.user.uuid,
        packType: packType,
        credits: creditPack.credits.toString(),
        bonus: creditPack.bonus.toString(),
        validDays: creditPack.validDays.toString()
      }
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id
    });

  } catch (error) {
    console.error('Buy credits error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

#### 4. Webhook 处理
```typescript
// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { users, orders, credits } from '@/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'invoice.payment_succeeded':
        await handleSubscriptionPayment(event.data.object as Stripe.Invoice);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userUuid = session.metadata?.userUuid;
  const packType = session.metadata?.packType;
  
  if (!userUuid || !packType) return;

  const creditPack = creditPacks[packType];
  const totalCredits = creditPack.credits + creditPack.bonus;

  // 添加积分到用户账户
  await db.insert(credits).values({
    userUuid: userUuid,
    amount: totalCredits,
    type: 'purchase',
    description: `Purchased ${creditPack.name}`,
    expiresAt: new Date(Date.now() + creditPack.validDays * 24 * 60 * 60 * 1000),
    createdAt: new Date()
  });

  // 创建订单记录
  await db.insert(orders).values({
    orderNo: `CR_${Date.now()}`,
    userUuid: userUuid,
    userEmail: session.customer_email || '',
    amount: session.amount_total || 0,
    status: 'completed',
    stripeSessionId: session.id,
    createdAt: new Date()
  });
}

async function handleSubscriptionPayment(invoice: Stripe.Invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const userUuid = subscription.metadata?.userUuid;
  const planType = subscription.metadata?.planType;
  
  if (!userUuid || !planType) return;

  const plan = lipsyncVideoPricing[planType];
  
  // 添加月度积分
  await db.insert(credits).values({
    userUuid: userUuid,
    amount: plan.credits,
    type: 'subscription',
    description: `Monthly credits for ${plan.name}`,
    expiresAt: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000), // 31天后过期
    createdAt: new Date()
  });

  // 更新用户订阅状态
  await db.update(users)
    .set({ 
      subscriptionTier: planType,
      subscriptionStatus: 'active',
      updatedAt: new Date()
    })
    .where(eq(users.uuid, userUuid));
}
```

### 💱 多货币支持实现

```typescript
// src/lib/stripe/currency.ts
export const supportedCurrencies = {
  USD: {
    symbol: '$',
    name: 'US Dollar',
    countries: ['US', 'CA', 'AU', 'GB']
  },
  EUR: {
    symbol: '€', 
    name: 'Euro',
    countries: ['DE', 'FR', 'IT', 'ES', 'NL']
  },
  GBP: {
    symbol: '£',
    name: 'British Pound',
    countries: ['GB']
  },
  JPY: {
    symbol: '¥',
    name: 'Japanese Yen', 
    countries: ['JP']
  },
  KRW: {
    symbol: '₩',
    name: 'Korean Won',
    countries: ['KR']
  }
};

// 汇率转换 (实际应用中应该使用实时汇率API)
export const currencyRates = {
  USD: 1.0,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110.0,
  KRW: 1200.0
};

export function convertPrice(usdPrice: number, targetCurrency: string): number {
  const rate = currencyRates[targetCurrency] || 1.0;
  return Math.round(usdPrice * rate);
}

export function formatPrice(amount: number, currency: string): string {
  const currencyInfo = supportedCurrencies[currency];
  if (!currencyInfo) return `$${amount}`;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
```

## 📊 定价策略分析总结

### 🎯 我们的竞争优势
1. **价格优势**: 比主要竞争对手低20-30%
2. **灵活性**: 订阅制 + 积分包双重选择
3. **专业化**: 专注唇语同步，功能更精准
4. **用户友好**: 更长的免费试用期和更多免费积分

### 📈 预期收入模型
```typescript
const revenueProjection = {
  month1: { 
    freeUsers: 500, 
    starterUsers: 20, 
    proUsers: 5, 
    revenue: 625 
  },
  month6: { 
    freeUsers: 2000, 
    starterUsers: 200, 
    proUsers: 80, 
    revenue: 7720 
  },
  month12: { 
    freeUsers: 5000, 
    starterUsers: 500, 
    proUsers: 200, 
    revenue: 19300 
  }
};
```

---

*定价策略将根据市场反馈和竞争环境变化进行动态调整。*
