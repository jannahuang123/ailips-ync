import { findUserByUuid, updateUserInvitedBy } from "@/models/user";
import { increaseCredits, CreditsTransType, CreditsAmount } from "./credit";
import { getIsoTimestr } from "@/lib/time";

/**
 * 简化的分享奖励系统
 * 取消复杂的分佣机制，改为简单的积分奖励
 */

export interface ShareRewardSummary {
  total_invited: number;
  total_credits_earned: number;
  is_eligible_for_bonus: boolean;
}

/**
 * 处理新用户通过邀请码注册的奖励
 * @param newUserUuid 新用户UUID
 * @param inviteCode 邀请码
 */
export async function processShareReward(
  newUserUuid: string,
  inviteCode: string
): Promise<boolean> {
  try {
    // 查找邀请人
    const inviter = await findUserByInviteCode(inviteCode);
    if (!inviter || !inviter.uuid) {
      console.log("邀请码无效或邀请人不存在:", inviteCode);
      return false;
    }

    // 检查是否是自己邀请自己
    if (inviter.uuid === newUserUuid) {
      console.log("不能邀请自己");
      return false;
    }

    // 更新新用户的邀请关系
    await updateUserInvitedBy(newUserUuid, inviter.uuid);

    // 给邀请人奖励积分
    await increaseCredits({
      user_uuid: inviter.uuid,
      trans_type: CreditsTransType.ShareReward,
      credits: CreditsAmount.ShareRewardAmount,
      expired_at: getExpiredAt(365), // 1年有效期
    });

    // 检查是否符合额外奖励条件
    const summary = await getShareRewardSummary(inviter.uuid);
    if (summary.total_invited <= 10 && summary.total_invited % 5 === 0) {
      // 每邀请5个人给额外奖励
      await increaseCredits({
        user_uuid: inviter.uuid,
        trans_type: CreditsTransType.ReferralBonus,
        credits: CreditsAmount.ReferralBonusAmount,
        expired_at: getExpiredAt(365),
      });
    }

    console.log(`分享奖励处理成功: 邀请人 ${inviter.uuid} 获得 ${CreditsAmount.ShareRewardAmount} 积分`);
    return true;
  } catch (error) {
    console.error("处理分享奖励失败:", error);
    return false;
  }
}

/**
 * 获取用户的分享奖励统计
 * @param userUuid 用户UUID
 */
export async function getShareRewardSummary(userUuid: string): Promise<ShareRewardSummary> {
  try {
    // 这里需要查询数据库获取邀请统计
    // 暂时返回模拟数据，实际实现需要查询 users 表中 invited_by 字段
    const invitedUsers = await getUsersInvitedBy(userUuid);
    const totalInvited = invitedUsers?.length || 0;
    
    // 计算获得的积分 (每个邀请20积分 + 奖励)
    const baseCredits = totalInvited * CreditsAmount.ShareRewardAmount;
    const bonusCount = Math.floor(totalInvited / 5);
    const bonusCredits = bonusCount * CreditsAmount.ReferralBonusAmount;
    const totalCreditsEarned = baseCredits + bonusCredits;

    return {
      total_invited: totalInvited,
      total_credits_earned: totalCreditsEarned,
      is_eligible_for_bonus: totalInvited < 10,
    };
  } catch (error) {
    console.error("获取分享奖励统计失败:", error);
    return {
      total_invited: 0,
      total_credits_earned: 0,
      is_eligible_for_bonus: true,
    };
  }
}

/**
 * 生成过期时间
 * @param days 天数
 */
function getExpiredAt(days: number): string {
  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() + days);
  return expiredDate.toISOString();
}

/**
 * 查找邀请码对应的用户
 * @param inviteCode 邀请码
 */
async function findUserByInviteCode(inviteCode: string) {
  // 这里需要实现查找邀请码对应用户的逻辑
  // 暂时使用现有的 findUserByInviteCode 函数
  const { findUserByInviteCode: findUser } = await import("@/models/user");
  return await findUser(inviteCode);
}

/**
 * 获取被某用户邀请的所有用户
 * @param userUuid 邀请人UUID
 */
async function getUsersInvitedBy(userUuid: string) {
  try {
    const { getUsersInvitedBy: getUsers } = await import("@/models/user");
    return await getUsers(userUuid);
  } catch (error) {
    console.error("查询被邀请用户失败:", error);
    return [];
  }
}
