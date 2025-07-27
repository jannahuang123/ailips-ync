import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { projects, credits } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { CreditsAmount, deductUserCredits } from '@/services/credit';

interface Veo3GenerationRequest {
  inputType: 'text' | 'image' | 'video';
  inputData: {
    textPrompt: string;
    imageFile?: string; // base64 or URL
    videoFile?: string; // base64 or URL
  };
  audioSettings: {
    generateAudio: boolean;
    audioPrompt?: string;
    voiceStyle?: 'natural' | 'professional' | 'casual' | 'dramatic';
    backgroundMusic?: boolean;
    soundEffects?: boolean;
  };
  settings: {
    quality: 'standard' | 'premium' | 'ultra';
    duration: number;
    aspectRatio: '16:9' | '9:16' | '1:1';
    style: 'realistic' | 'cinematic' | 'animated' | 'documentary';
    cameraMovement: 'static' | 'slow_pan' | 'zoom' | 'dynamic';
    lighting: 'natural' | 'studio' | 'dramatic' | 'soft';
  };
  estimatedCredits: number;
}

interface Veo3ApiRequest {
  model: 'veo-3' | 'veo-3-fast';
  prompt: string;
  image?: string;
  video?: string;
  audio_prompt?: string;
  duration_seconds: number;
  aspect_ratio: string;
  quality: 'standard' | 'high' | 'ultra';
  style?: string;
  camera_movement?: string;
  lighting?: string;
  generate_audio: boolean;
  voice_style?: string;
  background_music?: boolean;
  sound_effects?: boolean;
}

// Credit cost mapping based on quality and features
const calculateVeo3Credits = (config: Veo3GenerationRequest): number => {
  let baseCredits = 10; // Standard cost

  // Quality multiplier
  switch (config.settings.quality) {
    case 'premium':
      baseCredits = 15;
      break;
    case 'ultra':
      baseCredits = 20;
      break;
  }

  // Duration multiplier (base is 10 seconds)
  const durationMultiplier = config.settings.duration / 10;
  baseCredits = Math.ceil(baseCredits * durationMultiplier);

  // Audio features
  if (config.audioSettings.generateAudio) {
    baseCredits += 2;
  }
  if (config.audioSettings.backgroundMusic) {
    baseCredits += 1;
  }
  if (config.audioSettings.soundEffects) {
    baseCredits += 1;
  }

  // Advanced features
  if (config.settings.style === 'cinematic') {
    baseCredits += 3;
  }
  if (config.settings.cameraMovement === 'dynamic') {
    baseCredits += 2;
  }

  return baseCredits;
};

// Call Google Gemini API with Veo3
async function callVeo3API(request: Veo3ApiRequest): Promise<{
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  audioUrl?: string;
  estimatedTime?: number;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  const projectId = process.env.VEO3_PROJECT_ID;

  if (!apiKey || !projectId) {
    throw new Error('Veo3 API credentials not configured');
  }

  // Construct the API endpoint
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`;

  const requestBody = {
    contents: [{
      parts: [{
        text: `Generate a video with the following specifications:
        
        Prompt: ${request.prompt}
        ${request.audio_prompt ? `Audio: ${request.audio_prompt}` : ''}
        Duration: ${request.duration_seconds} seconds
        Aspect Ratio: ${request.aspect_ratio}
        Style: ${request.style || 'realistic'}
        Camera Movement: ${request.camera_movement || 'static'}
        Lighting: ${request.lighting || 'natural'}
        Quality: ${request.quality}
        
        ${request.generate_audio ? 'Include high-quality audio generation.' : 'Generate video only.'}
        ${request.voice_style ? `Voice style: ${request.voice_style}` : ''}
        ${request.background_music ? 'Add appropriate background music.' : ''}
        ${request.sound_effects ? 'Include relevant sound effects.' : ''}
        `
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH", 
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };

  // Add image or video input if provided
  if (request.image) {
    requestBody.contents[0].parts.push({
      inline_data: {
        mime_type: "image/jpeg",
        data: request.image
      }
    });
  }

  if (request.video) {
    requestBody.contents[0].parts.push({
      inline_data: {
        mime_type: "video/mp4", 
        data: request.video
      }
    });
  }

  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Veo3 API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  
  // For now, return a mock response since Veo3 API is still in preview
  // In production, this would return actual task ID and polling endpoints
  const taskId = uuidv4();
  
  return {
    taskId,
    status: 'processing',
    estimatedTime: request.duration_seconds * 2 // Rough estimate: 2x duration for processing
  };
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

    const body: Veo3GenerationRequest = await request.json();

    // Validation
    if (!body.inputData.textPrompt || body.inputData.textPrompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text prompt is required' },
        { status: 400 }
      );
    }

    if (body.inputData.textPrompt.length > 2000) {
      return NextResponse.json(
        { error: 'Text prompt must be less than 2000 characters' },
        { status: 400 }
      );
    }

    if (body.settings.duration < 5 || body.settings.duration > 60) {
      return NextResponse.json(
        { error: 'Duration must be between 5 and 60 seconds' },
        { status: 400 }
      );
    }

    // Calculate actual credits needed
    const creditsNeeded = calculateVeo3Credits(body);

    // Check user credits
    const userCredits = await getUserCredits(session.user.uuid);
    if (userCredits.left_credits < creditsNeeded) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          required: creditsNeeded,
          available: userCredits.left_credits
        },
        { status: 402 }
      );
    }

    // Create project record
    const projectUuid = uuidv4();
    const database = db();

    await database.insert(projects).values({
      uuid: projectUuid,
      user_uuid: session.user.uuid,
      name: `Veo3 Video - ${new Date().toISOString().split('T')[0]}`,
      status: 'pending',
      provider: 'veo3',
      quality: body.settings.quality,
      created_at: new Date(),
      updated_at: new Date(),
      settings: JSON.stringify({
        inputType: body.inputType,
        textPrompt: body.inputData.textPrompt,
        audioSettings: body.audioSettings,
        videoSettings: body.settings
      })
    });

    // Prepare Veo3 API request
    const veo3Request: Veo3ApiRequest = {
      model: body.settings.quality === 'ultra' ? 'veo-3' : 'veo-3-fast',
      prompt: body.inputData.textPrompt,
      image: body.inputData.imageFile,
      video: body.inputData.videoFile,
      audio_prompt: body.audioSettings.audioPrompt,
      duration_seconds: body.settings.duration,
      aspect_ratio: body.settings.aspectRatio,
      quality: body.settings.quality,
      style: body.settings.style,
      camera_movement: body.settings.cameraMovement,
      lighting: body.settings.lighting,
      generate_audio: body.audioSettings.generateAudio,
      voice_style: body.audioSettings.voiceStyle,
      background_music: body.audioSettings.backgroundMusic,
      sound_effects: body.audioSettings.soundEffects
    };

    // Call Veo3 API
    const veo3Response = await callVeo3API(veo3Request);

    // Update project with task ID
    await database
      .update(projects)
      .set({
        external_task_id: veo3Response.taskId,
        status: 'processing',
        updated_at: new Date()
      })
      .where(eq(projects.uuid, projectUuid));

    // Deduct credits
    await deductUserCredits(
      session.user.uuid,
      creditsNeeded,
      CreditsAmount.Veo3StandardCost,
      `Veo3 video generation - ${projectUuid}`
    );

    return NextResponse.json({
      success: true,
      projectId: projectUuid,
      taskId: veo3Response.taskId,
      status: veo3Response.status,
      estimatedTime: veo3Response.estimatedTime,
      creditsUsed: creditsNeeded,
      remainingCredits: userCredits.left_credits - creditsNeeded
    });

  } catch (error) {
    console.error('Veo3 generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to get user credits (imported from credit service)
async function getUserCredits(userUuid: string) {
  // This would use the existing credit service
  const { getUserCredits } = await import('@/services/credit');
  return await getUserCredits(userUuid);
}
