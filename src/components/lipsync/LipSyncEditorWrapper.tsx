"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import LipSyncEditor from "./LipSyncEditor";

interface LipSyncEditorWrapperProps {
  userCredits?: number;
}

export default function LipSyncEditorWrapper({ userCredits: initialCredits }: LipSyncEditorWrapperProps) {
  const { data: session, status } = useSession();
  const [userCredits, setUserCredits] = useState(initialCredits || 50); // Default to 50 credits for demo
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real user credits from ShipAny credit system
  useEffect(() => {
    if (mounted && session?.user && status === 'authenticated') {
      fetchUserCredits();
    }
  }, [mounted, session, status]);

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

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 bg-card rounded-lg border">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-2/3 mx-auto mb-8"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <LipSyncEditor
        userCredits={userCredits}
        onGenerate={handleGenerate}
        loading={loading}
      />
    </div>
  );
}
