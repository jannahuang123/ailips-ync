/**
 * LipSync AI SDK Types
 * 
 * Type definitions for LipSync AI functionality following ShipAny's AI SDK patterns.
 */

export type LipSyncModelId = 'heygen-lipsync' | 'did-lipsync';

export interface LipSyncModelSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  videoUrl: string;
  audioUrl: string;
  webhookUrl?: string;
}

export interface LipSyncResult {
  taskId: string;
  provider: 'heygen' | 'did';
  status: LipSyncStatus;
  progress: number;
  resultUrl?: string;
  error?: string;
  estimatedTime?: string;
  creditsUsed?: number;
}

export interface LipSyncTask {
  id: string;
  projectId: string;
  userId: string;
  provider: 'heygen' | 'did';
  status: LipSyncStatus;
  progress: number;
  videoUrl: string;
  audioUrl: string;
  resultUrl?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type LipSyncStatus = 
  | 'pending'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface LipSyncProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface LipSyncWebhookPayload {
  taskId: string;
  status: LipSyncStatus;
  progress: number;
  resultUrl?: string;
  error?: string;
  metadata?: Record<string, any>;
}
