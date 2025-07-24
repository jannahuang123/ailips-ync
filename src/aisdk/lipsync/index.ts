/**
 * LipSync AI SDK Integration
 *
 * This module integrates LipSync AI providers (HeyGen, D-ID) into ShipAny's AI SDK architecture.
 * Following ShipAny's AI SDK patterns for consistency and maintainability.
 */

// Export types only for now - implementation files will be added later
export type {
  LipSyncModelId,
  LipSyncModelSettings,
  LipSyncResult,
  LipSyncTask,
  LipSyncStatus,
  LipSyncProviderConfig,
  LipSyncWebhookPayload
} from './types';

// Re-export existing implementations
export { getAIProviderManager } from '@/lib/ai/provider-manager';
export { getHeyGenClient } from '@/lib/ai/heygen-client';
export { getDIDClient } from '@/lib/ai/did-client';
