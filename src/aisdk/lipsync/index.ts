/**
 * LipSync AI SDK Integration
 * 
 * This module integrates LipSync AI providers (HeyGen, D-ID) into ShipAny's AI SDK architecture.
 * Following ShipAny's AI SDK patterns for consistency and maintainability.
 */

export { LipSyncProvider } from './lipsync-provider';
export { HeyGenModel } from './heygen-model';
export { DIDModel } from './did-model';
export { LipSyncSettings } from './lipsync-settings';
export { LipSyncError } from './lipsync-error';

export type {
  LipSyncModelId,
  LipSyncModelSettings,
  LipSyncResult,
  LipSyncTask,
  LipSyncStatus
} from './types';

// Re-export for convenience
export { getAIProviderManager } from '@/lib/ai/provider-manager';
export { getHeyGenClient } from '@/lib/ai/heygen-client';
export { getDIDClient } from '@/lib/ai/did-client';
