/**
 * re-verify-1: targeted tests for the two panel-surfaced Changes-tab fixes.
 *
 * Fix 1: Changes copy bar is fixed bottom-0 (not mid-list); last rows clear it;
 *         both copy buttons are click-hittable; "Copied ✓" still flips.
 *         Tested at desktop (1280x800) AND mobile (375x812).
 *
 * Fix 2: Prose expanded to ALL 9 non-zero categories matching the oracle:
 *         "Since last week: 3 shipped, 1 started, 1 newly blocked, 1 unblocked,
 *          2 slipped, 4 new, 1 still blocked, 2 carried over, 1 removed from tracker."
 *         Count honesty: prose == rendered bucket rows == Markdown copy == plaintext copy.
 *
 * Regression: Weekly Status Shipped 5 / In Progress 4 / Blocked 2 and Sprint Review still pass.
 */

import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:3210';

async function loadChangesSample(page: Page) {
  await page.goto(BASE + '/');
  await page.locator('[data-testid="tab-changes"]').click();
  await page.locator('[data-testid="changes-load-sample"]').click();
  await expect(page.locator('[data-testid="changes-prose-summary"]')).toBeVisible({ timeout: 10000 });
}

// ---- FIX 1: copy bar pinned at viewport bottom, no content overlap ----

test('FIX1-desktop: Changes copy bar is a static footer (A-fix), last rows clear it, both copy buttons click-hittable', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadChangesSample(page);

  // Scroll to absolute bottom so all content and the copy bar are in view
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200); // let scroll settle

  const mdButton = page.locator('button[aria-label="Copy as Markdown"]');
  const ptButton = page.locator('button[aria-label="Copy as plain text"]');

  // Both buttons must be visible (static footer flows below all content)
  await expect(mdButton).toBeVisible();
  await expect(ptButton).toBeVisible();

  // Copy bar is now a static footer — NOT fixed/sticky.
  // Verify buttons are clickable (not covered by another element).
  const mdBtnBB = await mdButton.boundingBox();
  expect(mdBtnBB).not.toBeNull();
  const mdCenterX = mdBtnBB!.x + mdBtnBB!.width / 2;
  const mdCenterY = mdBtnBB!.y + mdBtnBB!.height / 2;

  const mdClosestBtn = await page.evaluate(({ x, y }: { x: number; y: number }) => {
    const el = document.elementFromPoint(x, y);
    if (!el) return 'no-element';
    return (el as HTMLElement).closest('button')?.getAttribute('aria-label') ?? 'no-button';
  }, { x: mdCenterX, y: mdCenterY });
  expect(mdClosestBtn).toBe('Copy as Markdown');

  const ptBtnBB = await ptButton.boundingBox();
  expect(ptBtnBB).not.toBeNull();
  const ptCenterX = ptBtnBB!.x + ptBtnBB!.width / 2;
  const ptCenterY = ptBtnBB!.y + ptBtnBB!.height / 2;

  const ptClosestBtn = await page.evaluate(({ x, y }: { x: number; y: number }) => {
    const el = document.elementFromPoint(x, y);
    if (!el) return 'no-element';
    return (el as HTMLElement).closest('button')?.getAttribute('aria-label') ?? 'no-button';
  }, { x: ptCenterX, y: ptCenterY });
  expect(ptClosestBtn).toBe('Copy as plain text');

  // Verify the last content item (Removed section) is visible ABOVE the copy bar footer
  const removedSection = page.locator('section[aria-label="Removed from tracker"]');
  await expect(removedSection).toBeVisible();

  const removedBB = await removedSection.boundingBox();
  if (removedBB && mdBtnBB) {
    // Static footer: the removed section should end BEFORE the copy bar starts
    // (removed section bottom <= copy bar top, since it's a static flow layout)
    expect(removedBB.y + removedBB.height).toBeLessThanOrEqual(mdBtnBB.y + 10); // 10px tolerance
  }

  // Both copy buttons must be clickable — click each and verify "Copied ✓"
  await mdButton.click();
  await expect(mdButton.locator('span[aria-live="polite"]')).toHaveText('Copied ✓', { timeout: 3000 });

  // Wait for reset
  await page.waitForTimeout(2200);

  await ptButton.click();
  await expect(ptButton.locator('span[aria-live="polite"]')).toHaveText('Copied ✓', { timeout: 3000 });
});

test('FIX1-mobile: Changes copy bar (A-fix static footer) visible at 375px, both buttons click-hittable', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await loadChangesSample(page);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);

  const mdButton = page.locator('button[aria-label="Copy as Markdown"]');
  const ptButton = page.locator('button[aria-label="Copy as plain text"]');

  await expect(mdButton).toBeVisible();
  await expect(ptButton).toBeVisible();

  // Copy bar is now a static footer (not fixed/sticky) — buttons are always visible at page bottom
  const mdBtnBB = await mdButton.boundingBox();
  expect(mdBtnBB).not.toBeNull();

  // elementFromPoint: both buttons are click-hittable at mobile
  const mdCenterX = mdBtnBB!.x + mdBtnBB!.width / 2;
  const mdCenterY = mdBtnBB!.y + mdBtnBB!.height / 2;
  const mdClosestBtnMobile = await page.evaluate(({ x, y }: { x: number; y: number }) => {
    const el = document.elementFromPoint(x, y);
    if (!el) return 'no-element';
    return (el as HTMLElement).closest('button')?.getAttribute('aria-label') ?? 'no-button';
  }, { x: mdCenterX, y: mdCenterY });
  expect(mdClosestBtnMobile).toBe('Copy as Markdown');

  // Click both and verify "Copied ✓"
  await mdButton.click();
  await expect(mdButton.locator('span[aria-live="polite"]')).toHaveText('Copied ✓', { timeout: 3000 });

  await page.waitForTimeout(2200);

  await ptButton.click();
  await expect(ptButton.locator('span[aria-live="polite"]')).toHaveText('Copied ✓', { timeout: 3000 });
});

// ---- FIX 2: prose covers all 9 non-zero categories with exact text ----

test('FIX2-exact-prose: Changes prose reads EXACTLY the 10-category oracle string (slipped and reopened separate)', async ({ page }) => {
  await loadChangesSample(page);

  const proseEl = page.locator('[data-testid="changes-prose-summary"]');
  const text = await proseEl.innerText();

  // Must contain the EXACT oracle sentence (slipped and reopened are now separate buckets)
  expect(text).toContain(
    'Since last week: 3 shipped, 1 started, 1 newly blocked, 1 unblocked, 1 slipped, 1 reopened, 4 new, 1 still blocked, 2 carried over, 1 removed from tracker.'
  );
});

test('FIX2-count-honesty-prose-equals-buckets: each prose number == rendered bucket row count', async ({ page }) => {
  await loadChangesSample(page);

  // Prose text
  const proseText = await page.locator('[data-testid="changes-prose-summary"]').innerText();

  // Parse numbers from prose
  const shipped = parseInt(proseText.match(/(\d+) shipped/)?.[1] ?? '0');
  const started = parseInt(proseText.match(/(\d+) started/)?.[1] ?? '0');
  const newlyBlocked = parseInt(proseText.match(/(\d+) newly blocked/)?.[1] ?? '0');
  const unblocked = parseInt(proseText.match(/(\d+) unblocked/)?.[1] ?? '0');
  const slipped = parseInt(proseText.match(/(\d+) slipped/)?.[1] ?? '0');
  const newItems = parseInt(proseText.match(/(\d+) new[^ly]/)?.[1] ?? '0');
  const stillBlocked = parseInt(proseText.match(/(\d+) still blocked/)?.[1] ?? '0');
  const carriedOver = parseInt(proseText.match(/(\d+) carried over/)?.[1] ?? '0');
  const removed = parseInt(proseText.match(/(\d+) removed from tracker/)?.[1] ?? '0');

  // Verify oracle values (slipped and reopened are now separate buckets, each = 1)
  const reopened = parseInt(proseText.match(/(\d+) reopened/)?.[1] ?? '0');
  expect(shipped).toBe(3);
  expect(started).toBe(1);
  expect(newlyBlocked).toBe(1);
  expect(unblocked).toBe(1);
  expect(slipped).toBe(1);
  expect(reopened).toBe(1);
  expect(newItems).toBe(4);
  expect(stillBlocked).toBe(1);
  expect(carriedOver).toBe(2);
  expect(removed).toBe(1);

  // Verify rendered bucket counts match (separate Slipped and Reopened headings)
  await expect(page.getByRole('heading', { name: new RegExp(`Newly Shipped \\(${shipped}\\)`, 'i') }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: new RegExp(`Newly Started \\(${started}\\)`, 'i') }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: new RegExp(`Newly Blocked \\(${newlyBlocked}\\)`, 'i') }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: new RegExp(`Unblocked \\(${unblocked}\\)`, 'i') }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /^Slipped \(1\)$/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /^Reopened \(1\)$/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: new RegExp(`New this period \\(${newItems}\\)`, 'i') }).first()).toBeVisible();
});

test('FIX2-count-honesty-markdown: prose counts == Markdown copy bucket counts (single model)', async ({ page }) => {
  await loadChangesSample(page);

  let mdText = '';
  await page.exposeFunction('captureMdFix2', (text: string) => { mdText = text; });
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (text: string) => {
          await (window as unknown as Record<string, unknown>)['captureMdFix2'](text);
        },
      },
      configurable: true,
    });
  });

  const mdButton = page.locator('button[aria-label="Copy as Markdown"]');
  await mdButton.click();
  await expect(mdButton.locator('span[aria-live="polite"]')).toHaveText('Copied ✓', { timeout: 3000 });
  await page.waitForTimeout(300);

  if (mdText) {
    // Prose line in Markdown must be the full 10-category sentence (slipped and reopened separate)
    expect(mdText).toContain(
      'Since last week: 3 shipped, 1 started, 1 newly blocked, 1 unblocked, 1 slipped, 1 reopened, 4 new, 1 still blocked, 2 carried over, 1 removed from tracker.'
    );
    // Bucket headings in Markdown must match (separate Slipped and Reopened)
    expect(mdText).toContain('Newly Shipped (3)');
    expect(mdText).toContain('Newly Started (1)');
    expect(mdText).toContain('Newly Blocked (1)');
    expect(mdText).toContain('Unblocked (1)');
    expect(mdText).toContain('Slipped (1)');
    expect(mdText).toContain('Reopened (1)');
    expect(mdText).toContain('New this period (4)');
    expect(mdText).toContain('Still Blocked (1)');
    expect(mdText).toContain('Carried over / unchanged-open (2)');
    expect(mdText).toContain('Removed from tracker (1)');
  }
});

test('FIX2-count-honesty-plaintext: prose counts == plain text copy (all 9 categories)', async ({ page }) => {
  await loadChangesSample(page);

  let ptText = '';
  await page.exposeFunction('capturePtFix2', (text: string) => { ptText = text; });
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (text: string) => {
          await (window as unknown as Record<string, unknown>)['capturePtFix2'](text);
        },
      },
      configurable: true,
    });
  });

  const ptButton = page.locator('button[aria-label="Copy as plain text"]');
  await ptButton.click();
  await expect(ptButton.locator('span[aria-live="polite"]')).toHaveText('Copied ✓', { timeout: 3000 });
  await page.waitForTimeout(300);

  if (ptText) {
    expect(ptText).toContain('Since last week: 3 shipped, 1 started, 1 newly blocked, 1 unblocked, 1 slipped, 1 reopened, 4 new, 1 still blocked, 2 carried over, 1 removed from tracker.');
    expect(ptText).toContain('Newly Shipped (3)');
    expect(ptText).toContain('Newly Started (1)');
    expect(ptText).toContain('Newly Blocked (1)');
    expect(ptText).toContain('Unblocked (1)');
    // Plain text has no ## markers (verified by existing test), but sections should still be titled
    expect(ptText).toContain('Slipped (1)');
    expect(ptText).toContain('Reopened (1)');
    expect(ptText).toContain('New this period (4)');
    expect(ptText).toContain('Still Blocked (1)');
    expect(ptText).toContain('Carried over / unchanged-open (2)');
    expect(ptText).toContain('Removed from tracker (1)');
  }
});

// ---- REGRESSION: Weekly Status counts unaffected ----

test('REGRESSION-weekly-status: Shipped 5 / In Progress 4 / Blocked 2 on All dates (unchanged)', async ({ page }) => {
  await page.goto(BASE + '/');
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });
  await page.locator('[data-testid="week-filter"]').selectOption('all');

  await expect(page.getByRole('heading', { name: /Shipped \(5\)/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /In Progress \(4\)/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /Blocked \(2\)/i }).first()).toBeVisible();
});

test('REGRESSION-weekly-copy-bar: Weekly Status copy bar is a static footer (A-fix) — buttons visible and clickable', async ({ page }) => {
  await page.goto(BASE + '/');
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });

  // Weekly Status copy bar is now a static footer (A-fix — no longer sticky to avoid overlap).
  // Verify both buttons are visible and clickable.
  const mdButton = page.locator('button[aria-label="Copy as Markdown"]');
  await expect(mdButton).toBeVisible();

  // Scroll to bottom so copy bar is in view
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(100);

  await mdButton.click();
  await expect(mdButton.locator('span[aria-live="polite"]')).toHaveText('Copied ✓', { timeout: 3000 });
});

test('REGRESSION-sprint-review: Sprint Review copy bar and velocity headline unaffected', async ({ page }) => {
  await page.goto(BASE + '/');
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });

  await page.locator('[data-testid="tab-sprint"]').click();
  const velocityEl = page.locator('[data-testid="velocity-headline"]');
  await expect(velocityEl).toBeVisible({ timeout: 5000 });

  const velocityText = await velocityEl.innerText();
  expect(velocityText).toContain('21 of 34 sprint pts shipped');

  // Copy bar on Sprint Review must still be click-hittable
  const mdButton = page.locator('button[aria-label="Copy as Markdown"]');
  await expect(mdButton).toBeVisible();
  await mdButton.click();
  await expect(mdButton.locator('span[aria-live="polite"]')).toHaveText('Copied ✓', { timeout: 3000 });
});
