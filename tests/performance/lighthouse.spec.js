import { test, expect, chromium } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';
import lighthouse from 'lighthouse';
import { URL } from 'url';

/**
 * Performance tests using Lighthouse to verify page speed and optimization
 * Tests Core Web Vitals, accessibility, best practices, and SEO metrics
 * Ensures all scores meet minimum production thresholds
 */

// Minimum score thresholds for production
const THRESHOLDS = {
  performance: 90,
  accessibility: 90,
  bestPractices: 90,
  seo: 90,
  pwa: 30
};

// Core Web Vitals thresholds (in milliseconds)
const CORE_WEB_VITALS_THRESHOLDS = {
  firstContentfulPaint: 1800,
  largestContentfulPaint: 2500,
  totalBlockingTime: 200,
  cumulativeLayoutShift: 0.1,
  speedIndex: 3400
};

test.describe('Lighthouse Performance Tests', () => {
  let browser;
  let context;
  let page;

  test.beforeAll(async () => {
    browser = await chromium.launch({
      args: ['--remote-debugging-port=9222', '--no-sandbox', '--disable-setuid-sandbox']
    });
  });

  test.afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test.beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterEach(async () => {
    if (page) {
      await page.close();
    }
    if (context) {
      await context.close();
    }
  });

  test('should meet Lighthouse performance score threshold', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:4173';
    
    console.log(`Running Lighthouse audit on: ${baseURL}`);
    
    await page.goto(baseURL, { waitUntil: 'networkidle' });

    const port = new URL(browser.wsEndpoint()).port;
    
    const lighthouseOptions = {
      port: parseInt(port),
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance'],
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false
      },
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      }
    };

    const result = await lighthouse(baseURL, lighthouseOptions);
    const performanceScore = result.lhr.categories.performance.score * 100;

    console.log(`Performance Score: ${performanceScore.toFixed(2)}`);
    console.log(`Threshold: ${THRESHOLDS.performance}`);

    expect(performanceScore).toBeGreaterThanOrEqual(THRESHOLDS.performance);
  });

  test('should meet Core Web Vitals thresholds', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:4173';
    
    console.log(`Testing Core Web Vitals on: ${baseURL}`);
    
    await page.goto(baseURL, { waitUntil: 'networkidle' });

    const port = new URL(browser.wsEndpoint()).port;
    
    const lighthouseOptions = {
      port: parseInt(port),
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance'],
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false
      }
    };

    const result = await lighthouse(baseURL, lighthouseOptions);
    const audits = result.lhr.audits;

    const fcp = audits['first-contentful-paint'].numericValue;
    const lcp = audits['largest-contentful-paint'].numericValue;
    const tbt = audits['total-blocking-time'].numericValue;
    const cls = audits['cumulative-layout-shift'].numericValue;
    const si = audits['speed-index'].numericValue;

    console.log('Core Web Vitals:');
    console.log(`  First Contentful Paint: ${fcp.toFixed(0)}ms (threshold: ${CORE_WEB_VITALS_THRESHOLDS.firstContentfulPaint}ms)`);
    console.log(`  Largest Contentful Paint: ${lcp.toFixed(0)}ms (threshold: ${CORE_WEB_VITALS_THRESHOLDS.largestContentfulPaint}ms)`);
    console.log(`  Total Blocking Time: ${tbt.toFixed(0)}ms (threshold: ${CORE_WEB_VITALS_THRESHOLDS.totalBlockingTime}ms)`);
    console.log(`  Cumulative Layout Shift: ${cls.toFixed(3)} (threshold: ${CORE_WEB_VITALS_THRESHOLDS.cumulativeLayoutShift})`);
    console.log(`  Speed Index: ${si.toFixed(0)}ms (threshold: ${CORE_WEB_VITALS_THRESHOLDS.speedIndex}ms)`);

    expect(fcp).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.firstContentfulPaint);
    expect(lcp).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.largestContentfulPaint);
    expect(tbt).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.totalBlockingTime);
    expect(cls).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.cumulativeLayoutShift);
    expect(si).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.speedIndex);
  });

  test('should meet accessibility score threshold', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:4173';
    
    console.log(`Testing accessibility on: ${baseURL}`);
    
    await page.goto(baseURL, { waitUntil: 'networkidle' });

    const port = new URL(browser.wsEndpoint()).port;
    
    const lighthouseOptions = {
      port: parseInt(port),
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['accessibility'],
      formFactor: 'desktop'
    };

    const result = await lighthouse(baseURL, lighthouseOptions);
    const accessibilityScore = result.lhr.categories.accessibility.score * 100;

    console.log(`Accessibility Score: ${accessibilityScore.toFixed(2)}`);
    console.log(`Threshold: ${THRESHOLDS.accessibility}`);

    expect(accessibilityScore).toBeGreaterThanOrEqual(THRESHOLDS.accessibility);
  });

  test('should meet best practices score threshold', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:4173';
    
    console.log(`Testing best practices on: ${baseURL}`);
    
    await page.goto(baseURL, { waitUntil: 'networkidle' });

    const port = new URL(browser.wsEndpoint()).port;
    
    const lighthouseOptions = {
      port: parseInt(port),
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['best-practices'],
      formFactor: 'desktop'
    };

    const result = await lighthouse(baseURL, lighthouseOptions);
    const bestPracticesScore = result.lhr.categories['best-practices'].score * 100;

    console.log(`Best Practices Score: ${bestPracticesScore.toFixed(2)}`);
    console.log(`Threshold: ${THRESHOLDS.bestPractices}`);

    expect(bestPracticesScore).toBeGreaterThanOrEqual(THRESHOLDS.bestPractices);
  });

  test('should meet SEO score threshold', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:4173';
    
    console.log(`Testing SEO on: ${baseURL}`);
    
    await page.goto(baseURL, { waitUntil: 'networkidle' });

    const port = new URL(browser.wsEndpoint()).port;
    
    const lighthouseOptions = {
      port: parseInt(port),
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['seo'],
      formFactor: 'desktop'
    };

    const result = await lighthouse(baseURL, lighthouseOptions);
    const seoScore = result.lhr.categories.seo.score * 100;

    console.log(`SEO Score: ${seoScore.toFixed(2)}`);
    console.log(`Threshold: ${THRESHOLDS.seo}`);

    expect(seoScore).toBeGreaterThanOrEqual(THRESHOLDS.seo);
  });

  test('should generate comprehensive Lighthouse report', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:4173';
    
    console.log(`Generating comprehensive Lighthouse report for: ${baseURL}`);
    
    await page.goto(baseURL, { waitUntil: 'networkidle' });

    const port = new URL(browser.wsEndpoint()).port;
    
    const lighthouseOptions = {
      port: parseInt(port),
      output: ['json', 'html'],
      logLevel: 'info',
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false
      }
    };

    const result = await lighthouse(baseURL, lighthouseOptions);
    const categories = result.lhr.categories;

    const scores = {
      performance: categories.performance.score * 100,
      accessibility: categories.accessibility.score * 100,
      bestPractices: categories['best-practices'].score * 100,
      seo: categories.seo.score * 100,
      pwa: categories.pwa.score * 100
    };

    console.log('\n=== Lighthouse Audit Results ===');
    console.log(`Performance: ${scores.performance.toFixed(2)} (threshold: ${THRESHOLDS.performance})`);
    console.log(`Accessibility: ${scores.accessibility.toFixed(2)} (threshold: ${THRESHOLDS.accessibility})`);
    console.log(`Best Practices: ${scores.bestPractices.toFixed(2)} (threshold: ${THRESHOLDS.bestPractices})`);
    console.log(`SEO: ${scores.seo.toFixed(2)} (threshold: ${THRESHOLDS.seo})`);
    console.log(`PWA: ${scores.pwa.toFixed(2)} (threshold: ${THRESHOLDS.pwa})`);
    console.log('================================\n');

    expect(scores.performance).toBeGreaterThanOrEqual(THRESHOLDS.performance);
    expect(scores.accessibility).toBeGreaterThanOrEqual(THRESHOLDS.accessibility);
    expect(scores.bestPractices).toBeGreaterThanOrEqual(THRESHOLDS.bestPractices);
    expect(scores.seo).toBeGreaterThanOrEqual(THRESHOLDS.seo);
    expect(scores.pwa).toBeGreaterThanOrEqual(THRESHOLDS.pwa);
  });

  test('should verify resource optimization', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:4173';
    
    console.log(`Testing resource optimization on: ${baseURL}`);
    
    await page.goto(baseURL, { waitUntil: 'networkidle' });

    const port = new URL(browser.wsEndpoint()).port;
    
    const lighthouseOptions = {
      port: parseInt(port),
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance'],
      formFactor: 'desktop'
    };

    const result = await lighthouse(baseURL, lighthouseOptions);
    const audits = result.lhr.audits;

    const imageOptimization = audits['uses-optimized-images'];
    const textCompression = audits['uses-text-compression'];
    const efficientCache = audits['uses-long-cache-ttl'];
    const modernImageFormats = audits['modern-image-formats'];

    console.log('\n=== Resource Optimization ===');
    console.log(`Optimized Images: ${imageOptimization.score === 1 ? 'PASS' : 'FAIL'}`);
    console.log(`Text Compression: ${textCompression.score === 1 ? 'PASS' : 'FAIL'}`);
    console.log(`Efficient Cache Policy: ${efficientCache.score >= 0.9 ? 'PASS' : 'WARN'}`);
    console.log(`Modern Image Formats: ${modernImageFormats.score === 1 ? 'PASS' : 'FAIL'}`);
    console.log('=============================\n');

    expect(imageOptimization.score).toBeGreaterThanOrEqual(0.9);
    expect(textCompression.score).toBeGreaterThanOrEqual(0.9);
  });

  test('should verify mobile performance', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:4173';
    
    console.log(`Testing mobile performance on: ${baseURL}`);
    
    await page.goto(baseURL, { waitUntil: 'networkidle' });

    const port = new URL(browser.wsEndpoint()).port;
    
    const lighthouseOptions = {
      port: parseInt(port),
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance'],
      formFactor: 'mobile',
      screenEmulation: {
        mobile: true,
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        disabled: false
      },
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      }
    };

    const result = await lighthouse(baseURL, lighthouseOptions);
    const mobilePerformanceScore = result.lhr.categories.performance.score * 100;

    console.log(`Mobile Performance Score: ${mobilePerformanceScore.toFixed(2)}`);
    console.log(`Threshold: ${THRESHOLDS.performance - 10}`);

    expect(mobilePerformanceScore).toBeGreaterThanOrEqual(THRESHOLDS.performance - 10);
  });
});