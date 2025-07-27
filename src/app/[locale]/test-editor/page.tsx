"use client";

import LipSyncEditor from "@/components/lipsync/LipSyncEditor";
import ThemeToggle from "@/components/theme/toggle";

export default function TestEditorPage() {
  const handleGenerate = (data: any) => {
    console.log("Generated:", data);
    alert("Generation completed! Check console for details.");
  };

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
        </div>

        <LipSyncEditor
          userCredits={50}
          onGenerate={handleGenerate}
        />
      </div>
    </div>
  );
}
