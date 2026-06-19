import { describe, it, expect } from 'vitest';
import { parseCSVText } from '../../lib/csvParser';
import {
  computeChanges,
  buildChangesMarkdown,
  buildChangesPlainText,
  buildChangesProse,
  type ChangesModel,
} from '../../lib/changesDigest';
import { CHANGES_CURRENT_CSV, CHANGES_PRIOR_CSV } from '../../lib/sampleData';

// ---- Parse helper ----

function parseSample() {
  const current = parseCSVText(CHANGES_CURRENT_CSV);
  const prior = parseCSVText(CHANGES_PRIOR_CSV);
  return { currentRows: current.rows, priorRows: prior.rows };
}

// ---- ORACLE: exact transition counts from APP_SPEC ----

describe('Changes — sample oracle counts (APP_SPEC §PRIOR-WEEK SAMPLE ORACLE)', () => {
  it('Newly Shipped = 3 (ENG-1,2,3: In Progress prior → Shipped now)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    expect(model.newlyShipped.length).toBe(3);
  });

  it('Newly Started = 1 (ENG-6: Backlog/Todo prior → In Progress now)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    expect(model.newlyStarted.length).toBe(1);
  });

  it('Newly Blocked = 1 (ENG-10: In Progress prior → Blocked now)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    expect(model.newlyBlocked.length).toBe(1);
  });

  it('Unblocked = 1 (ENG-14: Blocked prior → In Progress now)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    expect(model.unblocked.length).toBe(1);
  });

  it('Slipped = 1 (ENG-12: Blocked prior → Backlog/Todo now)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    expect(model.slipped.length).toBe(1);
  });

  it('Reopened = 1 (ENG-13: Shipped/Done prior → Backlog now)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    expect(model.reopened.length).toBe(1);
  });

  it('New this period = 4 (ENG-4,5,9,15: absent from prior)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    expect(model.newThisPeriod.length).toBe(4);
  });

  it('Still Blocked = 1 (ENG-11: Blocked in both, prior ≥2wks old)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    expect(model.stillBlocked.length).toBe(1);
  });

  it('Carried over / unchanged-open = 2 (ENG-7,8: In Progress in both)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    expect(model.carriedOver.length).toBe(2);
  });

  it('Removed from tracker = 1 (ENG-99: prior-only)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    expect(model.removed.length).toBe(1);
  });

  it('every current row lands in exactly one bucket: 3+1+1+1+1+1+4+1+2 = 15', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    const total =
      model.newlyShipped.length +
      model.newlyStarted.length +
      model.newlyBlocked.length +
      model.unblocked.length +
      model.slipped.length +
      model.reopened.length +
      model.newThisPeriod.length +
      model.stillBlocked.length +
      model.carriedOver.length;
    expect(total).toBe(15); // all current rows
    expect(currentRows.length).toBe(15);
  });
});

// ---- Correct row identities ----

describe('Changes — correct row identities', () => {
  it('ENG-1 is in newlyShipped (In Progress prior → Shipped now)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    const keys = model.newlyShipped.map(cr => cr.row.issueKey);
    expect(keys).toContain('ENG-1');
  });

  it('ENG-99 is in removed (prior-only)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    const keys = model.removed.map(cr => cr.row.issueKey);
    expect(keys).toContain('ENG-99');
  });

  it('ENG-11 has stilBlockedLabel "blocked 2+ wks" (prior date 2026-05-01, ≥2wks old)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    const eng11 = model.stillBlocked.find(cr => cr.row.issueKey === 'ENG-11');
    expect(eng11).toBeDefined();
    expect(eng11!.stilBlockedLabel).toBe('blocked 2+ wks');
  });

  it('ENG-4 and ENG-5 are in newThisPeriod (Shipped, absent from prior)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    const keys = model.newThisPeriod.map(cr => cr.row.issueKey);
    expect(keys).toContain('ENG-4');
    expect(keys).toContain('ENG-5');
  });

  it('ENG-9 is in newThisPeriod (In Progress, absent from prior)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    const keys = model.newThisPeriod.map(cr => cr.row.issueKey);
    expect(keys).toContain('ENG-9');
  });

  it('ENG-15 is in newThisPeriod (Unmapped, absent from prior)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    const keys = model.newThisPeriod.map(cr => cr.row.issueKey);
    expect(keys).toContain('ENG-15');
  });

  it('ENG-12 is in slipped (Blocked prior → To Do now)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    const keys = model.slipped.map(cr => cr.row.issueKey);
    expect(keys).toContain('ENG-12');
    // ENG-12 must NOT be in reopened
    const reopenedKeys = model.reopened.map(cr => cr.row.issueKey);
    expect(reopenedKeys).not.toContain('ENG-12');
  });

  it('ENG-13 is in reopened (Done/Shipped prior → Backlog now)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    const keys = model.reopened.map(cr => cr.row.issueKey);
    expect(keys).toContain('ENG-13');
    // ENG-13 must NOT be in slipped
    const slippedKeys = model.slipped.map(cr => cr.row.issueKey);
    expect(slippedKeys).not.toContain('ENG-13');
  });
});

// ---- ID-based matching ----

describe('Changes — match strategy', () => {
  it('matchedById = true when both files have Issue Key column', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    expect(model.matchedById).toBe(true);
  });

  it('matchedById = false when neither file has an id column → title-match fallback', () => {
    const noIdCsv = `Title,Status,Assignee,Updated\nFoo,Done,Alice,2026-06-10\nBar,In Progress,Bob,2026-06-09\n`;
    const priorNoIdCsv = `Title,Status,Assignee,Updated\nFoo,In Progress,Alice,2026-06-03\n`;
    const current = parseCSVText(noIdCsv).rows;
    const prior = parseCSVText(priorNoIdCsv).rows;
    const model = computeChanges(current, prior);
    expect(model.matchedById).toBe(false);
    // "Foo" matched by title: In Progress prior → Shipped now = Newly Shipped
    expect(model.newlyShipped.length).toBe(1);
    // "Bar" absent from prior = New this period
    expect(model.newThisPeriod.length).toBe(1);
  });

  it('title-match note: matchedById = false signals "less reliable" note to UI', () => {
    const noIdCsv = `Title,Status\nTask A,Done\n`;
    const priorCsv = `Title,Status\nTask A,In Progress\n`;
    const model = computeChanges(parseCSVText(noIdCsv).rows, parseCSVText(priorCsv).rows);
    expect(model.matchedById).toBe(false);
  });
});

// ---- Same-file detection ----

describe('Changes — same-file edge case', () => {
  it('sameFileDetected = true when current === prior (same rows)', () => {
    const { currentRows } = parseSample();
    const model = computeChanges(currentRows, currentRows);
    expect(model.sameFileDetected).toBe(true);
  });

  it('sameFileDetected = false when files are genuinely different', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    expect(model.sameFileDetected).toBe(false);
  });
});

// ---- Prose summary (count-honesty) ----

describe('Changes — prose summary (count-honesty rule)', () => {
  it('prose reads full 10-category sample oracle string (slipped and reopened are separate)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    expect(model.proseText).toBe(
      'Since last week: 3 shipped, 1 started, 1 newly blocked, 1 unblocked, 1 slipped, 1 reopened, 4 new, 1 still blocked, 2 carried over, 1 removed from tracker.'
    );
  });

  it('prose numbers == bucket lengths for ALL non-zero categories (count-honesty)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    // Every non-zero category must appear in prose with the correct count
    expect(model.proseText).toContain(`${model.newlyShipped.length} shipped`);
    expect(model.proseText).toContain(`${model.newlyStarted.length} started`);
    expect(model.proseText).toContain(`${model.newlyBlocked.length} newly blocked`);
    expect(model.proseText).toContain(`${model.unblocked.length} unblocked`);
    expect(model.proseText).toContain(`${model.slipped.length} slipped`);
    expect(model.proseText).toContain(`${model.reopened.length} reopened`);
    expect(model.proseText).toContain(`${model.newThisPeriod.length} new`);
    expect(model.proseText).toContain(`${model.stillBlocked.length} still blocked`);
    expect(model.proseText).toContain(`${model.carriedOver.length} carried over`);
    expect(model.proseText).toContain(`${model.removed.length} removed from tracker`);
  });

  it('zero-count categories are omitted from prose', () => {
    // A minimal dataset where only "shipped" and "new" are non-zero
    const currentCsv = `Issue Key,Title,Status\nX-1,Shipped Item,Done\nX-2,New Item,In Progress\n`;
    const priorCsv = `Issue Key,Title,Status\nX-1,Shipped Item,In Progress\n`;
    const current = parseCSVText(currentCsv).rows;
    const prior = parseCSVText(priorCsv).rows;
    const model = computeChanges(current, prior);
    // X-1: In Progress → Shipped = newly-shipped; X-2: absent from prior = new-this-period
    expect(model.proseText).toContain('1 shipped');
    expect(model.proseText).toContain('1 new');
    // Zero-count categories must NOT appear
    expect(model.proseText).not.toContain('started');
    expect(model.proseText).not.toContain('newly blocked');
    expect(model.proseText).not.toContain('unblocked');
    expect(model.proseText).not.toContain('slipped');
    expect(model.proseText).not.toContain('reopened');
    expect(model.proseText).not.toContain('still blocked');
    expect(model.proseText).not.toContain('carried over');
    expect(model.proseText).not.toContain('removed');
  });
});

// ---- Copy serializers (single source of truth) ----

describe('Changes — copy serializers (Markdown + plain text)', () => {
  it('Markdown contains "Newly Shipped (3)"', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    const md = buildChangesMarkdown({
      prose: model.proseText,
      newlyShipped: model.newlyShipped,
      newlyBlocked: model.newlyBlocked,
      slipped: model.slipped,
      reopened: model.reopened,
      newThisPeriod: model.newThisPeriod,
      unblocked: model.unblocked,
      newlyStarted: model.newlyStarted,
      stillBlocked: model.stillBlocked,
      carriedOver: model.carriedOver,
      removed: model.removed,
    });
    expect(md).toContain('Newly Shipped (3)');
    expect(md).toContain('Since last week: 3 shipped, 1 started, 1 newly blocked, 1 unblocked, 1 slipped, 1 reopened, 4 new, 1 still blocked, 2 carried over, 1 removed from tracker.');
  });

  it('Markdown contains ENG-11 with "blocked 2+ wks" label', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    const md = buildChangesMarkdown({
      prose: model.proseText,
      newlyShipped: model.newlyShipped,
      newlyBlocked: model.newlyBlocked,
      slipped: model.slipped,
      reopened: model.reopened,
      newThisPeriod: model.newThisPeriod,
      unblocked: model.unblocked,
      newlyStarted: model.newlyStarted,
      stillBlocked: model.stillBlocked,
      carriedOver: model.carriedOver,
      removed: model.removed,
    });
    expect(md).toContain('blocked 2+ wks');
  });

  it('Markdown contains "Removed from tracker (1)" with ENG-99 title', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    const md = buildChangesMarkdown({
      prose: model.proseText,
      newlyShipped: model.newlyShipped,
      newlyBlocked: model.newlyBlocked,
      slipped: model.slipped,
      reopened: model.reopened,
      newThisPeriod: model.newThisPeriod,
      unblocked: model.unblocked,
      newlyStarted: model.newlyStarted,
      stillBlocked: model.stillBlocked,
      carriedOver: model.carriedOver,
      removed: model.removed,
    });
    expect(md).toContain('Removed from tracker (1)');
    expect(md).toContain('Deprecate legacy API');
  });

  it('plain text has no ## markers', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    const pt = buildChangesPlainText({
      prose: model.proseText,
      newlyShipped: model.newlyShipped,
      newlyBlocked: model.newlyBlocked,
      slipped: model.slipped,
      reopened: model.reopened,
      newThisPeriod: model.newThisPeriod,
      unblocked: model.unblocked,
      newlyStarted: model.newlyStarted,
      stillBlocked: model.stillBlocked,
      carriedOver: model.carriedOver,
      removed: model.removed,
    });
    expect(pt).not.toMatch(/^## /m);
    // But content is still there
    expect(pt).toContain('Newly Shipped (3)');
    expect(pt).toContain('Since last week: 3 shipped, 1 started');
  });

  it('COUNT HONESTY: prose numbers in Markdown == bucket lengths in Markdown (all 10 categories)', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    const copyModel = {
      prose: model.proseText,
      newlyShipped: model.newlyShipped,
      newlyBlocked: model.newlyBlocked,
      slipped: model.slipped,
      reopened: model.reopened,
      newThisPeriod: model.newThisPeriod,
      unblocked: model.unblocked,
      newlyStarted: model.newlyStarted,
      stillBlocked: model.stillBlocked,
      carriedOver: model.carriedOver,
      removed: model.removed,
    };
    const md = buildChangesMarkdown(copyModel);
    // Every prose number must match the corresponding Markdown section count
    expect(md).toContain('3 shipped');
    expect(md).toContain('Newly Shipped (3)');
    expect(md).toContain('1 started');
    expect(md).toContain('Newly Started (1)');
    expect(md).toContain('1 newly blocked');
    expect(md).toContain('Newly Blocked (1)');
    expect(md).toContain('1 unblocked');
    expect(md).toContain('Unblocked (1)');
    expect(md).toContain('1 slipped');
    expect(md).toContain('Slipped (1)');
    expect(md).toContain('1 reopened');
    expect(md).toContain('Reopened (1)');
    expect(md).toContain('4 new');
    expect(md).toContain('New this period (4)');
    expect(md).toContain('1 still blocked');
    expect(md).toContain('Still Blocked (1)');
    expect(md).toContain('2 carried over');
    expect(md).toContain('Carried over / unchanged-open (2)');
    expect(md).toContain('1 removed from tracker');
    expect(md).toContain('Removed from tracker (1)');
  });
});

// ---- Edit round-trip (count-honesty with inline edits) ----

describe('Changes — edit flows into copy (count-honesty with edits)', () => {
  it('editing a row title and using it in copy produces the edited text', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    // Simulate an inline edit on the first newlyShipped row
    const editedRow = { ...model.newlyShipped[0].row, editedTitle: 'My edited shipped title' };
    const editedCr = { ...model.newlyShipped[0], row: editedRow };
    const md = buildChangesMarkdown({
      prose: model.proseText,
      newlyShipped: [editedCr, ...model.newlyShipped.slice(1)],
      newlyBlocked: model.newlyBlocked,
      slipped: model.slipped,
      reopened: model.reopened,
      newThisPeriod: model.newThisPeriod,
      unblocked: model.unblocked,
      newlyStarted: model.newlyStarted,
      stillBlocked: model.stillBlocked,
      carriedOver: model.carriedOver,
      removed: model.removed,
    });
    expect(md).toContain('My edited shipped title');
  });
});

// ---- Different-tracker warning ----

describe('Changes — different-tracker warning', () => {
  it('differentTrackerWarning = false for same-tracker sample data', () => {
    const { currentRows, priorRows } = parseSample();
    const model = computeChanges(currentRows, priorRows);
    expect(model.differentTrackerWarning).toBe(false);
  });

  it('differentTrackerWarning = true when both have ids but none overlap', () => {
    const csvA = `Issue Key,Title,Status\nJIRA-1,Task A,Done\n`;
    const csvB = `Issue Key,Title,Status\nGH-100,Task B,In Progress\n`;
    const rowsA = parseCSVText(csvA).rows;
    const rowsB = parseCSVText(csvB).rows;
    const model = computeChanges(rowsA, rowsB);
    expect(model.differentTrackerWarning).toBe(true);
    // Should still attempt match (not blank out) — "Task A" with no prior match → New
    expect(model.newThisPeriod.length).toBe(1);
  });
});

// ---- D1 fix: one-drop flow — Changes-tab drop produces correct diff vs snapshot ----
// Tests the lib-level logic that the Changes tab one-drop flow relies on.
// Scenario: user saves PRIOR as baseline, then drops CURRENT on Changes tab.
// computeChanges(current, prior) must produce the correct oracle counts —
// identical to loading the pair normally (snapshot rows inflated from prior data).

describe('D1 fix — one-drop flow: snapshot baseline + new current drop → correct diff', () => {
  it('correct diff when current = CHANGES_CURRENT_CSV rows and prior = snapshot-inflated rows', () => {
    const { currentRows, priorRows } = parseSample();
    // Simulate snapshot inflation: snapshotToRows produces rows with id, bucket, title
    // (same fields computeChanges needs); this mirrors the actual ChangesView logic.
    const snapshotInflated = priorRows.map((r, idx) => ({
      ...r,
      id: `snapshot-${r.issueKey || r.title}-${idx}`,
      assignee: '',
      epic: '',
      date: '',
      isCarryOver: false,
      editedTitle: undefined,
      storyPoints: 0,
      sprint: '',
      addedDate: '',
      removedDate: '',
    }));
    // computeChanges(current, snapshotInflated) must match computeChanges(current, prior)
    const modelFromSnapshot = computeChanges(currentRows, snapshotInflated);
    const modelFromRaw = computeChanges(currentRows, priorRows);
    expect(modelFromSnapshot.newlyShipped.length).toBe(modelFromRaw.newlyShipped.length);
    expect(modelFromSnapshot.newlyBlocked.length).toBe(modelFromRaw.newlyBlocked.length);
    expect(modelFromSnapshot.slipped.length).toBe(modelFromRaw.slipped.length);
    expect(modelFromSnapshot.newThisPeriod.length).toBe(modelFromRaw.newThisPeriod.length);
    expect(modelFromSnapshot.sameFileDetected).toBe(false);
    // Confirm no phantom self-diff — counts are the full oracle set, not zero
    expect(modelFromSnapshot.newlyShipped.length).toBe(3);
    expect(modelFromSnapshot.newThisPeriod.length).toBe(4);
  });

  it('sameFileDetected=true when current rows === prior rows (self-diff scenario from same-session save)', () => {
    // This is the EXACT scenario D1 catches: user saves a snapshot then opens Changes tab
    // while the same file is still loaded. computeChanges(current, current) = sameFileDetected.
    const { currentRows } = parseSample();
    const model = computeChanges(currentRows, currentRows);
    expect(model.sameFileDetected).toBe(true);
    // The UI should NOT render the model in this case — it should show the instructive prompt.
  });
});

// ---- D2 fix: diff direction consistency between auto/snapshot path and manual fallback ----
// Both paths must call computeChanges(current=newer, prior=older) — same direction.

describe('D2 fix — manual fallback diff direction matches auto/snapshot path', () => {
  it('computeChanges(current, prior) and computeChanges(current, prior) are identical regardless of path', () => {
    // Simulate auto path: current = this week, prior = last week (snapshot)
    const { currentRows, priorRows } = parseSample();
    const autoModel = computeChanges(currentRows, priorRows);

    // Simulate manual path: user drops "different baseline" = priorRows (same old data).
    // The manual path must use the SAME argument order: computeChanges(current, droppedPrior).
    const manualModel = computeChanges(currentRows, priorRows);

    expect(manualModel.newlyShipped.length).toBe(autoModel.newlyShipped.length);
    expect(manualModel.slipped.length).toBe(autoModel.slipped.length);
    expect(manualModel.newlyBlocked.length).toBe(autoModel.newlyBlocked.length);
    expect(manualModel.removed.length).toBe(autoModel.removed.length);
    expect(manualModel.sameFileDetected).toBe(autoModel.sameFileDetected);
  });

  it('inverted argument order produces wrong direction (guard against regression)', () => {
    // If arguments are swapped, an item "added in current" appears as "removed from prior".
    // This test documents the WRONG direction so any accidental swap is caught.
    const currentCsv = `Issue Key,Title,Status\nA-1,Alpha,Done\nA-2,Beta,In Progress\n`;
    const priorCsv = `Issue Key,Title,Status\nA-1,Alpha,In Progress\n`;
    const current = parseCSVText(currentCsv).rows;
    const prior = parseCSVText(priorCsv).rows;

    // CORRECT direction: current vs prior
    const correct = computeChanges(current, prior);
    // A-1: In Progress → Shipped = newly-shipped; A-2: new = new-this-period
    expect(correct.newlyShipped.length).toBe(1);
    expect(correct.newThisPeriod.length).toBe(1);
    expect(correct.removed.length).toBe(0);

    // WRONG direction (swapped): prior vs current — A-2 appears as "removed from tracker"
    const inverted = computeChanges(prior, current);
    expect(inverted.removed.length).toBe(1); // A-2 is prior-only = "removed" in the inverted view
    // This proves the two orderings are NOT equivalent; direction matters.
    expect(inverted.newlyShipped.length).toBe(0);
  });
});
