/**
 * Video Upload API Endpoint
 * 
 * Handles video file uploads to S3 storage for lip sync processing.
 * Validates file format, size, and uploads to designated S3 bucket.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { authOptions } from '@/auth/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Supported video formats
const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/quicktime',
  'video/x-msvideo'
];

// Maximum file size (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Initialize S3 client with validation
function createS3Client() {
  const endpoint = process.env.STORAGE_ENDPOINT;
  const accessKey = process.env.STORAGE_ACCESS_KEY;
  const secretKey = process.env.STORAGE_SECRET_KEY;
  const region = process.env.STORAGE_REGION || 'us-east-1';

  if (!endpoint || !accessKey || !secretKey) {
    console.warn('Storage configuration missing. Using fallback storage.');
    return null;
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    endpoint,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!SUPPORTED_VIDEO_FORMATS.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Unsupported file format. Please upload MP4, AVI, or MOV files.',
          supportedFormats: SUPPORTED_VIDEO_FORMATS
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
          maxSize: MAX_FILE_SIZE
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'mp4';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `videos/${session.user.uuid}/${fileName}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    let fileUrl: string;
    const s3Client = createS3Client();

    if (s3Client && process.env.STORAGE_BUCKET) {
      // Upload to S3/R2
      console.log('Using S3/R2 storage for video upload');
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.STORAGE_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          userId: session.user.uuid,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      await s3Client.send(uploadCommand);
      fileUrl = `${process.env.STORAGE_DOMAIN}/${key}`;
    } else {
      // Fallback to local storage
      console.log('Using local storage fallback for video');
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'videos');

      // Ensure directory exists
      await mkdir(uploadsDir, { recursive: true });

      // Save file locally
      const localPath = path.join(uploadsDir, fileName);
      await writeFile(localPath, buffer);

      // Generate public URL
      fileUrl = `/uploads/videos/${fileName}`;
    }

    console.log(`Video uploaded successfully: ${fileUrl}`);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      key: key
    });

  } catch (error) {
    console.error('Video upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload video file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
