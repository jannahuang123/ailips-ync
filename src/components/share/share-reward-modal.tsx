"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Icon from "@/components/icon";
import { useTranslations } from "next-intl";

interface ShareRewardModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onShareComplete?: () => void;
}

export default function ShareRewardModal({
  open,
  setOpen,
  onShareComplete,
}: ShareRewardModalProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [sharedPlatforms, setSharedPlatforms] = useState<Set<string>>(new Set());

  const shareText = "🎬 Check out this amazing AI Lip Sync Video Generator! Create professional lip-synced videos in minutes with cutting-edge AI technology. Try it free!";
  const shareUrl = `${process.env.NEXT_PUBLIC_WEB_URL}`;

  const socialPlatforms = [
    {
      name: "Twitter",
      icon: "RiTwitterXFill",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: "text-black hover:text-gray-700",
    },
    {
      name: "Facebook",
      icon: "RiFacebookFill",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      color: "text-blue-600 hover:text-blue-700",
    },
    {
      name: "LinkedIn",
      icon: "RiLinkedinFill",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`,
      color: "text-blue-700 hover:text-blue-800",
    },
    {
      name: "Reddit",
      icon: "RiRedditFill",
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
      color: "text-orange-600 hover:text-orange-700",
    },
  ];

  const handleShare = async (platform: string, url: string) => {
    try {
      // 打开分享窗口
      const shareWindow = window.open(
        url,
        "share",
        "width=600,height=400,scrollbars=yes,resizable=yes"
      );

      // 标记为已分享
      const newSharedPlatforms = new Set(sharedPlatforms);
      newSharedPlatforms.add(platform);
      setSharedPlatforms(newSharedPlatforms);

      // 模拟检测分享完成（实际项目中可能需要更复杂的检测逻辑）
      setTimeout(async () => {
        if (shareWindow?.closed) {
          await claimShareReward(platform);
        }
      }, 3000);

      toast.success(`Shared on ${platform}! You'll get 10 credits once verified.`);
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("Share failed. Please try again.");
    }
  };

  const claimShareReward = async (platform: string) => {
    try {
      setLoading(true);
      
      const response = await fetch("/api/claim-share-reward", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform,
          share_url: shareUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to claim reward");
      }

      const { code, message, data } = await response.json();
      
      if (code === 0) {
        toast.success(`🎉 Congratulations! You earned ${data.credits} credits for sharing on ${platform}!`);
        onShareComplete?.();
      } else {
        toast.error(message || "Failed to claim reward");
      }
    } catch (error) {
      console.error("Claim reward failed:", error);
      toast.error("Failed to claim reward. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="RiGiftLine" className="text-primary" />
            Share & Earn Free Credits
          </DialogTitle>
          <DialogDescription>
            Share LipSyncVideo on social media and earn <strong>10 free credits</strong> for each platform!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 分享按钮 */}
          <div className="grid grid-cols-2 gap-3">
            {socialPlatforms.map((platform) => (
              <Button
                key={platform.name}
                variant="outline"
                className="flex items-center gap-2 h-12"
                onClick={() => handleShare(platform.name, platform.url)}
                disabled={loading || sharedPlatforms.has(platform.name)}
              >
                <Icon name={platform.icon} className={`text-lg ${platform.color}`} />
                <span className="text-sm">
                  {sharedPlatforms.has(platform.name) ? "Shared ✓" : platform.name}
                </span>
              </Button>
            ))}
          </div>

          {/* 复制链接 */}
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">Or copy the link to share manually:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
              />
              <Button size="sm" variant="outline" onClick={handleCopyLink}>
                <Icon name="RiFileCopyLine" className="text-sm" />
              </Button>
            </div>
          </div>

          {/* 奖励说明 */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="RiInformationLine" className="text-primary text-sm" />
              <span className="text-sm font-medium">How it works:</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Share on any social platform to earn 10 credits</li>
              <li>• Credits are added automatically after sharing</li>
              <li>• Each platform can only be used once per user</li>
              <li>• Credits never expire and can be used for any video</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
