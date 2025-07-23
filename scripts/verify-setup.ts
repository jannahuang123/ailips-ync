#!/usr/bin/env tsx

/**
 * LipSyncVideo.net Setup Verification Script
 * 
 * This script verifies that all components are properly configured
 * and ready for development or production deployment.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string;
}

class SetupVerifier {
  private results: CheckResult[] = [];

  async runAllChecks(): Promise<void> {
    console.log('🔍 LipSyncVideo.net Setup Verification\n');
    console.log('=' .repeat(50));

    // Environment checks
    await this.checkEnvironmentVariables();
    await this.checkPackageJson();
    await this.checkDatabaseSchema();
    await this.checkAIClients();
    await this.checkAPIEndpoints();
    await this.checkHomepageCustomization();

    // Print results
    this.printResults();
  }

  private async checkEnvironmentVariables(): Promise<void> {
    console.log('\n📋 Checking Environment Variables...');

    const requiredEnvVars = [
      'NEXT_PUBLIC_WEB_URL',
      'NEXT_PUBLIC_PROJECT_NAME',
      'DATABASE_URL',
      'AUTH_SECRET',
      'HEYGEN_API_KEY',
      'STORAGE_BUCKET',
      'STORAGE_ACCESS_KEY',
      'STORAGE_SECRET_KEY'
    ];

    const optionalEnvVars = [
      'DID_API_KEY',
      'REDIS_HOST',
      'STRIPE_PUBLIC_KEY',
      'AUTH_GOOGLE_ID'
    ];

    // Check .env.development file
    const envPath = join(process.cwd(), '.env.development');
    if (!existsSync(envPath)) {
      this.addResult('Environment File', 'fail', '.env.development file not found');
      return;
    }

    const envContent = readFileSync(envPath, 'utf-8');
    
    // Check required variables
    let missingRequired = 0;
    for (const envVar of requiredEnvVars) {
      if (!envContent.includes(`${envVar}=`) || envContent.includes(`${envVar}=""`)) {
        this.addResult(`Required: ${envVar}`, 'fail', 'Not configured');
        missingRequired++;
      } else {
        this.addResult(`Required: ${envVar}`, 'pass', 'Configured');
      }
    }

    // Check optional variables
    let missingOptional = 0;
    for (const envVar of optionalEnvVars) {
      if (!envContent.includes(`${envVar}=`) || envContent.includes(`${envVar}=""`)) {
        this.addResult(`Optional: ${envVar}`, 'warn', 'Not configured');
        missingOptional++;
      } else {
        this.addResult(`Optional: ${envVar}`, 'pass', 'Configured');
      }
    }

    if (missingRequired === 0) {
      this.addResult('Environment Variables', 'pass', 'All required variables configured');
    } else {
      this.addResult('Environment Variables', 'fail', `${missingRequired} required variables missing`);
    }
  }

  private async checkPackageJson(): Promise<void> {
    console.log('\n📦 Checking Package Configuration...');

    const packagePath = join(process.cwd(), 'package.json');
    if (!existsSync(packagePath)) {
      this.addResult('Package.json', 'fail', 'package.json not found');
      return;
    }

    try {
      const packageContent = JSON.parse(readFileSync(packagePath, 'utf-8'));
      
      // Check project name
      if (packageContent.name === 'shipany-template-one') {
        this.addResult('Project Name', 'warn', 'Still using ShipAny template name');
      } else {
        this.addResult('Project Name', 'pass', `Project name: ${packageContent.name}`);
      }

      // Check LipSync scripts
      const lipsyncScripts = [
        'lipsync:start',
        'lipsync:env',
        'lipsync:customize',
        'lipsync:test-ai'
      ];

      let hasLipsyncScripts = 0;
      for (const script of lipsyncScripts) {
        if (packageContent.scripts && packageContent.scripts[script]) {
          hasLipsyncScripts++;
        }
      }

      if (hasLipsyncScripts === lipsyncScripts.length) {
        this.addResult('LipSync Scripts', 'pass', 'All LipSync scripts available');
      } else {
        this.addResult('LipSync Scripts', 'warn', `${hasLipsyncScripts}/${lipsyncScripts.length} scripts found`);
      }

      // Check dependencies
      const requiredDeps = ['@aws-sdk/client-s3', 'drizzle-orm', 'next-auth'];
      let missingDeps = 0;
      
      for (const dep of requiredDeps) {
        if (!packageContent.dependencies || !packageContent.dependencies[dep]) {
          missingDeps++;
        }
      }

      if (missingDeps === 0) {
        this.addResult('Dependencies', 'pass', 'All required dependencies installed');
      } else {
        this.addResult('Dependencies', 'fail', `${missingDeps} required dependencies missing`);
      }

    } catch (error) {
      this.addResult('Package.json', 'fail', 'Invalid JSON format');
    }
  }

  private async checkDatabaseSchema(): Promise<void> {
    console.log('\n🗄️ Checking Database Schema...');

    const schemaPath = join(process.cwd(), 'src/db/schema.ts');
    if (!existsSync(schemaPath)) {
      this.addResult('Database Schema', 'fail', 'schema.ts not found');
      return;
    }

    const schemaContent = readFileSync(schemaPath, 'utf-8');

    // Check for LipSync tables
    const requiredTables = ['projects', 'lipsyncTasks'];
    let foundTables = 0;

    for (const table of requiredTables) {
      if (schemaContent.includes(`export const ${table}`)) {
        this.addResult(`Table: ${table}`, 'pass', 'Table defined');
        foundTables++;
      } else {
        this.addResult(`Table: ${table}`, 'fail', 'Table not found');
      }
    }

    if (foundTables === requiredTables.length) {
      this.addResult('Database Schema', 'pass', 'All LipSync tables defined');
    } else {
      this.addResult('Database Schema', 'fail', `${foundTables}/${requiredTables.length} tables found`);
    }
  }

  private async checkAIClients(): Promise<void> {
    console.log('\n🤖 Checking AI Client Files...');

    const aiFiles = [
      'src/lib/ai/heygen-client.ts',
      'src/lib/ai/did-client.ts',
      'src/lib/ai/provider-manager.ts'
    ];

    let foundFiles = 0;
    for (const file of aiFiles) {
      const filePath = join(process.cwd(), file);
      if (existsSync(filePath)) {
        this.addResult(`AI Client: ${file.split('/').pop()}`, 'pass', 'File exists');
        foundFiles++;
      } else {
        this.addResult(`AI Client: ${file.split('/').pop()}`, 'fail', 'File not found');
      }
    }

    if (foundFiles === aiFiles.length) {
      this.addResult('AI Clients', 'pass', 'All AI client files present');
    } else {
      this.addResult('AI Clients', 'fail', `${foundFiles}/${aiFiles.length} files found`);
    }
  }

  private async checkAPIEndpoints(): Promise<void> {
    console.log('\n🎯 Checking API Endpoints...');

    const apiEndpoints = [
      'src/app/api/upload/video/route.ts',
      'src/app/api/upload/audio/route.ts',
      'src/app/api/lipsync/create/route.ts',
      'src/app/api/lipsync/status/[id]/route.ts',
      'src/app/api/webhooks/heygen/route.ts'
    ];

    let foundEndpoints = 0;
    for (const endpoint of apiEndpoints) {
      const endpointPath = join(process.cwd(), endpoint);
      if (existsSync(endpointPath)) {
        this.addResult(`API: ${endpoint.split('/').slice(-2).join('/')}`, 'pass', 'Endpoint exists');
        foundEndpoints++;
      } else {
        this.addResult(`API: ${endpoint.split('/').slice(-2).join('/')}`, 'fail', 'Endpoint not found');
      }
    }

    if (foundEndpoints === apiEndpoints.length) {
      this.addResult('API Endpoints', 'pass', 'All API endpoints present');
    } else {
      this.addResult('API Endpoints', 'fail', `${foundEndpoints}/${apiEndpoints.length} endpoints found`);
    }
  }

  private async checkHomepageCustomization(): Promise<void> {
    console.log('\n🏠 Checking Homepage Customization...');

    const landingPath = join(process.cwd(), 'src/i18n/pages/landing/en.json');
    if (!existsSync(landingPath)) {
      this.addResult('Homepage Content', 'fail', 'Landing page content not found');
      return;
    }

    try {
      const landingContent = JSON.parse(readFileSync(landingPath, 'utf-8'));
      
      // Check brand customization
      if (landingContent.header?.brand?.title === 'LipSyncVideo') {
        this.addResult('Brand Title', 'pass', 'Updated to LipSyncVideo');
      } else {
        this.addResult('Brand Title', 'warn', 'Still using default title');
      }

      // Check hero content
      if (landingContent.hero?.title?.includes('AI-Powered')) {
        this.addResult('Hero Content', 'pass', 'Updated for LipSync');
      } else {
        this.addResult('Hero Content', 'warn', 'Still using default content');
      }

      // Check navigation
      const hasDemo = landingContent.header?.nav?.items?.some((item: any) => 
        item.title === 'Demo' || item.url === '/#demo'
      );
      
      if (hasDemo) {
        this.addResult('Navigation', 'pass', 'Demo link added');
      } else {
        this.addResult('Navigation', 'warn', 'Demo link not found');
      }

    } catch (error) {
      this.addResult('Homepage Content', 'fail', 'Invalid JSON format');
    }
  }

  private addResult(name: string, status: 'pass' | 'fail' | 'warn', message: string, details?: string): void {
    this.results.push({ name, status, message, details });
    
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`  ${icon} ${name}: ${message}`);
  }

  private printResults(): void {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 Verification Summary\n');

    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warn').length;

    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`📊 Total: ${this.results.length}`);

    if (failed === 0) {
      console.log('\n🎉 Setup verification completed successfully!');
      console.log('🚀 Your LipSyncVideo.net project is ready for development.');
    } else {
      console.log('\n🚨 Setup verification found issues that need attention.');
      console.log('📋 Please review the failed checks above and fix them before proceeding.');
    }

    console.log('\n📚 Next steps:');
    console.log('1. Fix any failed checks');
    console.log('2. Configure your environment variables');
    console.log('3. Set up your database');
    console.log('4. Test AI service connections');
    console.log('5. Run `pnpm dev` to start development');
  }
}

// Run verification
async function main() {
  const verifier = new SetupVerifier();
  await verifier.runAllChecks();
}

if (require.main === module) {
  main().catch(console.error);
}
