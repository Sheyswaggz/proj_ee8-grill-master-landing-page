import { test, expect } from '@playwright/test';
import { HtmlValidate } from 'html-validate';

test.describe('HTML Validation Tests', () => {
  let htmlValidator;

  test.beforeAll(() => {
    htmlValidator = new HtmlValidate({
      extends: ['html-validate:recommended'],
      rules: {
        'doctype-html': 'error',
        'no-trailing-whitespace': 'off',
        'void-style': ['error', { style: 'omit' }],
        'attr-quotes': ['error', { style: 'double', unquoted: false }],
        'element-required-attributes': 'error',
        'element-permitted-content': 'error',
        'element-permitted-occurrences': 'error',
        'no-deprecated-attr': 'error',
        'no-dup-attr': 'error',
        'no-dup-id': 'error',
        'no-missing-references': 'error',
        'require-sri': 'off',
        'wcag/h30': 'error',
        'wcag/h32': 'error',
        'wcag/h37': 'error',
        'wcag/h63': 'error',
        'wcag/h67': 'error',
        'wcag/h71': 'error',
        'no-inline-style': 'off',
        'no-implicit-close': 'error',
        'no-raw-characters': 'error',
        'attribute-boolean-style': ['error', { style: 'omit' }],
        'attribute-empty-style': ['error', { style: 'omit' }],
        'heading-level': 'error',
        'input-missing-label': 'error',
        'meta-refresh': 'error',
        'no-abstract-role': 'error',
        'no-redundant-role': 'error',
        'prefer-native-element': 'error',
        'valid-id': 'error',
        'aria-label-misuse': 'error',
        'aria-hidden-body': 'error',
        'long-title': 'off',
        'no-unknown-elements': 'error'
      }
    });
  });

  test('should validate HTML5 doctype declaration', async ({ page }) => {
    await page.goto('/');
    const htmlContent = await page.content();

    const report = htmlValidator.validateString(htmlContent);

    const doctypeErrors = report.results[0]?.messages.filter(
      (msg) => msg.ruleId === 'doctype-html'
    );

    expect(doctypeErrors?.length || 0).toBe(0);
    expect(htmlContent).toMatch(/^<!DOCTYPE html>/i);
  });

  test('should have valid HTML structure with no validation errors', async ({
    page
  }) => {
    await page.goto('/');
    const htmlContent = await page.content();

    const report = htmlValidator.validateString(htmlContent);

    const errors = report.results[0]?.messages.filter(
      (msg) => msg.severity === 2
    );

    if (errors && errors.length > 0) {
      console.error('HTML Validation Errors:', JSON.stringify(errors, null, 2));
    }

    expect(report.valid).toBe(true);
    expect(errors?.length || 0).toBe(0);
  });

  test('should have proper semantic HTML5 elements', async ({ page }) => {
    await page.goto('/');

    const semanticElements = {
      header: await page.locator('header').count(),
      nav: await page.locator('nav').count(),
      main: await page.locator('main').count(),
      section: await page.locator('section').count(),
      article: await page.locator('article').count(),
      footer: await page.locator('footer').count()
    };

    expect(semanticElements.header).toBeGreaterThanOrEqual(1);
    expect(semanticElements.nav).toBeGreaterThanOrEqual(1);
    expect(semanticElements.main).toBe(1);
    expect(semanticElements.section).toBeGreaterThanOrEqual(1);
    expect(semanticElements.footer).toBe(1);
  });

  test('should have valid heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingLevels = [];

    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName.toLowerCase());
      const level = parseInt(tagName.substring(1));
      headingLevels.push(level);
    }

    expect(headingLevels[0]).toBe(1);

    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1];
      expect(diff).toBeLessThanOrEqual(1);
    }
  });

  test('should have valid meta tags', async ({ page }) => {
    await page.goto('/');

    const charset = await page.locator('meta[charset]').getAttribute('charset');
    expect(charset?.toLowerCase()).toBe('utf-8');

    const viewport = await page
      .locator('meta[name="viewport"]')
      .getAttribute('content');
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1');

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(description).toBeTruthy();
    expect(description.length).toBeGreaterThan(50);
    expect(description.length).toBeLessThan(160);

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThan(70);
  });

  test('should have valid accessibility attributes', async ({ page }) => {
    await page.goto('/');

    const imagesWithoutAlt = await page
      .locator('img:not([alt])')
      .count();
    expect(imagesWithoutAlt).toBe(0);

    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeDefined();
    }

    const inputsWithoutLabels = await page.evaluate(() => {
      const inputs = Array.from(
        document.querySelectorAll('input:not([type="hidden"])')
      );
      return inputs.filter((input) => {
        const id = input.id;
        if (!id) return true;
        const label = document.querySelector(`label[for="${id}"]`);
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledby = input.getAttribute('aria-labelledby');
        return !label && !ariaLabel && !ariaLabelledby;
      }).length;
    });
    expect(inputsWithoutLabels).toBe(0);

    const mainLandmark = await page.locator('main').count();
    expect(mainLandmark).toBe(1);

    const navElements = await page.locator('nav').all();
    for (const nav of navElements) {
      const ariaLabel = await nav.getAttribute('aria-label');
      const ariaLabelledby = await nav.getAttribute('aria-labelledby');
      expect(ariaLabel || ariaLabelledby).toBeTruthy();
    }
  });

  test('should have valid form elements', async ({ page }) => {
    await page.goto('/');

    const forms = await page.locator('form').all();

    for (const form of forms) {
      const action = await form.getAttribute('action');
      const method = await form.getAttribute('method');

      expect(action).toBeTruthy();
      if (method) {
        expect(['GET', 'POST']).toContain(method.toUpperCase());
      }

      const requiredInputs = await form
        .locator('input[required], textarea[required]')
        .all();

      for (const input of requiredInputs) {
        const ariaRequired = await input.getAttribute('aria-required');
        expect(ariaRequired).toBe('true');
      }
    }
  });

  test('should have valid link elements', async ({ page }) => {
    await page.goto('/');

    const links = await page.locator('a[href]').all();

    for (const link of links) {
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');

      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const ariaLabelledby = await link.getAttribute('aria-labelledby');

      expect(
        text?.trim() || ariaLabel || ariaLabelledby
      ).toBeTruthy();

      const target = await link.getAttribute('target');
      if (target === '_blank') {
        const rel = await link.getAttribute('rel');
        expect(rel).toContain('noopener');
      }
    }
  });

  test('should have no duplicate IDs', async ({ page }) => {
    await page.goto('/');

    const duplicateIds = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll('[id]')).map(
        (el) => el.id
      );
      const duplicates = ids.filter(
        (id, index) => ids.indexOf(id) !== index
      );
      return [...new Set(duplicates)];
    });

    expect(duplicateIds).toHaveLength(0);
  });

  test('should have valid ARIA attributes', async ({ page }) => {
    await page.goto('/');

    const elementsWithAriaLabel = await page
      .locator('[aria-label]')
      .all();

    for (const element of elementsWithAriaLabel) {
      const ariaLabel = await element.getAttribute('aria-label');
      expect(ariaLabel?.trim()).toBeTruthy();
      expect(ariaLabel.length).toBeGreaterThan(0);
    }

    const elementsWithAriaLabelledby = await page
      .locator('[aria-labelledby]')
      .all();

    for (const element of elementsWithAriaLabelledby) {
      const ariaLabelledby = await element.getAttribute('aria-labelledby');
      const referencedElement = await page
        .locator(`#${ariaLabelledby}`)
        .count();
      expect(referencedElement).toBeGreaterThan(0);
    }

    const elementsWithRole = await page.locator('[role]').all();

    const validRoles = [
      'banner',
      'navigation',
      'main',
      'contentinfo',
      'button',
      'link',
      'menubar',
      'menuitem',
      'list',
      'listitem',
      'alert',
      'status',
      'none'
    ];

    for (const element of elementsWithRole) {
      const role = await element.getAttribute('role');
      expect(validRoles).toContain(role);
    }
  });

  test('should have valid language attribute', async ({ page }) => {
    await page.goto('/');

    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
  });

  test('should have proper button elements', async ({ page }) => {
    await page.goto('/');

    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      const type = await button.getAttribute('type');
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      if (type) {
        expect(['button', 'submit', 'reset']).toContain(type);
      }

      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });

  test('should validate W3C HTML compliance', async ({ page }) => {
    await page.goto('/');
    const htmlContent = await page.content();

    const report = htmlValidator.validateString(htmlContent);

    const criticalErrors = report.results[0]?.messages.filter(
      (msg) =>
        msg.severity === 2 &&
        ![
          'no-trailing-whitespace',
          'require-sri',
          'no-inline-style',
          'long-title'
        ].includes(msg.ruleId)
    );

    if (criticalErrors && criticalErrors.length > 0) {
      console.error(
        'W3C Compliance Errors:',
        JSON.stringify(criticalErrors, null, 2)
      );
    }

    expect(criticalErrors?.length || 0).toBe(0);
  });

  test('should have valid table structure if tables exist', async ({
    page
  }) => {
    await page.goto('/');

    const tables = await page.locator('table').all();

    for (const table of tables) {
      const caption = await table.locator('caption').count();
      const thead = await table.locator('thead').count();
      const tbody = await table.locator('tbody').count();

      if (tables.length > 0) {
        expect(caption + thead).toBeGreaterThan(0);
      }

      const thElements = await table.locator('th').all();
      for (const th of thElements) {
        const scope = await th.getAttribute('scope');
        if (scope) {
          expect(['row', 'col', 'rowgroup', 'colgroup']).toContain(scope);
        }
      }
    }
  });

  test('should have valid list structure', async ({ page }) => {
    await page.goto('/');

    const lists = await page.locator('ul, ol').all();

    for (const list of lists) {
      const children = await list.locator('> *').all();

      for (const child of children) {
        const tagName = await child.evaluate((el) =>
          el.tagName.toLowerCase()
        );
        expect(tagName).toBe('li');
      }
    }
  });
});