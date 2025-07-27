# 🚀 基于ShipAny模板的LipSync优化方案

## 📊 **ShipAny模板利用分析**

### **✅ 可直接复用 (90%+ 利用率)**
```typescript
const directReuse = {
  // 1. 完整的积分系统 ✅
  creditSystem: {
    files: ["src/services/credit.ts", "src/models/credit.ts"],
    utilization: "100%",
    customization: "仅调整积分消耗量"
  },
  
  // 2. 支付系统 ✅  
  paymentSystem: {
    files: ["src/components/blocks/pricing/", "src/app/api/checkout/"],
    utilization: "95%",
    customization: "更新定价配置"
  },
  
  // 3. UI组件库 ✅
  uiComponents: {
    files: ["src/components/ui/*"],
    utilization: "100%",
    customization: "保持现有设计系统"
  },
  
  // 4. 用户认证 ✅
  authentication: {
    files: ["src/auth.ts", "src/components/sign/"],
    utilization: "100%",
    customization: "无需修改"
  }
}
```

## 🎨 **定价页面优化 (基于现有Pricing组件)**

### **更新定价配置文件**
```json
// src/i18n/pages/pricing/zh.json (优化版)
{
  "pricing": {
    "name": "pricing",
    "title": "LipSync Video 定价",
    "description": "选择适合您的口型同步视频方案，基于Google Veo3技术",
    "groups": [
      {
        "name": "usage_type",
        "title": "使用场景",
        "items": ["social", "business"]
      }
    ],
    "items": [
      {
        "title": "社交媒体版",
        "description": "快速制作，分享朋友圈",
        "group": "social",
        "features": [
          "3积分/视频 (约$0.39)",
          "1080p高清输出",
          "15秒快速生成",
          "完美口型同步",
          "适合抖音、小红书"
        ],
        "interval": "one-time",
        "amount": 499,
        "currency": "USD", 
        "price": "$4.99",
        "credits": 30,
        "valid_months": 3,
        "product_id": "lipsync_social",
        "icon": "📱"
      },
      {
        "title": "商业专业版",
        "description": "商业品质，客户展示",
        "group": "business",
        "is_featured": true,
        "features": [
          "8积分/视频 (约$1.04)",
          "4K超高清输出", 
          "精准口型同步",
          "自动面部美化",
          "多语言支持",
          "商业使用授权"
        ],
        "interval": "one-time",
        "amount": 999,
        "currency": "USD",
        "price": "$9.99", 
        "credits": 80,
        "valid_months": 6,
        "product_id": "lipsync_business",
        "icon": "💼"
      }
    ]
  }
}
```

### **积分消耗配置更新**
```typescript
// src/services/credit.ts (新增)
export enum LipSyncCredits {
  // 基于使用场景的简化定价
  SocialMedia = 3,     // $0.39/视频 - 社交媒体
  Business = 8,        // $1.04/视频 - 商业用途
  
  // 附加功能 (可选)
  FaceEnhancement = 2, // 面部美化
  MultiLanguage = 1,   // 多语言支持
  HighPrecision = 3,   // 超精准同步
}

// 计算函数
export function calculateLipSyncCredits(config: {
  type: 'social' | 'business';
  duration: number; // 秒
  enhancements?: string[];
}): number {
  const baseCredits = config.type === 'social' 
    ? LipSyncCredits.SocialMedia 
    : LipSyncCredits.Business;
    
  // 时长倍数 (基于10秒)
  const durationMultiplier = Math.ceil(config.duration / 10);
  let totalCredits = baseCredits * durationMultiplier;
  
  // 附加功能
  if (config.enhancements?.includes('face_enhancement')) {
    totalCredits += LipSyncCredits.FaceEnhancement;
  }
  
  return totalCredits;
}
```

## 🎬 **主编辑器组件 (基于ShipAny设计系统)**

### **创建LipSync编辑器组件**
```typescript
// src/components/blocks/lipsync-editor/index.tsx
"use client";

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAppContext } from '@/contexts/app';

interface LipSyncEditorProps {
  userCredits: number;
}

export default function LipSyncEditor({ userCredits }: LipSyncEditorProps) {
  const { user } = useAppContext();
  const [inputType, setInputType] = useState<'image' | 'video'>('image');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [speechText, setSpeechText] = useState('');
  const [usageType, setUsageType] = useState<'social' | 'business'>('business');
  const [isGenerating, setIsGenerating] = useState(false);

  // 计算积分消耗
  const estimatedCredits = useCallback(() => {
    if (!speechText.trim()) return 0;
    
    const duration = Math.ceil(speechText.length / 10); // 粗略估算
    return usageType === 'social' ? 3 * Math.ceil(duration / 10) : 8 * Math.ceil(duration / 10);
  }, [speechText, usageType]);

  const handleGenerate = async () => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    if (!uploadedFile) {
      toast.error('请上传图片或视频');
      return;
    }

    if (!speechText.trim()) {
      toast.error('请输入要说的内容');
      return;
    }

    const credits = estimatedCredits();
    if (credits > userCredits) {
      toast.error(`积分不足，需要${credits}积分，当前${userCredits}积分`);
      return;
    }

    setIsGenerating(true);
    
    try {
      // 调用生成API
      const response = await fetch('/api/lipsync/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputType,
          speechText,
          usageType,
          estimatedCredits: credits
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('视频生成中，请稍候...');
        // 跳转到项目页面查看进度
        window.location.href = `/projects/${result.projectId}`;
      } else {
        throw new Error('生成失败');
      }
    } catch (error) {
      toast.error('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧输入区 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎬 LipSync Video 编辑器
                <Badge variant="secondary">Powered by Veo3</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 输入类型选择 */}
              <Tabs value={inputType} onValueChange={(v) => setInputType(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    📸 图片说话
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    🎬 视频配音
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="image" className="mt-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    {uploadedFile ? (
                      <div className="space-y-4">
                        <img 
                          src={URL.createObjectURL(uploadedFile)} 
                          alt="Preview" 
                          className="max-w-full max-h-48 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-muted-foreground">{uploadedFile.name}</p>
                        <Button variant="outline" onClick={() => setUploadedFile(null)}>
                          重新选择
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="text-6xl mb-4">📸</div>
                        <p className="text-lg font-medium mb-2">上传人物照片</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          支持 JPG、PNG 格式，最大 10MB
                        </p>
                        <Button onClick={() => document.getElementById('image-upload')?.click()}>
                          选择图片
                        </Button>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="video" className="mt-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    {uploadedFile ? (
                      <div className="space-y-4">
                        <video 
                          src={URL.createObjectURL(uploadedFile)} 
                          className="max-w-full max-h-48 mx-auto rounded-lg"
                          controls
                        />
                        <p className="text-sm text-muted-foreground">{uploadedFile.name}</p>
                        <Button variant="outline" onClick={() => setUploadedFile(null)}>
                          重新选择
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="text-6xl mb-4">🎬</div>
                        <p className="text-lg font-medium mb-2">上传视频文件</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          支持 MP4、MOV 格式，最大 100MB
                        </p>
                        <Button onClick={() => document.getElementById('video-upload')?.click()}>
                          选择视频
                        </Button>
                        <input
                          id="video-upload"
                          type="file"
                          accept="video/*"
                          onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* 语音内容输入 */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">💬 要说的内容</label>
                  <Textarea
                    placeholder="请输入您想让人物说的话..."
                    value={speechText}
                    onChange={(e) => setSpeechText(e.target.value)}
                    rows={4}
                    maxLength={300}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {speechText.length}/300 字符 • 预计时长: {Math.ceil(speechText.length / 10)}秒
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">🎭 语音风格</label>
                    <Select defaultValue="professional">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="natural">自然对话</SelectItem>
                        <SelectItem value="professional">专业播报</SelectItem>
                        <SelectItem value="casual">轻松聊天</SelectItem>
                        <SelectItem value="dramatic">戏剧表演</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">🌍 语言</label>
                    <Select defaultValue="auto">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">自动识别</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                        <SelectItem value="ko">한국어</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧设置区 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>⚙️ 生成设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 使用场景选择 */}
              <div>
                <label className="text-sm font-medium mb-3 block">🎯 使用场景</label>
                <div className="space-y-2">
                  <div
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      usageType === 'social' ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
                    }`}
                    onClick={() => setUsageType('social')}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">📱 社交媒体</span>
                      <Badge variant="secondary">3💎/视频</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">快速制作，分享朋友圈</p>
                  </div>

                  <div
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      usageType === 'business' ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
                    }`}
                    onClick={() => setUsageType('business')}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">💼 商业专业</span>
                      <Badge variant="secondary">8💎/视频</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">商业品质，客户展示</p>
                  </div>
                </div>
              </div>

              {/* 积分计算 */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">💰 预估消耗</span>
                  <Badge variant={estimatedCredits() <= userCredits ? "default" : "destructive"}>
                    {estimatedCredits()}💎
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>您的余额:</span>
                    <span>{userCredits}💎</span>
                  </div>
                  <div className="flex justify-between">
                    <span>生成后余额:</span>
                    <span>{Math.max(0, userCredits - estimatedCredits())}💎</span>
                  </div>
                </div>
              </div>

              {/* 生成按钮 */}
              <Button 
                onClick={handleGenerate}
                disabled={!uploadedFile || !speechText.trim() || estimatedCredits() > userCredits || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    生成中...
                  </>
                ) : (
                  <>
                    🚀 生成口型同步视频
                  </>
                )}
              </Button>

              {estimatedCredits() > userCredits && (
                <p className="text-xs text-destructive text-center">
                  积分不足，请先购买积分
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

## 🏠 **首页集成 (基于现有Hero组件)**

### **更新首页配置**
```json
// src/i18n/pages/landing/zh.json (部分更新)
{
  "hero": {
    "title": "AI口型同步视频生成器",
    "subtitle": "基于Google Veo3技术，让照片开口说话",
    "description": "上传照片，输入文字，一键生成专业级口型同步视频。比竞品便宜50%，质量更优秀。",
    "button": {
      "title": "免费试用",
      "url": "/create"
    },
    "video_demo": "/demo/lipsync-demo.mp4"
  },
  
  "feature": {
    "title": "为什么选择我们的LipSync技术",
    "items": [
      {
        "icon": "🎯",
        "title": "专业口型同步",
        "description": "基于Google Veo3，实现完美的唇语同步效果"
      },
      {
        "icon": "💰", 
        "title": "性价比最高",
        "description": "比竞品便宜50%，社交版仅需$0.39/视频"
      },
      {
        "icon": "⚡",
        "title": "快速生成",
        "description": "15秒-2分钟完成，支持多种输入格式"
      }
    ]
  }
}
```

## 📊 **项目管理页面 (基于现有Table组件)**

### **项目列表页面**
```typescript
// src/app/[locale]/(dashboard)/projects/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ProjectsTable from '@/components/blocks/projects-table';

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">我的项目</h1>
        <Button asChild>
          <Link href="/create">
            🎬 创建新项目
          </Link>
        </Button>
      </div>
      
      <ProjectsTable userUuid={session.user.uuid} />
    </div>
  );
}
```

## 🎯 **实施优势**

### **1. 最大化利用ShipAny模板**
```
✅ 积分系统: 100%复用，仅调整消耗量
✅ 支付系统: 95%复用，更新定价配置  
✅ UI组件: 100%复用，保持设计一致性
✅ 用户系统: 100%复用，无需修改
✅ 国际化: 100%复用，仅更新翻译
```

### **2. 开发效率提升**
```
传统开发: 30-45天
基于ShipAny: 10-15天 (节省60%时间)

核心原因:
- 支付系统已完善
- UI组件库完整
- 用户认证现成
- 数据库结构可复用
```

### **3. 用户体验一致性**
```
✅ 保持ShipAny的设计语言
✅ 复用成熟的交互模式
✅ 利用用户熟悉的操作流程
✅ 减少学习成本
```

这个方案如何？完全基于ShipAny现有结构，最大化利用模板优势，同时实现了简化的两档定价策略！
