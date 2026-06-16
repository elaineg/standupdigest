import { describe, it, expect } from 'vitest';
import {
  getISOWeekKey,
  computeWeekOptions,
  filterRowsByWeek,
} from '../../components/DigestView';
import { parseCSVText } from '../../lib/csvParser';
import { SAMPLE_CSV } from '../../lib/sampleData';

describe('getISOWeekKey', () => {
  it('returns null for empty string', () => {
    expect(getISOWeekKey('')).toBeNull();
  });
  it('returns null for invalid date', () => {
    expect(getISOWeekKey('not-a-date')).toBeNull();
  });
  it('2026-06-14 (Sun) is in W24 2026 (Mon 8 Jun – Sun 14 Jun)', () => {
    expect(getISOWeekKey('2026-06-14')).toBe('2026-W24');
  });
  it('2026-06-08 (Mon) is in W24 2026', () => {
    expect(getISOWeekKey('2026-06-08')).toBe('2026-W24');
  });
  it('2025-01-01 is in a different week than 2026-06-14', () => {
    const key = getISOWeekKey('2025-01-01');
    expect(key).not.toBe('2026-W24');
    expect(key).not.toBeNull();
  });
});

describe('computeWeekOptions', () => {
  it('includes "All dates" option', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    const opts = computeWeekOptions(rows);
    expect(opts.some((o) => o.key === 'all')).toBe(true);
  });
  it('most recent week is first (before "All dates")', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    const opts = computeWeekOptions(rows);
    // First option should be the most recent ISO week
    expect(opts[0].key).not.toBe('all');
    expect(opts[0].key).toBe('2026-W24');
  });
  it('includes older weeks (carry-over row 2025-01-01 has its own week)', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    const opts = computeWeekOptions(rows);
    // The 2025-01-01 row generates a week key that is NOT 2026-W24
    const keys = opts.map((o) => o.key).filter((k) => k !== 'all');
    expect(keys.length).toBeGreaterThan(1); // at least 2 distinct weeks
  });
});

describe('filterRowsByWeek', () => {
  it('"all" returns all rows', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    expect(filterRowsByWeek(rows, 'all').length).toBe(15);
  });
  it('filtering by 2026-W24 keeps the carry-over row (2025-01-01, In Progress) visible', () => {
    // Spec check 9: still-open rows predating the selected week REMAIN (flagged carry-over).
    const { rows } = parseCSVText(SAMPLE_CSV);
    const filtered = filterRowsByWeek(rows, '2026-W24');
    const carryOverRow = filtered.find((r) => r.title === 'Migrate old orders');
    expect(carryOverRow).toBeDefined();
    expect(carryOverRow?.isCarryOver).toBe(true);
  });
  it('rows with no date are included regardless of week filter', () => {
    const csv = `Title,Status,Assignee,Epic,Updated
Task with date,Done,Alice,Alpha,2026-06-10
Task no date,In Progress,Bob,Beta,
`;
    const { rows } = parseCSVText(csv);
    const filtered = filterRowsByWeek(rows, '2026-W24');
    expect(filtered.find((r) => r.title === 'Task no date')).toBeDefined();
  });
  it('filtering by 2026-W24 keeps all 15 rows (14 in W24 + 1 still-open carry-over from 2025)', () => {
    // Spec check 9: the In Progress carry-over row (2025-01-01) is kept, so all 15 rows remain.
    const { rows } = parseCSVText(SAMPLE_CSV);
    const filtered = filterRowsByWeek(rows, '2026-W24');
    expect(filtered.length).toBe(15);
  });
});

describe('digest serializer — copy output matches screen model', () => {
  it('unmapped row in Markdown does NOT include phantom assignee', async () => {
    // The phantom assignee bug: unmapped rows were showing "(Bob)" in copy but not on screen.
    // Screen: title + (status: "...") only, no assignee.
    // Markdown must match screen.
    const { buildMarkdown } = await import('../../lib/digestSerializer');
    const model = {
      prose: 'Test prose',
      shipped: [],
      inProgress: [],
      blocked: [],
      backlog: [],
      unmapped: [
        {
          id: 'row-0',
          title: 'Audit accessibility issues',
          status: 'Needs Triage Review',
          assignee: 'Bob',
          epic: 'UX',
          date: '2026-06-13',
          bucket: 'Unmapped' as const,
          isCarryOver: false,
        },
      ],
      groupMode: 'assignee' as const,
    };
    const md = buildMarkdown(model);
    // Should include status
    expect(md).toContain('(status: "Needs Triage Review")');
    // Should NOT include phantom assignee (Bob) in the unmapped section
    // (the assignee appears in grouped sections but not in unmapped)
    const unmappedSection = md.split('## Unmapped')[1] ?? '';
    expect(unmappedSection).not.toContain('(Bob)');
  });

  it('epic grouping in Markdown reflects groupMode=epic (not flat)', async () => {
    const { buildMarkdown } = await import('../../lib/digestSerializer');
    const model = {
      prose: 'Test prose',
      shipped: [
        {
          id: 'r1',
          title: 'Feature A',
          status: 'Done',
          assignee: 'Alice',
          epic: 'Epic1',
          date: '2026-06-10',
          bucket: 'Shipped' as const,
          isCarryOver: false,
        },
        {
          id: 'r2',
          title: 'Feature B',
          status: 'Done',
          assignee: 'Bob',
          epic: 'Epic2',
          date: '2026-06-10',
          bucket: 'Shipped' as const,
          isCarryOver: false,
        },
      ],
      inProgress: [],
      blocked: [],
      backlog: [],
      unmapped: [],
      groupMode: 'epic' as const,
    };
    const md = buildMarkdown(model);
    // Should have group headings (###) for epics
    expect(md).toContain('### Epic1');
    expect(md).toContain('### Epic2');
  });
});
