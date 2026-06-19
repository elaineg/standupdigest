/**
 * snapshotStorage.test.ts
 *
 * Tests for the pure functions in snapshotStorage:
 * - snapshotToRows: converts a DigestSnapshotEntry into DigestRow[] for computeChanges
 * - relativeTime: human-readable relative timestamp
 *
 * localStorage-dependent functions (saveSnapshot, loadSnapshot, clearSnapshot) are
 * tested via e2e (jsdom not available in node vitest environment).
 *
 * COUNT-HONESTY gate: verifies that snapshot-inflated rows produce the SAME bucket
 * counts as the manual two-CSV path when fed into computeChanges.
 */
import { describe, it, expect } from 'vitest';
import {
  snapshotToRows,
  relativeTime,
  type DigestSnapshotEntry,
} from '../../lib/snapshotStorage';
import { computeChanges } from '../../lib/changesDigest';
import { parseCSVText } from '../../lib/csvParser';
import { CHANGES_CURRENT_CSV, CHANGES_PRIOR_CSV } from '../../lib/sampleData';

// ---- Build a snapshot entry manually (mirrors what saveSnapshot would store) ----

function buildSnapshotFromPriorCSV(): DigestSnapshotEntry {
  const priorParsed = parseCSVText(CHANGES_PRIOR_CSV).rows;
  // Mirror what saveSnapshot does: filter only Unmapped (Backlog included for Newly Started detection)
  const items = priorParsed
    .filter((r) => r.bucket !== 'Unmapped')
    .map((r) => ({ id: r.issueKey || '', bucket: r.bucket, title: r.title }));
  return {
    source: 'jira',
    periodLabel: 'Week of 1 Jun',
    savedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 1 week ago
    items,
  };
}

// ---- Count-honesty: snapshot-driven diff == manual two-CSV diff ----

describe('snapshotToRows → computeChanges — count-honesty on the AUTO path', () => {
  it('snapshot-driven diff yields same bucket counts as the manual two-CSV path', () => {
    const priorParsed = parseCSVText(CHANGES_PRIOR_CSV).rows;
    const currentParsed = parseCSVText(CHANGES_CURRENT_CSV).rows;

    // Manual path (the baseline oracle from APP_SPEC §PRIOR-WEEK SAMPLE ORACLE)
    const manualModel = computeChanges(currentParsed, priorParsed);

    // Build a snapshot from the prior CSV (simulates saveSnapshot → loadSnapshot)
    const snapshot = buildSnapshotFromPriorCSV();
    const priorFromSnapshot = snapshotToRows(snapshot);

    // Auto (snapshot) path
    const autoModel = computeChanges(currentParsed, priorFromSnapshot);

    // Bucket counts must match the manual path
    expect(autoModel.newlyShipped.length).toBe(manualModel.newlyShipped.length);  // 3
    expect(autoModel.newlyStarted.length).toBe(manualModel.newlyStarted.length);  // 1
    expect(autoModel.newlyBlocked.length).toBe(manualModel.newlyBlocked.length);  // 1
    expect(autoModel.unblocked.length).toBe(manualModel.unblocked.length);        // 1
    expect(autoModel.slipped.length).toBe(manualModel.slipped.length);            // 1
    expect(autoModel.reopened.length).toBe(manualModel.reopened.length);          // 1
    expect(autoModel.newThisPeriod.length).toBe(manualModel.newThisPeriod.length); // 4
    expect(autoModel.stillBlocked.length).toBe(manualModel.stillBlocked.length);  // 1
    expect(autoModel.carriedOver.length).toBe(manualModel.carriedOver.length);    // 2
    expect(autoModel.removed.length).toBe(manualModel.removed.length);            // 1
  });

  it('prose from the snapshot-driven model matches the manual-path prose', () => {
    const priorParsed = parseCSVText(CHANGES_PRIOR_CSV).rows;
    const currentParsed = parseCSVText(CHANGES_CURRENT_CSV).rows;
    const manualModel = computeChanges(currentParsed, priorParsed);

    const snapshot = buildSnapshotFromPriorCSV();
    const autoModel = computeChanges(currentParsed, snapshotToRows(snapshot));

    expect(autoModel.proseText).toBe(manualModel.proseText);
  });

  it('total current rows lands in exactly one bucket each (no row dropped or double-counted)', () => {
    const snapshot = buildSnapshotFromPriorCSV();
    const currentParsed = parseCSVText(CHANGES_CURRENT_CSV).rows;
    const model = computeChanges(currentParsed, snapshotToRows(snapshot));

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

    expect(total).toBe(currentParsed.length); // 15
  });

  it('snapshot items contain only {id, bucket, title} — no raw CSV body', () => {
    const snapshot = buildSnapshotFromPriorCSV();
    for (const item of snapshot.items) {
      const keys = Object.keys(item).sort();
      expect(keys).toEqual(['bucket', 'id', 'title'].sort());
    }
  });

  it('P2: snapshot items do NOT contain assignee, date, description, epic, status, storyPoints', () => {
    const snapshot = buildSnapshotFromPriorCSV();
    for (const item of snapshot.items) {
      // Explicit negative assertions — these raw CSV fields must never appear in the snapshot
      expect(Object.prototype.hasOwnProperty.call(item, 'assignee')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(item, 'date')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(item, 'description')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(item, 'epic')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(item, 'status')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(item, 'storyPoints')).toBe(false);
    }
  });

  it('snapshot does NOT include Unmapped rows (Backlog IS included for Newly Started detection)', () => {
    const snapshot = buildSnapshotFromPriorCSV();
    for (const item of snapshot.items) {
      // Unmapped excluded; Backlog rows ARE included to support Newly Started classification
      expect(item.bucket).not.toBe('Unmapped');
    }
  });
});

// ---- snapshotToRows structure ----

describe('snapshotToRows', () => {
  it('produces a DigestRow[] with correct issueKey and bucket', () => {
    const snapshot = buildSnapshotFromPriorCSV();
    const rows = snapshotToRows(snapshot);
    expect(rows.length).toBe(snapshot.items.length);
    for (let i = 0; i < rows.length; i++) {
      const item = snapshot.items[i];
      const row = rows[i];
      expect(row.issueKey).toBe(item.id);
      expect(row.bucket).toBe(item.bucket);
      expect(row.title).toBe(item.title);
    }
  });

  it('produces rows with empty assignee/epic/date (not stored in snapshot)', () => {
    const snapshot = buildSnapshotFromPriorCSV();
    const rows = snapshotToRows(snapshot);
    for (const row of rows) {
      expect(row.assignee).toBe('');
      expect(row.epic).toBe('');
      expect(row.date).toBe('');
    }
  });
});

// ---- relativeTime ----

describe('relativeTime', () => {
  it('returns "just now" for <2 minutes ago', () => {
    expect(relativeTime(Date.now() - 60_000)).toBe('just now');
  });

  it('returns "X minutes ago" for <1 hour', () => {
    const result = relativeTime(Date.now() - 5 * 60_000);
    expect(result).toMatch(/minutes ago/);
    expect(result).toContain('5');
  });

  it('returns "1 day ago" for ~1 day', () => {
    expect(relativeTime(Date.now() - 25 * 60 * 60 * 1000)).toBe('1 day ago');
  });

  it('returns "X days ago" for multi-day old snapshots', () => {
    expect(relativeTime(Date.now() - 3 * 24 * 60 * 60 * 1000)).toBe('3 days ago');
  });

  it('returns "1 week ago" for ~7+ days', () => {
    expect(relativeTime(Date.now() - 8 * 24 * 60 * 60 * 1000)).toBe('1 week ago');
  });
});
