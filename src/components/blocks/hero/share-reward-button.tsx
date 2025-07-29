"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/icon";
import ShareRewardModal from "@/components/share/share-reward-modal";
import { ButtonVariant } from "@/types/blocks/base";

interface ShareRewardButtonProps {
  title?: string;
  icon?: string;
  variant?: ButtonVariant;
}

export default function ShareRewardButton({
  title = "Share & Earn Credits",
  icon = "RiShareLine",
  variant = "outline"
}: ShareRewardButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = () => {
    setModalOpen(true);
  };

  const handleShareComplete = () => {
    // 可以在这里添加分享完成后的逻辑
    // 比如刷新用户积分、显示成功消息等
    console.log("Share completed!");
  };

  return (
    <>
      <Button
        className="w-full"
        size="lg"
        variant={variant}
        onClick={handleClick}
      >
        {icon && <Icon name={icon} className="" />}
        {title}
      </Button>
      
      <ShareRewardModal
        open={modalOpen}
        setOpen={setModalOpen}
        onShareComplete={handleShareComplete}
      />
    </>
  );
}
