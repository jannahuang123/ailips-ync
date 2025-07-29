import { respData, respErr } from "@/lib/resp";
import { processShareReward, getShareRewardSummary } from "@/services/share-reward";
import { findUserByEmail } from "@/models/user";

/**
 * 测试分享奖励功能的 API
 * 仅用于开发测试，生产环境应该移除
 */
export async function POST(req: Request) {
  try {
    const { action, inviteCode, userEmail } = await req.json();

    if (action === "test-reward") {
      // 测试分享奖励处理
      if (!inviteCode || !userEmail) {
        return respErr("Missing inviteCode or userEmail");
      }

      const user = await findUserByEmail(userEmail);
      if (!user || !user.uuid) {
        return respErr("User not found");
      }

      const success = await processShareReward(user.uuid, inviteCode);
      return respData({ success, message: success ? "Reward processed" : "Reward failed" });
    }

    if (action === "test-summary") {
      // 测试获取分享统计
      if (!userEmail) {
        return respErr("Missing userEmail");
      }

      const user = await findUserByEmail(userEmail);
      if (!user || !user.uuid) {
        return respErr("User not found");
      }

      const summary = await getShareRewardSummary(user.uuid);
      return respData(summary);
    }

    return respErr("Invalid action");
  } catch (error) {
    console.error("Test share reward error:", error);
    return respErr("Test failed");
  }
}

export async function GET() {
  return respData({
    message: "Share reward test API",
    actions: ["test-reward", "test-summary"],
    usage: {
      "test-reward": "POST with { action: 'test-reward', inviteCode: 'CODE', userEmail: 'email' }",
      "test-summary": "POST with { action: 'test-summary', userEmail: 'email' }"
    }
  });
}
