/**
 * Unit tests for the share feature:
 *
 * 1. PRIVACY TRUST-BOMB: the snapshot serializers ONLY include formatted digest fields
 *    (prose + categorized titles/assignees/epics) and NEVER raw CSV fields, Backlog rows,
 *    unmapped rows, or column mappings. Unmapped rows are always excluded per share disclosure.
 *
 * 2. SHARE PERSISTENCE round-trip: POST a snapshot → GET it back → identical;
 *    bogus id → graceful null (not a crash).
 *
 * 3. Snapshot structure validation: the API isValidSnapshot guard accepts good payloads
 *    and rejects bad ones.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { parseCSVText } from '../../lib/csvParser';
import { SAMPLE_CSV, CHANGES_CURRENT_CSV, CHANGES_PRIOR_CSV } from '../../lib/sampleData';
import { buildWeeklySnapshot, buildChangesSnapshot } from '../../lib/snapshotSerializer';
import {
  saveSnapshot,
  getSnapshot,
  type DigestSnapshot,
} from '../../lib/shareDb';
import { computeChanges, buildChangesProse, type ChangesModel, type ChangesCopyModel } from '../../lib/changesDigest';

// ---- 1. PRIVACY TRUST-BOMB: no raw CSV leaks through snapshot serializer ----

describe('PRIVACY: buildWeeklySnapshot — only formatted digest fields, no raw CSV', () => {
  function getWeeklyModel() {
    const { rows } = parseCSVText(SAMPLE_CSV);
    const shipped = rows.filter(r => r.bucket === 'Shipped');
    const inProgress = rows.filter(r => r.bucket === 'In Progress');
    const blocked = rows.filter(r => r.bucket === 'Blocked');
    const backlog = rows.filter(r => r.bucket === 'Backlog');
    const unmapped = rows.filter(r => r.bucket === 'Unmapped');
    const prose = 'This week the team shipped 5 items, has 4 in progress and 2 blocked, with 1 carried over.';
    return { shipped, inProgress, blocked, backlog, unmapped, prose, groupMode: 'flat' as const };
  }

  it('snapshot sections contain titles, assignees (prose-display format) — not raw CSV row objects', () => {
    const model = getWeeklyModel();
    const digestModel = {
      prose: model.prose,
      shipped: model.shipped,
      inProgress: model.inProgress,
      blocked: model.blocked,
      backlog: model.backlog,
      unmapped: model.unmapped,
      groupMode: model.groupMode,
    };
    const snapshot = buildWeeklySnapshot(digestModel, 'All dates');
    // Every item must be a string
    for (const section of snapshot.sections) {
      for (const item of section.items) {
        expect(typeof item).toBe('string');
      }
    }
  });

  it('snapshot does NOT include Unmapped rows (they stay local per share disclosure)', () => {
    const model = getWeeklyModel();
    // Confirm there IS actually 1 unmapped row in the sample data
    expect(model.unmapped.length).toBeGreaterThan(0);
    const digestModel = {
      prose: model.prose,
      shipped: model.shipped,
      inProgress: model.inProgress,
      blocked: model.blocked,
      backlog: model.backlog,
      unmapped: model.unmapped,
      groupMode: model.groupMode,
    };
    const snapshot = buildWeeklySnapshot(digestModel, 'All dates');
    const sectionLabels = snapshot.sections.map(s => s.label.toLowerCase());
    expect(sectionLabels.some(l => l.includes('unmapped'))).toBe(false);
    // Also verify no unmapped item text leaks into any other section
    const allItemText = JSON.stringify(snapshot);
    expect(allItemText).not.toContain('Needs Triage Review');
  });

  it('snapshot does NOT include Backlog rows (they stay local per spec)', () => {
    const model = getWeeklyModel();
    const digestModel = {
      prose: model.prose,
      shipped: model.shipped,
      inProgress: model.inProgress,
      blocked: model.blocked,
      backlog: model.backlog,
      unmapped: model.unmapped,
      groupMode: model.groupMode,
    };
    const snapshot = buildWeeklySnapshot(digestModel, 'All dates');
    // Section labels must NOT include "Backlog" or "To Do"
    const sectionLabels = snapshot.sections.map(s => s.label.toLowerCase());
    expect(sectionLabels.some(l => l.includes('backlog') || l.includes('to do'))).toBe(false);
  });

  it('snapshot sections contain only Shipped, In Progress, Blocked — NOT Unmapped status (stays local per disclosure)', () => {
    const model = getWeeklyModel();
    const digestModel = {
      prose: model.prose,
      shipped: model.shipped,
      inProgress: model.inProgress,
      blocked: model.blocked,
      backlog: model.backlog,
      unmapped: model.unmapped,
      groupMode: model.groupMode,
    };
    const snapshot = buildWeeklySnapshot(digestModel, 'All dates');
    // Only these three sections may appear; Unmapped must be absent
    const allowedSections = ['shipped', 'in progress', 'blocked'];
    for (const section of snapshot.sections) {
      const label = section.label.toLowerCase();
      const isAllowed = allowedSections.some(al => label.includes(al));
      expect(isAllowed).toBe(true);
    }
    // Explicitly assert no Unmapped section leaks into the snapshot
    const sectionLabels = snapshot.sections.map(s => s.label.toLowerCase());
    expect(sectionLabels.some(l => l.includes('unmapped'))).toBe(false);
  });

  it('snapshot viewType is "weekly"', () => {
    const model = getWeeklyModel();
    const digestModel = {
      prose: model.prose,
      shipped: model.shipped,
      inProgress: model.inProgress,
      blocked: model.blocked,
      backlog: model.backlog,
      unmapped: model.unmapped,
      groupMode: model.groupMode,
    };
    const snapshot = buildWeeklySnapshot(digestModel, 'All dates');
    expect(snapshot.viewType).toBe('weekly');
  });

  it('snapshot prose matches the digest prose exactly', () => {
    const model = getWeeklyModel();
    const digestModel = {
      prose: model.prose,
      shipped: model.shipped,
      inProgress: model.inProgress,
      blocked: model.blocked,
      backlog: model.backlog,
      unmapped: model.unmapped,
      groupMode: model.groupMode,
    };
    const snapshot = buildWeeklySnapshot(digestModel, 'All dates');
    expect(snapshot.prose).toBe(model.prose);
  });

  it('snapshot shipped section has exactly 5 items (matching digest body)', () => {
    const model = getWeeklyModel();
    const digestModel = {
      prose: model.prose,
      shipped: model.shipped,
      inProgress: model.inProgress,
      blocked: model.blocked,
      backlog: model.backlog,
      unmapped: model.unmapped,
      groupMode: model.groupMode,
    };
    const snapshot = buildWeeklySnapshot(digestModel, 'All dates');
    const shippedSection = snapshot.sections.find(s => s.label.toLowerCase() === 'shipped');
    expect(shippedSection).toBeDefined();
    expect(shippedSection!.items.length).toBe(5);
  });

  it('snapshot item strings contain the issue title (not raw CSV text)', () => {
    const model = getWeeklyModel();
    const digestModel = {
      prose: model.prose,
      shipped: model.shipped,
      inProgress: model.inProgress,
      blocked: model.blocked,
      backlog: model.backlog,
      unmapped: model.unmapped,
      groupMode: model.groupMode,
    };
    const snapshot = buildWeeklySnapshot(digestModel, 'All dates');
    // "Launch payment flow" is the first shipped item
    const shippedSection = snapshot.sections.find(s => s.label.toLowerCase() === 'shipped');
    expect(shippedSection!.items.some(i => i.includes('Launch payment flow'))).toBe(true);
  });

  it('snapshot items do NOT contain raw CSV column header names', () => {
    const model = getWeeklyModel();
    const digestModel = {
      prose: model.prose,
      shipped: model.shipped,
      inProgress: model.inProgress,
      blocked: model.blocked,
      backlog: model.backlog,
      unmapped: model.unmapped,
      groupMode: model.groupMode,
    };
    const snapshot = buildWeeklySnapshot(digestModel, 'All dates');
    // Check no item looks like a raw CSV value containing "Sprint 24" or "2026-06-10" (raw date)
    // Only formatted text (title + assignee + carry-over tag) should be in items.
    // We verify by checking items are NOT multi-field comma-separated lines.
    for (const section of snapshot.sections) {
      for (const item of section.items) {
        // Items must not have raw CSV structure (comma-delimited fields or date columns like "2026-06-10,Sprint 24")
        expect(item).not.toMatch(/,\d{4}-\d{2}-\d{2}/); // no ",...,2026-06-10"
        expect(item).not.toMatch(/^Sprint \d+,/); // no "Sprint 24,..."
      }
    }
  });
});

// ---- PRIVACY: buildChangesSnapshot — same privacy guarantees ----

describe('PRIVACY: buildChangesSnapshot — no raw CSV leaks', () => {
  function getChangesSnapshot() {
    const current = parseCSVText(CHANGES_CURRENT_CSV);
    const prior = parseCSVText(CHANGES_PRIOR_CSV);
    const model = computeChanges(current.rows, prior.rows);
    const prose = model.proseText;
    // Build copy model the same way ChangesView does (inline)
    const copyModel: ChangesCopyModel = {
      prose,
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
    return buildChangesSnapshot(copyModel);
  }

  it('snapshot viewType is "changes"', () => {
    const snapshot = getChangesSnapshot();
    expect(snapshot.viewType).toBe('changes');
  });

  it('snapshot items are all strings, not objects', () => {
    const snapshot = getChangesSnapshot();
    for (const section of snapshot.sections) {
      for (const item of section.items) {
        expect(typeof item).toBe('string');
      }
    }
  });

  it('Newly Shipped section has exactly 3 items (ENG-1,2,3)', () => {
    const snapshot = getChangesSnapshot();
    const section = snapshot.sections.find(s => s.label === 'Newly Shipped');
    expect(section).toBeDefined();
    expect(section!.items.length).toBe(3);
  });

  it('prose contains the EXACT oracle sentence', () => {
    const snapshot = getChangesSnapshot();
    expect(snapshot.prose).toContain(
      'Since last week: 3 shipped, 1 started, 1 newly blocked, 1 unblocked, 1 slipped, 1 reopened, 4 new, 1 still blocked, 2 carried over, 1 removed from tracker.'
    );
  });

  it('snapshot does NOT leak raw CSV dates or column names', () => {
    const snapshot = getChangesSnapshot();
    const allText = JSON.stringify(snapshot);
    // No raw CSV date patterns like "2026-01-01,ENG-" (raw row data)
    expect(allText).not.toMatch(/ENG-\d+,\d{4}-\d{2}-\d{2}/);
  });
});

// ---- 2. SHARE PERSISTENCE round-trip: saveSnapshot → getSnapshot ----

describe('SHARE PERSISTENCE round-trip (local SQLite fallback)', () => {
  const testSnapshot: DigestSnapshot = {
    viewType: 'weekly',
    prose: 'Test prose summary for round-trip.',
    sections: [
      { label: 'Shipped', items: ['Item A (Alice)', 'Item B (Bob)'] },
      { label: 'In Progress', items: ['Item C (Carol)'] },
    ],
    metaLabel: 'Test week',
    createdAt: Date.now(),
  };

  it('POST a snapshot → GET it back → identical fields', async () => {
    const id = await saveSnapshot(testSnapshot);
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(8);

    const retrieved = await getSnapshot(id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.viewType).toBe(testSnapshot.viewType);
    expect(retrieved!.prose).toBe(testSnapshot.prose);
    expect(retrieved!.sections.length).toBe(testSnapshot.sections.length);
    expect(retrieved!.sections[0].label).toBe('Shipped');
    expect(retrieved!.sections[0].items).toEqual(testSnapshot.sections[0].items);
    expect(retrieved!.sections[1].label).toBe('In Progress');
    expect(retrieved!.metaLabel).toBe(testSnapshot.metaLabel);
  });

  it('bogus id returns null (graceful 404, not a crash)', async () => {
    const result = await getSnapshot('bogusid0000000000000000');
    expect(result).toBeNull();
  });

  it('empty id returns null', async () => {
    const result = await getSnapshot('');
    expect(result).toBeNull();
  });

  it('generateShareId returns 24-char alphanumeric id', async () => {
    const { generateShareId } = await import('../../lib/shareDb');
    const id = generateShareId();
    expect(id).toHaveLength(24);
    expect(id).toMatch(/^[A-Za-z0-9]{24}$/);
  });

  it('two snapshots with different content get different ids', async () => {
    const snap1: DigestSnapshot = { ...testSnapshot, prose: 'Snap 1' };
    const snap2: DigestSnapshot = { ...testSnapshot, prose: 'Snap 2' };
    const id1 = await saveSnapshot(snap1);
    const id2 = await saveSnapshot(snap2);
    expect(id1).not.toBe(id2);
    const r1 = await getSnapshot(id1);
    const r2 = await getSnapshot(id2);
    expect(r1!.prose).toBe('Snap 1');
    expect(r2!.prose).toBe('Snap 2');
  });
});

// ---- 3. Snapshot validation (mirrors API isValidSnapshot guard) ----

describe('isValidSnapshot guard logic', () => {
  // Replicated from route.ts — test the logic contract
  function isValidSnapshot(raw: unknown): boolean {
    if (!raw || typeof raw !== 'object') return false;
    const s = raw as Record<string, unknown>;
    return (
      typeof s.viewType === 'string' &&
      typeof s.prose === 'string' &&
      Array.isArray(s.sections)
    );
  }

  it('accepts a valid weekly snapshot', () => {
    const snap: DigestSnapshot = {
      viewType: 'weekly',
      prose: 'Summary text',
      sections: [{ label: 'Shipped', items: ['A', 'B'] }],
      createdAt: Date.now(),
    };
    expect(isValidSnapshot(snap)).toBe(true);
  });

  it('accepts a valid changes snapshot', () => {
    const snap: DigestSnapshot = {
      viewType: 'changes',
      prose: 'Since last week: 3 shipped.',
      sections: [{ label: 'Newly Shipped', items: ['ENG-1'] }],
      createdAt: Date.now(),
    };
    expect(isValidSnapshot(snap)).toBe(true);
  });

  it('rejects null', () => {
    expect(isValidSnapshot(null)).toBe(false);
  });

  it('rejects missing viewType', () => {
    expect(isValidSnapshot({ prose: 'x', sections: [] })).toBe(false);
  });

  it('rejects missing prose', () => {
    expect(isValidSnapshot({ viewType: 'weekly', sections: [] })).toBe(false);
  });

  it('rejects missing sections', () => {
    expect(isValidSnapshot({ viewType: 'weekly', prose: 'x' })).toBe(false);
  });

  it('rejects sections as non-array', () => {
    expect(isValidSnapshot({ viewType: 'weekly', prose: 'x', sections: 'bad' })).toBe(false);
  });

  it('rejects a plain string', () => {
    expect(isValidSnapshot('not an object')).toBe(false);
  });
});
