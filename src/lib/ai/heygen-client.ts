/**
 * HeyGen API Client for LipSync Video Processing
 * 
 * This client handles all interactions with the HeyGen API for lip sync video generation.
 * It provides methods for creating tasks, checking status, and handling responses.
 */

export interface LipSyncParams {
  videoUrl: string;
  audioUrl: string;
  quality?: 'low' | 'medium' | 'high';
}

export interface HeyGenResponse {
  code: number;
  data?: {
    task_id: string;
    status: string;
    progress?: number;
    result_url?: string;
  };
  message?: string;
}

export interface TaskStatusResponse {
  code: number;
  data?: {
    task_id: string;
    status: string;
    progress: number;
    result_url?: string;
    error?: string;
  };
  message?: string;
}

export class HeyGenClient {
  private apiKey: string;
  private baseUrl = 'https://api.heygen.com/v2';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('HeyGen API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Test API connection and get account info
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user/remaining_quota`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json() as any;
      
      if (response.ok && data.code === 100) {
        console.log('HeyGen API connection successful');
        return true;
      } else {
        console.error('HeyGen API connection failed:', data);
        return false;
      }
    } catch (error) {
      console.error('HeyGen API connection error:', error);
      return false;
    }
  }

  /**
   * Create a new lip sync task
   */
  async createLipSyncTask(params: LipSyncParams): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/video/translate`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          video_url: params.videoUrl,
          audio_url: params.audioUrl,
          quality: params.quality || 'medium',
          webhook_url: `${process.env.NEXT_PUBLIC_WEB_URL}/api/webhooks/heygen`
        })
      });

      const data = await response.json() as HeyGenResponse;
      
      if (response.ok && data.code === 100) {
        console.log('HeyGen task created successfully:', data.data?.task_id);
        return data.data?.task_id || null;
      } else {
        console.error('HeyGen task creation failed:', data);
        throw new Error(data.message || 'Failed to create HeyGen task');
      }
    } catch (error) {
      console.error('HeyGen task creation error:', error);
      throw error;
    }
  }

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<TaskStatusResponse['data'] | null> {
    try {
      const response = await fetch(`${this.baseUrl}/video/translate/${taskId}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey
        }
      });

      const data = await response.json() as TaskStatusResponse;
      
      if (response.ok && data.code === 100) {
        return data.data || null;
      } else {
        console.error('HeyGen task status failed:', data);
        throw new Error(data.message || 'Failed to get task status');
      }
    } catch (error) {
      console.error('HeyGen task status error:', error);
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
    return 'HeyGen';
  }
}

// Export a singleton instance
let heygenClient: HeyGenClient | null = null;

export function getHeyGenClient(): HeyGenClient {
  if (!heygenClient) {
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      throw new Error('HEYGEN_API_KEY environment variable is not set');
    }
    heygenClient = new HeyGenClient(apiKey);
  }
  return heygenClient;
}
