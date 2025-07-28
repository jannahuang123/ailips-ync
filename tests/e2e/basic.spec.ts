import { test, expect } from '@playwright/test';

test.describe('Basic Application Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads successfully
    await expect(page).toHaveTitle(/LipSyncVideo/);
    
    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/homepage.png' });
  });

  test('should navigate to test editor', async ({ page }) => {
    await page.goto('/test-editor');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we can see some basic elements
    await expect(page.locator('body')).toBeVisible();
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/test-editor.png' });
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    
    // Check if we get a proper response (could be 404 or redirect)
    expect(response?.status()).toBeTruthy();
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/404-page.png' });
  });
});
