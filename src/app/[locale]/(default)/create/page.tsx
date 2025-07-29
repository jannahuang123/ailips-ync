import { getTranslations } from "next-intl/server";
import { getUserInfo } from "@/services/user";
import { redirect } from "next/navigation";
import CreateProjectForm from "@/components/create/create-project-form";

export default async function CreatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  // 检查用户登录状态
  const userInfo = await getUserInfo();
  if (!userInfo || !userInfo.email) {
    const callbackUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/create`;
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Create New Lip Sync Video
          </h1>
          <p className="text-muted-foreground">
            Upload your video and audio to create amazing lip sync content
          </p>
        </div>
        
        <CreateProjectForm />
      </div>
    </div>
  );
}
