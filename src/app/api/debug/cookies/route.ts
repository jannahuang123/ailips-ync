import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * Cookie 调试端点
 * 帮助诊断 NextAuth 会话 Cookie 问题
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🍪 Cookie 调试端点被调用');
    
    // 获取所有请求头
    const headers = Object.fromEntries(request.headers.entries());
    
    // 获取 Cookie 头
    const cookieHeader = request.headers.get('cookie');
    
    // 解析 Cookie
    const cookies = cookieHeader ? 
      Object.fromEntries(
        cookieHeader.split(';').map(cookie => {
          const [name, ...rest] = cookie.trim().split('=');
          return [name, rest.join('=')];
        })
      ) : {};
    
    // 检查 NextAuth 相关的 Cookie
    const nextAuthCookies = Object.keys(cookies).filter(key => 
      key.includes('next-auth') || key.includes('__Secure-next-auth')
    );
    
    // 获取会话信息
    let session = null;
    let sessionError = null;
    
    try {
      session = await auth();
      console.log('🎫 会话获取成功:', {
        hasSession: !!session,
        userEmail: session?.user?.email,
        userUuid: session?.user?.uuid
      });
    } catch (error) {
      sessionError = error instanceof Error ? error.message : String(error);
      console.log('❌ 会话获取失败:', sessionError);
    }
    
    // 环境变量检查
    const envCheck = {
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      AUTH_URL: !!process.env.AUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL_VALUE: process.env.NEXTAUTH_URL,
      AUTH_URL_VALUE: process.env.AUTH_URL,
    };
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      
      // Cookie 信息
      cookieInfo: {
        hasCookieHeader: !!cookieHeader,
        cookieHeaderLength: cookieHeader?.length || 0,
        totalCookies: Object.keys(cookies).length,
        nextAuthCookies: nextAuthCookies.length,
        nextAuthCookieNames: nextAuthCookies,
        allCookieNames: Object.keys(cookies),
      },
      
      // 会话信息
      sessionInfo: {
        hasSession: !!session,
        sessionError,
        userEmail: session?.user?.email,
        userUuid: session?.user?.uuid,
        userName: session?.user?.name,
      },
      
      // 环境变量
      envCheck,
      
      // 请求信息
      requestInfo: {
        url: request.url,
        method: request.method,
        userAgent: headers['user-agent'],
        host: headers['host'],
        origin: headers['origin'],
        referer: headers['referer'],
      },
      
      // Cookie 详情（仅显示 NextAuth 相关）
      nextAuthCookieDetails: nextAuthCookies.reduce((acc, name) => {
        acc[name] = {
          exists: true,
          length: cookies[name]?.length || 0,
          preview: cookies[name]?.substring(0, 20) + '...',
        };
        return acc;
      }, {} as Record<string, any>),
    };
    
    console.log('🔍 Cookie 调试信息:', debugInfo);
    
    return NextResponse.json({
      success: true,
      debug: debugInfo,
    });
    
  } catch (error) {
    console.error('❌ Cookie 调试端点错误:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * 清除所有 NextAuth Cookie（仅开发环境）
 */
export async function DELETE(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({
      success: false,
      error: 'Cookie 清除仅在开发环境可用'
    }, { status: 403 });
  }
  
  try {
    const response = NextResponse.json({
      success: true,
      message: 'NextAuth Cookie 已清除'
    });
    
    // 清除可能的 NextAuth Cookie
    const cookieNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url',
    ];
    
    cookieNames.forEach(name => {
      response.cookies.set(name, '', {
        expires: new Date(0),
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? 'lipsyncvideo.net' : undefined,
      });
    });
    
    return response;
    
  } catch (error) {
    console.error('❌ Cookie 清除错误:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
