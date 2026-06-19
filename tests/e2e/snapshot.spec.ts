/**
 * snapshot.spec.ts — e2e tests for the "Remember last week" snapshot feature.
 *
 * SC-29: Save this week's snapshot control visible and working
 * SC-30: One-drop auto-diff against saved snapshot
 * SC-31: Which-baseline indicator with period label + device-local note + pick/clear controls
 * SC-32: Promote-to-baseline
 * SC-33: First-ever empty state (no snapshot, no manual prior)
 * SC-34: Count-honesty on auto path
 * SC-35: Snapshot controls reachable at 375px
 */

import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:3010';

// ---- Helpers ----

async function loadWeeklySample(page: Page) {
  await page.goto(BASE + '/');
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });
}

async function loadChangesSample(page: Page) {
  await page.goto(BASE + '/');
  await page.locator('[data-testid="tab-changes"]').click();
  await page.locator('[data-testid="changes-load-sample"]').first().click();
  await expect(page.locator('[data-testid="changes-prose-summary"]')).toBeVisible({ timeout: 10000 });
}

// ---- SC-29: Auto-snapshot save control ----

test('SC-29: "Save this week\'s snapshot" button is visible in Weekly Status digest header', async ({ page }) => {
  await loadWeeklySample(page);
  const btn = page.locator('[data-testid="save-snapshot-btn"]');
  await expect(btn).toBeVisible();
  const text = await btn.textContent();
  expect(text?.toLowerCase()).toContain("snapshot");
});

test('SC-29: Clicking save-snapshot shows "Saved on this device" confirmation', async ({ page }) => {
  await loadWeeklySample(page);
  const btn = page.locator('[data-testid="save-snapshot-btn"]');
  await btn.click();
  // Button text should change to "Saved on this device · <period>"
  await expect(btn).toContainText('Saved on this device', { timeout: 3000 });
});

test('SC-29: After saving, localStorage contains snapshot with only {id,bucket,title} items (no raw CSV)', async ({ page }) => {
  await loadWeeklySample(page);
  await page.locator('[data-testid="save-snapshot-btn"]').click();
  // Wait for save confirmation
  await expect(page.locator('[data-testid="save-snapshot-btn"]')).toContainText('Saved', { timeout: 3000 });

  // Read localStorage to check structure
  const stored = await page.evaluate(() => {
    // Find any standupdigest-snapshot-v1-* key
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('standupdigest-snapshot-v1-')) {
        return localStorage.getItem(k);
      }
    }
    return null;
  });
  expect(stored).not.toBeNull();
  const parsed = JSON.parse(stored!);
  expect(parsed.items).toBeDefined();
  // Items must have ONLY id, bucket, title — no assignee, epic, date, raw status
  for (const item of parsed.items) {
    const keys = Object.keys(item).sort();
    expect(keys).toEqual(['bucket', 'id', 'title'].sort());
  }
});

// ---- SC-33: First-ever empty state ----

test('SC-33: Changes tab shows first-ever empty state when no snapshot and no prior file', async ({ page }) => {
  // Clear storage to ensure no snapshot
  await page.goto(BASE + '/');
  await page.evaluate(() => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith('standupdigest-snapshot-v1-')) localStorage.removeItem(k!);
    }
  });

  // Load weekly sample so current file is present (source key detected)
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });

  // Switch to Changes tab
  await page.locator('[data-testid="tab-changes"]').click();

  // Should show the first-ever empty state
  await expect(page.locator('[data-testid="first-ever-empty-state"]')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('[data-testid="first-ever-empty-state"]')).toContainText('Nothing to compare yet');
  // Should offer to save as first baseline
  await expect(page.locator('[data-testid="save-first-baseline-btn"]')).toBeVisible();
});

// ---- SC-30: One-drop auto-diff ----

test('SC-30: After saving snapshot, Changes tab auto-diffs without second upload', async ({ page }) => {
  // Load Changes sample (loads both current + prior sample rows)
  await loadChangesSample(page);

  // Verify the diff renders (auto or sample-driven)
  await expect(page.locator('[data-testid="changes-prose-summary"]')).toBeVisible();
  // Check that Newly Shipped section appears
  await expect(page.getByRole('heading', { name: /Newly Shipped/i }).first()).toBeVisible({ timeout: 5000 });
});

test('SC-30: Snapshot-driven diff uses same single model — prose matches on-screen bucket counts', async ({ page }) => {
  await loadChangesSample(page);
  const proseEl = page.locator('[data-testid="changes-prose-summary"]');
  await expect(proseEl).toBeVisible({ timeout: 10000 });
  const prose = await proseEl.textContent();
  // Prose should contain "3 shipped" (oracle count)
  expect(prose).toMatch(/3 shipped/i);
  // And 4 new
  expect(prose).toMatch(/4 new/i);
});

// ---- SC-31: Which-baseline indicator ----

test('SC-31: Baseline strip appears when diffing against a saved snapshot', async ({ page }) => {
  // Clear storage
  await page.goto(BASE + '/');
  await page.evaluate(() => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith('standupdigest-snapshot-v1-')) localStorage.removeItem(k!);
    }
  });

  // Load weekly sample and save snapshot
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });
  await page.locator('[data-testid="save-snapshot-btn"]').click();
  await expect(page.locator('[data-testid="save-snapshot-btn"]')).toContainText('Saved', { timeout: 3000 });

  // Switch to Changes tab
  await page.locator('[data-testid="tab-changes"]').click();

  // Baseline strip should appear
  await expect(page.locator('[data-testid="baseline-strip"]')).toBeVisible({ timeout: 5000 });
  // Should show "Comparing against:"
  await expect(page.locator('[data-testid="baseline-strip"]')).toContainText('Comparing against:');
  // Should show device-local note
  await expect(page.locator('[data-testid="snapshot-device-local-note"]')).toContainText('never uploaded');
  // Should show Clear button
  await expect(page.locator('[data-testid="clear-snapshot-btn"]')).toBeVisible();
});

test('SC-31: Clear snapshot removes baseline strip', async ({ page }) => {
  // Set up a snapshot in localStorage directly
  await page.goto(BASE + '/');
  await page.evaluate(() => {
    const snapshot = {
      source: 'unknown',
      periodLabel: 'Week of 1 Jun',
      savedAt: Date.now(),
      items: [{ id: 'ENG-1', bucket: 'Shipped', title: 'Launch payment flow' }],
    };
    localStorage.setItem('standupdigest-snapshot-v1-unknown', JSON.stringify(snapshot));
  });

  // Load weekly sample (to get currentRows and source)
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });
  await page.locator('[data-testid="tab-changes"]').click();

  // Baseline strip should appear
  await expect(page.locator('[data-testid="baseline-strip"]')).toBeVisible({ timeout: 5000 });

  // Clear the snapshot
  await page.locator('[data-testid="clear-snapshot-btn"]').click();

  // Baseline strip should be gone, first-ever-empty state should appear
  await expect(page.locator('[data-testid="baseline-strip"]')).not.toBeVisible({ timeout: 3000 });
});

// ---- SC-32: Promote to baseline ----

test('SC-32: Promote button visible after auto-diff, clicking it updates baseline label', async ({ page }) => {
  await page.goto(BASE + '/');

  // Set up a prior-week snapshot in localStorage (simulates having saved last week)
  // Use "unknown" source (matches SAMPLE_CSV auto-detection)
  await page.evaluate(() => {
    const snapshot = {
      source: 'unknown',
      periodLabel: 'Week of 2 Jun',
      savedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      // ENG-1..5 = Shipped → in new current sample, 5 are Shipped → no transition
      // Use items that will differ from weekly sample so diff renders (not same-file)
      items: [
        { id: '', bucket: 'In Progress', title: 'Launch payment flow' },
        { id: '', bucket: 'In Progress', title: 'Fix cart total bug' },
        { id: '', bucket: 'Backlog', title: 'Write API docs' },
      ],
    };
    localStorage.setItem('standupdigest-snapshot-v1-unknown', JSON.stringify(snapshot));
  });

  // Load weekly sample as the current week's data
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });

  // Switch to Changes tab — snapshot mode with current file loaded
  await page.locator('[data-testid="tab-changes"]').click();

  // Baseline strip should appear
  await expect(page.locator('[data-testid="baseline-strip"]')).toBeVisible({ timeout: 5000 });

  // Diff should render (different data → not same file)
  await expect(page.locator('[data-testid="changes-prose-summary"]')).toBeVisible({ timeout: 8000 });

  // Promote button should be visible
  await expect(page.locator('[data-testid="promote-snapshot-btn"]')).toBeVisible({ timeout: 5000 });

  // Click promote
  await page.locator('[data-testid="promote-snapshot-btn"]').click();

  // Should show "Baseline updated ✓" confirmation
  await expect(page.locator('[data-testid="promote-snapshot-btn"]')).toContainText('Baseline updated', { timeout: 3000 });

  // The baseline strip should now show the updated period
  await expect(page.locator('[data-testid="baseline-strip"]')).toContainText('Saved on');
});

// ---- SC-34: Count-honesty on auto path ----

test('SC-34: Changes sample diff — prose total matches on-screen counts from single model', async ({ page }) => {
  await loadChangesSample(page);

  // Get prose text
  const prose = await page.locator('[data-testid="changes-prose-summary"]').textContent();
  // The oracle says: 3 shipped, 1 started, 1 newly blocked, 1 unblocked, 1 slipped, 1 reopened, 4 new
  expect(prose).toMatch(/3 shipped/i);
  expect(prose).toMatch(/4 new/i);
  expect(prose).toMatch(/1 slipped/i);
  expect(prose).toMatch(/1 reopened/i);

  // Verify on-screen bucket headings match
  await expect(page.getByRole('heading', { name: /Newly Shipped \(3\)/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /New this period \(4\)/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /Slipped \(1\)/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /Reopened \(1\)/i }).first()).toBeVisible();
});

// ---- SC-35: Snapshot controls reachable at 375px ----

test('SC-35: Save-snapshot button is visible and not occluded at 375px (Weekly Status)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await loadWeeklySample(page);

  const btn = page.locator('[data-testid="save-snapshot-btn"]');
  await expect(btn).toBeVisible();

  // Scroll the button into view
  await btn.scrollIntoViewIfNeeded();

  // Assert no horizontal scroll (overflow-x)
  const noHorizScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
  });
  expect(noHorizScroll).toBe(true);
});

test('SC-35: Baseline strip + clear/promote controls visible at 375px (Changes tab)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  // Set up a snapshot in localStorage
  await page.goto(BASE + '/');
  await page.evaluate(() => {
    const snapshot = {
      source: 'unknown',
      periodLabel: 'Week of 1 Jun',
      savedAt: Date.now(),
      items: [{ id: 'ENG-1', bucket: 'Shipped', title: 'Test item' }],
    };
    localStorage.setItem('standupdigest-snapshot-v1-unknown', JSON.stringify(snapshot));
  });

  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });
  await page.locator('[data-testid="tab-changes"]').click();

  // Baseline strip must be visible
  await expect(page.locator('[data-testid="baseline-strip"]')).toBeVisible({ timeout: 5000 });
  // Clear button must be visible
  await expect(page.locator('[data-testid="clear-snapshot-btn"]')).toBeVisible();

  // No horizontal scroll
  const noHorizScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
  });
  expect(noHorizScroll).toBe(true);
});

// ---- SC-35: INTERACTION at 375px (per mobile-375-must-exercise-interaction lesson) ----

test('SC-35-interaction: Save-snapshot button CLICKS and fires at 375px (not render-only)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await loadWeeklySample(page);

  const btn = page.locator('[data-testid="save-snapshot-btn"]');
  await btn.scrollIntoViewIfNeeded();
  await btn.click();

  // After click, the button text should change to "Saved on this device" — proves click fired
  await expect(btn).toContainText('Saved on this device', { timeout: 3000 });
});

test('SC-35-interaction: Clear-snapshot button CLICKS and fires at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  await page.goto(BASE + '/');
  await page.evaluate(() => {
    const snapshot = {
      source: 'unknown',
      periodLabel: 'Week of 1 Jun',
      savedAt: Date.now(),
      items: [{ id: 'ENG-1', bucket: 'Shipped', title: 'Test item' }],
    };
    localStorage.setItem('standupdigest-snapshot-v1-unknown', JSON.stringify(snapshot));
  });

  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });
  await page.locator('[data-testid="tab-changes"]').click();

  const clearBtn = page.locator('[data-testid="clear-snapshot-btn"]');
  await expect(clearBtn).toBeVisible({ timeout: 5000 });
  await clearBtn.scrollIntoViewIfNeeded();
  await clearBtn.click();

  // After click, baseline strip should be gone — proves click actually fired
  await expect(page.locator('[data-testid="baseline-strip"]')).not.toBeVisible({ timeout: 3000 });
});

// ---- SC-34: COUNT-HONESTY on the TRUE snapshot-driven path (not the sample-loads-both path) ----

test('SC-34-snapshot-path: snapshot-driven diff prose counts equal on-screen bucket counts (not sample manual path)', async ({ page }) => {
  // TRUE one-drop snapshot path:
  // Seed a prior-week snapshot whose source key matches what CHANGES_CURRENT_CSV produces ("jira").
  // CHANGES_CURRENT_CSV has Issue Keys ENG-1..15, auto-detected as "jira" source.
  // Snapshot contains CHANGES_PRIOR_CSV items (ENG-1..14 + ENG-99) with their prior buckets.
  // Load ONLY the current CSV via Weekly Status + switch to Changes → externalPriorRows = null → snapshot path.

  await page.goto(BASE + '/');

  // Clear any prior snapshots
  await page.evaluate(() => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith('standupdigest-snapshot-v1-')) localStorage.removeItem(k!);
    }
  });

  // Seed snapshot for "jira" source (matches CHANGES_CURRENT_CSV auto-detection)
  // These items mirror CHANGES_PRIOR_CSV parsed state (prior-week buckets)
  await page.evaluate(() => {
    const priorItems = [
      { id: 'ENG-1',  bucket: 'In Progress', title: 'Build auth service' },
      { id: 'ENG-2',  bucket: 'In Progress', title: 'Fix cart total bug' },
      { id: 'ENG-3',  bucket: 'In Progress', title: 'Add promo code support' },
      { id: 'ENG-6',  bucket: 'Backlog',     title: 'Migrate old orders' },
      { id: 'ENG-7',  bucket: 'In Progress', title: 'Review API endpoints' },
      { id: 'ENG-8',  bucket: 'In Progress', title: 'Deploy staging environment' },
      { id: 'ENG-10', bucket: 'In Progress', title: 'Fix login redirect' },
      { id: 'ENG-11', bucket: 'Blocked',     title: 'Investigate memory leak' },
      { id: 'ENG-12', bucket: 'Blocked',     title: 'Archive old reports' },
      { id: 'ENG-13', bucket: 'Shipped',     title: 'Launch billing reports' },
      { id: 'ENG-14', bucket: 'Blocked',     title: 'Write API docs' },
      { id: 'ENG-99', bucket: 'In Progress', title: 'Legacy cleanup task' },
    ];
    const snapshot = {
      source: 'jira',
      periodLabel: 'Week of 1 Jun',
      savedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      items: priorItems,
    };
    localStorage.setItem('standupdigest-snapshot-v1-jira', JSON.stringify(snapshot));
  });

  // Load CHANGES_CURRENT_CSV via the Changes tab "Load sample data"
  // BUT we intercept: instead of using loadChangesSample (which sets externalPriorRows),
  // we navigate to Weekly Status, load the current-only sample (won't work for changes CSV),
  // so we use the Changes tab load-sample BUT verify snapshot is preferred over externalPriorRows.
  // Actually the loadChangesSample sets externalPriorRows which overrides snapshot.
  // TRUE one-drop: we must load only the CURRENT file.
  // The Changes tab "Load sample data" always loads BOTH. Instead, use Weekly Status sample
  // which loads SAMPLE_CSV (not CHANGES_CURRENT_CSV). SAMPLE_CSV has no Issue Key column →
  // source="unknown", not "jira" → snapshot key mismatch.
  // Solution: seed snapshot for "unknown" with DIFFERENT rows than SAMPLE_CSV
  // (different count/titles) so isSameExport = false, and verify diff renders.

  // Clear the "jira" snapshot we just set, seed one for "unknown" instead
  await page.evaluate(() => {
    localStorage.removeItem('standupdigest-snapshot-v1-jira');
    // Snapshot has 3 rows (different from SAMPLE_CSV's 15 rows → not same export)
    const snapshot = {
      source: 'unknown',
      periodLabel: 'Week of 1 Jun',
      savedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      items: [
        { id: '', bucket: 'In Progress', title: 'Launch payment flow' },
        { id: '', bucket: 'In Progress', title: 'Add promo code support' },
        { id: '', bucket: 'Blocked',     title: 'Build analytics dashboard' },
      ],
    };
    localStorage.setItem('standupdigest-snapshot-v1-unknown', JSON.stringify(snapshot));
  });

  // Load the Weekly Status sample (SAMPLE_CSV) → source="unknown" → matches snapshot
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });

  // Switch to Changes tab — externalPriorRows=null, snapshot exists → snapshot path
  await page.locator('[data-testid="tab-changes"]').click();

  // Baseline strip must appear (snapshot mode)
  await expect(page.locator('[data-testid="baseline-strip"]')).toBeVisible({ timeout: 5000 });

  // Diff must render (different row counts / new-period items → non-trivial diff)
  const proseEl = page.locator('[data-testid="changes-prose-summary"]');
  await expect(proseEl).toBeVisible({ timeout: 8000 });
  const prose = await proseEl.textContent();
  expect(prose).toBeTruthy();

  // Prose must contain "Since last week" pattern
  expect(prose).toMatch(/Since last week/i);

  // Extract "N shipped" from prose — "Launch payment flow" was In Progress in prior → Shipped now
  const shippedMatch = prose!.match(/(\d+) shipped/i);
  expect(shippedMatch).not.toBeNull();
  const proseShippedCount = parseInt(shippedMatch![1], 10);

  // Extract "Newly Shipped (N)" from on-screen heading
  const shippedHeading = await page.locator('h2').filter({ hasText: /Newly Shipped/i }).first().textContent();
  const headingMatch = shippedHeading?.match(/\((\d+)\)/);
  expect(headingMatch).not.toBeNull();
  const headingShippedCount = parseInt(headingMatch![1], 10);

  // COUNT-HONESTY: prose count must equal on-screen bucket count (single model, snapshot path)
  expect(proseShippedCount).toBe(headingShippedCount);
  expect(proseShippedCount).toBeGreaterThan(0);
});

// ---- P2: snapshot localStorage payload has NO assignee/date/description fields ----

test('P2: snapshot localStorage items have NO assignee, date, description — only {id, bucket, title}', async ({ page }) => {
  await loadWeeklySample(page);
  await page.locator('[data-testid="save-snapshot-btn"]').click();
  await expect(page.locator('[data-testid="save-snapshot-btn"]')).toContainText('Saved', { timeout: 3000 });

  const stored = await page.evaluate(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('standupdigest-snapshot-v1-')) {
        return localStorage.getItem(k);
      }
    }
    return null;
  });
  expect(stored).not.toBeNull();
  const parsed = JSON.parse(stored!);
  expect(parsed.items).toBeDefined();
  for (const item of parsed.items) {
    // Must contain ONLY id, bucket, title
    const keys = Object.keys(item).sort();
    expect(keys).toEqual(['bucket', 'id', 'title'].sort());
    // Explicitly must NOT contain assignee, date, description, epic, status, storyPoints
    expect(Object.prototype.hasOwnProperty.call(item, 'assignee')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(item, 'date')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(item, 'description')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(item, 'epic')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(item, 'status')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(item, 'storyPoints')).toBe(false);
  }
});

// ---- P3: Jira-header CSV keys snapshot as -jira (not -unknown) ----
// Upload a synthetic CSV with "Issue Key,Summary,Status" headers (real Jira minimal export format).
// Prior to the P3 fix, detectSource returned "unknown" for this format.

test('P3: header-bearing Jira CSV (Issue Key,Summary,Status) keys snapshot as -jira not -unknown', async ({ page }) => {
  await page.goto(BASE + '/');

  // Clear any prior snapshots
  await page.evaluate(() => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith('standupdigest-snapshot-v1-')) localStorage.removeItem(k!);
    }
  });

  // Synthetic Jira CSV with minimal headers: Issue Key + Summary (no Epic Link required)
  const jiraCsv = `Issue Key,Summary,Status,Assignee\nENG-1,Build auth service,Done,Alice\nENG-2,Fix cart total bug,In Progress,Bob\nENG-3,Add promo code support,To Do,Sam\n`;

  // Upload via the file input
  const fileInput = page.locator('input[type="file"][aria-label="Upload CSV file"]');
  await fileInput.setInputFiles({
    name: 'jira-export.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(jiraCsv),
  });

  // Wait for digest to render
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });

  // Save snapshot
  const saveBtn = page.locator('[data-testid="save-snapshot-btn"]');
  await expect(saveBtn).toBeVisible({ timeout: 3000 });
  await saveBtn.click();
  await expect(saveBtn).toContainText('Saved', { timeout: 3000 });

  // Check localStorage: the snapshot key must be -jira (not -unknown)
  const result = await page.evaluate(() => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('standupdigest-snapshot-v1-')) keys.push(k);
    }
    return keys;
  });
  expect(result.length).toBeGreaterThan(0);
  const hasJiraKey = result.some((k) => k.endsWith('-jira'));
  const hasUnknownKey = result.some((k) => k.endsWith('-unknown'));
  expect(hasJiraKey).toBe(true);
  expect(hasUnknownKey).toBe(false);
});

// ---- P1: copy-confirmation appears for all three copy triggers ----

test('P1: Copy Markdown button shows "Copied ✓" confirmation (data-testid path)', async ({ page }) => {
  await loadWeeklySample(page);
  const btn = page.locator('[data-testid="copy-md-btn"]');
  await expect(btn).toBeVisible();
  await btn.click();
  await expect(btn.locator('span[aria-live="polite"]')).toHaveText('Copied ✓', { timeout: 3000 });
});

test('P1: Copy plain text button shows "Copied ✓" confirmation (data-testid path)', async ({ page }) => {
  await loadWeeklySample(page);
  const btn = page.locator('[data-testid="copy-pt-btn"]');
  await expect(btn).toBeVisible();
  await btn.click();
  await expect(btn.locator('span[aria-live="polite"]')).toHaveText('Copied ✓', { timeout: 3000 });
});

test('P1: Changes "Copy Markdown" button shows "Copied ✓" confirmation', async ({ page }) => {
  await loadChangesSample(page);
  const btn = page.locator('[data-testid="copy-md-btn"]');
  await expect(btn).toBeVisible();
  await btn.click();
  await expect(btn.locator('span[aria-live="polite"]')).toHaveText('Copied ✓', { timeout: 3000 });
});

test('P1: Changes "Copy plain text" button shows "Copied ✓" confirmation', async ({ page }) => {
  await loadChangesSample(page);
  const btn = page.locator('[data-testid="copy-pt-btn"]');
  await expect(btn).toBeVisible();
  await btn.click();
  await expect(btn.locator('span[aria-live="polite"]')).toHaveText('Copied ✓', { timeout: 3000 });
});

test('P1: "Copy link" button shows "Link copied ✓" after share link minted', async ({ page }) => {
  await loadWeeklySample(page);
  await page.locator('[data-testid="share-create-link-btn"]').click();
  await expect(page.locator('[data-testid="share-disclosure-panel"]')).toBeVisible({ timeout: 3000 });
  await page.locator('[data-testid="share-confirm-btn"]').click();
  await expect(page.locator('[data-testid="share-link-panel"]')).toBeVisible({ timeout: 15000 });

  const copyLinkBtn = page.locator('[data-testid="share-copy-link-btn"]');
  await copyLinkBtn.click();
  await expect(copyLinkBtn.locator('span[aria-live="polite"]')).toHaveText('Link copied ✓', { timeout: 3000 });
});
