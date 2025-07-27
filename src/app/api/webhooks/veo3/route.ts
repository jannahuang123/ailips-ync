/**
 * Veo3 Webhook Handler
 * 
 * Processes webhook notifications from APICore.ai Veo3 when tasks complete.
 * Updates project status and notifies users of completion.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects, lipsyncTasks } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface Veo3WebhookPayload {
  job_id: string;
  status: string;
  result_url?: string;
  error?: string;
  progress?: number;
  model: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse webhook payload
    const payload = await request.json() as Veo3WebhookPayload;
    
    console.log('Received Veo3 webhook:', payload);

    const { job_id, status, result_url, error, progress } = payload;

    if (!job_id) {
      console.error('Missing job_id in webhook payload');
      return NextResponse.json(
        { error: 'Missing job_id' },
        { status: 400 }
      );
    }

    // Find project by external task ID
    const database = db();
    const [project] = await database
      .select()
      .from(projects)
      .where(eq(projects.external_task_id, job_id))
      .limit(1);

    if (!project) {
      console.error(`Project not found for job_id: ${job_id}`);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    console.log(`Processing webhook for project ${project.uuid}, status: ${status}`);

    if (status === 'completed' && result_url) {
      // Task completed successfully
      await database.update(projects)
        .set({
          status: 'completed',
          result_url: result_url,
          updated_at: new Date(),
        })
        .where(eq(projects.uuid, project.uuid));

      await database.update(lipsyncTasks)
        .set({
          status: 'completed',
          progress: 100,
          completed_at: new Date(),
        })
        .where(eq(lipsyncTasks.project_uuid, project.uuid));

      console.log(`Project ${project.uuid} completed successfully`);

      // TODO: Send notification to user (email, push notification, etc.)
      // await notifyUser(project.user_uuid, {
      //   type: 'project_completed',
      //   projectId: project.uuid,
      //   projectName: project.name,
      //   resultUrl: result_url
      // });

    } else if (status === 'failed') {
      // Task failed
      const errorMessage = error || 'Veo3 processing failed';

      await database.update(projects)
        .set({
          status: 'failed',
          updated_at: new Date(),
        })
        .where(eq(projects.uuid, project.uuid));

      await database.update(lipsyncTasks)
        .set({
          status: 'failed',
          error_message: errorMessage,
          completed_at: new Date(),
        })
        .where(eq(lipsyncTasks.project_uuid, project.uuid));

      console.error(`Project ${project.uuid} failed: ${errorMessage}`);

      // TODO: Send failure notification to user
      // await notifyUser(project.user_uuid, {
      //   type: 'project_failed',
      //   projectId: project.uuid,
      //   projectName: project.name,
      //   error: errorMessage
      // });

    } else if (status === 'processing') {
      // Task is still processing, update progress
      const currentProgress = progress || 50;

      await database.update(lipsyncTasks)
        .set({
          progress: currentProgress,
        })
        .where(eq(lipsyncTasks.project_uuid, project.uuid));

      console.log(`Project ${project.uuid} progress: ${currentProgress}%`);

    } else {
      console.log(`Unknown status for project ${project.uuid}: ${status}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      projectId: project.uuid,
      status: status
    });

  } catch (error) {
    console.error('Veo3 webhook processing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Verify webhook signature (if APICore.ai provides signature verification)
 */
function verifyWebhookSignature(payload: string, signature: string): boolean {
  // TODO: Implement signature verification if APICore.ai provides it
  // const expectedSignature = crypto
  //   .createHmac('sha256', process.env.APICORE_WEBHOOK_SECRET!)
  //   .update(payload)
  //   .digest('hex');
  // 
  // return crypto.timingSafeEqual(
  //   Buffer.from(signature),
  //   Buffer.from(expectedSignature)
  // );
  
  return true; // For now, accept all webhooks
}

/**
 * Send notification to user (placeholder for future implementation)
 */
async function notifyUser(userUuid: string, notification: {
  type: string;
  projectId: string;
  projectName: string;
  resultUrl?: string;
  error?: string;
}) {
  // TODO: Implement user notification system
  // This could include:
  // - Email notifications
  // - Push notifications
  // - In-app notifications
  // - WebSocket real-time updates
  
  console.log(`Notification for user ${userUuid}:`, notification);
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

// Handle GET request for webhook verification (if needed)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');
  
  if (challenge) {
    // Return challenge for webhook verification
    return NextResponse.json({ challenge });
  }
  
  return NextResponse.json({
    message: 'Veo3 webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
