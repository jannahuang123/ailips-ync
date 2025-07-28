# Playwright E2E Testing Setup

## 🎯 Overview

This project now includes a complete Playwright testing setup for end-to-end testing of the LipSync video generation application.

## 📁 Directory Structure

```
tests/
├── e2e/                    # End-to-end test files
│   ├── basic.spec.ts       # Basic application tests
│   └── lipsync-editor.spec.ts  # LipSync editor specific tests
├── fixtures/               # Test data files
│   └── README.md          # Instructions for creating test files
├── utils/                  # Test utility functions
│   └── test-helpers.ts    # Common test helper functions
├── global-setup.ts        # Global test setup
├── global-teardown.ts     # Global test cleanup
└── README.md              # This file
```

## 🚀 Getting Started

### 1. Install Dependencies

Playwright is already installed. If you need to reinstall browsers:

```bash
npx playwright install
```

### 2. Create Test Fixtures

Create test files in the `tests/fixtures/` directory:

```bash
# Create a simple test image (requires ImageMagick)
convert -size 100x100 xc:red tests/fixtures/test-image.jpg

# Create a simple test video (requires FFmpeg)
ffmpeg -f lavfi -i testsrc=duration=1:size=320x240:rate=1 tests/fixtures/test-video.mp4

# Create a test text file
echo "This is a test document" > tests/fixtures/test-document.txt
```

### 3. Run Tests

```bash
# Run all tests
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Run specific test file
npx playwright test tests/e2e/basic.spec.ts

# Run tests for specific browser
npx playwright test --project=chromium
```

## 📊 Test Reports

After running tests, you can view detailed reports:

```bash
# Show HTML report
npm run test:report

# Or directly
npx playwright show-report
```

## 🔧 Configuration

The Playwright configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:3001`
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Parallel execution**: Enabled
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On retry

## 📝 Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/some-page');
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### Using Test Helpers

```typescript
import { 
  waitForElement, 
  clickElement, 
  uploadFile,
  waitForToast 
} from '../utils/test-helpers';

test('should upload file', async ({ page }) => {
  await page.goto('/test-editor');
  await uploadFile(page, 'input[type="file"]', 'tests/fixtures/test-image.jpg');
  await waitForToast(page, 'Upload successful');
});
```

## 🎯 Test Categories

### 1. Basic Tests (`basic.spec.ts`)
- Homepage loading
- Navigation
- 404 handling

### 2. LipSync Editor Tests (`lipsync-editor.spec.ts`)
- File upload functionality
- Authentication requirements
- Error handling
- Generation process

## 🐛 Debugging Tests

```bash
# Run tests in debug mode
npm run test:debug

# Run specific test in debug mode
npx playwright test tests/e2e/basic.spec.ts --debug

# Run tests with trace viewer
npx playwright test --trace on
```

## 📈 Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Wait for elements** before interacting with them
3. **Mock API responses** for consistent testing
4. **Take screenshots** on failures for debugging
5. **Use page object models** for complex pages
6. **Keep tests independent** and atomic

## 🔄 CI/CD Integration

The tests are configured to run in CI environments:

- Retries: 2 times on CI
- Workers: 1 on CI (to avoid resource conflicts)
- Headless mode: Always on CI

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure port 3001 is available
2. **Browser installation**: Run `npx playwright install` if browsers are missing
3. **Test fixtures**: Create test files in `tests/fixtures/` directory
4. **Timeout issues**: Increase timeout in `playwright.config.ts` if needed

### Debug Commands

```bash
# Check Playwright installation
npx playwright --version

# List available browsers
npx playwright install --dry-run

# Generate test code
npx playwright codegen localhost:3001
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

---

✅ **Playwright is now successfully configured and ready for testing!**
