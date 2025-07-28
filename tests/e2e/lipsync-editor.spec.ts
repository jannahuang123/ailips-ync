import { test, expect } from '@playwright/test';
import { 
  waitForElement, 
  clickElement, 
  uploadFile, 
  waitForToast,
  takeScreenshot,
  waitForApiResponse,
  mockApiResponse
} from '../utils/test-helpers';

test.describe('LipSync Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test editor page
    await page.goto('/test-editor');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load the LipSync editor interface', async ({ page }) => {
    // Check if the main editor components are visible
    await expect(page.locator('[data-testid="lipsync-editor"]')).toBeVisible();
    
    // Check for tab navigation
    await expect(page.locator('text=Photo')).toBeVisible();
    await expect(page.locator('text=Video')).toBeVisible();
    
    // Check for upload area
    await expect(page.locator('[data-testid="upload-area"]')).toBeVisible();
    
    // Take screenshot for visual verification
    await takeScreenshot(page, 'lipsync-editor-loaded');
  });

  test('should handle photo upload', async ({ page }) => {
    // Mock successful upload response
    await mockApiResponse(page, '**/api/upload/image', {
      success: true,
      url: 'https://example.com/test-image.jpg'
    });

    // Ensure we're on the photo tab
    await clickElement(page, 'text=Photo');
    
    // Create a test image file (you'll need to have this in your test fixtures)
    const testImagePath = 'tests/fixtures/test-image.jpg';
    
    // Upload the file
    await uploadFile(page, 'input[type="file"]', testImagePath);
    
    // Wait for upload to complete
    await waitForApiResponse(page, '/api/upload/image');
    
    // Check for success feedback
    await waitForToast(page, 'Upload successful');
    
    // Take screenshot
    await takeScreenshot(page, 'photo-upload-success');
  });

  test('should handle video upload', async ({ page }) => {
    // Mock successful upload response
    await mockApiResponse(page, '**/api/upload/video', {
      success: true,
      url: 'https://example.com/test-video.mp4'
    });

    // Switch to video tab
    await clickElement(page, 'text=Video');
    
    // Create a test video file
    const testVideoPath = 'tests/fixtures/test-video.mp4';
    
    // Upload the file
    await uploadFile(page, 'input[type="file"]', testVideoPath);
    
    // Wait for upload to complete
    await waitForApiResponse(page, '/api/upload/video');
    
    // Check for success feedback
    await waitForToast(page, 'Upload successful');
    
    // Take screenshot
    await takeScreenshot(page, 'video-upload-success');
  });

  test('should handle upload errors gracefully', async ({ page }) => {
    // Mock failed upload response
    await page.route('**/api/upload/image', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Upload failed' })
      });
    });

    // Try to upload a file
    const testImagePath = 'tests/fixtures/test-image.jpg';
    await uploadFile(page, 'input[type="file"]', testImagePath);
    
    // Wait for error response
    await waitForApiResponse(page, '/api/upload/image');
    
    // Check for error feedback
    await waitForToast(page, 'Upload failed');
    
    // Take screenshot
    await takeScreenshot(page, 'upload-error');
  });

  test('should require authentication for uploads', async ({ page }) => {
    // Mock unauthenticated response
    await page.route('**/api/upload/image', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' })
      });
    });

    // Try to upload without authentication
    const testImagePath = 'tests/fixtures/test-image.jpg';
    await uploadFile(page, 'input[type="file"]', testImagePath);
    
    // Wait for unauthorized response
    await waitForApiResponse(page, '/api/upload/image');
    
    // Check for authentication error
    await waitForToast(page, 'Please sign in to upload files');
    
    // Take screenshot
    await takeScreenshot(page, 'auth-required');
  });

  test('should validate file types', async ({ page }) => {
    // Try to upload an invalid file type
    const invalidFilePath = 'tests/fixtures/test-document.txt';
    
    // Upload the invalid file
    await uploadFile(page, 'input[type="file"]', invalidFilePath);
    
    // Check for validation error
    await waitForToast(page, 'Invalid file type');
    
    // Take screenshot
    await takeScreenshot(page, 'file-type-validation');
  });

  test('should show loading state during upload', async ({ page }) => {
    // Mock slow upload response
    await page.route('**/api/upload/image', async route => {
      // Delay the response to simulate slow upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, url: 'https://example.com/test.jpg' })
      });
    });

    // Upload a file
    const testImagePath = 'tests/fixtures/test-image.jpg';
    await uploadFile(page, 'input[type="file"]', testImagePath);
    
    // Check for loading state
    await expect(page.locator('[data-testid="upload-loading"]')).toBeVisible();
    
    // Take screenshot of loading state
    await takeScreenshot(page, 'upload-loading');
    
    // Wait for upload to complete
    await waitForApiResponse(page, '/api/upload/image');
    
    // Check that loading state is gone
    await expect(page.locator('[data-testid="upload-loading"]')).toBeHidden();
  });

  test('should handle generation process', async ({ page }) => {
    // Mock successful upload
    await mockApiResponse(page, '**/api/upload/image', {
      success: true,
      url: 'https://example.com/test-image.jpg'
    });

    // Mock successful generation
    await mockApiResponse(page, '**/api/lipsync/generate', {
      success: true,
      videoUrl: 'https://example.com/generated-video.mp4'
    });

    // Upload an image first
    const testImagePath = 'tests/fixtures/test-image.jpg';
    await uploadFile(page, 'input[type="file"]', testImagePath);
    await waitForApiResponse(page, '/api/upload/image');

    // Click generate button
    await clickElement(page, '[data-testid="generate-button"]');
    
    // Wait for generation to complete
    await waitForApiResponse(page, '/api/lipsync/generate');
    
    // Check for success message
    await waitForToast(page, 'Video generated successfully');
    
    // Check if generated video is displayed
    await expect(page.locator('[data-testid="generated-video"]')).toBeVisible();
    
    // Take screenshot
    await takeScreenshot(page, 'generation-success');
  });
});
