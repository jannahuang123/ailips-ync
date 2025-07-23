/**
 * D-ID API Client for LipSync Video Processing (Backup Provider)
 * 
 * This client serves as a backup to HeyGen for lip sync video generation.
 * It provides similar functionality with D-ID's API.
 */

import { LipSyncParams } from './heygen-client';

export interface DIDResponse {
  id: string;
  status: string;
  result_url?: string;
  error?: {
    message: string;
    description: string;
  };
}

export interface DIDTaskStatus {
  id: string;
  status: string;
  result_url?: string;
  error?: {
    message: string;
    description: string;
  };
}

export class DIDClient {
  private apiKey: string;
  private baseUrl = 'https://api.d-id.com';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('D-ID API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Test API connection and get credits info
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/credits`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json() as any;
        console.log('D-ID API connection successful, remaining credits:', data.remaining);
        return true;
      } else {
        console.error('D-ID API connection failed, status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('D-ID API connection error:', error);
      return false;
    }
  }

  /**
   * Create a new lip sync task using D-ID's talks endpoint
   */
  async createLipSyncTask(params: LipSyncParams): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/talks`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_url: params.videoUrl,
          script: {
            type: 'audio',
            audio_url: params.audioUrl
          },
          config: {
            fluent: false,
            pad_audio: 0.0,
            result_format: 'mp4'
          },
          webhook: `${process.env.NEXT_PUBLIC_WEB_URL}/api/webhooks/did`
        })
      });

      if (response.ok) {
        const data = await response.json() as DIDResponse;
        console.log('D-ID task created successfully:', data.id);
        return data.id;
      } else {
        const errorData = await response.json();
        console.error('D-ID task creation failed:', errorData);
        throw new Error(errorData.error?.message || 'Failed to create D-ID task');
      }
    } catch (error) {
      console.error('D-ID task creation error:', error);
      throw error;
    }
  }

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<DIDTaskStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/talks/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.apiKey}`
        }
      });

      if (response.ok) {
        const data = await response.json() as DIDTaskStatus;
        return data;
      } else {
        const errorData = await response.json();
        console.error('D-ID task status failed:', errorData);
        throw new Error(errorData.error?.message || 'Failed to get task status');
      }
    } catch (error) {
      console.error('D-ID task status error:', error);
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
    return 'D-ID';
  }
}

// Export a singleton instance
let didClient: DIDClient | null = null;

export function getDIDClient(): DIDClient {
  if (!didClient) {
    const apiKey = process.env.DID_API_KEY;
    if (!apiKey) {
      throw new Error('DID_API_KEY environment variable is not set');
    }
    didClient = new DIDClient(apiKey);
  }
  return didClient;
}
