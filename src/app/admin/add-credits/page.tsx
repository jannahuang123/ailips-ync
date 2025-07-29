"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';

// 强制动态渲染
export const dynamic = 'force-dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, CreditCard, User, Plus } from 'lucide-react';

export default function AddCreditsPage() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status;
  const [credits, setCredits] = useState(100);
  const [loading, setLoading] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);

  const handleAddCredits = async () => {
    if (!session?.user) {
      toast.error('Please login first');
      return;
    }

    if (credits <= 0 || credits > 1000) {
      toast.error('Credits must be between 1 and 1000');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/add-test-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credits }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Successfully added ${credits} credits!`);
        setUserCredits(data.data.current_credits);
        console.log('Credits added:', data);
      } else {
        toast.error(data.error || 'Failed to add credits');
        console.error('Add credits error:', data);
      }
    } catch (error) {
      toast.error('Network error occurred');
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckCredits = async () => {
    if (!session?.user) {
      toast.error('Please login first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/add-test-credits', {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUserCredits(data.data.credits);
        toast.success(`Current credits: ${data.data.credits}`);
      } else {
        toast.error(data.error || 'Failed to get credits');
      }
    } catch (error) {
      toast.error('Network error occurred');
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 在构建时避免渲染错误
  if (typeof window === 'undefined') {
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to access this page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Add Test Credits</h1>
          <p className="text-muted-foreground">
            Add credits to your account for testing LipSync functionality
          </p>
        </div>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Email:</strong> {session.user.email}</p>
              <p><strong>Name:</strong> {session.user.name || 'N/A'}</p>
              <p><strong>UUID:</strong> {session.user.uuid || 'N/A'}</p>
              {userCredits !== null && (
                <p><strong>Current Credits:</strong> {userCredits}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Credits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Credits
            </CardTitle>
            <CardDescription>
              Add test credits to your account. Each LipSync generation costs 10 credits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="credits">Credits to Add</Label>
              <Input
                id="credits"
                type="number"
                min="1"
                max="1000"
                value={credits}
                onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
                placeholder="Enter credits amount"
              />
              <p className="text-sm text-muted-foreground">
                Recommended: 100 credits = 10 video generations
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleAddCredits} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add {credits} Credits
              </Button>

              <Button 
                variant="outline" 
                onClick={handleCheckCredits}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Check Credits
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>1. <strong>Add Credits:</strong> Click "Add Credits" to add test credits to your account</p>
              <p>2. <strong>Check Balance:</strong> Click "Check Credits" to see your current balance</p>
              <p>3. <strong>Test LipSync:</strong> Go to the homepage and test the LipSync editor</p>
              <p>4. <strong>Credit Cost:</strong> Each video generation costs 10 credits</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            onClick={() => setCredits(50)}
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <span className="font-semibold">50 Credits</span>
            <span className="text-xs text-muted-foreground">5 generations</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setCredits(100)}
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <span className="font-semibold">100 Credits</span>
            <span className="text-xs text-muted-foreground">10 generations</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setCredits(200)}
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <span className="font-semibold">200 Credits</span>
            <span className="text-xs text-muted-foreground">20 generations</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
