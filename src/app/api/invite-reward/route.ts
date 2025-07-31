import { respData, respErr } from "@/lib/resp";
import { findUserByInviteCode, findUserByUuid } from "@/models/user";
import { increaseCredits } from "@/services/credit";
import { getIsoTimestr } from "@/lib/time";

/**
 * 简化的邀请积分奖励系统
 * 替代复杂的分佣机制，实现简单直接的积分奖励
 */
export async function POST(req: Request) {
  try {
    const { invite_code, new_user_uuid } = await req.json();
    
    if (!invite_code || !new_user_uuid) {
      return respErr("Missing required parameters");
    }

    // 查找邀请人
    const inviter = await findUserByInviteCode(invite_code);
    if (!inviter) {
      return respErr("Invalid invite code");
    }

    // 查找新用户
    const newUser = await findUserByUuid(new_user_uuid);
    if (!newUser) {
      return respErr("New user not found");
    }

    // 防止自己邀请自己
    if (inviter.uuid === newUser.uuid || inviter.email === newUser.email) {
      return respErr("Cannot invite yourself");
    }

    // 简化的积分奖励：每成功邀请一人获得50积分
    const INVITE_REWARD_CREDITS = 50;
    
    // 给邀请人增加积分
    await increaseCredits({
      user_uuid: inviter.uuid,
      trans_type: "invite_reward",
      credits: INVITE_REWARD_CREDITS,
      expired_at: undefined, // 积分不过期
      order_no: `invite_${new_user_uuid}_${Date.now()}`,
    });

    // 可选：给新用户也赠送一些积分作为欢迎奖励
    const WELCOME_CREDITS = 20;
    await increaseCredits({
      user_uuid: new_user_uuid,
      trans_type: "welcome_bonus",
      credits: WELCOME_CREDITS,
      expired_at: undefined,
      order_no: `welcome_${new_user_uuid}_${Date.now()}`,
    });

    return respData({
      success: true,
      inviter_reward: INVITE_REWARD_CREDITS,
      new_user_bonus: WELCOME_CREDITS,
      message: "Invite reward processed successfully"
    });

  } catch (error) {
    console.error("Invite reward processing failed:", error);
    return respErr("Failed to process invite reward");
  }
}
