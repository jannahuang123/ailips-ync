/**
 * HeyGen Webhook Handler
 * 
 * Processes webhook notifications from HeyGen API when tasks complete.
 * Updates project status and notifies users of completion.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects, lipsyncTasks } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface HeyGenWebhookPayload {
  task_id: string;
  status: string;
  result_url?: string;
  error?: string;
  progress?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Parse webhook payload
    const payload = await request.json() as HeyGenWebhookPayload;
    
    console.log('Received HeyGen webhook:', payload);

    const { task_id, status, result_url, error, progress } = payload;

    if (!task_id) {
      console.error('Missing task_id in webhook payload');
      return NextResponse.json(
        { error: 'Missing task_id' },
        { status: 400 }
      );
    }

    // Find project by external task ID
    const project = await db.query.projects.findFirst({
      where: eq(projects.external_task_id, task_id)
    });

    if (!project) {
      console.error(`Project not found for task_id: ${task_id}`);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    console.log(`Processing webhook for project: ${project.uuid}`);

    // Update project based on status
    if (status === 'completed' || status === 'done') {
      // Task completed successfully
      await db.update(projects)
        .set({
          status: 'completed',
          result_url: result_url,
          updated_at: new Date(),
        })
        .where(eq(projects.uuid, project.uuid));

      // Update task status
      await db.update(lipsyncTasks)
        .set({
          status: 'completed',
          progress: 100,
          completed_at: new Date(),
        })
        .where(eq(lipsyncTasks.project_uuid, project.uuid));

      console.log(`Project ${project.uuid} completed successfully`);

      // TODO: Send notification to user (email, push notification, etc.)
      // await sendCompletionNotification(project.user_uuid, project.uuid, result_url);

    } else if (status === 'failed' || status === 'error') {
      // Task failed
      await db.update(projects)
        .set({
          status: 'failed',
          updated_at: new Date(),
        })
        .where(eq(projects.uuid, project.uuid));

      // Update task with error
      await db.update(lipsyncTasks)
        .set({
          status: 'failed',
          progress: 0,
          error_message: error || 'Processing failed',
        })
        .where(eq(lipsyncTasks.project_uuid, project.uuid));

      console.log(`Project ${project.uuid} failed:`, error);

      // TODO: Send failure notification to user
      // await sendFailureNotification(project.user_uuid, project.uuid, error);

    } else if (status === 'processing') {
      // Task is still processing, update progress
      const currentProgress = progress || 50;

      await db.update(lipsyncTasks)
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
    console.error('HeyGen webhook processing error:', error);
    
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
 * Send completion notification to user
 * TODO: Implement email/push notification system
 */
async function sendCompletionNotification(userUuid: string, projectUuid: string, resultUrl?: string) {
  try {
    // Implementation depends on your notification system
    // Could be email, push notification, in-app notification, etc.
    
    console.log(`Sending completion notification to user ${userUuid} for project ${projectUuid}`);
    
    // Example: Send email notification
    // await emailService.sendProjectCompletionEmail(userUuid, projectUuid, resultUrl);
    
    // Example: Send push notification
    // await pushService.sendNotification(userUuid, {
    //   title: 'Video Processing Complete!',
    //   body: 'Your lip sync video is ready for download.',
    //   data: { projectId: projectUuid, resultUrl }
    // });
    
  } catch (error) {
    console.error('Failed to send completion notification:', error);
  }
}

/**
 * Send failure notification to user
 * TODO: Implement email/push notification system
 */
async function sendFailureNotification(userUuid: string, projectUuid: string, errorMessage?: string) {
  try {
    console.log(`Sending failure notification to user ${userUuid} for project ${projectUuid}`);
    
    // Example: Send email notification
    // await emailService.sendProjectFailureEmail(userUuid, projectUuid, errorMessage);
    
  } catch (error) {
    console.error('Failed to send failure notification:', error);
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
