"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LipSyncDebug() {
  const [mounted, setMounted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    setDebugInfo(prev => [...prev, "Component mounted successfully"]);
  }, []);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
        <p className="text-yellow-800">Loading LipSync Editor...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-lg border">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              🎬 LipSync Video Generator
            </h3>
            <Badge variant="secondary" className="mb-4">
              Debug Mode - Component Loaded Successfully
            </Badge>
            <p className="text-muted-foreground">
              This is a debug version to verify component rendering
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Upload Area</h4>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/30">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                  📁
                </div>
                <p className="text-sm text-muted-foreground">
                  Drag & drop your photo or video here
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Preview Area</h4>
              <div className="border border-border rounded-lg p-8 text-center bg-muted/30 h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center text-2xl">
                    🎥
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Preview will appear here
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Controls</h4>
            <div className="flex gap-4">
              <Button 
                onClick={() => addDebugInfo("Test button clicked")}
                className="flex-1"
              >
                🎬 Generate Video (Test)
              </Button>
              <Button 
                variant="outline"
                onClick={() => addDebugInfo("Settings button clicked")}
              >
                ⚙️ Settings
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-foreground mb-2">Debug Information</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <p key={index} className="text-xs text-muted-foreground font-mono">
                  {info}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
