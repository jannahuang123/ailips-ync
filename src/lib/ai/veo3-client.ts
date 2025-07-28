/**
 * Veo3 API Client for LipSync Video Processing via APICore.ai
 * 
 * This client handles all interactions with the Veo3 model through APICore.ai
 * for advanced image-to-video lip sync generation.
 */

export interface Veo3LipSyncParams {
  imageUrl: string;
  audioUrl?: string; // Optional - for uploaded audio files
  audioPrompt?: string; // Optional - for text-to-speech generation
  quality?: 'standard' | 'hd' | '4k';
  aspectRatio?: '16:9' | '9:16' | '1:1';
  duration?: 'auto' | number; // seconds
}

export interface Veo3Response {
  code: number;
  data?: {
    job_id: string;
    status: string;
    progress?: number;
    result_url?: string;
    estimated_time?: string;
  };
  message?: string;
}

export interface Veo3TaskStatus {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  result_url?: string;
  error?: string;
  estimated_time?: string;
}

export class Veo3Client {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = process.env.APICORE_BASE_URL || 'https://api.apicore.ai';
    this.model = process.env.APICORE_VEO3_MODEL || 'veo3-fast-frames';
  }

  /**
   * Test API connection and get account info
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/account/info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json() as any;
      
      if (response.ok && data.success) {
        console.log('Veo3 API connection successful');
        return true;
      } else {
        console.error('Veo3 API connection failed:', data);
        return false;
      }
    } catch (error) {
      console.error('Veo3 API connection error:', error);
      return false;
    }
  }

  /**
   * Create a new lip sync task using Veo3 model
   */
  async createLipSyncTask(params: Veo3LipSyncParams): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/video/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          mode: 'image_to_video_with_audio',
          inputs: {
            image_url: params.imageUrl,
            audio_url: params.audioUrl,
            audio_prompt: params.audioPrompt, // Text for TTS generation
            duration: params.duration || 'auto',
            quality: params.quality || 'hd',
            aspect_ratio: params.aspectRatio || '16:9',
            fps: 30
          },
          options: {
            lip_sync: true,
            face_enhancement: true,
            audio_sync_precision: 'high',
            background_stability: true,
            generate_audio: !!params.audioPrompt // Enable audio generation if text provided
          },
          webhook_url: `${process.env.NEXT_PUBLIC_WEB_URL}/api/webhooks/veo3`
        })
      });

      const data = await response.json() as Veo3Response;
      
      if (response.ok && data.data?.job_id) {
        console.log(`Veo3 task created successfully: ${data.data.job_id}`);
        return data.data.job_id;
      } else {
        console.error('Veo3 task creation failed:', data);
        throw new Error(data.message || 'Failed to create Veo3 task');
      }
    } catch (error) {
      console.error('Veo3 task creation error:', error);
      throw error;
    }
  }

  /**
   * Get task status
   */
  async getTaskStatus(jobId: string): Promise<Veo3TaskStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/jobs/status/${jobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      const data = await response.json() as Veo3Response;
      
      if (response.ok && data.data) {
        return {
          job_id: data.data.job_id,
          status: data.data.status as any,
          progress: data.data.progress || 0,
          result_url: data.data.result_url,
          estimated_time: data.data.estimated_time
        };
      } else {
        console.error('Veo3 task status failed:', data);
        throw new Error(data.message || 'Failed to get task status');
      }
    } catch (error) {
      console.error('Veo3 task status error:', error);
      throw error;
    }
  }

  /**
   * Check if the service is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      return await this.testConnection();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get service name for logging
   */
  get name(): string {
    return 'Veo3';
  }

  /**
   * Get estimated processing time based on quality
   */
  getEstimatedTime(quality: string): string {
    switch (quality) {
      case 'standard':
        return '2-3 minutes';
      case 'hd':
        return '3-5 minutes';
      case '4k':
        return '5-8 minutes';
      default:
        return '3-5 minutes';
    }
  }

  /**
   * Calculate credits needed for Veo3 processing
   */
  calculateCredits(quality: string, duration: number = 10): number {
    const baseCredits = {
      'standard': 6,  // 40% less than traditional
      'hd': 8,        // 20% less than traditional  
      '4k': 12        // 20% less than traditional
    };

    const qualityCredits = baseCredits[quality as keyof typeof baseCredits] || baseCredits.hd;
    
    // Additional credits for longer videos (per 10 seconds)
    const durationMultiplier = Math.ceil(duration / 10);
    
    return qualityCredits * durationMultiplier;
  }
}

// Export a singleton instance
let veo3Client: Veo3Client | null = null;

export function getVeo3Client(): Veo3Client {
  if (!veo3Client) {
    const apiKey = process.env.APICORE_API_KEY;
    if (!apiKey) {
      throw new Error('APICORE_API_KEY environment variable is not set');
    }
    veo3Client = new Veo3Client(apiKey);
  }
  return veo3Client;
}

// Export interface for compatibility with existing provider manager
export interface LipSyncParams {
  videoUrl?: string;  // For backward compatibility
  imageUrl?: string;  // Veo3 uses image instead of video
  audioUrl?: string;  // Optional - for uploaded audio files
  audioPrompt?: string; // Optional - for text-to-speech generation
  quality?: 'low' | 'medium' | 'high' | 'ultra';
}

// Adapter function to convert old interface to new
export function adaptLipSyncParams(params: LipSyncParams): Veo3LipSyncParams {
  return {
    imageUrl: params.imageUrl || params.videoUrl || '',
    audioUrl: params.audioUrl,
    audioPrompt: params.audioPrompt, // Pass through text for TTS
    quality: mapQualityToVeo3(params.quality || 'medium'),
    aspectRatio: '16:9',
    duration: 'auto'
  };
}

function mapQualityToVeo3(quality: string): 'standard' | 'hd' | '4k' {
  switch (quality) {
    case 'low':
      return 'standard';
    case 'medium':
      return 'hd';
    case 'high':
    case 'ultra':
      return '4k';
    default:
      return 'hd';
  }
}
