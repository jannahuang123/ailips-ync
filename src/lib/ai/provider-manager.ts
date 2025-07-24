/**
 * AI Provider Manager for LipSync Video Processing
 * 
 * This manager handles multiple AI providers with automatic failover.
 * It tries HeyGen first, then falls back to D-ID if needed.
 */

import { getHeyGenClient, HeyGenClient, LipSyncParams } from './heygen-client';
import { getDIDClient, DIDClient } from './did-client';

export interface ProcessResult {
  taskId: string;
  provider: 'heygen' | 'did';
  estimatedTime: string;
}

export interface TaskStatus {
  taskId: string;
  provider: 'heygen' | 'did';
  status: string;
  progress: number;
  resultUrl?: string;
  error?: string;
}

export class AIProviderManager {
  private heygenClient?: HeyGenClient;
  private didClient?: DIDClient;

  constructor() {
    try {
      this.heygenClient = getHeyGenClient();
    } catch (error) {
      console.warn('HeyGen client initialization failed:', error);
    }

    try {
      this.didClient = getDIDClient();
    } catch (error) {
      console.warn('D-ID client initialization failed:', error);
    }

    if (!this.heygenClient && !this.didClient) {
      throw new Error('No AI providers are available. Please check your API keys.');
    }
  }

  /**
   * Process lip sync with automatic failover
   */
  async processLipSync(params: LipSyncParams): Promise<ProcessResult> {
    const providers = this.getAvailableProviders();
    
    for (const provider of providers) {
      try {
        console.log(`Attempting to process with ${provider.name}...`);
        
        // Check if provider is healthy
        if (!(await provider.client.isHealthy())) {
          console.warn(`${provider.name} is not healthy, trying next provider...`);
          continue;
        }

        // Create task
        const taskId = await provider.client.createLipSyncTask(params);
        
        if (taskId) {
          console.log(`Successfully created task with ${provider.name}: ${taskId}`);
          return {
            taskId,
            provider: provider.type,
            estimatedTime: this.getEstimatedTime(provider.type)
          };
        }
      } catch (error) {
        console.error(`${provider.name} failed:`, error);
        
        // If this is the last provider, throw the error
        if (provider === providers[providers.length - 1]) {
          throw new Error(`All providers failed. Last error: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        console.log(`Trying next provider...`);
        continue;
      }
    }

    throw new Error('All AI providers failed to process the request');
  }

  /**
   * Get task status from the appropriate provider
   */
  async getTaskStatus(taskId: string, provider: 'heygen' | 'did'): Promise<TaskStatus> {
    try {
      let client: HeyGenClient | DIDClient | undefined;

      if (provider === 'heygen') {
        client = this.heygenClient;
      } else {
        client = this.didClient;
      }

      if (!client) {
        throw new Error(`${provider} client is not available`);
      }

      if (provider === 'heygen') {
        const status = await (client as HeyGenClient).getTaskStatus(taskId);
        return {
          taskId,
          provider,
          status: status?.status || 'unknown',
          progress: status?.progress || 0,
          resultUrl: status?.result_url,
          error: status?.error
        };
      } else {
        const status = await (client as DIDClient).getTaskStatus(taskId);
        return {
          taskId,
          provider,
          status: status?.status || 'unknown',
          progress: this.mapDIDStatusToProgress(status?.status || 'unknown'),
          resultUrl: status?.result_url,
          error: status?.error?.message
        };
      }
    } catch (error) {
      console.error(`Failed to get task status from ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Get list of available providers in priority order
   */
  private getAvailableProviders() {
    const providers = [];

    // HeyGen is the primary provider
    if (this.heygenClient) {
      providers.push({
        client: this.heygenClient,
        type: 'heygen' as const,
        name: 'HeyGen'
      });
    }

    // D-ID is the backup provider
    if (this.didClient) {
      providers.push({
        client: this.didClient,
        type: 'did' as const,
        name: 'D-ID'
      });
    }

    return providers;
  }

  /**
   * Get estimated processing time based on provider
   */
  private getEstimatedTime(provider: 'heygen' | 'did'): string {
    switch (provider) {
      case 'heygen':
        return '2-5 minutes';
      case 'did':
        return '3-7 minutes';
      default:
        return '2-10 minutes';
    }
  }

  /**
   * Map D-ID status to progress percentage
   */
  private mapDIDStatusToProgress(status: string): number {
    switch (status.toLowerCase()) {
      case 'created':
      case 'submitted':
        return 10;
      case 'processing':
        return 50;
      case 'done':
      case 'completed':
        return 100;
      case 'error':
      case 'failed':
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Get health status of all providers
   */
  async getProvidersHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    if (this.heygenClient) {
      try {
        health.heygen = await this.heygenClient.isHealthy();
      } catch (error) {
        health.heygen = false;
      }
    }

    if (this.didClient) {
      try {
        health.did = await this.didClient.isHealthy();
      } catch (error) {
        health.did = false;
      }
    }

    return health;
  }
}

// Export a singleton instance
let aiProviderManager: AIProviderManager | null = null;

export function getAIProviderManager(): AIProviderManager {
  if (!aiProviderManager) {
    aiProviderManager = new AIProviderManager();
  }
  return aiProviderManager;
}
