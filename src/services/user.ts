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
import { processShareReward } from "./share-reward";

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

  const token = await getBearerToken();

  if (token) {
    // api key
    if (token.startsWith("sk-")) {
      const user_uuid = await getUserUuidByApiKey(token);

      return user_uuid || "";
    }
  }

  const session = await auth();
  if (session && session.user && session.user.uuid) {
    user_uuid = session.user.uuid;
  }

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
