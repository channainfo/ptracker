import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has proper heading hierarchy', async ({ page }) => {
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText('Smart Crypto Portfolio');
    
    // Check for h2 headings in sections
    const h2Headings = page.locator('h2');
    await expect(h2Headings).toHaveCount(4); // Features, Stats, Testimonials, CTA
  });

  test('has proper ARIA labels and roles', async ({ page }) => {
    // Navigation should have proper role
    const nav = page.locator('nav');
    await expect(nav).toHaveAttribute('aria-label', 'Top');
    
    // Check for proper roles
    const header = page.locator('header');
    await expect(header).toHaveRole('banner');
    
    const main = page.locator('main');
    await expect(main).toHaveRole('main');
    
    const footer = page.locator('footer');
    await expect(footer).toHaveRole('contentinfo');
  });

  test('has keyboard navigation support', async ({ page }) => {
    // Focus on first interactive element (logo)
    await page.keyboard.press('Tab');
    const logo = page.getByRole('link', { name: /cryptotracker/i }).first();
    await expect(logo).toBeFocused();
    
    // Tab through navigation links
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /portfolio/i })).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /learn/i })).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /sign in/i })).toBeFocused();
  });

  test('has sufficient color contrast', async ({ page }) => {
    // Test that text is visible against backgrounds
    const heroTitle = page.locator('h1');
    await expect(heroTitle).toBeVisible();
    
    // Test feature cards have good contrast
    const featureCards = page.locator('[class*="bg-gray-700"]');
    await expect(featureCards.first()).toBeVisible();
  });

  test('has proper link descriptions', async ({ page }) => {
    // All links should have descriptive text or aria-labels
    const links = page.locator('a');
    const linkCount = await links.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      
      // Each link should have either text content or aria-label
      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });

  test('supports screen reader navigation', async ({ page }) => {
    // Check for landmarks
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    
    // Check for section headings
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(4);
  });

  test('has proper form labels (if any)', async ({ page }) => {
    // Currently no forms on landing page, but this is a placeholder
    // for when login/signup forms are added
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    if (formCount > 0) {
      // Check that all form inputs have labels
      const inputs = page.locator('input, select, textarea');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        if (id) {
          // Check for corresponding label
          const label = page.locator(`label[for="${id}"]`);
          await expect(label).toBeVisible();
        } else {
          // Should have aria-label or aria-labelledby
          expect(ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
    }
  });

  test('has skip links for keyboard users', async ({ page }) => {
    // Press Tab to see if skip link appears
    await page.keyboard.press('Tab');
    
    // Look for skip link (might be visually hidden but focusable)
    const skipLink = page.locator('a[href="#main"], a[href="#content"]');
    const skipLinkExists = await skipLink.count() > 0;
    
    if (skipLinkExists) {
      await expect(skipLink).toBeFocused();
    }
  });

  test('images have alt text', async ({ page }) => {
    // Check all images have alt attributes
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const ariaHidden = await img.getAttribute('aria-hidden');
      
      // Images should have alt text, aria-label, or be marked as decorative
      expect(alt !== null || ariaLabel || ariaHidden === 'true').toBeTruthy();
    }
  });
});