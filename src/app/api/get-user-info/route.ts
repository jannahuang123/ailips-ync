import { respData, respErr, respJson } from "@/lib/resp";

import { findUserByUuid } from "@/models/user";
import { getUserUuid } from "@/services/user";
import { getUserCredits } from "@/services/credit";
import { User } from "@/types/user";
import { auth } from "@/auth";
import { headers } from "next/headers";

async function getUserInfoHandler() {
  try {
    console.log('🔍 getUserInfoHandler 开始执行');

    // 获取请求头信息用于调试
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');
    console.log('📋 请求头调试:', {
      hasCookie: !!cookieHeader,
      cookieLength: cookieHeader?.length || 0,
      userAgent: headersList.get('user-agent')?.substring(0, 50)
    });

    // 方法1: 使用原有的 getUserUuid
    let user_uuid = await getUserUuid();
    console.log('👤 方法1 - getUserUuid 结果:', user_uuid ? `${user_uuid.substring(0, 8)}...` : '未获取到');

    // 方法2: 直接调用 auth() 函数作为备用
    if (!user_uuid) {
      console.log('🔄 方法1失败，尝试方法2 - 直接调用 auth()');
      try {
        const session = await auth();
        console.log('🎫 直接 auth() 结果:', {
          hasSession: !!session,
          hasUser: !!(session?.user),
          hasUuid: !!(session?.user?.uuid),
          userEmail: session?.user?.email
        });

        if (session?.user?.uuid) {
          user_uuid = session.user.uuid;
          console.log('✅ 方法2成功获取 UUID:', `${user_uuid.substring(0, 8)}...`);
        }
      } catch (authError) {
        console.error('❌ 方法2 auth() 调用失败:', authError);
      }
    }

    if (!user_uuid) {
      console.log('🔐 所有方法都失败，用户未认证，返回 no auth');
      return respJson(-2, "no auth");
    }

    console.log('🔍 查找数据库用户...');
    const dbUser = await findUserByUuid(user_uuid);

    if (!dbUser) {
      console.error('❌ 数据库中未找到用户:', user_uuid);
      return respErr("user not exist");
    }

    console.log('✅ 找到数据库用户:', {
      uuid: dbUser.uuid,
      email: dbUser.email,
      nickname: dbUser.nickname
    });

    console.log('💰 获取用户积分...');
    const userCredits = await getUserCredits(user_uuid);
    console.log('✅ 用户积分:', userCredits);

    const user = {
      ...(dbUser as unknown as User),
      credits: userCredits,
    };

    console.log('✅ 用户信息组装完成，返回数据');
    return respData(user);

  } catch (e) {
    console.error("❌ get user info failed:", e);
    console.error("错误详情:", {
      message: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
      name: e instanceof Error ? e.name : 'Unknown'
    });
    return respErr("get user info failed");
  }
}

export async function POST(req: Request) {
  return getUserInfoHandler();
}

export async function GET(req: Request) {
  return getUserInfoHandler();
}
