/**
 * re-verify-4: targeted assertions for panel-fix round 2.
 *
 * Fix A: Copy Markdown/plaintext bar is a STATIC (non-overlapping) footer in all views.
 * Fix B: "Share link" affordance is a primary filled button (not a text link).
 * Fix C: persistence — "saved on this device" note visible; custom status→bucket rules
 *         remembered per source in localStorage, "remembered" indicator shows on reload.
 * Fix D: copy-cue confirmation — "Copied ✓"/"Link copied ✓" fires on persistent button
 *         under blocked-clipboard AND during a live session (not clobbered by re-render).
 *
 * Regression guards:
 * - Share feature privacy: POST body has NO unmapped/backlog rows (from reverify3; still holds)
 * - /s/<bogusid> returns HTTP 404 + friendly message (from reverify3; still holds)
 * - Weekly Status Shipped 5 / In Progress 4 / Blocked 2 (All dates)
 *
 * All tests run against BASE_URL (http://localhost:3010 by default).
 */

import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:3010';

// ---- helpers ----

async function loadWeeklySample(page: Page) {
  await page.goto(BASE + '/');
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });
  // Switch to All dates so all rows render
  await page.locator('[data-testid="week-filter"]').selectOption('all');
  await expect(page.getByRole('heading', { name: /Shipped \(5\)/i }).first()).toBeVisible({ timeout: 5000 });
}

async function loadChangesSample(page: Page) {
  await page.goto(BASE + '/');
  await page.locator('[data-testid="tab-changes"]').click();
  await page.locator('[data-testid="changes-load-sample"]').click();
  await expect(page.locator('[data-testid="changes-prose-summary"]')).toBeVisible({ timeout: 10000 });
}

// ---- Fix A: Copy bar non-overlap at 1280px and 375px ----

test('FIX-A-weekly-1280: Copy bar is static footer (not fixed/sticky) — Weekly Status at 1280px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadWeeklySample(page);

  // Scroll to bottom to expose any overlap with last row
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);

  const mdBtn = page.locator('button[aria-label="Copy as Markdown"]');
  await expect(mdBtn).toBeVisible();

  // The copy bar must NOT be position:fixed or position:sticky (it must be a static footer)
  const copyBarPosition = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Copy as Markdown"]');
    if (!btn) return null;
    const bar = btn.closest('div');
    return bar ? window.getComputedStyle(bar).position : null;
  });
  // Static footer: position should be 'static' or 'relative', NOT 'fixed' or 'sticky'
  expect(copyBarPosition).not.toBe('fixed');
  expect(copyBarPosition).not.toBe('sticky');
});

test('FIX-A-weekly-375: Copy bar is static footer — Weekly Status at 375px mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await loadWeeklySample(page);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);

  const mdBtn = page.locator('button[aria-label="Copy as Markdown"]');
  await expect(mdBtn).toBeVisible();

  const copyBarPosition = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Copy as Markdown"]');
    if (!btn) return null;
    const bar = btn.closest('div');
    return bar ? window.getComputedStyle(bar).position : null;
  });
  expect(copyBarPosition).not.toBe('fixed');
  expect(copyBarPosition).not.toBe('sticky');
});

test('FIX-A-changes-1280: Copy bar is static footer — Changes view at 1280px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadChangesSample(page);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);

  const mdBtn = page.locator('button[aria-label="Copy as Markdown"]');
  await expect(mdBtn).toBeVisible();

  const copyBarPosition = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Copy as Markdown"]');
    if (!btn) return null;
    const bar = btn.closest('div');
    return bar ? window.getComputedStyle(bar).position : null;
  });
  expect(copyBarPosition).not.toBe('fixed');
  expect(copyBarPosition).not.toBe('sticky');
});

test('FIX-A-changes-375: Copy bar is static footer — Changes view at 375px mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await loadChangesSample(page);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);

  const mdBtn = page.locator('button[aria-label="Copy as Markdown"]');
  await expect(mdBtn).toBeVisible();

  const copyBarPosition = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Copy as Markdown"]');
    if (!btn) return null;
    const bar = btn.closest('div');
    return bar ? window.getComputedStyle(bar).position : null;
  });
  expect(copyBarPosition).not.toBe('fixed');
  expect(copyBarPosition).not.toBe('sticky');
});

// ---- Fix B: Share link is primary filled button ----

test('FIX-B-share-btn-primary: Share link button is filled/primary (not text link)', async ({ page }) => {
  await loadWeeklySample(page);

  const shareBtn = page.locator('[data-testid="share-create-link-btn"]');
  await expect(shareBtn).toBeVisible();

  // Must have "Share link" text (contains "link")
  const label = await shareBtn.textContent();
  expect(label?.toLowerCase()).toContain('link');

  // Must be visually distinct from Copy buttons: has a non-transparent background (filled button)
  const bgColor = await shareBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  // A plain/ghost button has 'rgba(0, 0, 0, 0)' or 'transparent' background
  // A filled button returns any color value that isn't transparent (rgb, lab, oklch etc.)
  const isTransparent = bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent' || bgColor === '';
  expect(isTransparent).toBe(false);
});

// ---- Fix C(i): "saved on this device" note visible after data loads ----

test('FIX-C-saved-note: "saved on this device" note is visible in Weekly Status digest view', async ({ page }) => {
  await loadWeeklySample(page);

  const savedNote = page.locator('[data-testid="saved-on-device-note"]');
  await expect(savedNote).toBeVisible();
  const noteText = await savedNote.textContent();
  expect(noteText?.toLowerCase()).toMatch(/saved.*(device|this)/i);
});

// ---- Fix C(ii): custom status→bucket rule persists across re-load ----

test('FIX-C-persistence: re-bucket "Needs Triage Review" → persisted rule auto-maps on reload', async ({ page }) => {
  // First visit: clean state (clear localStorage first)
  await page.goto(BASE + '/');
  await page.evaluate(() => {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('standupdigest')) localStorage.removeItem(k);
    });
  });

  // Load sample data
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });
  // Switch to All dates so unmapped row (ENG-15 / "Audit accessibility issues") is visible
  await page.locator('[data-testid="week-filter"]').selectOption('all');
  await expect(page.getByRole('heading', { name: /Shipped \(5\)/i }).first()).toBeVisible({ timeout: 5000 });

  // The unmapped row title is "Audit accessibility issues"; aria-label is 'Move "Audit accessibility issues" to bucket'
  const moveSelect = page.locator('select[aria-label*="Audit accessibility issues"]');
  await expect(moveSelect).toBeVisible({ timeout: 5000 });
  await moveSelect.selectOption('In Progress');

  // Verify it disappeared from Unmapped section (select gone)
  await expect(moveSelect).not.toBeVisible({ timeout: 3000 });

  // Now RELOAD the page and load sample again (same context, localStorage persists)
  await page.reload();
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });
  await page.locator('[data-testid="week-filter"]').selectOption('all');
  await expect(page.getByRole('heading', { name: /Shipped \(5\)/i }).first()).toBeVisible({ timeout: 5000 });

  // The rule should have been remembered: "Audit accessibility issues" (was "Needs Triage Review")
  // should be auto-mapped to In Progress, so it should NOT appear in Unmapped
  const moveSelectAfterReload = page.locator('select[aria-label*="Audit accessibility issues"]');
  const unmappedCount = await moveSelectAfterReload.count();
  expect(unmappedCount).toBe(0);

  // The "remembered" indicator should be visible (shows when autoAppliedCount > 0)
  const rememberedText = page.locator('text=remembered from last time');
  await expect(rememberedText).toBeVisible({ timeout: 3000 });
});

// ---- Fix D: copy-cue confirmation under blocked clipboard ----

test('FIX-D-copy-md-blocked: "Copied ✓" fires on Markdown button even with clipboard blocked', async ({ page }) => {
  await loadWeeklySample(page);

  // Block navigator.clipboard.writeText
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => { throw new Error('Clipboard blocked'); },
      },
      configurable: true,
    });
  });

  const mdBtn = page.locator('button[aria-label="Copy as Markdown"]');
  await mdBtn.click();
  // Optimistic flip must fire even though clipboard threw
  await expect(mdBtn.locator('span[aria-live="polite"]')).toHaveText('Copied ✓', { timeout: 3000 });
});

test('FIX-D-copy-pt-blocked: "Copied ✓" fires on plain-text button even with clipboard blocked', async ({ page }) => {
  await loadWeeklySample(page);

  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => { throw new Error('Clipboard blocked'); },
      },
      configurable: true,
    });
  });

  const ptBtn = page.locator('button[aria-label="Copy as plain text"]');
  await ptBtn.click();
  await expect(ptBtn.locator('span[aria-live="polite"]')).toHaveText('Copied ✓', { timeout: 3000 });
});

test('FIX-D-copy-link-blocked: "Link copied ✓" fires on Copy link button even with clipboard blocked', async ({ page }) => {
  await loadWeeklySample(page);

  // Create share link first
  await page.locator('[data-testid="share-create-link-btn"]').click();
  await expect(page.locator('[data-testid="share-disclosure-panel"]')).toBeVisible({ timeout: 3000 });

  // Block clipboard BEFORE confirming
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => { throw new Error('Clipboard blocked'); },
      },
      configurable: true,
    });
  });

  await page.locator('[data-testid="share-confirm-btn"]').click();
  await expect(page.locator('[data-testid="share-link-panel"]')).toBeVisible({ timeout: 15000 });

  const copyLinkBtn = page.locator('[data-testid="share-copy-link-btn"]');
  await copyLinkBtn.click();
  // Optimistic flip even under blocked clipboard
  await expect(copyLinkBtn.locator('span[aria-live="polite"]')).toHaveText('Link copied ✓', { timeout: 3000 });
});

test('FIX-D-copy-cue-not-clobbered-by-render: "Copied ✓" cue persists ~1s after click (not clobbered by re-render)', async ({ page }) => {
  // This catches the case where a re-render would reset the cue state
  await loadWeeklySample(page);

  const mdBtn = page.locator('button[aria-label="Copy as Markdown"]');
  await mdBtn.click();

  // Assert at 50ms
  await page.waitForTimeout(50);
  await expect(mdBtn.locator('span[aria-live="polite"]')).toHaveText('Copied ✓');

  // Assert at ~800ms — still showing (2s timeout in the component)
  await page.waitForTimeout(750);
  await expect(mdBtn.locator('span[aria-live="polite"]')).toHaveText('Copied ✓');
});

// ---- Item 1: Share privacy — POST body has only 3 status buckets ----

test('ITEM1-share-post-body: POST to /api/digest-share has only Shipped/InProgress/Blocked (no unmapped/backlog)', async ({ page }) => {
  let capturedBody: string | null = null;
  await page.route('**/api/digest-share', async (route, request) => {
    if (request.method() === 'POST') {
      capturedBody = request.postData();
    }
    await route.continue();
  });

  await loadWeeklySample(page);

  await page.locator('[data-testid="share-create-link-btn"]').click();
  await expect(page.locator('[data-testid="share-disclosure-panel"]')).toBeVisible({ timeout: 3000 });
  await page.locator('[data-testid="share-confirm-btn"]').click();
  await expect(page.locator('[data-testid="share-link-panel"]')).toBeVisible({ timeout: 15000 });

  expect(capturedBody).not.toBeNull();
  const body = capturedBody!.toLowerCase();
  expect(body).not.toContain('unmapped');
  expect(body).not.toContain('needs triage review');
  expect(body).not.toContain('backlog');
});

test('ITEM1-share-view-readonly: /s/<id> renders read-only (no dropzone, no "Load sample data")', async ({ page }) => {
  await loadWeeklySample(page);

  await page.locator('[data-testid="share-create-link-btn"]').click();
  await expect(page.locator('[data-testid="share-disclosure-panel"]')).toBeVisible({ timeout: 3000 });
  await page.locator('[data-testid="share-confirm-btn"]').click();
  await expect(page.locator('[data-testid="share-link-panel"]')).toBeVisible({ timeout: 15000 });

  const urlField = page.locator('[data-testid="share-url-field"]');
  const shareUrl = await urlField.inputValue();
  expect(shareUrl).toContain('/s/');

  const freshPage = await page.context().newPage();
  await freshPage.goto(shareUrl);
  await expect(freshPage.locator('text=This week the team shipped').first()).toBeVisible({ timeout: 10000 });

  // Must have footer
  await expect(freshPage.locator('text=no signup').first()).toBeVisible();
  // Must NOT have dropzone/load-sample
  expect(await freshPage.locator('button:has-text("Load sample data")').count()).toBe(0);
  expect(await freshPage.locator('[data-testid="share-create-link-btn"]').count()).toBe(0);
  await freshPage.close();
});

test('ITEM1-bogus-id-404: GET /s/bogusid404test returns HTTP 404 with friendly message', async ({ page, request }) => {
  const response = await request.get(BASE + '/s/bogusid404test');
  expect(response.status()).toBe(404);

  await page.goto(BASE + '/s/bogusid404test', { waitUntil: 'domcontentloaded' });
  const friendlyMsg = page.locator('text=no longer available').or(
    page.locator('text=expired').or(
      page.locator('text=not found').or(
        page.locator('text=invalid')
      )
    )
  );
  await expect(friendlyMsg.first()).toBeVisible({ timeout: 5000 });
});

// ---- Regression: Weekly Status bucket counts unchanged ----

test('REGRESSION-weekly-buckets: Shipped 5 / In Progress 4 / Blocked 2 (All dates) still holds', async ({ page }) => {
  await loadWeeklySample(page);
  await expect(page.getByRole('heading', { name: /Shipped \(5\)/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /In Progress \(4\)/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /Blocked \(2\)/i }).first()).toBeVisible();
});
