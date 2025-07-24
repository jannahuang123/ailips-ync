/**
 * LipSync Status API Endpoint
 * 
 * Retrieves the current status of a lip sync project.
 * Checks both local database and external AI provider status.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { authOptions } from '@/auth/config';
import { db } from '@/db';
import { projects, lipsyncTasks } from '@/db/schema';
import { getAIProviderManager } from '@/lib/ai/provider-manager';
import { eq, and, desc } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get project from database
    const database = db();
    const [project] = await database
      .select()
      .from(projects)
      .where(and(
        eq(projects.uuid, projectId),
        eq(projects.user_uuid, session.user.uuid)
      ))
      .limit(1);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get latest task status
    const [task] = await database
      .select()
      .from(lipsyncTasks)
      .where(eq(lipsyncTasks.project_uuid, projectId))
      .orderBy(desc(lipsyncTasks.created_at))
      .limit(1);

    // If project is completed or failed, return cached status
    if (project.status === 'completed' || project.status === 'failed') {
      return NextResponse.json({
        projectId,
        status: project.status,
        progress: project.status === 'completed' ? 100 : 0,
        resultUrl: project.result_url,
        error: task?.error_message,
        provider: project.provider,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      });
    }

    // If project is still processing, check with AI provider
    if (project.status === 'processing' && project.external_task_id && project.provider) {
      try {
        const aiManager = getAIProviderManager();
        const aiStatus = await aiManager.getTaskStatus(
          project.external_task_id,
          project.provider as 'heygen' | 'did'
        );

        // Update local database with latest status
        let newStatus = project.status;
        let newProgress = task?.progress || 0;
        let resultUrl = project.result_url;

        if (aiStatus.status === 'completed' || aiStatus.status === 'done') {
          newStatus = 'completed';
          newProgress = 100;
          resultUrl = aiStatus.resultUrl || null;

          // Update project in database
          await database.update(projects)
            .set({
              status: 'completed',
              result_url: aiStatus.resultUrl || null,
              updated_at: new Date(),
            })
            .where(eq(projects.uuid, projectId));

          // Update task in database
          await database.update(lipsyncTasks)
            .set({
              status: 'completed',
              progress: 100,
              completed_at: new Date(),
            })
            .where(eq(lipsyncTasks.project_uuid, projectId));

        } else if (aiStatus.status === 'failed' || aiStatus.status === 'error') {
          newStatus = 'failed';
          newProgress = 0;

          // Update project in database
          await database.update(projects)
            .set({
              status: 'failed',
              updated_at: new Date(),
            })
            .where(eq(projects.uuid, projectId));

          // Update task in database
          await database.update(lipsyncTasks)
            .set({
              status: 'failed',
              progress: 0,
              error_message: aiStatus.error || 'Processing failed',
            })
            .where(eq(lipsyncTasks.project_uuid, projectId));

        } else if (aiStatus.status === 'processing') {
          newProgress = aiStatus.progress;

          // Update task progress
          await database.update(lipsyncTasks)
            .set({
              progress: aiStatus.progress,
            })
            .where(eq(lipsyncTasks.project_uuid, projectId));
        }

        return NextResponse.json({
          projectId,
          status: newStatus,
          progress: newProgress,
          resultUrl,
          error: aiStatus.error,
          provider: project.provider,
          createdAt: project.created_at,
          updatedAt: new Date()
        });

      } catch (aiError) {
        console.error('Failed to get AI status:', aiError);
        
        // Return local database status if AI provider fails
        return NextResponse.json({
          projectId,
          status: project.status,
          progress: task?.progress || 0,
          resultUrl: project.result_url,
          error: 'Failed to get latest status from AI provider',
          provider: project.provider,
          createdAt: project.created_at,
          updatedAt: project.updated_at
        });
      }
    }

    // Return current database status
    return NextResponse.json({
      projectId,
      status: project.status,
      progress: task?.progress || 0,
      resultUrl: project.result_url,
      error: task?.error_message,
      provider: project.provider,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    });

  } catch (error) {
    console.error('Status check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get project status',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
