"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LipSyncEditorTest() {
  return (
    <div className="w-full max-w-[950px] mx-auto p-4">
      <Card className="shadow-2xl bg-card border-border text-card-foreground">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">LipSync Editor Test</h2>
            <p className="text-muted-foreground mb-6">
              This is a test component to verify the editor is loading correctly.
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Test Button
            </Button>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                If you can see this, the component is rendering correctly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
