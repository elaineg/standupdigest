/**
 * re-verify-3: two targeted post-fix assertions.
 *
 * FIX 1 (PRIVACY P1): the share snapshot POST body and the rendered /s/<id> page
 *   must NOT contain the "Unmapped status" section or any unmapped row text
 *   (sample unmapped row: "Needs Triage Review").
 *   Backlog/Todo must also remain absent (was already required).
 *
 * FIX 2 (404): GET /s/bogusid000 must return HTTP 404 (not 200) and render a
 *   friendly message ("no longer available" / "expired" / "invalid").
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:3010';

// ---- FIX 1: Privacy — unmapped rows absent from POST body and /s/<id> view ----

test('PRIVACY-FIX: snapshot POST body does NOT contain "Unmapped status" section or "Needs Triage Review"', async ({ page }) => {
  // Intercept the POST to /api/digest-share to capture the request body
  let capturedBody: string | null = null;
  await page.route('**/api/digest-share', async (route, request) => {
    if (request.method() === 'POST') {
      capturedBody = request.postData();
    }
    // Continue the request normally
    await route.continue();
  });

  await page.goto(BASE + '/');
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });

  // Open disclosure and confirm to trigger the POST
  await page.locator('[data-testid="share-create-link-btn"]').click();
  await expect(page.locator('[data-testid="share-disclosure-panel"]')).toBeVisible({ timeout: 3000 });
  await page.locator('[data-testid="share-confirm-btn"]').click();

  // Wait for link panel to appear (confirms POST completed)
  await expect(page.locator('[data-testid="share-link-panel"]')).toBeVisible({ timeout: 15000 });

  // Assert the POST body was captured and does NOT contain unmapped content
  expect(capturedBody).not.toBeNull();
  const body = capturedBody!.toLowerCase();

  // Must NOT contain any unmapped section label
  expect(body).not.toContain('unmapped');
  // Must NOT contain the specific unmapped row text from the sample
  expect(body).not.toContain('needs triage review');
  // Must NOT contain backlog/todo section
  expect(body).not.toContain('backlog');
  expect(body).not.toContain('to do');
});

test('PRIVACY-FIX: rendered /s/<id> view does NOT render "Unmapped status" section or "Needs Triage Review"', async ({ page }) => {
  // Step 1: create a share link from the sample weekly digest
  await page.goto(BASE + '/');
  await page.getByRole('button', { name: 'Load sample data' }).click();
  await expect(page.locator('[data-testid="prose-summary"]')).toBeVisible({ timeout: 10000 });

  await page.locator('[data-testid="share-create-link-btn"]').click();
  await expect(page.locator('[data-testid="share-disclosure-panel"]')).toBeVisible({ timeout: 3000 });
  await page.locator('[data-testid="share-confirm-btn"]').click();

  await expect(page.locator('[data-testid="share-link-panel"]')).toBeVisible({ timeout: 15000 });

  // Extract the share URL
  const urlField = page.locator('[data-testid="share-url-field"]');
  await expect(urlField).toBeVisible();
  const shareUrl = await urlField.inputValue();
  expect(shareUrl).toContain('/s/');

  // Step 2: open the share URL in a fresh context
  const newPage = await page.context().newPage();
  await newPage.goto(shareUrl);

  // Must render the digest content
  await expect(newPage.locator('text=This week the team shipped').first()).toBeVisible({ timeout: 10000 });

  // Must NOT show "Unmapped status" section
  const unmappedSection = newPage.locator('text=Unmapped');
  expect(await unmappedSection.count()).toBe(0);

  // Must NOT show the unmapped row text
  const needsTriageText = newPage.locator('text=Needs Triage Review');
  expect(await needsTriageText.count()).toBe(0);

  // Must NOT show Backlog section
  const backlogSection = newPage.locator('text=Backlog');
  expect(await backlogSection.count()).toBe(0);

  await newPage.close();
});

// ---- FIX 2: 404 on bogus share ID ----

test('404-FIX: GET /s/bogusid000 returns HTTP 404 and renders a friendly message', async ({ page, request }) => {
  // HTTP-level check: the page response must be 404
  const response = await request.get(BASE + '/s/bogusid000');
  expect(response.status()).toBe(404);

  // DOM-level check: navigate to the page and verify friendly message renders
  await page.goto(BASE + '/s/bogusid000', { waitUntil: 'domcontentloaded' });

  // The not-found page should show a friendly message
  const friendlyMsg = page.locator('text=no longer available').or(
    page.locator('text=expired').or(
      page.locator('text=invalid').or(
        page.locator('text=not found')
      )
    )
  );
  await expect(friendlyMsg.first()).toBeVisible({ timeout: 5000 });
});
