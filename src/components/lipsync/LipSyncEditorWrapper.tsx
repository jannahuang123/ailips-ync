"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import LipSyncEditor from "./LipSyncEditor";

interface LipSyncEditorWrapperProps {
  userCredits?: number;
}

export default function LipSyncEditorWrapper({ userCredits: initialCredits }: LipSyncEditorWrapperProps) {
  const { data: session } = useSession();
  const [userCredits, setUserCredits] = useState(initialCredits || 0);
  const [loading, setLoading] = useState(false);

  // Fetch real user credits from ShipAny credit system
  useEffect(() => {
    if (session?.user) {
      fetchUserCredits();
    }
  }, [session]);

  const fetchUserCredits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/get-user-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.code === 0 && data.data) {
          setUserCredits(data.data.left_credits || 0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = (data: any) => {
    console.log("Generated:", data);

    // Show success message with result
    if (data.resultUrl) {
      toast.success(
        <div>
          <p>Video generated successfully!</p>
          <a
            href={data.resultUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Download Video
          </a>
        </div>
      );
    }

    // Refresh credits after generation
    if (session?.user) {
      fetchUserCredits();
    }

    // Additional logic:
    // - Track analytics
    // - Update project list
    // - Show project in user dashboard
  };

  return (
    <LipSyncEditor
      userCredits={userCredits}
      onGenerate={handleGenerate}
      loading={loading}
    />
  );
}
