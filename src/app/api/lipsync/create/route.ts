/**
 * LipSync Creation API Endpoint
 * 
 * Creates a new lip sync project and initiates AI processing.
 * Handles project creation, AI provider selection, and task management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { authOptions } from '@/auth/config';
import { db } from '@/db';
import { projects, lipsyncTasks, users } from '@/db/schema';
import { getAIProviderManager } from '@/lib/ai/provider-manager';
import { getUserCredits, decreaseCredits, CreditsTransType } from '@/services/credit';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

interface CreateProjectRequest {
  name: string;
  videoUrl: string;
  audioUrl: string;
  quality?: 'low' | 'medium' | 'high';
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

    // Parse request body
    const body = await request.json() as CreateProjectRequest;
    const { name, videoUrl, audioUrl, quality = 'medium' } = body;

    // Validate required fields
    if (!name || !videoUrl || !audioUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: name, videoUrl, audioUrl' },
        { status: 400 }
      );
    }

    // Validate URLs
    if (!isValidUrl(videoUrl) || !isValidUrl(audioUrl)) {
      return NextResponse.json(
        { error: 'Invalid video or audio URL format' },
        { status: 400 }
      );
    }

    // Check user credits using ShipAny credit system
    const userCredits = await getUserCredits(session.user.uuid);

    // Calculate credits needed based on quality
    const creditsNeeded = calculateCreditsNeeded(quality);

    // Check if user has enough credits
    if (userCredits.left_credits < creditsNeeded) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          required: creditsNeeded,
          available: userCredits.left_credits,
          message: 'Please purchase more credits to continue'
        },
        { status: 402 } // Payment Required
      );
    }
    
    // Generate project UUID
    const projectUuid = uuidv4();

    // Create project record
    const database = db();
    const [project] = await database.insert(projects).values({
      uuid: projectUuid,
      user_uuid: session.user.uuid,
      name,
      status: 'pending',
      video_url: videoUrl,
      audio_url: audioUrl,
      quality,
      credits_consumed: creditsNeeded,
      created_at: new Date(),
      updated_at: new Date(),
    }).returning();

    // Create initial task record
    const [task] = await database.insert(lipsyncTasks).values({
      project_uuid: projectUuid,
      status: 'queued',
      progress: 0,
      created_at: new Date(),
    }).returning();

    try {
      // Initialize AI provider manager
      const aiManager = getAIProviderManager();

      // Start AI processing
      const result = await aiManager.processLipSync({
        videoUrl,
        audioUrl,
        quality
      });

      // Update project with external task ID and provider
      await database.update(projects)
        .set({
          external_task_id: result.taskId,
          provider: result.provider,
          status: 'processing',
          updated_at: new Date(),
        })
        .where(eq(projects.uuid, projectUuid));

      // Update task status
      await database.update(lipsyncTasks)
        .set({
          status: 'processing',
          started_at: new Date(),
        })
        .where(eq(lipsyncTasks.project_uuid, projectUuid));

      // Deduct credits using ShipAny credit system with LipSync specific type
      const transType = getLipSyncTransType(quality);
      await decreaseCredits({
        user_uuid: session.user.uuid,
        trans_type: transType,
        credits: creditsNeeded
      });

      console.log(`Project ${projectUuid} created and processing started with ${result.provider}, ${creditsNeeded} credits deducted`);

      return NextResponse.json({
        success: true,
        projectId: projectUuid,
        status: 'processing',
        provider: result.provider,
        estimatedTime: result.estimatedTime,
        creditsUsed: creditsNeeded,
        creditsRemaining: userCredits.left_credits - creditsNeeded,
        message: 'Project created successfully and processing started'
      });

    } catch (aiError) {
      console.error('AI processing failed:', aiError);

      // Update project status to failed
      await database.update(projects)
        .set({
          status: 'failed',
          updated_at: new Date(),
        })
        .where(eq(projects.uuid, projectUuid));

      // Update task with error
      await database.update(lipsyncTasks)
        .set({
          status: 'failed',
          error_message: aiError instanceof Error ? aiError.message : 'Unknown AI processing error',
        })
        .where(eq(lipsyncTasks.project_uuid, projectUuid));

      return NextResponse.json(
        { 
          error: 'Failed to start AI processing',
          details: aiError instanceof Error ? aiError.message : 'Unknown error',
          projectId: projectUuid
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Project creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create project',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Calculate credits needed based on quality
 * Following ShipAny credit system standards
 */
function calculateCreditsNeeded(quality: string): number {
  switch (quality) {
    case 'low':
      return 5;   // Low quality lip sync
    case 'medium':
      return 10;  // Medium quality lip sync
    case 'high':
      return 20;  // High quality lip sync
    case 'ultra':
      return 30;  // Ultra quality lip sync
    default:
      return 10;  // Default to medium
  }
}

/**
 * Get LipSync transaction type based on quality
 */
function getLipSyncTransType(quality: string): CreditsTransType {
  switch (quality) {
    case 'low':
      return CreditsTransType.LipSyncLow;
    case 'medium':
      return CreditsTransType.LipSyncMedium;
    case 'high':
      return CreditsTransType.LipSyncHigh;
    case 'ultra':
      return CreditsTransType.LipSyncUltra;
    default:
      return CreditsTransType.LipSyncMedium;
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
