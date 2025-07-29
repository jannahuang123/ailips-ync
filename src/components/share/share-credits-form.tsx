"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Copy, Share2, Users, Gift, Twitter, Facebook, MessageCircle, TrendingUp } from "lucide-react";
import { User } from "@/types/user";
import { CopyToClipboard } from "react-copy-to-clipboard";

interface ShareCreditsFormProps {
  userInfo: User;
}

interface ShareRewardSummary {
  total_invited: number;
  total_credits_earned: number;
  is_eligible_for_bonus: boolean;
}

export default function ShareCreditsForm({ userInfo }: ShareCreditsFormProps) {
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [summary, setSummary] = useState<ShareRewardSummary | null>(null);
  
  // 获取分享奖励统计
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('/api/share-reward-summary');
        if (response.ok) {
          const result = await response.json();
          if (result.code === 0) {
            setSummary(result.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch share reward summary:', error);
      }
    };

    fetchSummary();
  }, []);

  // 生成分享链接
  const shareUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/i/${userInfo.invite_code || 'signup'}`;
  const shareText = "🎬 Check out LipSyncVideo - Create amazing AI lip sync videos in minutes! Get 50 free credits when you sign up with my link.";

  // 社交媒体分享链接
  const socialShares = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
  };

  const handleGenerateCode = async () => {
    if (userInfo.invite_code) {
      toast.success("Your invite code is already set!");
      return;
    }

    setIsGeneratingCode(true);
    try {
      // 生成邀请码：用户名前缀 + UUID前4位
      const namePrefix = userInfo.nickname?.substring(0, 4).toUpperCase() || 'USER';
      const uuidSuffix = userInfo.uuid?.substring(0, 4).toUpperCase() || '1234';
      const code = `${namePrefix}${uuidSuffix}`;

      // 调用 API 设置邀请码
      const response = await fetch('/api/update-invite-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invite_code: code }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invite code');
      }

      const result = await response.json();
      if (result.code !== 0) {
        throw new Error(result.message || 'Failed to generate invite code');
      }

      toast.success("Invite code generated successfully!");
      // 刷新页面以显示新的邀请码
      window.location.reload();
    } catch (error) {
      console.error('Generate invite code error:', error);
      toast.error("Failed to generate invite code");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 积分奖励说明 */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="flex items-center gap-4 mb-4">
          <Gift className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-xl font-semibold">Earn Free Credits</h3>
            <p className="text-muted-foreground">Share and get rewarded - no payment required!</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">+20</div>
            <div className="text-sm text-muted-foreground">Credits per signup</div>
          </div>
          <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">+50</div>
            <div className="text-sm text-muted-foreground">Bonus for first 10 referrals</div>
          </div>
          <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">∞</div>
            <div className="text-sm text-muted-foreground">No limit on referrals</div>
          </div>
        </div>
      </Card>

      {/* 分享统计 */}
      {summary && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Your Share Statistics</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{summary.total_invited}</div>
              <div className="text-sm text-muted-foreground">Total Referrals</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{summary.total_credits_earned}</div>
              <div className="text-sm text-muted-foreground">Credits Earned</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {summary.is_eligible_for_bonus ? "✅" : "🎉"}
              </div>
              <div className="text-sm text-muted-foreground">
                {summary.is_eligible_for_bonus ? "Bonus Eligible" : "Bonus Unlocked"}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 分享链接 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Your Share Link</h3>
        </div>
        
        {userInfo.invite_code ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="share-link">Share this link to earn credits</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="share-link"
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <CopyToClipboard
                  text={shareUrl}
                  onCopy={() => toast.success("Link copied to clipboard!")}
                >
                  <Button variant="outline" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </CopyToClipboard>
              </div>
            </div>
            
            <div>
              <Label>Your Invite Code</Label>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {userInfo.invite_code}
                </Badge>
                <CopyToClipboard
                  text={userInfo.invite_code}
                  onCopy={() => toast.success("Invite code copied!")}
                >
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </CopyToClipboard>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Generate your unique invite code to start earning credits
            </p>
            <Button 
              onClick={handleGenerateCode}
              disabled={isGeneratingCode}
              className="min-w-[200px]"
            >
              {isGeneratingCode ? "Generating..." : "Generate Invite Code"}
            </Button>
          </div>
        )}
      </Card>

      {/* 社交媒体分享 */}
      {userInfo.invite_code && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Share on Social Media</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-12 justify-start"
              onClick={() => window.open(socialShares.twitter, '_blank')}
            >
              <Twitter className="h-5 w-5 mr-3 text-blue-400" />
              Share on Twitter
            </Button>
            
            <Button
              variant="outline"
              className="h-12 justify-start"
              onClick={() => window.open(socialShares.facebook, '_blank')}
            >
              <Facebook className="h-5 w-5 mr-3 text-blue-600" />
              Share on Facebook
            </Button>
            
            <Button
              variant="outline"
              className="h-12 justify-start"
              onClick={() => window.open(socialShares.whatsapp, '_blank')}
            >
              <MessageCircle className="h-5 w-5 mr-3 text-green-500" />
              Share on WhatsApp
            </Button>
          </div>
        </Card>
      )}

      {/* 使用说明 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">How It Works</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
            <p>Share your unique link or invite code with friends</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
            <p>When someone signs up using your link, you both get credits</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
            <p>Use your credits to create amazing lip sync videos</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
