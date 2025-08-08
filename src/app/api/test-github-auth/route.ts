import { NextResponse } from "next/server";

/**
 * GitHub OAuth 测试端点
 * 基于 ShipAny 模板的 GitHub OAuth 配置验证
 */
export async function GET() {
  try {
    console.log('🔍 GitHub OAuth 配置测试开始...');
    
    // 1. 检查环境变量
    const githubConfig = {
      enabled: process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED,
      hasClientId: !!process.env.AUTH_GITHUB_ID,
      hasSecret: !!process.env.AUTH_GITHUB_SECRET,
      clientIdPreview: process.env.AUTH_GITHUB_ID ? 
        `${process.env.AUTH_GITHUB_ID.substring(0, 15)}...` : '未设置',
      nextAuthUrl: process.env.NEXTAUTH_URL,
      authSecret: process.env.AUTH_SECRET ? 'SET' : 'NOT_SET'
    };
    
    console.log('📋 GitHub OAuth 环境变量:', githubConfig);
    
    // 2. 生成预期的回调 URL
    const expectedCallbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/callback/github`;
    
    // 3. 检查配置完整性
    const configIssues = [];
    
    if (githubConfig.enabled !== "true") {
      configIssues.push("NEXT_PUBLIC_AUTH_GITHUB_ENABLED 未设置为 'true'");
    }
    
    if (!githubConfig.hasClientId) {
      configIssues.push("AUTH_GITHUB_ID 未设置");
    }
    
    if (!githubConfig.hasSecret) {
      configIssues.push("AUTH_GITHUB_SECRET 未设置");
    }
    
    if (!githubConfig.nextAuthUrl) {
      configIssues.push("NEXTAUTH_URL 未设置");
    }
    
    if (!githubConfig.authSecret) {
      configIssues.push("AUTH_SECRET 未设置");
    }
    
    // 4. GitHub OAuth App 配置指南
    const githubAppConfig = {
      homepage_url: process.env.NEXTAUTH_URL || 'https://lipsyncvideo.net',
      authorization_callback_url: expectedCallbackUrl,
      required_scopes: ['read:user', 'user:email'],
      settings_url: 'https://github.com/settings/developers'
    };
    
    // 5. 常见问题诊断
    const commonIssues = [
      {
        issue: "Error retrieving a token",
        causes: [
          "GitHub OAuth App 回调 URL 配置错误",
          "GitHub Client ID 或 Secret 不正确",
          "GitHub OAuth App 未激活或被暂停",
          "作用域 (scope) 配置不正确"
        ],
        solutions: [
          `确保 GitHub OAuth App 回调 URL 设置为: ${expectedCallbackUrl}`,
          "检查 GitHub OAuth App 的 Client ID 和 Secret",
          "确保 GitHub OAuth App 状态为 Active",
          "确保作用域包含 'read:user' 和 'user:email'"
        ]
      },
      {
        issue: "会话状态不一致",
        causes: [
          "JWT token 生成失败",
          "用户数据保存到数据库失败",
          "NextAuth 会话 Cookie 设置问题"
        ],
        solutions: [
          "检查 JWT callback 中的错误日志",
          "验证数据库连接和用户保存逻辑",
          "检查 NextAuth Cookie 配置"
        ]
      }
    ];
    
    // 6. 生成测试结果
    const testResult = {
      timestamp: new Date().toISOString(),
      config: githubConfig,
      githubApp: githubAppConfig,
      issues: configIssues,
      commonProblems: commonIssues,
      status: configIssues.length === 0 ? 'READY' : 'NEEDS_CONFIGURATION',
      nextSteps: configIssues.length === 0 ? [
        "配置看起来正确",
        "请检查 GitHub OAuth App 设置",
        "测试完整的登录流程"
      ] : [
        "修复上述配置问题",
        "重新部署应用",
        "再次测试登录"
      ]
    };
    
    console.log('✅ GitHub OAuth 配置测试完成:', {
      status: testResult.status,
      issueCount: configIssues.length
    });
    
    return NextResponse.json({
      code: 0,
      message: "GitHub OAuth 配置测试完成",
      data: testResult
    });
    
  } catch (error) {
    console.error('❌ GitHub OAuth 配置测试失败:', error);
    
    return NextResponse.json({
      code: -1,
      message: "GitHub OAuth 配置测试失败",
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    });
  }
}

export async function POST() {
  return GET();
}
