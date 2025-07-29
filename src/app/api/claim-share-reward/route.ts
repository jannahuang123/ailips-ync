import { NextResponse } from "next/server";
import { getUserUuid } from "@/services/user";
import { increaseCredits, CreditsTransType, CreditsAmount } from "@/services/credit";
import { getOneYearLaterTimestr } from "@/lib/time";
import { respData, respErr } from "@/lib/resp";

// 用于跟踪用户分享记录的简单内存存储
// 在生产环境中，这应该存储在数据库中
const shareRecords = new Map<string, Set<string>>();

export async function POST(req: Request) {
  try {
    const { platform, share_url } = await req.json();
    
    if (!platform || !share_url) {
      return respErr("Missing required parameters");
    }

    // 获取当前用户
    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return respErr("User not authenticated");
    }

    // 检查用户是否已经在该平台分享过
    const userShares = shareRecords.get(user_uuid) || new Set();
    if (userShares.has(platform)) {
      return respErr(`You have already claimed reward for sharing on ${platform}`);
    }

    // 验证平台
    const validPlatforms = ["Twitter", "Facebook", "LinkedIn", "Reddit"];
    if (!validPlatforms.includes(platform)) {
      return respErr("Invalid platform");
    }

    console.log(`🎁 用户 ${user_uuid} 在 ${platform} 分享，准备发放奖励...`);

    // 增加分享奖励积分
    await increaseCredits({
      user_uuid: user_uuid,
      trans_type: CreditsTransType.ShareReward,
      credits: CreditsAmount.ShareReward,
      expired_at: getOneYearLaterTimestr(),
    });

    // 记录分享
    userShares.add(platform);
    shareRecords.set(user_uuid, userShares);

    console.log(`✅ 成功为用户 ${user_uuid} 发放 ${CreditsAmount.ShareReward} 积分 (${platform} 分享奖励)`);

    return respData({
      credits: CreditsAmount.ShareReward,
      platform: platform,
      message: `Successfully earned ${CreditsAmount.ShareReward} credits for sharing on ${platform}!`
    });

  } catch (error) {
    console.error("❌ 分享奖励发放失败:", error);
    return respErr("Failed to claim share reward");
  }
}

// 获取用户已分享的平台列表
export async function GET(req: Request) {
  try {
    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return respErr("User not authenticated");
    }

    const userShares = shareRecords.get(user_uuid) || new Set();
    
    return respData({
      shared_platforms: Array.from(userShares),
      available_platforms: ["Twitter", "Facebook", "LinkedIn", "Reddit"],
      credits_per_share: CreditsAmount.ShareReward
    });

  } catch (error) {
    console.error("❌ 获取分享记录失败:", error);
    return respErr("Failed to get share records");
  }
}
