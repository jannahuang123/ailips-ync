import { AdapterUser } from "next-auth/adapters";
import { Account, User } from "next-auth";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";
import { saveUser } from "@/services/user";
import { User as UserType } from "@/types/user";
import { getClientIp } from "@/lib/ip";

export async function handleSignInUser(
  user: User | AdapterUser,
  account: Account
): Promise<UserType | null> {
  console.log('🔧 handleSignInUser 开始:', {
    userEmail: user?.email,
    userName: user?.name,
    userImage: user?.image,
    accountType: account?.type,
    accountProvider: account?.provider,
    accountProviderAccountId: account?.providerAccountId
  });

  try {
    if (!user.email) {
      console.error('❌ 用户邮箱为空');
      throw new Error("invalid signin user");
    }
    if (!account.type || !account.provider || !account.providerAccountId) {
      console.error('❌ 账户信息不完整:', {
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId
      });
      throw new Error("invalid signin account");
    }

    console.log('📝 准备保存用户信息...');
    const userInfo: UserType = {
      uuid: getUuid(),
      email: user.email,
      nickname: user.name || "",
      avatar_url: user.image || "",
      signin_type: account.type,
      signin_provider: account.provider,
      signin_openid: account.providerAccountId,
      created_at: new Date(),
      signin_ip: await getClientIp(),
    };

    console.log('💾 调用 saveUser:', {
      uuid: userInfo.uuid,
      email: userInfo.email,
      provider: userInfo.signin_provider
    });

    const savedUser = await saveUser(userInfo);

    if (savedUser) {
      console.log('✅ 用户保存成功:', {
        uuid: savedUser.uuid,
        email: savedUser.email
      });
    } else {
      console.error('❌ saveUser 返回空值');
    }

    return savedUser;
  } catch (e) {
    console.error("❌ handleSignInUser 失败:", e);
    console.error("错误详情:", {
      message: e.message,
      stack: e.stack,
      userEmail: user?.email,
      provider: account?.provider
    });
    throw e;
  }
}
