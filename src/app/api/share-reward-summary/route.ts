import { respData, respErr } from "@/lib/resp";
import { getUserUuid } from "@/services/user";
import { getShareRewardSummary } from "@/services/share-reward";

export async function GET() {
  try {
    const userUuid = await getUserUuid();
    if (!userUuid) {
      return respErr("no auth");
    }

    const summary = await getShareRewardSummary(userUuid);
    return respData(summary);
  } catch (error) {
    console.error("获取分享奖励统计失败:", error);
    return respErr("failed to get share reward summary");
  }
}

export async function POST() {
  return GET();
}
