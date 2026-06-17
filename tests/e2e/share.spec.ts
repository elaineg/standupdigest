/**
 * Share link tests (APP_SPEC success checks 24–28).
 *
 * SC24: "Create shareable link" / "Share link" control is visible near digest header
 *       and is visually/lexically distinct from Copy buttons (label contains "link"/"Share",
 *       not "Copy").
 * SC25: Privacy disclosure panel appears before any POST; shows what's uploaded vs stays local.
 *       The page-level privacy claim is unqualified before share; becomes mode-aware after.
 * SC26: Shared read-only view renders same content with NO editing controls, NO dropzone.
 * SC27: Shared view has footer "Made free with StandupDigest — no signup" linking to home,
 *       and is legible at 375px width (single column, no horizontal scroll).
 * SC28: "Copy link" button flips to solid-green "Link copied ✓" with aria-live,
 *       still flips when clipboard is blocked (fallback).
 *
 * NOTE: These tests require TURSO_DATABASE_URL / TURSO_AUTH_TOKEN env vars to be set
 *       for the link to actually write to the DB. When those are absent the server falls
 *       back to a local SQLite file, so the tests work locally too.
 */

import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:3210';

async function loadSampleAndGetDigest(page: Page) {
  await page.goto(BASE + '/');
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });
}

// ---- SC24: Share link control is visible and distinct from Copy buttons ----

test('SC24: "Share link" control is visible in digest header after sample loads', async ({ page }) => {
  await loadSampleAndGetDigest(page);

  // The share button must be visible
  const shareBtn = page.locator('[data-testid="share-create-link-btn"]');
  await expect(shareBtn).toBeVisible({ timeout: 5000 });

  // Its label must contain "Share" or "link" (case-insensitive), NOT "Copy"
  const label = await shareBtn.innerText();
  const normalizedLabel = label.toLowerCase();
  expect(normalizedLabel.includes('share') || normalizedLabel.includes('link')).toBe(true);
  expect(normalizedLabel.includes('copy')).toBe(false);
});

test('SC24: Share link control is distinct from Copy buttons (different aria-label)', async ({ page }) => {
  await loadSampleAndGetDigest(page);

  // Copy buttons
  const mdBtn = page.locator('button[aria-label="Copy as Markdown"]');
  const ptBtn = page.locator('button[aria-label="Copy as plain text"]');
  await expect(mdBtn).toBeVisible();
  await expect(ptBtn).toBeVisible();

  // Share button must have a different aria-label than the copy buttons
  const shareBtn = page.locator('[data-testid="share-create-link-btn"]');
  const shareLabel = await shareBtn.getAttribute('aria-label');
  expect(shareLabel).not.toBe('Copy as Markdown');
  expect(shareLabel).not.toBe('Copy as plain text');
  // Must contain "link" or "share" (case-insensitive)
  expect(shareLabel?.toLowerCase()).toMatch(/link|share/);
});

test('SC24: Share link control is also present on Sprint Review tab', async ({ page }) => {
  await loadSampleAndGetDigest(page);
  await page.locator('[data-testid="tab-sprint"]').click();
  await expect(page.locator('[data-testid="velocity-headline"]')).toBeVisible({ timeout: 5000 });

  const shareBtn = page.locator('[data-testid="share-create-link-btn"]');
  await expect(shareBtn).toBeVisible({ timeout: 3000 });
});

test('SC24: Share link control is present on Changes tab after loading sample', async ({ page }) => {
  await page.goto(BASE + '/');
  await page.locator('[data-testid="tab-changes"]').click();
  await page.locator('[data-testid="changes-load-sample"]').click();
  await expect(page.locator('[data-testid="changes-prose-summary"]')).toBeVisible({ timeout: 10000 });

  // Share button should appear in the Changes header once digest is rendered
  const shareBtn = page.locator('[data-testid="share-create-link-btn"]');
  await expect(shareBtn).toBeVisible({ timeout: 3000 });
});

// ---- SC25: Privacy disclosure appears before POST; privacy claim is mode-aware ----

test('SC25: clicking Share shows privacy disclosure (not a silent POST)', async ({ page }) => {
  await loadSampleAndGetDigest(page);

  const shareBtn = page.locator('[data-testid="share-create-link-btn"]');
  await shareBtn.click();

  // Disclosure panel must appear
  const disclosure = page.locator('[data-testid="share-disclosure-panel"]');
  await expect(disclosure).toBeVisible({ timeout: 3000 });

  // Must mention what's uploaded
  const text = await disclosure.innerText();
  expect(text.toLowerCase()).toContain('uploaded');
  // Must mention what stays local
  expect(text.toLowerCase()).toMatch(/stays|device|never upload/);
  // Must mention the confidentiality warning
  expect(text.toLowerCase()).toContain('confidential');
});

test('SC25: privacy claim is absolute/unqualified before any share link is created', async ({ page }) => {
  await loadSampleAndGetDigest(page);

  const claim = page.locator('[data-testid="privacy-claim"]');
  await expect(claim).toBeVisible({ timeout: 3000 });
  const text = await claim.innerText();
  // Must be the absolute claim
  expect(text.toLowerCase()).toMatch(/never leaves|no upload/);
  // Must NOT have hedging language like "you've shared"
  expect(text.toLowerCase()).not.toContain("you've shared");
  expect(text.toLowerCase()).not.toContain("you have shared");
});

test('SC25: clicking Cancel on disclosure hides it without creating a link', async ({ page }) => {
  await loadSampleAndGetDigest(page);

  const shareBtn = page.locator('[data-testid="share-create-link-btn"]');
  await shareBtn.click();

  const disclosure = page.locator('[data-testid="share-disclosure-panel"]');
  await expect(disclosure).toBeVisible({ timeout: 3000 });

  // Click Cancel
  await page.locator('[data-testid="share-disclosure-panel"]').locator('text=Cancel').click();

  // Disclosure should be gone, share button reappears
  await expect(disclosure).not.toBeVisible({ timeout: 2000 });
  await expect(shareBtn).toBeVisible();
});

// ---- SC26+SC27+SC28: Full share link flow (requires Turso/local fallback DB) ----

test('SC26+SC27+SC28: full share flow — create link, open shared view, copy link', async ({ page }) => {
  await loadSampleAndGetDigest(page);

  // Open disclosure
  const shareBtn = page.locator('[data-testid="share-create-link-btn"]');
  await shareBtn.click();
  await expect(page.locator('[data-testid="share-disclosure-panel"]')).toBeVisible({ timeout: 3000 });

  // Confirm
  const confirmBtn = page.locator('[data-testid="share-confirm-btn"]');
  await confirmBtn.click();

  // Wait for URL to appear in the share panel
  const sharePanel = page.locator('[data-testid="share-link-panel"]');
  await expect(sharePanel).toBeVisible({ timeout: 15000 });

  // The URL field must contain the base URL and /s/
  const urlField = page.locator('[data-testid="share-url-field"]');
  await expect(urlField).toBeVisible();
  const shareUrl = await urlField.inputValue();
  expect(shareUrl).toContain('/s/');
  expect(shareUrl).toContain(new URL(BASE).host);

  // SC28: Copy link button flips to "Link copied ✓"
  const copyLinkBtn = page.locator('[data-testid="share-copy-link-btn"]');
  await expect(copyLinkBtn).toBeVisible();
  await copyLinkBtn.click();
  await expect(copyLinkBtn.locator('span[aria-live="polite"]')).toHaveText('Link copied ✓', { timeout: 3000 });

  // SC26: Open the shared URL in a new page
  const newPage = await page.context().newPage();
  await newPage.goto(shareUrl);

  // Must show the digest content (prose summary text)
  await expect(newPage.locator('text=This week the team shipped').first()).toBeVisible({ timeout: 10000 });

  // SC26: Must NOT have dropzone
  const dropzone = newPage.locator('input[type="file"]');
  expect(await dropzone.count()).toBe(0);

  // SC26: Must NOT have "Load sample data" button
  const loadSampleBtn = newPage.locator('button:has-text("Load sample data")');
  expect(await loadSampleBtn.count()).toBe(0);

  // SC26: Must NOT have Create shareable link control
  const shareLinkBtn = newPage.locator('[data-testid="share-create-link-btn"]');
  expect(await shareLinkBtn.count()).toBe(0);

  // SC27: Footer with "Made free with StandupDigest — no signup"
  await expect(newPage.locator('text=Made free with')).toBeVisible();
  await expect(newPage.locator('text=no signup')).toBeVisible();

  // SC27: Footer link points to the app home
  const footerLink = newPage.locator('a', { hasText: 'StandupDigest' }).first();
  const href = await footerLink.getAttribute('href');
  expect(href).toBe('/');

  // SC27: Legible at 375px (no horizontal scroll)
  await newPage.setViewportSize({ width: 375, height: 812 });
  const scrollWidth = await newPage.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await newPage.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px tolerance for scrollbar

  await newPage.close();
});

test('SC28: Copy link still flips "Link copied ✓" when clipboard is blocked', async ({ page }) => {
  // Block clipboard before navigation
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: () => Promise.reject(new Error('Clipboard blocked by test')),
      },
      configurable: true,
    });
  });

  await page.goto(BASE + '/');
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });

  // Open disclosure and confirm
  const shareBtn = page.locator('[data-testid="share-create-link-btn"]');
  await shareBtn.click();
  await expect(page.locator('[data-testid="share-disclosure-panel"]')).toBeVisible({ timeout: 3000 });
  await page.locator('[data-testid="share-confirm-btn"]').click();

  // Wait for link panel
  await expect(page.locator('[data-testid="share-link-panel"]')).toBeVisible({ timeout: 15000 });

  // Copy link — should flip even with blocked clipboard (textarea fallback)
  const copyLinkBtn = page.locator('[data-testid="share-copy-link-btn"]');
  await copyLinkBtn.click();
  await expect(copyLinkBtn.locator('span[aria-live="polite"]')).toHaveText('Link copied ✓', { timeout: 3000 });
});
