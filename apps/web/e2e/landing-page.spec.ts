import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct title and meta information', async ({ page }) => {
    await expect(page).toHaveTitle(/CryptoTracker/);
    
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /crypto portfolio management/);
  });

  test('displays hero section with call-to-action', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Smart Crypto Portfolio');
    await expect(page.locator('h1')).toContainText('Management');
    
    const getStartedButton = page.getByRole('link', { name: /get started/i });
    await expect(getStartedButton).toBeVisible();
    await expect(getStartedButton).toHaveAttribute('href', '/dashboard');
    
    const learnMoreLink = page.getByRole('link', { name: /learn more/i });
    await expect(learnMoreLink).toBeVisible();
    await expect(learnMoreLink).toHaveAttribute('href', '/about');
  });

  test('displays features section', async ({ page }) => {
    await expect(page.getByText('Features')).toBeVisible();
    await expect(page.getByText('Everything you need to track crypto')).toBeVisible();
    
    // Check all feature cards
    await expect(page.getByText('Real-time Portfolio Tracking')).toBeVisible();
    await expect(page.getByText('Market Sentiment Analysis')).toBeVisible();
    await expect(page.getByText('Educational Resources')).toBeVisible();
    
    // Check feature icons
    await expect(page.getByText('📊')).toBeVisible();
    await expect(page.getByText('🧠')).toBeVisible();
    await expect(page.getByText('📚')).toBeVisible();
  });

  test('displays stats section with metrics', async ({ page }) => {
    await expect(page.getByText('Active Users')).toBeVisible();
    await expect(page.getByText('10,000+')).toBeVisible();
    
    await expect(page.getByText('Crypto Assets Tracked')).toBeVisible();
    await expect(page.getByText('500+')).toBeVisible();
    
    await expect(page.getByText('Total Portfolio Value')).toBeVisible();
    await expect(page.getByText('$50M+')).toBeVisible();
    
    await expect(page.getByText('Market Updates Daily')).toBeVisible();
    await expect(page.getByText('1M+')).toBeVisible();
  });

  test('displays testimonials section', async ({ page }) => {
    await expect(page.getByText('Testimonials')).toBeVisible();
    await expect(page.getByText('Trusted by crypto enthusiasts')).toBeVisible();
    
    // Check testimonial content
    await expect(page.getByText(/CryptoTracker has completely transformed/)).toBeVisible();
    await expect(page.getByText('Sarah Chen')).toBeVisible();
    await expect(page.getByText('Crypto Investor')).toBeVisible();
  });

  test('displays call-to-action section', async ({ page }) => {
    await expect(page.getByText('Start tracking your crypto portfolio today')).toBeVisible();
    
    const signupButton = page.getByRole('link', { name: /get started for free/i });
    await expect(signupButton).toBeVisible();
    await expect(signupButton).toHaveAttribute('href', '/signup');
    
    const contactLink = page.getByRole('link', { name: /contact us/i });
    await expect(contactLink).toBeVisible();
    await expect(contactLink).toHaveAttribute('href', '/contact');
  });

  test('has working navigation header', async ({ page }) => {
    // Check logo
    const logo = page.getByRole('link', { name: /cryptotracker/i }).first();
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('href', '/');
    
    // Check navigation links (desktop)
    await expect(page.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
    await expect(page.getByRole('link', { name: /portfolio/i })).toHaveAttribute('href', '/portfolio');
    await expect(page.getByRole('link', { name: /learn/i })).toHaveAttribute('href', '/education');
    
    // Check sign in button
    const signInButton = page.getByRole('link', { name: /sign in/i });
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toHaveAttribute('href', '/login');
  });

  test('has working footer', async ({ page }) => {
    await expect(page.getByText('© 2025 CryptoTracker. All rights reserved.')).toBeVisible();
    
    // Check footer links
    await expect(page.getByRole('link', { name: /about/i }).last()).toHaveAttribute('href', '/about');
    await expect(page.getByRole('link', { name: /contact/i }).last()).toHaveAttribute('href', '/contact');
    await expect(page.getByRole('link', { name: /privacy/i })).toHaveAttribute('href', '/privacy');
    await expect(page.getByRole('link', { name: /terms/i })).toHaveAttribute('href', '/terms');
  });

  test('has dark mode styling', async ({ page }) => {
    // Check that the page has dark background
    const body = page.locator('body');
    await expect(body).toHaveClass(/dark/);
    
    // Check that main content has dark theme
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Hero section should still be visible
    await expect(page.locator('h1')).toContainText('Smart Crypto Portfolio');
    
    // Navigation should be responsive (links might be hidden on mobile)
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Features should stack vertically
    await expect(page.getByText('Real-time Portfolio Tracking')).toBeVisible();
  });

  test('smooth scrolling between sections', async ({ page }) => {
    // Get initial position
    const heroSection = page.getByText('Smart Crypto Portfolio');
    await expect(heroSection).toBeVisible();
    
    // Scroll to features
    await page.getByText('Features').scrollIntoViewIfNeeded();
    await expect(page.getByText('Features')).toBeInViewport();
    
    // Scroll to stats
    await page.getByText('Active Users').scrollIntoViewIfNeeded();
    await expect(page.getByText('Active Users')).toBeInViewport();
  });
});