/**
 * Image Upload API Endpoint
 * 
 * Handles image file uploads for LipSync photo-to-video generation.
 * Supports JPEG, PNG, WebP formats with validation and optimization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Supported image formats
const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Initialize S3 client with validation
function createS3Client() {
  const endpoint = process.env.STORAGE_ENDPOINT;
  const accessKey = process.env.STORAGE_ACCESS_KEY;
  const secretKey = process.env.STORAGE_SECRET_KEY;
  const region = process.env.STORAGE_REGION || 'auto';

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
    if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Unsupported file format',
          supportedFormats: SUPPORTED_IMAGE_FORMATS,
          receivedFormat: file.type
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'File too large',
          maxSize: '10MB',
          receivedSize: `${Math.round(file.size / 1024 / 1024 * 100) / 100}MB`
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `images/${session.user.uuid}/${fileName}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    let fileUrl: string;
    const s3Client = createS3Client();

    if (s3Client && process.env.STORAGE_BUCKET) {
      // Upload to S3/R2
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
      console.log('Using local storage fallback');
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'images');

      // Ensure directory exists
      await mkdir(uploadsDir, { recursive: true });

      // Save file locally
      const localPath = path.join(uploadsDir, fileName);
      await writeFile(localPath, buffer);

      // Generate public URL
      fileUrl = `/uploads/images/${fileName}`;
    }

    console.log(`Image uploaded successfully: ${fileUrl} (${file.size} bytes)`);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      key: key,
      uploadedAt: new Date().toISOString(),
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Image upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}



/**
 * Validate image dimensions (optional - for future use)
 */
async function validateImageDimensions(buffer: Buffer): Promise<{ width: number; height: number } | null> {
  try {
    // This would require an image processing library like 'sharp'
    // For now, we'll skip dimension validation
    return null;
  } catch (error) {
    console.warn('Image dimension validation failed:', error);
    return null;
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
