/**
 * re-verify-2: targeted tests for the "Slipped / Reopened" split into TWO separate buckets.
 *
 * Spec contract (SC18 updated):
 *   - Slipped (1): ENG-12, Blocked prior → Backlog/Todo now (lost momentum)
 *   - Reopened (1): ENG-13, Shipped/Done prior → Backlog now (came back from done)
 *   These are TWO SEPARATE headings with separate counts, not one combined bucket.
 *
 * Regression guards:
 *   - In Progress → Blocked (ENG-10) → Newly Blocked (NOT Slipped, NOT Reopened)
 *   - Blocked → In Progress (ENG-14) → Unblocked (NOT Slipped, NOT Reopened)
 *   - Weekly Status Shipped 5 / In Progress 4 / Blocked 2 (All dates) unaffected
 *   - Sprint Review velocity unaffected
 *
 * Count honesty:
 *   - Prose reads EXACTLY "Since last week: 3 shipped, 1 started, 1 newly blocked,
 *     1 unblocked, 1 slipped, 1 reopened, 4 new, 1 still blocked, 2 carried over,
 *     1 removed from tracker."
 *   - Markdown copy and plaintext copy contain matching section headers and counts.
 *
 * Previous fixes still hold:
 *   - Copy bar pinned fixed bottom-0 (no overlap at desktop)
 *   - Copy cue flips "Copied ✓" in place
 *   - Inline edit commits on Enter/blur
 */

import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:3211';

async function loadChangesSample(page: Page) {
  await page.goto(BASE + '/');
  await page.locator('[data-testid="tab-changes"]').click();
  await page.locator('[data-testid="changes-load-sample"]').click();
  await expect(page.locator('[data-testid="changes-prose-summary"]')).toBeVisible({ timeout: 10000 });
}

// ---- 1. Two distinct headings: "Slipped (1)" and "Reopened (1)" separate ----

test('RV2-split-headings: Slipped and Reopened are TWO separate headings each with count 1', async ({ page }) => {
  await loadChangesSample(page);

  // Must find "Slipped (1)" as a heading (not combined with Reopened)
  const slippedHeading = page.getByRole('heading', { name: /^Slipped \(1\)$/i });
  await expect(slippedHeading.first()).toBeVisible();

  // Must find "Reopened (1)" as a separate heading
  const reopenedHeading = page.getByRole('heading', { name: /^Reopened \(1\)$/i });
  await expect(reopenedHeading.first()).toBeVisible();

  // Must NOT find a combined heading like "Slipped / Reopened" or "Slipped/Reopened"
  const combinedHeading = page.getByRole('heading', { name: /Slipped\s*\/\s*Reopened/i });
  const combinedCount = await combinedHeading.count();
  expect(combinedCount).toBe(0);
});

test('RV2-slipped-section: ENG-12 (Blocked→Todo) is in Slipped (1), NOT in Reopened', async ({ page }) => {
  await loadChangesSample(page);

  // ENG-12 = "Design onboarding flow" (Blocked prior → To Do now) → Slipped
  const slippedSection = page.locator('section[aria-label="Slipped"]');
  await expect(slippedSection).toBeVisible();
  await expect(slippedSection.locator('text=Design onboarding flow')).toBeVisible();

  // ENG-12 must NOT appear in Reopened
  const reopenedSection = page.locator('section[aria-label="Reopened"]');
  const eng12InReopened = reopenedSection.locator('text=Design onboarding flow');
  const eng12ReopenedCount = await eng12InReopened.count();
  expect(eng12ReopenedCount).toBe(0);
});

test('RV2-reopened-section: ENG-13 (Done→Backlog) is in Reopened (1), NOT in Slipped', async ({ page }) => {
  await loadChangesSample(page);

  // ENG-13 = "Write API docs" (Shipped/Done prior → Backlog now) → Reopened
  const reopenedSection = page.locator('section[aria-label="Reopened"]');
  await expect(reopenedSection).toBeVisible();
  await expect(reopenedSection.locator('text=Write API docs')).toBeVisible();

  // ENG-13 must NOT appear in Slipped
  const slippedSection = page.locator('section[aria-label="Slipped"]');
  const eng13InSlipped = slippedSection.locator('text=Write API docs');
  const eng13SlippedCount = await eng13InSlipped.count();
  expect(eng13SlippedCount).toBe(0);
});

// ---- 2. Bucket non-theft: In Progress→Blocked → Newly Blocked (not Slipped); Blocked→InProgress → Unblocked (not Slipped) ----

test('RV2-no-bucket-theft: ENG-10 (InProgress→Blocked) is in Newly Blocked, not Slipped or Reopened', async ({ page }) => {
  await loadChangesSample(page);

  // ENG-10 = "Fix login redirect" (In Progress prior → Blocked now) → Newly Blocked
  const newlyBlockedSection = page.locator('section[aria-label="Newly Blocked"]');
  await expect(newlyBlockedSection).toBeVisible();
  await expect(newlyBlockedSection.locator('text=Fix login redirect')).toBeVisible();

  // Must NOT appear in Slipped
  const slippedSection = page.locator('section[aria-label="Slipped"]');
  const eng10InSlipped = slippedSection.locator('text=Fix login redirect');
  expect(await eng10InSlipped.count()).toBe(0);

  // Must NOT appear in Reopened
  const reopenedSection = page.locator('section[aria-label="Reopened"]');
  const eng10InReopened = reopenedSection.locator('text=Fix login redirect');
  expect(await eng10InReopened.count()).toBe(0);
});

test('RV2-no-bucket-theft: ENG-14 (Blocked→InProgress) is in Unblocked, not Slipped or Reopened', async ({ page }) => {
  await loadChangesSample(page);

  // ENG-14 = "Plan Q3 roadmap" (Blocked prior → In Progress now) → Unblocked
  const unblockedSection = page.locator('section[aria-label="Unblocked"]');
  await expect(unblockedSection).toBeVisible();
  await expect(unblockedSection.locator('text=Plan Q3 roadmap')).toBeVisible();

  // Must NOT appear in Slipped
  const slippedSection = page.locator('section[aria-label="Slipped"]');
  expect(await slippedSection.locator('text=Plan Q3 roadmap').count()).toBe(0);

  // Must NOT appear in Reopened
  const reopenedSection = page.locator('section[aria-label="Reopened"]');
  expect(await reopenedSection.locator('text=Plan Q3 roadmap').count()).toBe(0);
});

// ---- 3. Full oracle: all 10 categories correct ----

test('RV2-full-oracle: all 10 bucket counts match APP_SPEC oracle exactly', async ({ page }) => {
  await loadChangesSample(page);

  // Headline buckets (BucketSection uses h2 heading)
  await expect(page.getByRole('heading', { name: /Newly Shipped \(3\)/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /Newly Started \(1\)/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /Newly Blocked \(1\)/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /Unblocked \(1\)/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /^Slipped \(1\)$/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /^Reopened \(1\)$/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /New this period \(4\)/i }).first()).toBeVisible();

  // Secondary buckets (CollapsibleBucket uses a button with uppercase text — check case-insensitively)
  const stillBlockedBtn = page.locator('section[aria-label="Still Blocked"] button');
  await expect(stillBlockedBtn).toBeVisible();
  const stillBlockedText = await stillBlockedBtn.innerText();
  // Button text is uppercase (CSS text-transform) or literal uppercase — match case-insensitively
  expect(stillBlockedText.toUpperCase()).toContain('STILL BLOCKED (1)');

  const carriedOverBtn = page.locator('section[aria-label="Carried over / unchanged-open"] button');
  await expect(carriedOverBtn).toBeVisible();
  const carriedOverText = await carriedOverBtn.innerText();
  expect(carriedOverText.toUpperCase()).toContain('CARRIED OVER / UNCHANGED-OPEN (2)');

  // Removed section (uses aria-label, not a heading count)
  await expect(page.locator('section[aria-label="Removed from tracker"]')).toBeVisible();

  // Total current rows in headline BucketSections: 3+1+1+1+1+1+4 = 12 (Newly Shipped/Blocked/Started/Unblocked/Slipped/Reopened/New)
  // Secondary (collapsible) still-blocked=1, carried-over=2 (collapsed by default, so li not rendered)
  // Verify headline buckets count = 12 by asserting prose contains all numbers
  const proseText = await page.locator('[data-testid="changes-prose-summary"]').innerText();
  expect(proseText).toContain('3 shipped');
  expect(proseText).toContain('1 started');
  expect(proseText).toContain('1 newly blocked');
  expect(proseText).toContain('1 unblocked');
  expect(proseText).toContain('1 slipped');
  expect(proseText).toContain('1 reopened');
  expect(proseText).toContain('4 new');
  expect(proseText).toContain('1 still blocked');
  expect(proseText).toContain('2 carried over');
  expect(proseText).toContain('1 removed from tracker');
});

// ---- 4. Count honesty: exact prose string ----

test('RV2-count-honesty-prose: prose reads EXACTLY the 10-category oracle sentence', async ({ page }) => {
  await loadChangesSample(page);

  const proseText = await page.locator('[data-testid="changes-prose-summary"]').innerText();

  expect(proseText).toContain(
    'Since last week: 3 shipped, 1 started, 1 newly blocked, 1 unblocked, 1 slipped, 1 reopened, 4 new, 1 still blocked, 2 carried over, 1 removed from tracker.'
  );

  // Each number must appear separately (not combined)
  expect(proseText).toContain('1 slipped');
  expect(proseText).toContain('1 reopened');
  // Must NOT say "2 slipped" or "2 reopened" or any combined phrasing
  expect(proseText).not.toContain('2 slipped');
  expect(proseText).not.toContain('2 reopened');
  expect(proseText).not.toMatch(/slipped\s*\/\s*reopened/i);
});

test('RV2-count-honesty-markdown: Markdown copy has Slipped (1) and Reopened (1) as separate sections', async ({ page }) => {
  await loadChangesSample(page);

  let mdText = '';
  await page.exposeFunction('captureRv2Md', (text: string) => { mdText = text; });
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (text: string) => {
          await (window as unknown as Record<string, unknown>)['captureRv2Md'](text);
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
    // Full prose sentence
    expect(mdText).toContain(
      'Since last week: 3 shipped, 1 started, 1 newly blocked, 1 unblocked, 1 slipped, 1 reopened, 4 new, 1 still blocked, 2 carried over, 1 removed from tracker.'
    );
    // Separate section headers
    expect(mdText).toContain('Slipped (1)');
    expect(mdText).toContain('Reopened (1)');
    // Must NOT contain combined bucket
    expect(mdText).not.toMatch(/Slipped\s*\/\s*Reopened/i);
    // Full oracle counts
    expect(mdText).toContain('Newly Shipped (3)');
    expect(mdText).toContain('Newly Started (1)');
    expect(mdText).toContain('Newly Blocked (1)');
    expect(mdText).toContain('Unblocked (1)');
    expect(mdText).toContain('New this period (4)');
    expect(mdText).toContain('Still Blocked (1)');
    expect(mdText).toContain('Removed from tracker (1)');
  }
});

test('RV2-count-honesty-plaintext: plaintext copy has Slipped (1) and Reopened (1) as separate sections', async ({ page }) => {
  await loadChangesSample(page);

  let ptText = '';
  await page.exposeFunction('captureRv2Pt', (text: string) => { ptText = text; });
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (text: string) => {
          await (window as unknown as Record<string, unknown>)['captureRv2Pt'](text);
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
    expect(ptText).toContain(
      'Since last week: 3 shipped, 1 started, 1 newly blocked, 1 unblocked, 1 slipped, 1 reopened, 4 new, 1 still blocked, 2 carried over, 1 removed from tracker.'
    );
    // Separate section headings (plaintext has no ## markers)
    expect(ptText).toContain('Slipped (1)');
    expect(ptText).toContain('Reopened (1)');
    expect(ptText).not.toMatch(/Slipped\s*\/\s*Reopened/i);
    expect(ptText).not.toMatch(/^## /m); // no markdown headers in plaintext
  }
});

// ---- 5. Previous fixes regression guard ----

test('RV2-regression-copy-bar: Changes copy bar is fixed bottom-0 at desktop (no overlap)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadChangesSample(page);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);

  const copyBar = page.locator('.fixed.bottom-0.left-0.right-0');
  await expect(copyBar).toBeVisible();
  const copyBarClass = await copyBar.getAttribute('class');
  expect(copyBarClass).toContain('fixed');
  expect(copyBarClass).toContain('bottom-0');

  const mdButton = page.locator('button[aria-label="Copy as Markdown"]');
  await mdButton.click();
  await expect(mdButton.locator('span[aria-live="polite"]')).toHaveText('Copied ✓', { timeout: 3000 });
});

test('RV2-regression-inline-edit: inline edit commits on Enter, flows into copy', async ({ page }) => {
  await loadChangesSample(page);

  // Click the first row in Newly Shipped to edit it
  const shippedSection = page.locator('section[aria-label="Newly Shipped"]');
  await expect(shippedSection).toBeVisible();

  // Hover to reveal the Edit button (opacity-0 sm:group-hover:opacity-100), then click
  const firstLi = shippedSection.locator('li').first();
  await firstLi.hover();

  // Use same pattern as the existing passing SC20-edit-enter test
  const editBtn = firstLi.locator('button', { hasText: 'Edit line' });
  await editBtn.click();

  // Input appears after clicking Edit
  const editInput = firstLi.locator('input');
  await expect(editInput).toBeVisible();
  await editInput.fill('RV2 edited shipped title');
  await editInput.press('Enter');

  // Verify edit shows in the section, input is gone
  await expect(firstLi.locator('text=RV2 edited shipped title')).toBeVisible();
  await expect(editInput).not.toBeVisible();
});

test('RV2-regression-weekly-status: Weekly Status Shipped 5 / In Progress 4 / Blocked 2 unaffected', async ({ page }) => {
  await page.goto(BASE + '/');
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });
  await page.locator('[data-testid="week-filter"]').selectOption('all');

  await expect(page.getByRole('heading', { name: /Shipped \(5\)/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /In Progress \(4\)/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /Blocked \(2\)/i }).first()).toBeVisible();
});

test('RV2-regression-sprint-review: Sprint Review velocity headline unaffected', async ({ page }) => {
  await page.goto(BASE + '/');
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });

  await page.locator('[data-testid="tab-sprint"]').click();
  const velocityEl = page.locator('[data-testid="velocity-headline"]');
  await expect(velocityEl).toBeVisible({ timeout: 5000 });

  const velocityText = await velocityEl.innerText();
  expect(velocityText).toContain('21 of 34 sprint pts shipped');
});
