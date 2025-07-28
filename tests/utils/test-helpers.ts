import { Page, expect } from '@playwright/test';

/**
 * Test helper utilities for Playwright tests
 */

/**
 * Wait for an element to be visible and ready for interaction
 */
export async function waitForElement(page: Page, selector: string, timeout = 10000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
  return page.locator(selector);
}

/**
 * Fill form field with proper waiting
 */
export async function fillField(page: Page, selector: string, value: string) {
  const element = await waitForElement(page, selector);
  await element.fill(value);
  return element;
}

/**
 * Click element with proper waiting
 */
export async function clickElement(page: Page, selector: string) {
  const element = await waitForElement(page, selector);
  await element.click();
  return element;
}

/**
 * Upload file to input element
 */
export async function uploadFile(page: Page, selector: string, filePath: string) {
  const fileInput = page.locator(selector);
  await fileInput.setInputFiles(filePath);
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page, url?: string) {
  if (url) {
    await page.waitForURL(url);
  } else {
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse(response => {
    const url = response.url();
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern);
    }
    return urlPattern.test(url);
  });
}

/**
 * Mock API response
 */
export async function mockApiResponse(page: Page, url: string | RegExp, response: any) {
  await page.route(url, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });
}

/**
 * Check if element contains text
 */
export async function expectElementToContainText(page: Page, selector: string, text: string) {
  const element = page.locator(selector);
  await expect(element).toContainText(text);
}

/**
 * Check if element is visible
 */
export async function expectElementToBeVisible(page: Page, selector: string) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
}

/**
 * Check if element is hidden
 */
export async function expectElementToBeHidden(page: Page, selector: string) {
  const element = page.locator(selector);
  await expect(element).toBeHidden();
}

/**
 * Wait for toast notification
 */
export async function waitForToast(page: Page, message?: string) {
  const toastSelector = '[data-testid="toast"], .toast, [role="alert"]';
  const toast = await waitForElement(page, toastSelector);
  
  if (message) {
    await expect(toast).toContainText(message);
  }
  
  return toast;
}

/**
 * Login helper for authenticated tests
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/auth/signin');
  await fillField(page, 'input[name="email"]', email);
  await fillField(page, 'input[name="password"]', password);
  await clickElement(page, 'button[type="submit"]');
  await waitForNavigation(page);
}

/**
 * Logout helper
 */
export async function logout(page: Page) {
  await clickElement(page, '[data-testid="user-menu"]');
  await clickElement(page, '[data-testid="logout-button"]');
  await waitForNavigation(page, '/');
}
