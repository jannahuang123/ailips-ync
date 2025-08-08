import { CreditsAmount, CreditsTransType } from "./credit";
import { findUserByEmail, findUserByUuid, insertUser } from "@/models/user";

import { User } from "@/types/user";
import { auth } from "@/auth";
import { getIsoTimestr, getOneYearLaterTimestr } from "@/lib/time";
import { getUserUuidByApiKey } from "@/models/apikey";
import { headers } from "next/headers";
import { increaseCredits } from "./credit";
import { users } from "@/db/schema";
import { getUuid } from "@/lib/hash";

// save user to database, if user not exist, create a new user
export async function saveUser(user: User) {
  console.log('💾 saveUser 开始:', {
    email: user.email,
    uuid: user.uuid,
    nickname: user.nickname,
    provider: user.signin_provider
  });

  try {
    if (!user.email) {
      console.error('❌ 用户邮箱为空');
      throw new Error("invalid user email");
    }

    console.log('🔍 查找现有用户:', user.email);
    const existUser = await findUserByEmail(user.email);

    if (!existUser) {
      console.log('👤 用户不存在，创建新用户');
      // user not exist, create a new user
      if (!user.uuid) {
        user.uuid = getUuid();
        console.log('🆔 生成新 UUID:', user.uuid);
      }

      console.log("📝 准备插入用户:", {
        uuid: user.uuid,
        email: user.email,
        nickname: user.nickname,
        signin_provider: user.signin_provider
      });

      const dbUser = await insertUser(user as typeof users.$inferInsert);
      console.log('✅ 用户插入成功:', dbUser);

      console.log('💰 为新用户增加积分...');
      // increase credits for new user, expire in one year
      await increaseCredits({
        user_uuid: user.uuid,
        trans_type: CreditsTransType.NewUser,
        credits: CreditsAmount.NewUserGet,
        expired_at: getOneYearLaterTimestr(),
      });
      console.log('✅ 新用户积分添加成功');

      user = {
        ...(dbUser as unknown as User),
      };
    } else {
      console.log('👤 用户已存在，返回现有用户信息:', {
        uuid: existUser.uuid,
        email: existUser.email
      });
      // user exist, return user info in db
      user = {
        ...(existUser as unknown as User),
      };
    }

    console.log('✅ saveUser 完成:', {
      uuid: user.uuid,
      email: user.email
    });
    return user;
  } catch (e) {
    console.error("❌ saveUser 失败:", e);
    console.error("错误详情:", {
      message: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
      userEmail: user.email
    });
    throw e;
  }
}

export async function getUserUuid() {
  let user_uuid = "";

  console.log('🔍 getUserUuid 开始执行');

  const token = await getBearerToken();
  console.log('🎫 Bearer Token:', token ? `${token.substring(0, 10)}...` : '无');

  if (token) {
    // api key
    if (token.startsWith("sk-")) {
      console.log('🔑 使用 API Key 认证');
      const user_uuid = await getUserUuidByApiKey(token);
      console.log('👤 API Key 用户 UUID:', user_uuid ? `${user_uuid.substring(0, 8)}...` : '未找到');
      return user_uuid || "";
    }
  }

  console.log('🎫 尝试获取 NextAuth 会话...');
  try {
    const session = await auth();
    console.log('📋 会话状态:', {
      hasSession: !!session,
      hasUser: !!(session?.user),
      hasUuid: !!(session?.user?.uuid),
      userEmail: session?.user?.email,
      sessionKeys: session ? Object.keys(session) : [],
      userKeys: session?.user ? Object.keys(session.user) : []
    });

    if (session && session.user && session.user.uuid) {
      user_uuid = session.user.uuid;
      console.log('✅ 从会话获取用户 UUID:', `${user_uuid.substring(0, 8)}...`);
    } else {
      console.log('❌ 会话中未找到用户 UUID');

      // 基于 ShipAny 模板的详细诊断
      if (session) {
        console.log('🔍 会话存在但缺少用户信息:', {
          sessionType: typeof session,
          hasUser: !!session.user,
          userType: typeof session.user,
          userUuid: (session.user as any)?.uuid,
          userEmail: (session.user as any)?.email
        });
      } else {
        console.log('🔍 会话为空，可能的原因:');
        console.log('  1. Cookie 未正确发送到服务端');
        console.log('  2. JWT token 解析失败');
        console.log('  3. 会话已过期');
        console.log('  4. NextAuth 配置问题');
      }
    }
  } catch (error) {
    console.error('❌ 获取会话时发生错误:', error);
    console.error('错误详情:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }

  console.log('🔍 getUserUuid 执行完成，返回:', user_uuid ? `${user_uuid.substring(0, 8)}...` : '空');
  return user_uuid;
}

export async function getBearerToken() {
  const h = await headers();
  const auth = h.get("Authorization");
  if (!auth) {
    return "";
  }

  return auth.replace("Bearer ", "");
}

export async function getUserEmail() {
  let user_email = "";

  const session = await auth();
  if (session && session.user && session.user.email) {
    user_email = session.user.email;
  }

  return user_email;
}

export async function getUserInfo() {
  let user_uuid = await getUserUuid();

  if (!user_uuid) {
    return;
  }

  const user = await findUserByUuid(user_uuid);

  return user;
}
