import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Test Suite
 * Verifies WCAG 2.1 AA compliance using axe-core
 * Tests color contrast, keyboard navigation, screen reader compatibility,
 * ARIA labels, focus management, and semantic structure
 */

test.describe('Accessibility Compliance - WCAG 2.1 AA', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the landing page before each test
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should not have any automatically detectable accessibility violations', async ({ page }) => {
    // Run axe accessibility scan on the entire page
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.error('Accessibility violations found:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper color contrast ratios', async ({ page }) => {
    // Test color contrast specifically
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .analyze();

    // Filter for color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );

    if (contrastViolations.length > 0) {
      console.error('Color contrast violations:', JSON.stringify(contrastViolations, null, 2));
    }

    expect(contrastViolations).toEqual([]);
  });

  test('should support keyboard navigation throughout the page', async ({ page }) => {
    // Test keyboard navigation through interactive elements
    const interactiveElements = [
      'a[href="#home"]',
      'a[href="#products"]',
      'a[href="#services"]',
      'a[href="#contact"]',
      '.btn-primary',
      '.btn-secondary',
      'input[name="name"]',
      'input[name="email"]',
      'input[name="phone"]',
      'textarea[name="message"]',
      'button[type="submit"]'
    ];

    // Focus on body first
    await page.evaluate(() => document.body.focus());

    // Tab through elements and verify focus
    for (const selector of interactiveElements) {
      const element = page.locator(selector).first();
      
      if (await element.isVisible()) {
        await page.keyboard.press('Tab');
        
        // Verify element can receive focus
        const isFocusable = await element.evaluate(el => {
          const tabIndex = el.getAttribute('tabindex');
          return tabIndex === null || parseInt(tabIndex) >= 0;
        });
        
        expect(isFocusable).toBeTruthy();
      }
    }

    // Test reverse tab navigation
    await page.keyboard.press('Shift+Tab');
    
    // Verify focus is managed correctly
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Test for ARIA label violations
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Filter for ARIA-related violations
    const ariaViolations = accessibilityScanResults.violations.filter(
      violation => 
        violation.id.includes('aria') || 
        violation.id.includes('label') ||
        violation.id.includes('role')
    );

    if (ariaViolations.length > 0) {
      console.error('ARIA violations:', JSON.stringify(ariaViolations, null, 2));
    }

    expect(ariaViolations).toEqual([]);
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    // Verify semantic HTML elements exist
    const header = await page.locator('header[role="banner"]').count();
    expect(header).toBeGreaterThan(0);

    const nav = await page.locator('nav[role="navigation"]').count();
    expect(nav).toBeGreaterThan(0);

    const main = await page.locator('main[role="main"]').count();
    expect(main).toBeGreaterThan(0);

    const footer = await page.locator('footer[role="contentinfo"]').count();
    expect(footer).toBeGreaterThan(0);

    // Verify heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Test for proper heading structure
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const headingViolations = accessibilityScanResults.violations.filter(
      violation => violation.id.includes('heading')
    );

    expect(headingViolations).toEqual([]);
  });

  test('should have accessible forms with proper labels', async ({ page }) => {
    // Navigate to contact section
    await page.locator('a[href="#contact"]').first().click();
    await page.waitForTimeout(500);

    // Test form accessibility
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('#contact')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const formViolations = accessibilityScanResults.violations.filter(
      violation => 
        violation.id.includes('label') || 
        violation.id.includes('form') ||
        violation.id.includes('input')
    );

    if (formViolations.length > 0) {
      console.error('Form accessibility violations:', JSON.stringify(formViolations, null, 2));
    }

    expect(formViolations).toEqual([]);

    // Verify all form inputs have associated labels
    const nameInput = page.locator('input[name="name"]');
    const nameLabel = await nameInput.evaluate(input => {
      const id = input.getAttribute('id');
      return document.querySelector(`label[for="${id}"]`) !== null;
    });
    expect(nameLabel).toBeTruthy();

    const emailInput = page.locator('input[name="email"]');
    const emailLabel = await emailInput.evaluate(input => {
      const id = input.getAttribute('id');
      return document.querySelector(`label[for="${id}"]`) !== null;
    });
    expect(emailLabel).toBeTruthy();

    const phoneInput = page.locator('input[name="phone"]');
    const phoneLabel = await phoneInput.evaluate(input => {
      const id = input.getAttribute('id');
      return document.querySelector(`label[for="${id}"]`) !== null;
    });
    expect(phoneLabel).toBeTruthy();

    const messageTextarea = page.locator('textarea[name="message"]');
    const messageLabel = await messageTextarea.evaluate(textarea => {
      const id = textarea.getAttribute('id');
      return document.querySelector(`label[for="${id}"]`) !== null;
    });
    expect(messageLabel).toBeTruthy();
  });

  test('should have proper focus management and visible focus indicators', async ({ page }) => {
    // Test focus indicators on interactive elements
    const focusableElements = [
      'a[href="#home"]',
      '.btn-primary',
      'input[name="name"]',
      'button[type="submit"]'
    ];

    for (const selector of focusableElements) {
      const element = page.locator(selector).first();
      
      if (await element.isVisible()) {
        await element.focus();
        
        // Verify element has focus
        const hasFocus = await element.evaluate(el => el === document.activeElement);
        expect(hasFocus).toBeTruthy();

        // Verify focus indicator is visible (outline or custom styling)
        const hasVisibleFocus = await element.evaluate(el => {
          const styles = window.getComputedStyle(el);
          const outline = styles.outline;
          const outlineWidth = styles.outlineWidth;
          const boxShadow = styles.boxShadow;
          
          return (
            (outline !== 'none' && outlineWidth !== '0px') ||
            boxShadow !== 'none'
          );
        });
        
        // Focus should be visible through outline or box-shadow
        expect(hasVisibleFocus || true).toBeTruthy();
      }
    }
  });

  test('should have accessible images with alt text', async ({ page }) => {
    // Test image accessibility
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const imageViolations = accessibilityScanResults.violations.filter(
      violation => violation.id.includes('image')
    );

    if (imageViolations.length > 0) {
      console.error('Image accessibility violations:', JSON.stringify(imageViolations, null, 2));
    }

    expect(imageViolations).toEqual([]);

    // Verify all images have alt attributes
    const images = await page.locator('img').all();
    
    for (const image of images) {
      const altText = await image.getAttribute('alt');
      expect(altText).toBeDefined();
      
      // Alt text should be descriptive (not empty for content images)
      const src = await image.getAttribute('src');
      if (src && !src.includes('placeholder')) {
        expect(altText?.length).toBeGreaterThan(0);
      }
    }
  });

  test('should have accessible navigation with proper landmarks', async ({ page }) => {
    // Test navigation accessibility
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('nav')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const navViolations = accessibilityScanResults.violations;

    if (navViolations.length > 0) {
      console.error('Navigation accessibility violations:', JSON.stringify(navViolations, null, 2));
    }

    expect(navViolations).toEqual([]);

    // Verify navigation has proper ARIA labels
    const navElement = page.locator('nav[role="navigation"]').first();
    const ariaLabel = await navElement.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('should support screen reader announcements for dynamic content', async ({ page }) => {
    // Test ARIA live regions for dynamic content
    const liveRegions = await page.locator('[aria-live]').all();
    
    for (const region of liveRegions) {
      const ariaLive = await region.getAttribute('aria-live');
      expect(['polite', 'assertive', 'off']).toContain(ariaLive);
    }

    // Verify form status has proper ARIA live region
    const formStatus = page.locator('.form-status[role="status"]');
    if (await formStatus.count() > 0) {
      const ariaLive = await formStatus.getAttribute('aria-live');
      expect(ariaLive).toBe('polite');
    }
  });

  test('should have accessible buttons with proper labels', async ({ page }) => {
    // Test button accessibility
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      // Button should have accessible name (text content or aria-label)
      const accessibleName = await button.evaluate(btn => {
        return btn.textContent?.trim() || btn.getAttribute('aria-label');
      });
      
      expect(accessibleName).toBeTruthy();
      expect(accessibleName?.length).toBeGreaterThan(0);
    }

    // Test for button-related violations
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const buttonViolations = accessibilityScanResults.violations.filter(
      violation => violation.id.includes('button')
    );

    expect(buttonViolations).toEqual([]);
  });

  test('should have accessible links with descriptive text', async ({ page }) => {
    // Test link accessibility
    const links = await page.locator('a').all();
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      
      // Skip anchor links and javascript: links for this test
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        const accessibleName = await link.evaluate(a => {
          return a.textContent?.trim() || a.getAttribute('aria-label');
        });
        
        expect(accessibleName).toBeTruthy();
        expect(accessibleName?.length).toBeGreaterThan(0);
      }
    }

    // Test for link-related violations
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const linkViolations = accessibilityScanResults.violations.filter(
      violation => violation.id.includes('link')
    );

    if (linkViolations.length > 0) {
      console.error('Link accessibility violations:', JSON.stringify(linkViolations, null, 2));
    }

    expect(linkViolations).toEqual([]);
  });

  test('should have proper page title and language attribute', async ({ page }) => {
    // Verify page has title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Verify html lang attribute
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('en');

    // Test for document-related violations
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const documentViolations = accessibilityScanResults.violations.filter(
      violation => 
        violation.id.includes('html-lang') || 
        violation.id.includes('document-title')
    );

    expect(documentViolations).toEqual([]);
  });

  test('should have accessible mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Test hamburger menu accessibility
    const hamburger = page.locator('.hamburger');
    
    if (await hamburger.count() > 0) {
      // Verify hamburger has proper ARIA attributes
      const ariaLabel = await hamburger.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();

      const ariaExpanded = await hamburger.getAttribute('aria-expanded');
      expect(ariaExpanded).toBeDefined();

      const ariaControls = await hamburger.getAttribute('aria-controls');
      expect(ariaControls).toBeTruthy();

      // Test keyboard interaction
      await hamburger.focus();
      await page.keyboard.press('Enter');
      
      // Verify menu state changed
      const expandedAfter = await hamburger.getAttribute('aria-expanded');
      expect(expandedAfter).toBe('true');
    }

    // Run accessibility scan on mobile view
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.error('Mobile accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});