import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { headers } from 'next/headers';

/**
 * 直接测试 NextAuth auth() 函数
 * 专门用于调试会话状态不一致问题
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 auth() 函数直接测试开始');
    
    // 获取请求头
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');
    
    console.log('📋 请求头信息:', {
      hasCookie: !!cookieHeader,
      cookieLength: cookieHeader?.length || 0,
      userAgent: headersList.get('user-agent')?.substring(0, 50),
      host: headersList.get('host'),
      origin: headersList.get('origin')
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
    
    console.log('🍪 Cookie 详情:', {
      totalCookies: Object.keys(cookies).length,
      allCookieNames: Object.keys(cookies),
      nextAuthCookieCount: nextAuthCookies.length,
      nextAuthCookieNames: nextAuthCookies,
      nextAuthCookieDetails: nextAuthCookies.reduce((acc, name) => {
        acc[name] = {
          length: cookies[name]?.length || 0,
          preview: cookies[name]?.substring(0, 50) + '...'
        };
        return acc;
      }, {} as Record<string, any>)
    });
    
    // 直接调用 auth() 函数
    console.log('🎫 开始调用 auth() 函数...');
    let authResult = null;
    let authError = null;
    
    try {
      authResult = await auth();
      console.log('✅ auth() 调用成功:', {
        hasResult: !!authResult,
        resultType: typeof authResult,
        resultKeys: authResult ? Object.keys(authResult) : [],
        hasUser: !!(authResult?.user),
        userKeys: authResult?.user ? Object.keys(authResult.user) : [],
        userEmail: authResult?.user?.email,
        userUuid: authResult?.user?.uuid,
        userName: authResult?.user?.name
      });
    } catch (error) {
      authError = error instanceof Error ? error.message : String(error);
      console.error('❌ auth() 调用失败:', authError);
    }
    
    // 检查环境变量
    const envCheck = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      AUTH_SECRET: process.env.AUTH_SECRET ? 'SET' : 'NOT_SET',
      AUTH_URL: process.env.AUTH_URL,
      NODE_ENV: process.env.NODE_ENV
    };
    
    console.log('🔧 环境变量:', envCheck);
    
    const result = {
      timestamp: new Date().toISOString(),
      
      // 请求信息
      request: {
        url: request.url,
        method: request.method,
        hasCookieHeader: !!cookieHeader,
        cookieHeaderLength: cookieHeader?.length || 0,
      },
      
      // Cookie 信息
      cookies: {
        total: Object.keys(cookies).length,
        nextAuthCount: nextAuthCookies.length,
        nextAuthNames: nextAuthCookies,
        allNames: Object.keys(cookies),
      },
      
      // auth() 函数结果
      authFunction: {
        success: !!authResult && !authError,
        error: authError,
        hasResult: !!authResult,
        hasUser: !!(authResult?.user),
        userEmail: authResult?.user?.email,
        userUuid: authResult?.user?.uuid,
        userName: authResult?.user?.name,
        resultKeys: authResult ? Object.keys(authResult) : [],
        userKeys: authResult?.user ? Object.keys(authResult.user) : [],
      },
      
      // 环境变量
      environment: envCheck,
      
      // 诊断
      diagnosis: {
        cookieIssue: nextAuthCookies.length === 0,
        authFunctionIssue: !authResult || authError,
        userDataIssue: !authResult?.user?.uuid,
        possibleCauses: [
          nextAuthCookies.length === 0 ? 'No NextAuth cookies found' : null,
          authError ? `Auth function error: ${authError}` : null,
          authResult && !authResult.user ? 'Auth result has no user' : null,
          authResult?.user && !authResult.user.uuid ? 'User has no UUID' : null,
        ].filter(Boolean)
      }
    };
    
    console.log('📊 测试结果汇总:', result);
    
    return NextResponse.json({
      success: true,
      test: 'NextAuth auth() function direct test',
      result
    });
    
  } catch (error) {
    console.error('❌ auth() 测试失败:', error);
    
    return NextResponse.json({
      success: false,
      test: 'NextAuth auth() function direct test',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * 测试不同的认证方法
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 多种认证方法测试');
    
    // 方法1: 直接调用 auth()
    let method1Result = null;
    try {
      method1Result = await auth();
      console.log('✅ 方法1 (直接 auth()):', !!method1Result);
    } catch (error) {
      console.log('❌ 方法1 失败:', error);
    }
    
    // 方法2: 从请求中获取会话
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');
    
    console.log('🔍 方法2 Cookie 检查:', {
      hasCookie: !!cookieHeader,
      cookiePreview: cookieHeader?.substring(0, 100) + '...'
    });
    
    return NextResponse.json({
      success: true,
      methods: {
        directAuth: {
          success: !!method1Result,
          hasUser: !!(method1Result?.user),
          userUuid: method1Result?.user?.uuid
        },
        cookieCheck: {
          hasCookieHeader: !!cookieHeader,
          cookieLength: cookieHeader?.length || 0
        }
      }
    });
    
  } catch (error) {
    console.error('❌ 多方法测试失败:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
