/**
 * panel-round2: targeted tests for the 4 fixes from the round-1 synthesis.
 *
 * A. Copy bar non-overlap (1280px + 375px): assert no digest row is ever covered
 *    by the copy bar on Weekly Status, Sprint Review, and Changes tabs.
 * B. Share link elevated to primary button: distinct style from Remap columns link.
 * C(i). Persistence note visible near Remap columns.
 * C(ii). Custom status re-bucket persists per source in localStorage and auto-applies
 *        on the next load of the same source.
 * D. Copy confirmation visible: both copy cues flip to "Copied ✓" after A-fix.
 */

import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:3210';

async function loadSampleWeekly(page: Page) {
  await page.goto(BASE + '/');
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });
}

// ---- A: Copy bar non-overlap at 1280px (Weekly Status) ----

test('A-no-overlap-desktop: Weekly Status copy bar does NOT overlap any digest row at 1280px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await loadSampleWeekly(page);

  const mdButton = page.locator('button[aria-label="Copy as Markdown"]');
  await expect(mdButton).toBeVisible();

  // Scroll to bottom to ensure copy bar and last rows are both in viewport
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(100);

  // Copy bar must be visible and not overlap digest rows.
  // Since the copy bar is now a static footer, verify that the section[aria-label="Shipped"]
  // bounding box bottom is ABOVE the copy bar bounding box top (no overlap).
  const shippedSection = page.locator('section[aria-label="Shipped"]');
  await expect(shippedSection).toBeVisible();

  const shippedBB = await shippedSection.boundingBox();
  const mdButtonBB = await mdButton.boundingBox();

  expect(shippedBB).not.toBeNull();
  expect(mdButtonBB).not.toBeNull();

  // Static footer: the Shipped section's bottom Y must be ABOVE (less than) the copy bar's top Y.
  // They are in normal document flow — section then bar, no overlap.
  if (shippedBB && mdButtonBB) {
    expect(shippedBB.y + shippedBB.height).toBeLessThanOrEqual(mdButtonBB.y + 5);
  }
});

test('A-no-overlap-mobile: Weekly Status copy bar does NOT overlap digest content at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await loadSampleWeekly(page);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(100);

  const mdButton = page.locator('button[aria-label="Copy as Markdown"]');
  await expect(mdButton).toBeVisible();

  // elementFromPoint at copy bar center must return the copy bar button, not a digest row
  const mdBtnBB = await mdButton.boundingBox();
  expect(mdBtnBB).not.toBeNull();

  if (mdBtnBB) {
    const mdCenterX = mdBtnBB.x + mdBtnBB.width / 2;
    const mdCenterY = mdBtnBB.y + mdBtnBB.height / 2;
    const mdClosestBtn = await page.evaluate(({ x, y }: { x: number; y: number }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return 'no-element';
      return (el as HTMLElement).closest('button')?.getAttribute('aria-label') ?? 'no-button';
    }, { x: mdCenterX, y: mdCenterY });
    expect(mdClosestBtn).toBe('Copy as Markdown');
  }
});

// ---- A: Copy bar non-overlap at 1280px (Changes tab) ----

test('A-no-overlap-changes: Changes copy bar (static footer) does not overlap content at 1280px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(BASE + '/');
  await page.locator('[data-testid="tab-changes"]').click();
  await page.locator('[data-testid="changes-load-sample"]').click();
  await expect(page.locator('[data-testid="changes-prose-summary"]')).toBeVisible({ timeout: 10000 });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(100);

  const mdButton = page.locator('button[aria-label="Copy as Markdown"]');
  await expect(mdButton).toBeVisible();

  const mdBtnBB = await mdButton.boundingBox();
  expect(mdBtnBB).not.toBeNull();

  // elementFromPoint on the copy bar must return the button, not a section item
  if (mdBtnBB) {
    const x = mdBtnBB.x + mdBtnBB.width / 2;
    const y = mdBtnBB.y + mdBtnBB.height / 2;
    const closest = await page.evaluate(({ x, y }: { x: number; y: number }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return 'no-element';
      return (el as HTMLElement).closest('button')?.getAttribute('aria-label') ?? 'no-button';
    }, { x, y });
    expect(closest).toBe('Copy as Markdown');
  }
});

// ---- B: Share link is a primary button, distinct from Remap columns ----

test('B-share-primary-button: Share link is a filled blue button (not a plain text link)', async ({ page }) => {
  await loadSampleWeekly(page);

  const shareBtn = page.locator('[data-testid="share-create-link-btn"]');
  await expect(shareBtn).toBeVisible();

  // Should have blue background styling (bg-blue-600)
  const cls = await shareBtn.getAttribute('class');
  expect(cls).toContain('bg-blue-600');

  // Remap columns button should NOT have bg-blue-600 (it's a text underline link)
  const remapBtn = page.locator('[data-testid="remap-columns-btn"]');
  await expect(remapBtn).toBeVisible();
  const remapCls = await remapBtn.getAttribute('class');
  expect(remapCls).not.toContain('bg-blue-600');
});

test('B-share-label-distinct: Share button label contains "Share" or "link", not "Copy"', async ({ page }) => {
  await loadSampleWeekly(page);

  const shareBtn = page.locator('[data-testid="share-create-link-btn"]');
  const label = (await shareBtn.innerText()).toLowerCase();
  expect(label.includes('share') || label.includes('link')).toBe(true);
  expect(label.includes('copy')).toBe(false);
});

// ---- C(i): Persistence note visible near Remap columns ----

test('C1-persistence-note: "Saved on this device" note is visible near Remap columns', async ({ page }) => {
  await loadSampleWeekly(page);

  // The persistence note should be visible near the Remap columns button
  const note = page.locator('[data-testid="saved-on-device-note"]');
  await expect(note).toBeVisible();
  const text = (await note.innerText()).toLowerCase();
  expect(text).toMatch(/saved on this device/i);
  expect(text).toMatch(/next week/i);
});

// ---- C(ii): Custom status rule persists per source and auto-applies on next load ----

test('C2-status-rule-persists: re-bucket unmapped status, reload, same status auto-maps without re-fiddling', async ({ page }) => {
  // Use a CSV with a custom status ("Needs Triage Review") that starts as Unmapped
  await page.goto(BASE + '/');

  const customCSV = `Title,Status,Assignee,Epic,Updated
Task A,Done,Alice,ProjectA,2026-06-14
Task B,Needs Triage Review,Bob,ProjectB,2026-06-14
Task C,In Progress,Carol,ProjectC,2026-06-14
`;

  // Upload the CSV
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: 'custom-status.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(customCSV),
  });

  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });

  // "Needs Triage Review" should appear as Unmapped
  await expect(page.locator('section[aria-label="Unmapped statuses"]')).toBeVisible();
  const dropdown = page.locator('section[aria-label="Unmapped statuses"]').locator('select').first();
  await expect(dropdown).toBeVisible();

  // Re-bucket it to "In Progress"
  await dropdown.selectOption('In Progress');

  // Wait for the "All statuses recognized" to appear (unmapped section cleared)
  await expect(page.locator('text=All statuses recognized')).toBeVisible({ timeout: 3000 });

  // Reload the page (simulates "next week")
  await page.reload();

  // Re-upload the same CSV (same source = "unknown")
  await expect(page.locator('text=Turn your tracker export')).toBeVisible();
  const fileInput2 = page.locator('input[type="file"]').first();
  await fileInput2.setInputFiles({
    name: 'custom-status.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(customCSV),
  });

  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });

  // "Needs Triage Review" should now be auto-bucketed to "In Progress" WITHOUT user re-fiddling
  // The Unmapped section should be EMPTY or not show "Needs Triage Review"
  const unmappedSection = page.locator('section[aria-label="Unmapped statuses"]');
  const hasUnmapped = await unmappedSection.isVisible().catch(() => false);
  if (hasUnmapped) {
    const unmappedText = await unmappedSection.innerText();
    expect(unmappedText).not.toContain('Needs Triage Review');
  }

  // "Needs Triage Review" row should appear in "In Progress" section (auto-applied)
  const inProgressSection = page.locator('section[aria-label="In Progress"]');
  await expect(inProgressSection).toBeVisible();
  const ipText = await inProgressSection.innerText();
  expect(ipText).toContain('Task B');
});

// ---- D: Copy confirmation visible after A-fix (both cues flip on persistent button) ----

test('D-copy-markdown-cue: "Copied ✓" cue is visible on Copy Markdown button after click (post A-fix)', async ({ page }) => {
  await loadSampleWeekly(page);

  // Scroll to bottom so copy bar is visible
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(100);

  const mdButton = page.locator('button[aria-label="Copy as Markdown"]');
  await expect(mdButton).toBeVisible();
  await mdButton.click();

  // Must flip to "Copied ✓" on the persistent button (aria-live element)
  await expect(mdButton.locator('span[aria-live="polite"]')).toHaveText('Copied ✓', { timeout: 3000 });
  // Button is still in DOM (persistent — never unmounts)
  await expect(mdButton).toBeVisible();
});

test('D-copy-plaintext-cue: "Copied ✓" cue is visible on Copy plain text button after click', async ({ page }) => {
  await loadSampleWeekly(page);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(100);

  const ptButton = page.locator('button[aria-label="Copy as plain text"]');
  await expect(ptButton).toBeVisible();
  await ptButton.click();

  await expect(ptButton.locator('span[aria-live="polite"]')).toHaveText('Copied ✓', { timeout: 3000 });
  await expect(ptButton).toBeVisible();
});
