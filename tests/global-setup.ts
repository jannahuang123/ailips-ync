import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for the development server to be ready
    console.log('⏳ Waiting for development server...');
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3001';
    
    // Try to connect to the server with retries
    let retries = 30;
    while (retries > 0) {
      try {
        await page.goto(baseURL, { timeout: 5000 });
        console.log('✅ Development server is ready');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error(`Failed to connect to development server at ${baseURL}`);
        }
        console.log(`⏳ Retrying connection... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Perform any global authentication or setup here
    console.log('🔧 Performing global setup tasks...');
    
    // Example: Create test user or setup test data
    // await setupTestData();
    
    console.log('✅ Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
