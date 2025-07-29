import { getTranslations } from "next-intl/server";
import { getUserInfo } from "@/services/user";
import { redirect } from "next/navigation";
import ShareCreditsForm from "@/components/share/share-credits-form";
import { User } from "@/types/user";

export default async function ShareCreditsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();
  
  // 检查用户登录状态
  const rawUserInfo = await getUserInfo();
  if (!rawUserInfo || !rawUserInfo.email) {
    const callbackUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/share-credits`;
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  // 转换为 User 类型
  const userInfo: User = {
    id: rawUserInfo.id,
    uuid: rawUserInfo.uuid,
    email: rawUserInfo.email,
    created_at: rawUserInfo.created_at || undefined,
    nickname: rawUserInfo.nickname || "",
    avatar_url: rawUserInfo.avatar_url || "",
    locale: rawUserInfo.locale || undefined,
    signin_type: rawUserInfo.signin_type || undefined,
    signin_ip: rawUserInfo.signin_ip || undefined,
    signin_provider: rawUserInfo.signin_provider || undefined,
    signin_openid: rawUserInfo.signin_openid || undefined,
    invite_code: rawUserInfo.invite_code || undefined,
    invited_by: rawUserInfo.invited_by || undefined,
    is_affiliate: rawUserInfo.is_affiliate || false,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">
            🎁 Share & Get Free Credits
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Share LipSyncVideo with your friends and earn free credits for every successful referral.
            No payment required - just share and earn!
          </p>
        </div>
        
        <ShareCreditsForm userInfo={userInfo} />
      </div>
    </div>
  );
}
