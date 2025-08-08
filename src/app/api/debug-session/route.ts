import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserUuid } from "@/services/user";
import { headers } from "next/headers";

/**
 * 服务端会话诊断端点
 * 用于调试服务端会话获取问题
 */
export async function GET() {
  try {
    console.log('🔍 开始服务端会话诊断...');
    
    // 1. 检查请求头
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    const cookieHeader = headersList.get('cookie');
    
    console.log('📋 请求头信息:', {
      hasAuthHeader: !!authHeader,
      authHeaderPreview: authHeader ? `${authHeader.substring(0, 20)}...` : '无',
      hasCookieHeader: !!cookieHeader,
      cookieCount: cookieHeader ? cookieHeader.split(';').length : 0
    });
    
    // 2. 检查 NextAuth cookies
    const nextAuthCookies = [];
    if (cookieHeader) {
      const cookies = cookieHeader.split(';');
      cookies.forEach(cookie => {
        const trimmed = cookie.trim();
        if (trimmed.includes('next-auth') || trimmed.includes('__Secure-next-auth')) {
          nextAuthCookies.push(trimmed.split('=')[0]);
        }
      });
    }
    
    console.log('🍪 NextAuth Cookies:', {
      count: nextAuthCookies.length,
      names: nextAuthCookies
    });
    
    // 3. 尝试获取会话
    console.log('🎫 尝试获取服务端会话...');
    const session = await auth();
    
    console.log('📋 服务端会话结果:', {
      hasSession: !!session,
      hasUser: !!(session?.user),
      userEmail: session?.user?.email,
      hasUuid: !!(session?.user as any)?.uuid,
      userUuid: (session?.user as any)?.uuid ? `${((session?.user as any)?.uuid).substring(0, 8)}...` : '无'
    });
    
    // 4. 尝试获取用户 UUID
    console.log('🔍 尝试获取用户 UUID...');
    const userUuid = await getUserUuid();
    
    console.log('👤 getUserUuid 结果:', {
      hasUuid: !!userUuid,
      uuid: userUuid ? `${userUuid.substring(0, 8)}...` : '无'
    });
    
    // 5. 组装诊断结果
    const diagnosticResult = {
      timestamp: new Date().toISOString(),
      server: {
        hasAuthHeader: !!authHeader,
        hasCookieHeader: !!cookieHeader,
        nextAuthCookieCount: nextAuthCookies.length,
        nextAuthCookieNames: nextAuthCookies
      },
      session: {
        hasSession: !!session,
        hasUser: !!(session?.user),
        userEmail: session?.user?.email || null,
        hasUuid: !!(session?.user as any)?.uuid,
        userUuid: (session?.user as any)?.uuid || null
      },
      userUuid: {
        hasUuid: !!userUuid,
        uuid: userUuid || null
      },
      diagnosis: {
        sessionWorking: !!session && !!(session?.user),
        uuidInSession: !!(session?.user as any)?.uuid,
        getUserUuidWorking: !!userUuid,
        overallStatus: !!userUuid ? 'SUCCESS' : 'FAILED'
      }
    };
    
    console.log('✅ 服务端会话诊断完成:', diagnosticResult.diagnosis);
    
    return NextResponse.json({
      code: 0,
      message: "服务端会话诊断完成",
      data: diagnosticResult
    });
    
  } catch (error) {
    console.error('❌ 服务端会话诊断失败:', error);
    
    return NextResponse.json({
      code: -1,
      message: "服务端会话诊断失败",
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
