"use client";

import LipSyncEditorWrapper from "@/components/lipsync/LipSyncEditorWrapper";
import ThemeToggle from "@/components/theme/toggle";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestEditorPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background transition-colors py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-2/3 mx-auto mb-8"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background transition-colors py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold text-foreground">
                LipSync Editor Test Page
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Theme:</span>
                <ThemeToggle />
              </div>
            </div>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Please sign in to use the LipSync editor.
              </p>
              <a
                href="/auth/signin"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Sign In
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              LipSync Editor Test Page
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Theme:</span>
              <ThemeToggle />
            </div>
          </div>
          <p className="text-lg text-muted-foreground">
            Test the LipSync video editor functionality and theme switching
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Signed in as: {session.user?.email}
          </p>
        </div>

        <LipSyncEditorWrapper />
      </div>
    </div>
  );
}
