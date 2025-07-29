import {
  findUserByInviteCode,
  findUserByUuid,
  updateUserInvitedBy,
} from "@/models/user";
import { respData, respErr } from "@/lib/resp";
import { processShareReward } from "@/services/share-reward";

export async function POST(req: Request) {
  try {
    const { invite_code, user_uuid } = await req.json();
    if (!invite_code || !user_uuid) {
      return respErr("invalid params");
    }

    // check invite user
    const inviteUser = await findUserByInviteCode(invite_code);
    if (!inviteUser) {
      return respErr("invite user not found");
    }

    // check current user
    const user = await findUserByUuid(user_uuid);
    if (!user) {
      return respErr("user not found");
    }

    if (user.uuid === inviteUser.uuid || user.email === inviteUser.email) {
      return respErr("can't invite yourself");
    }

    if (user.invited_by) {
      return respErr("user already has invite user");
    }

    // 使用简化的分享奖励系统
    const success = await processShareReward(user_uuid, invite_code);
    if (!success) {
      return respErr("failed to process share reward");
    }

    // 更新用户信息
    const updatedUser = await findUserByUuid(user_uuid);
    return respData(updatedUser);
  } catch (e) {
    console.error("update invited by failed: ", e);
    return respErr("update invited by failed");
  }
}
