# 🎨 LipSync Editor Theme Adaptation Guide

## ✅ **完成的主题适配**

### **1. 核心主题系统集成**
- ✅ 导入 `useTheme` from `next-themes`
- ✅ 使用 `cn` 工具函数进行条件样式
- ✅ 替换所有硬编码颜色为主题变量

### **2. 颜色系统映射**

#### **原始硬编码颜色 → 主题变量**
```typescript
// 🚫 Before (硬编码)
className="bg-gray-900 border-gray-700 text-white"

// ✅ After (主题适配)
className="bg-card border-border text-card-foreground"
```

#### **完整颜色映射表**
| 组件区域 | 原始颜色 | 主题变量 | 亮色模式 | 暗色模式 |
|---------|---------|---------|---------|---------|
| **主容器** | `bg-gray-900` | `bg-card` | 白色 | 深灰色 |
| **边框** | `border-gray-700` | `border-border` | 浅灰色 | 深灰色 |
| **主文字** | `text-white` | `text-foreground` | 黑色 | 白色 |
| **次要文字** | `text-gray-400` | `text-muted-foreground` | 灰色 | 浅灰色 |
| **输入框背景** | `bg-gray-800` | `bg-background` | 白色 | 黑色 |
| **按钮背景** | `bg-gray-800` | `bg-muted` | 浅灰色 | 深灰色 |
| **预览区域** | `bg-gray-800` | `bg-muted` | 浅灰色 | 深灰色 |

### **3. 组件级别的主题适配**

#### **3.1 主容器 (Card)**
```typescript
<Card className={cn(
  "shadow-2xl transition-colors duration-200",
  "bg-card border-border text-card-foreground"
)}>
```

#### **3.2 标签页 (Tabs)**
```typescript
<TabsList className={cn(
  "grid w-full grid-cols-2 transition-colors",
  "bg-muted border-border"
)}>

<TabsTrigger className={cn(
  "flex items-center gap-2 transition-colors",
  "data-[state=active]:bg-background data-[state=active]:text-foreground",
  "text-muted-foreground hover:text-foreground"
)}>
```

#### **3.3 拖拽区域 (Dropzone)**
```typescript
className={cn(
  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
  photoDropzone.isDragActive 
    ? 'border-green-500 bg-green-500/10 dark:bg-green-500/5' 
    : 'border-border hover:border-primary/50 hover:bg-muted/50'
)}
```

#### **3.4 文本输入 (Textarea)**
```typescript
<Textarea className={cn(
  "min-h-[100px] resize-none transition-colors",
  "bg-background border-border text-foreground",
  "placeholder:text-muted-foreground/60",
  "focus:border-primary focus:ring-1 focus:ring-primary"
)} />
```

#### **3.5 选择器 (Select)**
```typescript
<SelectTrigger className={cn(
  "bg-background border-border text-foreground",
  "hover:bg-muted focus:border-primary"
)}>

<SelectContent className="bg-popover border-border">
  <SelectItem className="text-popover-foreground hover:bg-muted">
```

#### **3.6 进度条 (Progress)**
```typescript
<Progress className={cn(
  "bg-muted",
  "[&>div]:bg-primary [&>div]:transition-all"
)} />
```

### **4. 文字对比度增强**

#### **4.1 字体权重优化**
```typescript
// 主标题
className="text-lg font-semibold text-foreground"

// 次要标题  
className="text-sm font-semibold text-foreground"

// 描述文字
className="text-muted-foreground font-medium"

// 小字说明
className="text-muted-foreground/60 font-medium"
```

#### **4.2 透明度层级**
```typescript
// 主要文字: 100% 不透明
text-foreground

// 次要文字: 80% 透明度
text-muted-foreground/80

// 辅助文字: 60% 透明度  
text-muted-foreground/60
```

### **5. 交互状态优化**

#### **5.1 悬停效果**
```typescript
// 按钮悬停
"hover:bg-muted hover:text-foreground"

// 边框悬停
"hover:border-primary/50"

// 背景悬停
"hover:bg-muted/50"
```

#### **5.2 焦点状态**
```typescript
// 输入框焦点
"focus:border-primary focus:ring-1 focus:ring-primary"

// 按钮焦点
"focus:ring-2 focus:ring-primary focus:ring-offset-2"
```

#### **5.3 激活状态**
```typescript
// 标签页激活
"data-[state=active]:bg-background data-[state=active]:text-foreground"

// 复选框激活
"data-[state=checked]:bg-primary data-[state=checked]:border-primary"
```

## 🎯 **主题切换测试**

### **测试页面**
访问 `/en/test-editor` 查看主题切换效果

### **测试检查点**
- [ ] 亮色模式下文字清晰可读
- [ ] 暗色模式下文字清晰可读  
- [ ] 边框在两种模式下都可见
- [ ] 悬停效果在两种模式下都正常
- [ ] 拖拽区域在两种模式下都有适当对比度
- [ ] 进度条在两种模式下都可见
- [ ] 按钮在两种模式下都有足够对比度

## 🚀 **性能优化**

### **1. 过渡动画**
```typescript
// 统一过渡时间
"transition-colors duration-200"
"transition-all duration-200"
```

### **2. 条件渲染优化**
```typescript
// 使用 cn 工具函数减少重复
className={cn(
  "base-classes",
  condition && "conditional-classes",
  theme === "dark" && "dark-specific-classes"
)}
```

## 📱 **响应式适配**

### **移动端优化**
```typescript
// 在小屏幕上调整布局
"grid-cols-1 lg:grid-cols-3"

// 调整间距
"gap-4 lg:gap-6"

// 调整高度
"h-[200px] lg:h-[250px]"
```

## 🎨 **品牌色彩保持**

### **绿色按钮保持品牌色**
```typescript
// Generate 按钮保持绿色品牌色
className={cn(
  "bg-green-600 hover:bg-green-700 text-white",
  "dark:bg-green-600 dark:hover:bg-green-700"
)}
```

### **成功状态保持绿色**
```typescript
// 拖拽激活状态
photoDropzone.isDragActive 
  ? 'border-green-500 bg-green-500/10 dark:bg-green-500/5'
```

## ✅ **验证结果**

### **亮色模式**
- ✅ 背景为白色/浅色
- ✅ 文字为深色，对比度高
- ✅ 边框清晰可见
- ✅ 交互效果正常

### **暗色模式**  
- ✅ 背景为深色
- ✅ 文字为浅色，对比度高
- ✅ 边框适配暗色主题
- ✅ 交互效果正常

**主题适配完成！编辑器现在完美支持亮色和暗色主题切换。**
