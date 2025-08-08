import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserUuid } from '@/services/user';

/**
 * 会话调试端点
 * 深入分析 NextAuth 会话状态不一致问题
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 会话调试端点被调用');
    
    // 获取请求头信息
    const headers = Object.fromEntries(request.headers.entries());
    const cookieHeader = request.headers.get('cookie');
    
    console.log('📋 请求信息:', {
      url: request.url,
      method: request.method,
      hasCookieHeader: !!cookieHeader,
      cookieLength: cookieHeader?.length || 0,
      userAgent: headers['user-agent']?.substring(0, 50) + '...',
      host: headers['host']
    });
    
    // 解析 Cookie
    const cookies = cookieHeader ? 
      Object.fromEntries(
        cookieHeader.split(';').map(cookie => {
          const [name, ...rest] = cookie.trim().split('=');
          return [name, rest.join('=')];
        })
      ) : {};
    
    const nextAuthCookies = Object.keys(cookies).filter(key => 
      key.includes('next-auth') || key.includes('__Secure-next-auth') || key.includes('__Host-next-auth')
    );
    
    console.log('🍪 Cookie 分析:', {
      totalCookies: Object.keys(cookies).length,
      nextAuthCookies: nextAuthCookies.length,
      nextAuthCookieNames: nextAuthCookies,
      allCookieNames: Object.keys(cookies)
    });
    
    // 尝试获取会话
    let session = null;
    let sessionError = null;
    
    try {
      console.log('🎫 开始获取 NextAuth 会话...');
      session = await auth();
      console.log('✅ 会话获取结果:', {
        hasSession: !!session,
        sessionType: typeof session,
        sessionKeys: session ? Object.keys(session) : [],
        hasUser: !!(session?.user),
        userKeys: session?.user ? Object.keys(session.user) : [],
        userEmail: session?.user?.email,
        userUuid: session?.user?.uuid,
        userName: session?.user?.name
      });
    } catch (error) {
      sessionError = error instanceof Error ? error.message : String(error);
      console.error('❌ 会话获取失败:', sessionError);
    }
    
    // 尝试获取用户 UUID
    let userUuid = null;
    let userUuidError = null;
    
    try {
      console.log('👤 开始获取用户 UUID...');
      userUuid = await getUserUuid();
      console.log('✅ 用户 UUID 获取结果:', {
        hasUuid: !!userUuid,
        uuidLength: userUuid?.length || 0,
        uuidPreview: userUuid ? `${userUuid.substring(0, 8)}...` : null
      });
    } catch (error) {
      userUuidError = error instanceof Error ? error.message : String(error);
      console.error('❌ 用户 UUID 获取失败:', userUuidError);
    }
    
    // 环境变量检查
    const envVars = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      AUTH_SECRET: process.env.AUTH_SECRET ? 'SET' : 'NOT_SET',
      AUTH_URL: process.env.AUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
    };
    
    console.log('🔧 环境变量检查:', envVars);
    
    const debugResult = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      
      // 请求信息
      request: {
        url: request.url,
        method: request.method,
        hasCookieHeader: !!cookieHeader,
        cookieHeaderLength: cookieHeader?.length || 0,
        userAgent: headers['user-agent'],
        host: headers['host'],
        origin: headers['origin'],
        referer: headers['referer'],
      },
      
      // Cookie 信息
      cookies: {
        total: Object.keys(cookies).length,
        nextAuthCount: nextAuthCookies.length,
        nextAuthNames: nextAuthCookies,
        allNames: Object.keys(cookies),
        details: nextAuthCookies.reduce((acc, name) => {
          acc[name] = {
            length: cookies[name]?.length || 0,
            preview: cookies[name]?.substring(0, 30) + '...',
          };
          return acc;
        }, {} as Record<string, any>),
      },
      
      // 会话信息
      session: {
        success: !!session && !sessionError,
        error: sessionError,
        hasSession: !!session,
        hasUser: !!(session?.user),
        userEmail: session?.user?.email,
        userUuid: session?.user?.uuid,
        userName: session?.user?.name,
        sessionKeys: session ? Object.keys(session) : [],
        userKeys: session?.user ? Object.keys(session.user) : [],
      },
      
      // 用户 UUID
      userUuid: {
        success: !!userUuid && !userUuidError,
        error: userUuidError,
        hasUuid: !!userUuid,
        length: userUuid?.length || 0,
        preview: userUuid ? `${userUuid.substring(0, 8)}...` : null,
      },
      
      // 环境变量
      environment_vars: envVars,
      
      // 诊断建议
      diagnosis: {
        cookieIssue: !cookieHeader || nextAuthCookies.length === 0,
        sessionIssue: !session || sessionError,
        userUuidIssue: !userUuid || userUuidError,
        possibleCauses: [
          !cookieHeader ? 'No Cookie header in request' : null,
          nextAuthCookies.length === 0 ? 'No NextAuth cookies found' : null,
          sessionError ? `Session error: ${sessionError}` : null,
          userUuidError ? `User UUID error: ${userUuidError}` : null,
        ].filter(Boolean),
      },
    };
    
    console.log('📊 调试结果汇总:', debugResult);
    
    return NextResponse.json({
      success: true,
      debug: debugResult,
    });
    
  } catch (error) {
    console.error('❌ 会话调试端点错误:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
