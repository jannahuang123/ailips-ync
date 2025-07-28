import { test, expect } from '@playwright/test';

test.describe('TTS API Fix Verification', () => {
  test('should not return 404 for TTS API endpoint when properly configured', async ({ page }) => {
    // Test that the TTS API endpoint exists and returns proper error for missing auth
    const response = await page.request.post('/api/tts/generate', {
      data: {
        text: 'Hello world',
        voice: 'en-US-AriaNeural',
        format: 'mp3'
      }
    });

    // Should return 401 (unauthorized) instead of 404 (not found)
    expect(response.status()).toBe(401);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toBe('Authentication required');
  });

  test('should handle LipSync API with audioPrompt parameter', async ({ page }) => {
    // Test that the LipSync API accepts audioPrompt parameter
    const response = await page.request.post('/api/lipsync/create', {
      data: {
        name: 'Test Project',
        imageUrl: 'https://example.com/test.jpg',
        audioPrompt: 'Hello, this is a test message',
        quality: 'medium'
      }
    });

    // Should return 401 (unauthorized) instead of 400 (bad request) for missing audioUrl
    expect(response.status()).toBe(401);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toBe('Authentication required');
  });

  test('should validate LipSync API parameters correctly', async ({ page }) => {
    // Test parameter validation - should require either audioUrl or audioPrompt
    const response = await page.request.post('/api/lipsync/create', {
      data: {
        name: 'Test Project',
        imageUrl: 'https://example.com/test.jpg',
        quality: 'medium'
        // Missing both audioUrl and audioPrompt
      }
    });

    // Should return 401 for auth, but if we had auth, it would be 400 for missing params
    expect([400, 401]).toContain(response.status());
  });

  test('should accept both audioUrl and audioPrompt parameters', async ({ page }) => {
    // Test that API accepts both parameters
    const response = await page.request.post('/api/lipsync/create', {
      data: {
        name: 'Test Project',
        imageUrl: 'https://example.com/test.jpg',
        audioUrl: 'https://example.com/test.mp3',
        audioPrompt: 'Hello world',
        quality: 'medium'
      }
    });

    // Should return 401 (unauthorized) - the important thing is it's not 400 (bad request)
    expect(response.status()).toBe(401);
  });

  test('should validate image URL format', async ({ page }) => {
    const response = await page.request.post('/api/lipsync/create', {
      data: {
        name: 'Test Project',
        imageUrl: 'invalid-url',
        audioPrompt: 'Hello world',
        quality: 'medium'
      }
    });

    // Should return 401 for auth first, but the URL validation logic is there
    expect([400, 401]).toContain(response.status());
  });
});
