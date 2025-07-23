#!/usr/bin/env tsx

/**
 * LipSyncVideo.net 首页定制脚本
 * 运行命令: npx tsx scripts/customize-homepage.ts
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CustomizationTask {
  name: string;
  file: string;
  action: 'update' | 'create' | 'replace';
  status: 'pending' | 'completed' | 'failed';
  description: string;
}

class HomepageCustomizer {
  private tasks: CustomizationTask[] = [
    {
      name: '更新项目名称',
      file: 'src/i18n/pages/landing/en.json',
      action: 'update',
      status: 'pending',
      description: '将 ShipAny 替换为 LipSyncVideo'
    },
    {
      name: '更新 Hero 区域内容',
      file: 'src/i18n/pages/landing/en.json',
      action: 'update', 
      status: 'pending',
      description: '更新主标题、描述和按钮文案'
    },
    {
      name: '更新品牌主题色彩',
      file: 'src/app/theme.css',
      action: 'update',
      status: 'pending',
      description: '应用 LipSync 蓝紫色主题'
    },
    {
      name: '更新技术栈展示',
      file: 'src/i18n/pages/landing/en.json',
      action: 'update',
      status: 'pending',
      description: '展示 AI 技术栈 (HeyGen, D-ID 等)'
    },
    {
      name: '更新统计数据',
      file: 'src/i18n/pages/landing/en.json', 
      action: 'update',
      status: 'pending',
      description: '更新为 LipSync 相关数据'
    },
    {
      name: '更新用户评价',
      file: 'src/i18n/pages/landing/en.json',
      action: 'update',
      status: 'pending',
      description: '更新为视频创作者评价'
    }
  ];

  async customize(): Promise<void> {
    console.log('🎨 LipSyncVideo.net 首页定制开始\n');
    console.log('=' .repeat(50));

    for (const task of this.tasks) {
      console.log(`\n🔧 ${task.name}`);
      console.log(`📁 文件: ${task.file}`);
      console.log(`📝 描述: ${task.description}`);

      try {
        switch (task.name) {
          case '更新项目名称':
            await this.updateProjectName();
            break;
          case '更新 Hero 区域内容':
            await this.updateHeroContent();
            break;
          case '更新品牌主题色彩':
            await this.updateThemeColors();
            break;
          case '更新技术栈展示':
            await this.updateBrandingContent();
            break;
          case '更新统计数据':
            await this.updateStatsContent();
            break;
          case '更新用户评价':
            await this.updateTestimonialContent();
            break;
        }
        
        task.status = 'completed';
        console.log('✅ 完成');
      } catch (error) {
        task.status = 'failed';
        console.log(`❌ 失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }

    this.printSummary();
  }

  private async updateProjectName(): Promise<void> {
    // 更新环境变量中的项目名称
    const envPath = '.env.development';
    if (existsSync(envPath)) {
      let envContent = readFileSync(envPath, 'utf-8');
      envContent = envContent.replace(
        /NEXT_PUBLIC_PROJECT_NAME\s*=\s*".*"/,
        'NEXT_PUBLIC_PROJECT_NAME="LipSyncVideo"'
      );
      writeFileSync(envPath, envContent);
    }
  }

  private async updateHeroContent(): Promise<void> {
    const filePath = 'src/i18n/pages/landing/en.json';
    if (!existsSync(filePath)) {
      throw new Error('Landing page content file not found');
    }

    const content = JSON.parse(readFileSync(filePath, 'utf-8'));
    
    // 更新 Hero 区域内容
    content.hero = {
      title: "AI-Powered Lip Sync Video Generator",
      highlight_text: "AI-Powered",
      description: "Create perfect lip-synced videos in minutes with our advanced AI technology.<br/>Upload your video and audio, get professional results instantly.",
      announcement: {
        label: "NEW",
        title: "🎬 Free Demo Available",
        url: "/#demo"
      },
      tip: "🎁 Try 5 videos free",
      buttons: [
        {
          title: "Try Free Demo",
          icon: "RiPlayFill",
          url: "/create",
          target: "_self",
          variant: "default"
        },
        {
          title: "Watch Demo", 
          icon: "RiVideoFill",
          url: "/#demo",
          target: "_self",
          variant: "outline"
        }
      ]
    };

    writeFileSync(filePath, JSON.stringify(content, null, 2));
  }

  private async updateThemeColors(): Promise<void> {
    const filePath = 'src/app/theme.css';
    
    const themeContent = `@layer base {
  :root {
    /* LipSync 品牌色彩 - 蓝紫色主题 */
    --primary: 264 80% 57%;        /* #6366f1 */
    --primary-foreground: 0 0% 98%;
    
    /* 辅助色 - 绿色系 */
    --secondary: 120 30% 65%;      /* #84cc16 */
    --secondary-foreground: 0 0% 9%;
    
    /* 强调色 - 紫色系 */
    --accent: 280 65% 60%;         /* #a855f7 */
    --accent-foreground: 0 0% 9%;
    
    /* 成功色 - 视频处理完成 */
    --success: 142 76% 36%;        /* #16a34a */
    
    /* 警告色 - 处理中状态 */
    --warning: 38 92% 50%;         /* #f59e0b */
    
    /* 错误色 - 处理失败 */
    --destructive: 0 84% 60%;      /* #ef4444 */
    
    /* 其他颜色保持默认 */
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 264 80% 57%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 280 65% 60%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
  }
}`;

    writeFileSync(filePath, themeContent);
  }

  private async updateBrandingContent(): Promise<void> {
    const filePath = 'src/i18n/pages/landing/en.json';
    const content = JSON.parse(readFileSync(filePath, 'utf-8'));
    
    // 更新技术栈展示
    content.branding = {
      title: "Powered by Leading AI Technologies",
      items: [
        {
          title: "HeyGen",
          image: {
            src: "/imgs/logos/heygen.svg",
            alt: "HeyGen AI"
          }
        },
        {
          title: "D-ID",
          image: {
            src: "/imgs/logos/did.svg",
            alt: "D-ID"
          }
        },
        {
          title: "OpenAI",
          image: {
            src: "/imgs/logos/openai.svg",
            alt: "OpenAI"
          }
        },
        {
          title: "AWS",
          image: {
            src: "/imgs/logos/aws.svg",
            alt: "AWS"
          }
        },
        {
          title: "Next.js",
          image: {
            src: "/imgs/logos/nextjs.svg",
            alt: "Next.js"
          }
        }
      ]
    };

    writeFileSync(filePath, JSON.stringify(content, null, 2));
  }

  private async updateStatsContent(): Promise<void> {
    const filePath = 'src/i18n/pages/landing/en.json';
    const content = JSON.parse(readFileSync(filePath, 'utf-8'));
    
    // 更新统计数据
    content.stats = {
      title: "Trusted by Content Creators Worldwide",
      description: "for professional video production.",
      items: [
        {
          title: "Videos Created",
          label: "10K+",
          description: "Successfully"
        },
        {
          title: "Processing Time",
          label: "2-5",
          description: "Minutes"
        },
        {
          title: "Accuracy Rate",
          label: "95%+", 
          description: "Lip Sync"
        }
      ]
    };

    writeFileSync(filePath, JSON.stringify(content, null, 2));
  }

  private async updateTestimonialContent(): Promise<void> {
    const filePath = 'src/i18n/pages/landing/en.json';
    const content = JSON.parse(readFileSync(filePath, 'utf-8'));
    
    // 更新用户评价
    content.testimonial = {
      title: "What Creators Say About LipSyncVideo",
      description: "Hear from content creators who use our AI lip sync technology.",
      items: [
        {
          title: "Sarah Johnson",
          label: "YouTube Creator (2M subscribers)",
          description: "LipSyncVideo saved me hours of editing time. The AI quality is incredible - my audience can't tell the difference from manual sync!",
          image: {
            src: "/imgs/users/creator1.png"
          }
        },
        {
          title: "Mike Chen", 
          label: "Marketing Director at TechCorp",
          description: "We use LipSyncVideo for all our multilingual marketing videos. The quality is professional-grade and the turnaround time is amazing.",
          image: {
            src: "/imgs/users/creator2.png"
          }
        },
        {
          title: "Emma Rodriguez",
          label: "Online Course Creator", 
          description: "Perfect for creating educational content in multiple languages. My students love the clear audio-video synchronization.",
          image: {
            src: "/imgs/users/creator3.png"
          }
        }
      ]
    };

    writeFileSync(filePath, JSON.stringify(content, null, 2));
  }

  private printSummary(): void {
    console.log('\n📊 定制结果汇总\n');
    console.log('=' .repeat(50));

    const completed = this.tasks.filter(t => t.status === 'completed').length;
    const failed = this.tasks.filter(t => t.status === 'failed').length;

    this.tasks.forEach(task => {
      const statusIcon = task.status === 'completed' ? '✅' : 
                        task.status === 'failed' ? '❌' : '⏳';
      console.log(`${statusIcon} ${task.name}`);
    });

    console.log(`\n📈 总计: ${this.tasks.length} 项任务`);
    console.log(`✅ 完成: ${completed} 项`);
    console.log(`❌ 失败: ${failed} 项`);

    if (failed === 0) {
      console.log('\n🎉 首页定制完成！');
      console.log('\n📋 下一步操作:');
      console.log('1. 运行 pnpm dev 查看效果');
      console.log('2. 准备 Logo 和图片资源');
      console.log('3. 测试页面响应式效果');
      console.log('4. 开始 AI 服务集成开发');
    } else {
      console.log('\n🚨 请修复失败的任务后重新运行。');
    }
  }
}

// 运行定制
async function main() {
  const customizer = new HomepageCustomizer();
  await customizer.customize();
}

if (require.main === module) {
  main().catch(console.error);
}

export { HomepageCustomizer };
