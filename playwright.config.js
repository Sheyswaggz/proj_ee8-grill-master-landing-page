import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for cross-browser E2E testing
 * Supports Chrome, Firefox, Safari, and Edge with comprehensive test settings
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  // Maximum time one test can run for
  timeout: 30 * 1000,
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    
    // Collect trace on failure for debugging
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Action timeout
    actionTimeout: 10 * 1000,
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'America/New_York',
    
    // Color scheme
    colorScheme: 'light',
    
    // Accept downloads
    acceptDownloads: false,
    
    // Permissions
    permissions: [],
    
    // Geolocation
    geolocation: undefined,
    
    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9'
    }
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      }
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox']
      }
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari']
      }
    },

    {
      name: 'edge',
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge'
      }
    },

    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5']
      }
    },

    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12']
      }
    },

    // Tablet viewports
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro']
      }
    }
  ],

  // Web server configuration for local development
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe'
  },

  // Output directory for test artifacts
  outputDir: 'test-results',

  // Global setup and teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Expect configuration
  expect: {
    timeout: 5 * 1000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2
    },
    toMatchSnapshot: {
      maxDiffPixels: 100,
      threshold: 0.2
    }
  },

  // Metadata
  metadata: {
    project: 'Grill Business Landing Page',
    environment: process.env.CI ? 'CI' : 'local',
    testType: 'E2E'
  }
});