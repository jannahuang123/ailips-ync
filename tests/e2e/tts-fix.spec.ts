import { test, expect } from '@playwright/test';

test.describe('TTS Fix Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should not call TTS API when using text input mode', async ({ page }) => {
    // Mock the API responses to track calls
    const ttsApiCalls: any[] = [];
    const lipSyncApiCalls: any[] = [];

    // Intercept TTS API calls (should not be called)
    await page.route('/api/tts/generate', async (route) => {
      ttsApiCalls.push(await route.request().postDataJSON());
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'TTS API should not be called' })
      });
    });

    // Intercept LipSync API calls (should receive audioPrompt)
    await page.route('/api/lipsync/create', async (route) => {
      const requestData = await route.request().postDataJSON();
      lipSyncApiCalls.push(requestData);
      
      // Verify that audioPrompt is passed instead of audioUrl for text mode
      expect(requestData).toHaveProperty('audioPrompt');
      expect(requestData.audioPrompt).toBeTruthy();
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          projectId: 'test-project-id',
          taskId: 'test-task-id'
        })
      });
    });

    // Mock file upload
    await page.route('/api/upload/image', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          url: 'https://example.com/test-image.jpg'
        })
      });
    });

    // Navigate to the main page where LipSync editor is embedded
    await page.goto('/');

    // Scroll to the demo section
    await page.locator('#demo').scrollIntoViewIfNeeded();

    // Wait for the LipSync editor wrapper to load
    await page.waitForSelector('.lipsync-editor, [class*="lipsync"], [class*="LipSync"]', { timeout: 10000 });

    // Select text input mode
    const textModeButton = page.locator('button:has-text("Text Input")');
    if (await textModeButton.isVisible()) {
      await textModeButton.click();
    }

    // Fill in text content
    const textArea = page.locator('textarea[placeholder*="text"], textarea[placeholder*="script"]').first();
    if (await textArea.isVisible()) {
      await textArea.fill('Hello, this is a test message for lip sync generation.');
    }

    // Upload an image file (create a mock file)
    const fileInput = page.locator('input[type="file"][accept*="image"]');
    if (await fileInput.isVisible()) {
      // Create a simple test image file
      const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
      await fileInput.setInputFiles({
        name: 'test-image.png',
        mimeType: 'image/png',
        buffer: buffer,
      });
    }

    // Click generate button
    const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create")');
    if (await generateButton.isVisible()) {
      await generateButton.click();
    }

    // Wait for API calls to complete
    await page.waitForTimeout(2000);

    // Verify that TTS API was NOT called
    expect(ttsApiCalls).toHaveLength(0);

    // Verify that LipSync API was called with audioPrompt
    expect(lipSyncApiCalls).toHaveLength(1);
    expect(lipSyncApiCalls[0]).toHaveProperty('audioPrompt');
    expect(lipSyncApiCalls[0].audioPrompt).toBe('Hello, this is a test message for lip sync generation.');
  });

  test('should handle audio upload mode correctly', async ({ page }) => {
    const lipSyncApiCalls: any[] = [];

    // Intercept LipSync API calls
    await page.route('/api/lipsync/create', async (route) => {
      const requestData = await route.request().postDataJSON();
      lipSyncApiCalls.push(requestData);
      
      // For audio upload mode, should have audioUrl but not audioPrompt
      expect(requestData).toHaveProperty('audioUrl');
      expect(requestData.audioUrl).toBeTruthy();
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          projectId: 'test-project-id',
          taskId: 'test-task-id'
        })
      });
    });

    // Mock audio upload
    await page.route('/api/upload/audio', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          url: 'https://example.com/test-audio.mp3'
        })
      });
    });

    // Mock image upload
    await page.route('/api/upload/image', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          url: 'https://example.com/test-image.jpg'
        })
      });
    });

    // Navigate to the main page where LipSync editor is embedded
    await page.goto('/');

    // Scroll to the demo section
    await page.locator('#demo').scrollIntoViewIfNeeded();

    // Wait for the LipSync editor wrapper to load
    await page.waitForSelector('.lipsync-editor, [class*="lipsync"], [class*="LipSync"]', { timeout: 10000 });

    // Select audio upload mode
    const audioModeButton = page.locator('button:has-text("Upload Audio")');
    if (await audioModeButton.isVisible()) {
      await audioModeButton.click();
    }

    // Upload audio file
    const audioInput = page.locator('input[type="file"][accept*="audio"]');
    if (await audioInput.isVisible()) {
      const buffer = Buffer.from('fake-audio-data');
      await audioInput.setInputFiles({
        name: 'test-audio.mp3',
        mimeType: 'audio/mpeg',
        buffer: buffer,
      });
    }

    // Upload image file
    const imageInput = page.locator('input[type="file"][accept*="image"]');
    if (await imageInput.isVisible()) {
      const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
      await imageInput.setInputFiles({
        name: 'test-image.png',
        mimeType: 'image/png',
        buffer: buffer,
      });
    }

    // Click generate button
    const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create")');
    if (await generateButton.isVisible()) {
      await generateButton.click();
    }

    // Wait for API calls
    await page.waitForTimeout(2000);

    // Verify LipSync API was called with audioUrl
    expect(lipSyncApiCalls).toHaveLength(1);
    expect(lipSyncApiCalls[0]).toHaveProperty('audioUrl');
    expect(lipSyncApiCalls[0].audioUrl).toBe('https://example.com/test-audio.mp3');
  });
});
