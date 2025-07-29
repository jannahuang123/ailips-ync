import { findAffiliateByOrderNo, insertAffiliate } from "@/models/affiliate";

import { AffiliateRewardAmount } from "./constant";
import { AffiliateRewardPercent } from "./constant";
import { AffiliateStatus } from "./constant";
import { Order } from "@/types/order";
import { findUserByUuid } from "@/models/user";
import { getIsoTimestr } from "@/lib/time";
import { increaseCredits, CreditsTransType, CreditsAmount } from "./credit";
import { getOneYearLaterTimestr } from "@/lib/time";

export async function updateAffiliateForOrder(order: Order) {
  try {
    const user = await findUserByUuid(order.user_uuid);
    if (user && user.uuid && user.invited_by && user.invited_by !== user.uuid) {
      const affiliate = await findAffiliateByOrderNo(order.order_no);
      if (affiliate) {
        return;
      }

      // 记录邀请关系
      await insertAffiliate({
        user_uuid: user.uuid,
        invited_by: user.invited_by,
        created_at: new Date(),
        status: AffiliateStatus.Completed,
        paid_order_no: order.order_no,
        paid_amount: order.amount,
        reward_percent: AffiliateRewardPercent.Paied,
        reward_amount: AffiliateRewardAmount.Paied,
      });

      // 给邀请人发放积分奖励
      console.log(`🎁 被邀请人 ${user.uuid} 首次付费，给邀请人 ${user.invited_by} 发放 ${CreditsAmount.InviteReward} 积分奖励`);

      await increaseCredits({
        user_uuid: user.invited_by,
        trans_type: CreditsTransType.InviteReward,
        credits: CreditsAmount.InviteReward,
        expired_at: getOneYearLaterTimestr(),
      });

      console.log(`✅ 成功为邀请人 ${user.invited_by} 发放 ${CreditsAmount.InviteReward} 积分奖励`);
    }
  } catch (e) {
    console.log("update affiliate for order failed: ", e);
    throw e;
  }
}
