import { getTranslations } from "next-intl/server";
import { getUserInfo } from "@/services/user";
import { redirect } from "next/navigation";
import ShareCreditsForm from "@/components/share/share-credits-form";

export default async function ShareCreditsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();
  
  // 检查用户登录状态
  const userInfo = await getUserInfo();
  if (!userInfo || !userInfo.email) {
    const callbackUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/share-credits`;
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

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
