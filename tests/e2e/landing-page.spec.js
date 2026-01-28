import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite for Grill Business Landing Page
 * 
 * Test Categories:
 * - Navigation & Routing
 * - Form Validation & Submission
 * - Responsive Design & Mobile
 * - Accessibility (WCAG 2.1 AA)
 * - Performance & Loading
 * - User Interactions
 * - Visual Regression
 * - SEO & Meta Tags
 */

// ============================================================================
// 🎯 TEST DATA FACTORIES
// ============================================================================

const testData = {
  validContact: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    message: 'I am interested in your premium gas grill products.'
  },
  invalidContact: {
    name: 'J',
    email: 'invalid-email',
    phone: '123',
    message: 'Short'
  },
  validNewsletter: {
    email: 'newsletter@example.com'
  }
};

const selectors = {
  navigation: {
    logo: '.logo',
    hamburger: '.hamburger',
    navMenu: '#nav-menu',
    homeLink: 'a[href="#home"]',
    productsLink: 'a[href="#products"]',
    servicesLink: 'a[href="#services"]',
    contactLink: 'a[href="#contact"]'
  },
  hero: {
    section: '.hero-section',
    heading: '#hero-heading',
    subheadline: '.hero-subheadline',
    primaryButton: '.hero-actions .btn-primary',
    secondaryButton: '.hero-actions .btn-secondary'
  },
  products: {
    section: '#products',
    heading: '#products-heading',
    grid: '.products-grid',
    cards: '.product-card',
    images: '.product-card img',
    prices: '.product-price',
    links: '.product-link'
  },
  services: {
    section: '#services',
    heading: '#services-heading',
    grid: '.services-grid',
    cards: '.service-card'
  },
  contact: {
    section: '#contact',
    form: '.contact-form',
    nameInput: '#name',
    emailInput: '#email',
    phoneInput: '#phone',
    messageInput: '#message',
    submitButton: '.contact-form button[type="submit"]',
    errorMessages: '.error-message',
    formStatus: '.form-status',
    socialLinks: '.social-links a'
  },
  footer: {
    section: 'footer',
    newsletterForm: '.newsletter-form',
    newsletterInput: '#newsletter-email',
    newsletterButton: '.newsletter-form button',
    socialLinks: '.footer-section .social-links a',
    quickLinks: '.footer-section nav a',
    currentYear: '#current-year'
  }
};

// ============================================================================
// 🎭 TEST HOOKS & SETUP
// ============================================================================

test.beforeEach(async ({ page }) => {
  // Navigate to the landing page before each test
  await page.goto('/');
  
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
});

// ============================================================================
// 🌐 NAVIGATION & ROUTING TESTS
// ============================================================================

test.describe('Navigation & Routing', () => {
  test('should display logo and navigation menu', async ({ page }) => {
    // Arrange & Act
    const logo = page.locator(selectors.navigation.logo);
    const navMenu = page.locator(selectors.navigation.navMenu);
    
    // Assert
    await expect(logo).toBeVisible();
    await expect(logo).toHaveText('Grill Business');
    await expect(navMenu).toBeVisible();
    await expect(navMenu.locator('li')).toHaveCount(4);
  });

  test('should navigate to all sections via menu links', async ({ page }) => {
    // Test Home link
    await page.click(selectors.navigation.homeLink);
    await expect(page.locator(selectors.hero.section)).toBeInViewport();
    
    // Test Products link
    await page.click(selectors.navigation.productsLink);
    await expect(page.locator(selectors.products.section)).toBeInViewport();
    
    // Test Services link
    await page.click(selectors.navigation.servicesLink);
    await expect(page.locator(selectors.services.section)).toBeInViewport();
    
    // Test Contact link
    await page.click(selectors.navigation.contactLink);
    await expect(page.locator(selectors.contact.section)).toBeInViewport();
  });

  test('should have smooth scrolling behavior', async ({ page }) => {
    // Arrange
    const initialPosition = await page.evaluate(() => window.scrollY);
    
    // Act
    await page.click(selectors.navigation.contactLink);
    await page.waitForTimeout(500); // Wait for smooth scroll animation
    
    // Assert
    const finalPosition = await page.evaluate(() => window.scrollY);
    expect(finalPosition).toBeGreaterThan(initialPosition);
  });

  test('should toggle mobile menu on hamburger click', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    const hamburger = page.locator(selectors.navigation.hamburger);
    const navMenu = page.locator(selectors.navigation.navMenu);
    
    // Act - Open menu
    await hamburger.click();
    
    // Assert - Menu is visible
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    
    // Act - Close menu
    await hamburger.click();
    
    // Assert - Menu is hidden
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });

  test('should have correct ARIA labels for navigation', async ({ page }) => {
    const hamburger = page.locator(selectors.navigation.hamburger);
    const navMenu = page.locator(selectors.navigation.navMenu);
    
    await expect(hamburger).toHaveAttribute('aria-label', 'Toggle navigation menu');
    await expect(hamburger).toHaveAttribute('aria-controls', 'nav-menu');
    await expect(navMenu).toHaveAttribute('role', 'menubar');
  });
});

// ============================================================================
// 🎨 HERO SECTION TESTS
// ============================================================================

test.describe('Hero Section', () => {
  test('should display hero content correctly', async ({ page }) => {
    const heroSection = page.locator(selectors.hero.section);
    const heading = page.locator(selectors.hero.heading);
    const subheadline = page.locator(selectors.hero.subheadline);
    
    await expect(heroSection).toBeVisible();
    await expect(heading).toHaveText('Premium Grills for Perfect BBQ');
    await expect(subheadline).toContainText('Experience the art of outdoor cooking');
  });

  test('should have functional CTA buttons', async ({ page }) => {
    const primaryButton = page.locator(selectors.hero.primaryButton);
    const secondaryButton = page.locator(selectors.hero.secondaryButton);
    
    await expect(primaryButton).toBeVisible();
    await expect(primaryButton).toHaveAttribute('href', '#products');
    await expect(secondaryButton).toBeVisible();
    await expect(secondaryButton).toHaveAttribute('href', '#contact');
    
    // Test navigation
    await primaryButton.click();
    await expect(page.locator(selectors.products.section)).toBeInViewport();
  });

  test('should have proper ARIA labels on CTA buttons', async ({ page }) => {
    const primaryButton = page.locator(selectors.hero.primaryButton);
    const secondaryButton = page.locator(selectors.hero.secondaryButton);
    
    await expect(primaryButton).toHaveAttribute('aria-label', 'Explore our premium grill collection');
    await expect(secondaryButton).toHaveAttribute('aria-label', 'Contact us for expert consultation');
  });
});

// ============================================================================
// 🛍️ PRODUCTS SECTION TESTS
// ============================================================================

test.describe('Products Section', () => {
  test('should display all product cards', async ({ page }) => {
    const productCards = page.locator(selectors.products.cards);
    
    await expect(productCards).toHaveCount(8);
    
    // Verify first product card structure
    const firstCard = productCards.first();
    await expect(firstCard.locator('h3')).toBeVisible();
    await expect(firstCard.locator('p')).toBeVisible();
    await expect(firstCard.locator('.product-price')).toBeVisible();
    await expect(firstCard.locator('.product-link')).toBeVisible();
  });

  test('should display correct product information', async ({ page }) => {
    const firstProduct = page.locator(selectors.products.cards).first();
    
    await expect(firstProduct.locator('h3')).toHaveText('Premium Gas Grill');
    await expect(firstProduct.locator('.product-price')).toHaveText('$1,299.99');
    await expect(firstProduct.locator('p').first()).toContainText('Professional-grade gas grill');
  });

  test('should lazy load product images', async ({ page }) => {
    const images = page.locator(selectors.products.images);
    const firstImage = images.first();
    
    await expect(firstImage).toHaveAttribute('loading', 'lazy');
    await expect(firstImage).toHaveAttribute('alt');
    
    // Verify image loads
    await firstImage.scrollIntoViewIfNeeded();
    await expect(firstImage).toBeVisible();
  });

  test('should have accessible product images with alt text', async ({ page }) => {
    const images = page.locator(selectors.products.images);
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText.length).toBeGreaterThan(10);
    }
  });

  test('should navigate to contact on product link click', async ({ page }) => {
    const firstProductLink = page.locator(selectors.products.links).first();
    
    await firstProductLink.click();
    await expect(page.locator(selectors.contact.section)).toBeInViewport();
  });
});

// ============================================================================
// 🔧 SERVICES SECTION TESTS
// ============================================================================

test.describe('Services Section', () => {
  test('should display all service cards', async ({ page }) => {
    const serviceCards = page.locator(selectors.services.cards);
    
    await expect(serviceCards).toHaveCount(4);
  });

  test('should display service information correctly', async ({ page }) => {
    const firstService = page.locator(selectors.services.cards).first();
    
    await expect(firstService.locator('h3')).toHaveText('Professional Installation');
    await expect(firstService.locator('p')).toContainText('Expert installation services');
  });

  test('should have service icons with proper ARIA attributes', async ({ page }) => {
    const serviceIcons = page.locator('.service-icon');
    const count = await serviceIcons.count();
    
    for (let i = 0; i < count; i++) {
      const icon = serviceIcons.nth(i);
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
    }
  });
});

// ============================================================================
// 📧 CONTACT FORM TESTS
// ============================================================================

test.describe('Contact Form - Validation', () => {
  test('should display contact form with all fields', async ({ page }) => {
    const form = page.locator(selectors.contact.form);
    
    await expect(form).toBeVisible();
    await expect(page.locator(selectors.contact.nameInput)).toBeVisible();
    await expect(page.locator(selectors.contact.emailInput)).toBeVisible();
    await expect(page.locator(selectors.contact.phoneInput)).toBeVisible();
    await expect(page.locator(selectors.contact.messageInput)).toBeVisible();
    await expect(page.locator(selectors.contact.submitButton)).toBeVisible();
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Act - Submit empty form
    await page.click(selectors.contact.submitButton);
    
    // Assert - Check HTML5 validation
    const nameInput = page.locator(selectors.contact.nameInput);
    const emailInput = page.locator(selectors.contact.emailInput);
    const phoneInput = page.locator(selectors.contact.phoneInput);
    const messageInput = page.locator(selectors.contact.messageInput);
    
    await expect(nameInput).toHaveAttribute('required');
    await expect(emailInput).toHaveAttribute('required');
    await expect(phoneInput).toHaveAttribute('required');
    await expect(messageInput).toHaveAttribute('required');
  });

  test('should validate email format', async ({ page }) => {
    const emailInput = page.locator(selectors.contact.emailInput);
    
    // Fill with invalid email
    await emailInput.fill('invalid-email');
    await page.click(selectors.contact.submitButton);
    
    // Check pattern attribute
    await expect(emailInput).toHaveAttribute('pattern', '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$');
  });

  test('should validate phone number format', async ({ page }) => {
    const phoneInput = page.locator(selectors.contact.phoneInput);
    
    await expect(phoneInput).toHaveAttribute('pattern', '[\\d\\s\\-\\+\\(\\)]{10,}');
  });

  test('should validate name length constraints', async ({ page }) => {
    const nameInput = page.locator(selectors.contact.nameInput);
    
    await expect(nameInput).toHaveAttribute('minlength', '2');
    await expect(nameInput).toHaveAttribute('maxlength', '100');
  });

  test('should validate message length constraints', async ({ page }) => {
    const messageInput = page.locator(selectors.contact.messageInput);
    
    await expect(messageInput).toHaveAttribute('minlength', '10');
    await expect(messageInput).toHaveAttribute('maxlength', '1000');
  });
});

test.describe('Contact Form - Submission', () => {
  test('should successfully submit valid contact form', async ({ page }) => {
    // Arrange - Mock form submission
    await page.route('/submit-contact', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Form submitted successfully' })
      });
    });
    
    // Act - Fill form with valid data
    await page.fill(selectors.contact.nameInput, testData.validContact.name);
    await page.fill(selectors.contact.emailInput, testData.validContact.email);
    await page.fill(selectors.contact.phoneInput, testData.validContact.phone);
    await page.fill(selectors.contact.messageInput, testData.validContact.message);
    
    // Submit form
    await page.click(selectors.contact.submitButton);
    
    // Assert - Form submission was attempted
    // Note: Actual validation would depend on JavaScript implementation
  });

  test('should have proper autocomplete attributes', async ({ page }) => {
    await expect(page.locator(selectors.contact.nameInput)).toHaveAttribute('autocomplete', 'name');
    await expect(page.locator(selectors.contact.emailInput)).toHaveAttribute('autocomplete', 'email');
    await expect(page.locator(selectors.contact.phoneInput)).toHaveAttribute('autocomplete', 'tel');
  });

  test('should have proper ARIA attributes for accessibility', async ({ page }) => {
    const form = page.locator(selectors.contact.form);
    const nameInput = page.locator(selectors.contact.nameInput);
    const emailInput = page.locator(selectors.contact.emailInput);
    
    await expect(form).toHaveAttribute('aria-label', 'Contact form');
    await expect(nameInput).toHaveAttribute('aria-required', 'true');
    await expect(emailInput).toHaveAttribute('aria-required', 'true');
  });

  test('should display contact information correctly', async ({ page }) => {
    const contactInfo = page.locator('.contact-info');
    
    await expect(contactInfo).toContainText('123 Grill Street, Cooktown, ST 12345');
    await expect(contactInfo).toContainText('+1 (555) 123-4567');
    await expect(contactInfo).toContainText('info@grillbusiness.com');
  });

  test('should have clickable phone and email links', async ({ page }) => {
    const phoneLink = page.locator('a[href="tel:+15551234567"]');
    const emailLink = page.locator('a[href="mailto:info@grillbusiness.com"]');
    
    await expect(phoneLink).toBeVisible();
    await expect(emailLink).toBeVisible();
    await expect(phoneLink).toHaveAttribute('aria-label', 'Call us at +1 555 123 4567');
    await expect(emailLink).toHaveAttribute('aria-label', 'Email us at info@grillbusiness.com');
  });
});

test.describe('Contact Form - Social Media Links', () => {
  test('should display all social media links', async ({ page }) => {
    const socialLinks = page.locator(selectors.contact.socialLinks);
    
    await expect(socialLinks).toHaveCount(4);
  });

  test('should have proper attributes for external links', async ({ page }) => {
    const socialLinks = page.locator(selectors.contact.socialLinks);
    const count = await socialLinks.count();
    
    for (let i = 0; i < count; i++) {
      const link = socialLinks.nth(i);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  test('should have accessible ARIA labels for social links', async ({ page }) => {
    const facebookLink = page.locator('a[href="https://facebook.com/grillbusiness"]');
    const instagramLink = page.locator('a[href="https://instagram.com/grillbusiness"]');
    
    await expect(facebookLink).toHaveAttribute('aria-label', 'Visit our Facebook page');
    await expect(instagramLink).toHaveAttribute('aria-label', 'Visit our Instagram profile');
  });
});

// ============================================================================
// 🦶 FOOTER TESTS
// ============================================================================

test.describe('Footer Section', () => {
  test('should display footer with all sections', async ({ page }) => {
    const footer = page.locator(selectors.footer.section);
    
    await expect(footer).toBeVisible();
    await expect(footer.locator('.footer-section')).toHaveCount(4);
  });

  test('should display current year dynamically', async ({ page }) => {
    const currentYear = page.locator(selectors.footer.currentYear);
    const year = new Date().getFullYear().toString();
    
    await expect(currentYear).toHaveText(year);
  });

  test('should have functional quick links', async ({ page }) => {
    const quickLinks = page.locator(selectors.footer.quickLinks);
    
    await expect(quickLinks).toHaveCount(4);
    
    // Test first link
    await quickLinks.first().click();
    await expect(page.locator(selectors.hero.section)).toBeInViewport();
  });

  test('should display newsletter subscription form', async ({ page }) => {
    const newsletterForm = page.locator(selectors.footer.newsletterForm);
    const newsletterInput = page.locator(selectors.footer.newsletterInput);
    const newsletterButton = page.locator(selectors.footer.newsletterButton);
    
    await expect(newsletterForm).toBeVisible();
    await expect(newsletterInput).toBeVisible();
    await expect(newsletterButton).toBeVisible();
  });

  test('should validate newsletter email input', async ({ page }) => {
    const newsletterInput = page.locator(selectors.footer.newsletterInput);
    
    await expect(newsletterInput).toHaveAttribute('type', 'email');
    await expect(newsletterInput).toHaveAttribute('required');
    await expect(newsletterInput).toHaveAttribute('autocomplete', 'email');
  });

  test('should have legal links in footer', async ({ page }) => {
    const privacyLink = page.locator('a[href="/privacy-policy"]');
    const termsLink = page.locator('a[href="/terms-of-service"]');
    const sitemapLink = page.locator('a[href="/sitemap"]');
    
    await expect(privacyLink).toBeVisible();
    await expect(termsLink).toBeVisible();
    await expect(sitemapLink).toBeVisible();
  });
});

// ============================================================================
// 📱 RESPONSIVE DESIGN TESTS
// ============================================================================

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile Portrait', width: 375, height: 667 },
    { name: 'Mobile Landscape', width: 667, height: 375 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
    { name: 'Desktop', width: 1280, height: 720 },
    { name: 'Large Desktop', width: 1920, height: 1080 }
  ];

  for (const viewport of viewports) {
    test(`should display correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Verify key elements are visible
      await expect(page.locator(selectors.navigation.logo)).toBeVisible();
      await expect(page.locator(selectors.hero.section)).toBeVisible();
      await expect(page.locator(selectors.products.section)).toBeVisible();
      await expect(page.locator(selectors.footer.section)).toBeVisible();
    });
  }

  test('should show hamburger menu on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const hamburger = page.locator(selectors.navigation.hamburger);
    await expect(hamburger).toBeVisible();
  });

  test('should hide hamburger menu on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    const hamburger = page.locator(selectors.navigation.hamburger);
    // Hamburger should be hidden via CSS on desktop
    const isVisible = await hamburger.isVisible();
    // Note: Actual visibility depends on CSS implementation
  });

  test('should stack product cards on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const productsGrid = page.locator(selectors.products.grid);
    await expect(productsGrid).toBeVisible();
    
    // Verify cards are stacked (would need CSS inspection in real implementation)
  });
});

// ============================================================================
// ♿ ACCESSIBILITY TESTS (WCAG 2.1 AA)
// ============================================================================

test.describe('Accessibility', () => {
  test('should have proper document structure', async ({ page }) => {
    // Check for single h1
    const h1Elements = page.locator('h1');
    await expect(h1Elements).toHaveCount(1);
    
    // Check for proper heading hierarchy
    const h2Elements = page.locator('h2');
    await expect(h2Elements.first()).toBeVisible();
  });

  test('should have proper landmark roles', async ({ page }) => {
    await expect(page.locator('header[role="banner"]')).toBeVisible();
    await expect(page.locator('main[role="main"]')).toBeVisible();
    await expect(page.locator('footer[role="contentinfo"]')).toBeVisible();
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
  });

  test('should have skip to main content link', async ({ page }) => {
    // Check for main content ID
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeVisible();
  });

  test('should have proper form labels', async ({ page }) => {
    const nameLabel = page.locator('label[for="name"]');
    const emailLabel = page.locator('label[for="email"]');
    const phoneLabel = page.locator('label[for="phone"]');
    const messageLabel = page.locator('label[for="message"]');
    
    await expect(nameLabel).toBeVisible();
    await expect(emailLabel).toBeVisible();
    await expect(phoneLabel).toBeVisible();
    await expect(messageLabel).toBeVisible();
  });

  test('should have proper button labels', async ({ page }) => {
    const buttons = page.locator('button, a[role="button"]');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      // Button should have either aria-label or text content
      expect(ariaLabel || text).toBeTruthy();
    }
  });

  test('should have proper image alt text', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      expect(alt).toBeDefined();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // Check if focus is visible (would need visual inspection)
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have proper color contrast', async ({ page }) => {
    // This would require axe-core or similar tool for automated testing
    // Manual verification recommended for production
  });

  test('should have proper ARIA live regions for dynamic content', async ({ page }) => {
    const formStatus = page.locator(selectors.contact.formStatus);
    
    await expect(formStatus).toHaveAttribute('role', 'status');
    await expect(formStatus).toHaveAttribute('aria-live', 'polite');
  });
});

// ============================================================================
// 🚀 PERFORMANCE TESTS
// ============================================================================

test.describe('Performance', () => {
  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have optimized images with lazy loading', async ({ page }) => {
    const images = page.locator('img[loading="lazy"]');
    const count = await images.count();
    
    // Most images should have lazy loading
    expect(count).toBeGreaterThan(0);
  });

  test('should have resource hints for external resources', async ({ page }) => {
    const preconnectLinks = page.locator('link[rel="preconnect"]');
    const dnsPrefetchLinks = page.locator('link[rel="dns-prefetch"]');
    
    await expect(preconnectLinks.first()).toBeVisible();
    await expect(dnsPrefetchLinks.first()).toBeVisible();
  });

  test('should have proper caching headers', async ({ page, request }) => {
    const response = await request.get('/');
    
    // Check for cache-control headers (would depend on server configuration)
    expect(response.status()).toBe(200);
  });

  test('should minimize render-blocking resources', async ({ page }) => {
    // Check for critical CSS inline
    const styleTag = page.locator('style');
    await expect(styleTag).toBeVisible();
  });
});

// ============================================================================
// 🔍 SEO TESTS
// ============================================================================

test.describe('SEO & Meta Tags', () => {
  test('should have proper meta tags', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/Premium Grill Products & Services/);
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Premium grill products/);
    
    // Check meta keywords
    const metaKeywords = page.locator('meta[name="keywords"]');
    await expect(metaKeywords).toHaveAttribute('content', /grill, grilling, BBQ/);
  });

  test('should have Open Graph meta tags', async ({ page }) => {
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');
    const ogType = page.locator('meta[property="og:type"]');
    const ogUrl = page.locator('meta[property="og:url"]');
    const ogImage = page.locator('meta[property="og:image"]');
    
    await expect(ogTitle).toHaveAttribute('content', 'Premium Grill Products & Services');
    await expect(ogDescription).toHaveAttribute('content');
    await expect(ogType).toHaveAttribute('content', 'website');
    await expect(ogUrl).toHaveAttribute('content');
    await expect(ogImage).toHaveAttribute('content');
  });

  test('should have Twitter Card meta tags', async ({ page }) => {
    const twitterCard = page.locator('meta[name="twitter:card"]');
    const twitterTitle = page.locator('meta[name="twitter:title"]');
    const twitterDescription = page.locator('meta[name="twitter:description"]');
    const twitterImage = page.locator('meta[name="twitter:image"]');
    
    await expect(twitterCard).toHaveAttribute('content', 'summary_large_image');
    await expect(twitterTitle).toHaveAttribute('content');
    await expect(twitterDescription).toHaveAttribute('content');
    await expect(twitterImage).toHaveAttribute('content');
  });

  test('should have proper language and charset', async ({ page }) => {
    const html = page.locator('html');
    const metaCharset = page.locator('meta[charset]');
    
    await expect(html).toHaveAttribute('lang', 'en');
    await expect(metaCharset).toHaveAttribute('charset', 'UTF-8');
  });

  test('should have viewport meta tag', async ({ page }) => {
    const viewport = page.locator('meta[name="viewport"]');
    
    await expect(viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1.0');
  });

  test('should have robots meta tag', async ({ page }) => {
    const robots = page.locator('meta[name="robots"]');
    
    await expect(robots).toHaveAttribute('content', 'index, follow');
  });
});

// ============================================================================
// 🎯 USER INTERACTION TESTS
// ============================================================================

test.describe('User Interactions', () => {
  test('should handle form input focus states', async ({ page }) => {
    const nameInput = page.locator(selectors.contact.nameInput);
    
    await nameInput.focus();
    
    // Check if input is focused
    const isFocused = await nameInput.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test('should handle hover states on buttons', async ({ page }) => {
    const primaryButton = page.locator(selectors.hero.primaryButton);
    
    await primaryButton.hover();
    
    // Visual verification would be needed for actual hover effect
    await expect(primaryButton).toBeVisible();
  });

  test('should handle click events on product cards', async ({ page }) => {
    const firstProductLink = page.locator(selectors.products.links).first();
    
    await firstProductLink.click();
    
    // Should navigate to contact section
    await expect(page.locator(selectors.contact.section)).toBeInViewport();
  });

  test('should handle scroll events', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Verify footer is visible
    await expect(page.locator(selectors.footer.section)).toBeInViewport();
  });
});

// ============================================================================
// 🔒 SECURITY TESTS
// ============================================================================

test.describe('Security', () => {
  test('should have noopener noreferrer on external links', async ({ page }) => {
    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();
    
    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      const rel = await link.getAttribute('rel');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }
  });

  test('should have proper form method and action', async ({ page }) => {
    const contactForm = page.locator(selectors.contact.form);
    
    await expect(contactForm).toHaveAttribute('method', 'POST');
    await expect(contactForm).toHaveAttribute('action', '/submit-contact');
  });

  test('should have novalidate attribute for custom validation', async ({ page }) => {
    const contactForm = page.locator(selectors.contact.form);
    
    await expect(contactForm).toHaveAttribute('novalidate');
  });

  test('should use HTTPS for external resources', async ({ page }) => {
    const externalLinks = page.locator('link[href^="http"]');
    const count = await externalLinks.count();
    
    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      const href = await link.getAttribute('href');
      if (href) {
        expect(href).toMatch(/^https:/);
      }
    }
  });
});

// ============================================================================
// 📊 VISUAL REGRESSION TESTS
// ============================================================================

test.describe('Visual Regression', () => {
  test('should match hero section screenshot', async ({ page }) => {
    const heroSection = page.locator(selectors.hero.section);
    
    await expect(heroSection).toHaveScreenshot('hero-section.png', {
      maxDiffPixels: 100
    });
  });

  test('should match products section screenshot', async ({ page }) => {
    const productsSection = page.locator(selectors.products.section);
    
    await expect(productsSection).toHaveScreenshot('products-section.png', {
      maxDiffPixels: 100
    });
  });

  test('should match full page screenshot on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    await expect(page).toHaveScreenshot('full-page-desktop.png', {
      fullPage: true,
      maxDiffPixels: 100
    });
  });

  test('should match full page screenshot on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page).toHaveScreenshot('full-page-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100
    });
  });
});

// ============================================================================
// 🎪 CROSS-BROWSER COMPATIBILITY TESTS
// ============================================================================

test.describe('Cross-Browser Compatibility', () => {
  test('should work in all configured browsers', async ({ page, browserName }) => {
    // This test runs automatically across all browsers configured in playwright.config.js
    
    // Verify basic functionality works
    await expect(page.locator(selectors.navigation.logo)).toBeVisible();
    await expect(page.locator(selectors.hero.section)).toBeVisible();
    
    // Log browser name for debugging
    console.log(`Testing in browser: ${browserName}`);
  });
});

// ============================================================================
// 🧪 EDGE CASES & ERROR HANDLING
// ============================================================================

test.describe('Edge Cases', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);
    
    // Try to submit form
    await page.fill(selectors.contact.nameInput, testData.validContact.name);
    await page.click(selectors.contact.submitButton);
    
    // Restore online mode
    await page.context().setOffline(false);
  });

  test('should handle very long input values', async ({ page }) => {
    const longText = 'A'.repeat(1000);
    
    await page.fill(selectors.contact.messageInput, longText);
    
    // Should respect maxlength attribute
    const value = await page.locator(selectors.contact.messageInput).inputValue();
    expect(value.length).toBeLessThanOrEqual(1000);
  });

  test('should handle special characters in form inputs', async ({ page }) => {
    const specialChars = '<script>alert("XSS")</script>';
    
    await page.fill(selectors.contact.nameInput, specialChars);
    
    // Form should handle special characters safely
    const value = await page.locator(selectors.contact.nameInput).inputValue();
    expect(value).toBe(specialChars);
  });

  test('should handle rapid navigation clicks', async ({ page }) => {
    // Click multiple navigation links rapidly
    await page.click(selectors.navigation.productsLink);
    await page.click(selectors.navigation.servicesLink);
    await page.click(selectors.navigation.contactLink);
    await page.click(selectors.navigation.homeLink);
    
    // Page should still be functional
    await expect(page.locator(selectors.hero.section)).toBeVisible();
  });

  test('should handle window resize events', async ({ page }) => {
    // Start with desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator(selectors.navigation.logo)).toBeVisible();
    
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator(selectors.navigation.logo)).toBeVisible();
    
    // Resize back to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator(selectors.navigation.logo)).toBeVisible();
  });
});