"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TestUploadPage() {
  const { data: session, status } = useSession();
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const testImageUpload = async () => {
    if (!session) {
      toast.error('Please sign in first');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      // Create a test image file (1x1 pixel PNG)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 1, 1);
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/png');
      });

      // Create form data
      const formData = new FormData();
      formData.append('file', blob, 'test-image.png');

      // Upload
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Image uploaded successfully!');
        setUploadResult(result);
      } else {
        throw new Error(result.error || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const testFileUpload = async (file: File, endpoint: string) => {
    if (!session) {
      toast.error('Please sign in first');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`${file.type.split('/')[0]} uploaded successfully!`);
        setUploadResult(result);
      } else {
        throw new Error(result.error || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    let endpoint = '';
    if (file.type.startsWith('image/')) {
      endpoint = '/api/upload/image';
    } else if (file.type.startsWith('audio/')) {
      endpoint = '/api/upload/audio';
    } else if (file.type.startsWith('video/')) {
      endpoint = '/api/upload/video';
    } else {
      toast.error('Unsupported file type');
      return;
    }

    testFileUpload(file, endpoint);
  };

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>File Upload Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to test file upload functionality.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>File Upload Test</CardTitle>
          <p className="text-sm text-muted-foreground">
            Test the file upload functionality with different file types.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Test with Generated Image</h3>
            <Button 
              onClick={testImageUpload} 
              disabled={uploading}
              className="w-full"
            >
              {uploading ? 'Uploading...' : 'Test Image Upload'}
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Test with Your Files</h3>
            <input
              type="file"
              accept="image/*,audio/*,video/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="w-full p-2 border rounded"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supports: Images (JPG, PNG, WebP), Audio (MP3, WAV), Video (MP4, MOV)
            </p>
          </div>

          {uploadResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <h4 className="font-semibold text-green-800">Upload Successful!</h4>
              <div className="mt-2 text-sm">
                <p><strong>URL:</strong> {uploadResult.url}</p>
                <p><strong>File Name:</strong> {uploadResult.fileName}</p>
                <p><strong>File Size:</strong> {uploadResult.fileSize} bytes</p>
                <p><strong>File Type:</strong> {uploadResult.fileType}</p>
                {uploadResult.key && <p><strong>Storage Key:</strong> {uploadResult.key}</p>}
              </div>
              
              {uploadResult.url.startsWith('/uploads/') && (
                <div className="mt-2">
                  <p className="text-sm text-green-700">
                    ✅ Using local storage fallback (S3 not configured)
                  </p>
                </div>
              )}
              
              {uploadResult.url.startsWith('http') && (
                <div className="mt-2">
                  <p className="text-sm text-green-700">
                    ✅ Using S3/R2 cloud storage
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-semibold text-blue-800">Storage Configuration</h4>
            <p className="text-sm text-blue-700 mt-1">
              {process.env.NEXT_PUBLIC_STORAGE_CONFIGURED === 'true' 
                ? '✅ S3/R2 storage configured' 
                : '⚠️ Using local storage fallback (S3 not configured)'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
