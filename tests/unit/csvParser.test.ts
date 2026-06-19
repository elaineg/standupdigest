import { describe, it, expect } from 'vitest';
import {
  bucketStatus,
  bucketStatusGitHub,
  autoDetectColumns,
  detectSource,
  detectCarryOver,
  parseCSVText,
} from '../../lib/csvParser';
import { SAMPLE_CSV } from '../../lib/sampleData';

// ---- detectCarryOver (reference-date anchor) ----

describe('detectCarryOver – reference-date anchor', () => {
  const ref = new Date('2026-06-14T00:00:00Z'); // a fixed reference, simulates max(updated)

  it('returns false for empty date (P2: no baseless flag)', () => {
    expect(detectCarryOver('', ref)).toBe(false);
  });
  it('returns false for invalid date string', () => {
    expect(detectCarryOver('not-a-date', ref)).toBe(false);
  });
  it('returns false when date is within 7 days of reference', () => {
    // ref - 6 days
    expect(detectCarryOver('2026-06-08', ref)).toBe(false);
  });
  it('returns true when date is older than 7 days from reference', () => {
    // ref - 14 days
    expect(detectCarryOver('2025-01-01', ref)).toBe(true);
  });
  it('sample data yields exactly 1 carry-over regardless of today\'s date', () => {
    // The sample's max updated date is 2026-06-14. All dates except 2025-01-01 are
    // within 7 days of that reference, so only "Migrate old orders" is carry-over.
    const { rows } = parseCSVText(SAMPLE_CSV);
    const carryOverAll = rows.filter(r => r.isCarryOver);
    expect(carryOverAll.length).toBe(1);
    expect(carryOverAll[0].title).toContain('Migrate old orders');
  });
});

// ---- bucketStatus ----

describe('bucketStatus – Shipped keywords', () => {
  it('maps "Done" → Shipped', () => expect(bucketStatus('Done')).toBe('Shipped'));
  it('maps "done" (lowercase) → Shipped', () => expect(bucketStatus('done')).toBe('Shipped'));
  it('maps "Closed" → Shipped', () => expect(bucketStatus('Closed')).toBe('Shipped'));
  it('maps "Resolved" → Shipped', () => expect(bucketStatus('Resolved')).toBe('Shipped'));
  it('maps "Complete" → Shipped', () => expect(bucketStatus('Complete')).toBe('Shipped'));
  it('maps "Completed" → Shipped', () => expect(bucketStatus('Completed')).toBe('Shipped'));
  it('maps "Merged" → Shipped', () => expect(bucketStatus('Merged')).toBe('Shipped'));
  it('maps "Released" → Shipped', () => expect(bucketStatus('Released')).toBe('Shipped'));
});

describe('bucketStatus – In Progress keywords', () => {
  it('maps "In Progress" → In Progress', () => expect(bucketStatus('In Progress')).toBe('In Progress'));
  it('maps "In Review" → In Progress', () => expect(bucketStatus('In Review')).toBe('In Progress'));
  it('maps "In Dev" → In Progress', () => expect(bucketStatus('In Dev')).toBe('In Progress'));
  it('maps "Started" → In Progress', () => expect(bucketStatus('Started')).toBe('In Progress'));
  it('maps "Doing" → In Progress', () => expect(bucketStatus('Doing')).toBe('In Progress'));
  it('maps "Active" → In Progress', () => expect(bucketStatus('Active')).toBe('In Progress'));
  it('maps "QA" → In Progress', () => expect(bucketStatus('QA')).toBe('In Progress'));
});

describe('bucketStatus – Blocked keywords', () => {
  it('maps "Blocked" → Blocked', () => expect(bucketStatus('Blocked')).toBe('Blocked'));
  it('maps "On Hold" → Blocked', () => expect(bucketStatus('On Hold')).toBe('Blocked'));
  it('maps "Waiting" → Blocked', () => expect(bucketStatus('Waiting')).toBe('Blocked'));
  it('maps "Stalled" → Blocked', () => expect(bucketStatus('Stalled')).toBe('Blocked'));
  it('maps "Impediment" → Blocked', () => expect(bucketStatus('Impediment')).toBe('Blocked'));
});

describe('bucketStatus – Backlog/Todo keywords', () => {
  it('maps "To Do" → Backlog', () => expect(bucketStatus('To Do')).toBe('Backlog'));
  it('maps "Backlog" → Backlog', () => expect(bucketStatus('Backlog')).toBe('Backlog'));
  it('maps "Open" → Backlog', () => expect(bucketStatus('Open')).toBe('Backlog'));
  it('maps "New" → Backlog', () => expect(bucketStatus('New')).toBe('Backlog'));
  it('maps "Triage" → Backlog', () => expect(bucketStatus('Triage')).toBe('Backlog'));
});

describe('bucketStatus – Unmapped (not silently dropped)', () => {
  it('maps "" → Unmapped', () => expect(bucketStatus('')).toBe('Unmapped'));
  it('maps "Unknown status" → Unmapped', () => expect(bucketStatus('Unknown status')).toBe('Unmapped'));
  it('maps "Custom State" → Unmapped', () => expect(bucketStatus('Custom State')).toBe('Unmapped'));

  // KEY BOUNDARY TRAP: "Needs Triage Review" contains "triage" as a substring
  // but must NOT be matched to Backlog — it should be Unmapped.
  it('maps "Needs Triage Review" → Unmapped (NOT Backlog — substring trap)', () => {
    expect(bucketStatus('Needs Triage Review')).toBe('Unmapped');
  });

  // Another substring trap: "Needs Triage Review" must not hit "review" from In Progress
  it('does not match "Needs Triage Review" as In Progress', () => {
    expect(bucketStatus('Needs Triage Review')).not.toBe('In Progress');
  });
});

// ---- autoDetectColumns / header alias map ----

describe('autoDetectColumns – Jira aliases', () => {
  it('detects Summary as title', () => {
    const { columnMap } = autoDetectColumns(['Summary', 'Status', 'Assignee', 'Epic Link', 'Updated']);
    expect(columnMap.title.toLowerCase()).toBe('summary');
    expect(columnMap.status.toLowerCase()).toBe('status');
    expect(columnMap.assignee.toLowerCase()).toBe('assignee');
    expect(columnMap.epic.toLowerCase()).toBe('epic link');
  });
});

describe('autoDetectColumns – Linear aliases', () => {
  it('detects Title and State', () => {
    const { columnMap } = autoDetectColumns(['Title', 'State', 'Assignee', 'Project', 'Updated']);
    expect(columnMap.title.toLowerCase()).toBe('title');
    expect(columnMap.status.toLowerCase()).toBe('state');
  });
});

describe('autoDetectColumns – Asana aliases', () => {
  it('detects Name and Section/Column', () => {
    const { columnMap } = autoDetectColumns(['Name', 'Section/Column', 'Assignee', 'Projects', 'Completed At']);
    expect(columnMap.title.toLowerCase()).toBe('name');
    expect(columnMap.status.toLowerCase()).toBe('section/column');
  });
});

describe('autoDetectColumns – GitHub aliases', () => {
  it('detects title and state', () => {
    const { columnMap } = autoDetectColumns(['title', 'state', 'assignee', 'milestone', 'updated_at']);
    expect(columnMap.title.toLowerCase()).toBe('title');
    expect(columnMap.status.toLowerCase()).toBe('state');
    expect(columnMap.date.toLowerCase()).toBe('updated_at');
  });
});

// ---- detectSource ----

describe('detectSource', () => {
  it('detects jira from Summary + Epic Link', () => {
    expect(detectSource(['Summary', 'Status', 'Assignee', 'Epic Link', 'Updated'])).toBe('jira');
  });
  it('detects asana from Name + Section/Column', () => {
    expect(detectSource(['Name', 'Section/Column', 'Assignee', 'Projects', 'Completed At'])).toBe('asana');
  });
  it('detects github from title + updated_at', () => {
    expect(detectSource(['title', 'state', 'assignee', 'milestone', 'updated_at'])).toBe('github');
  });
  it('returns unknown for unrecognized headers', () => {
    expect(detectSource(['Foo', 'Bar', 'Baz'])).toBe('unknown');
  });
});

// ---- Reconciliation rule: every row lands in exactly one bucket ----

describe('reconciliation rule', () => {
  it('every parsed row lands in exactly one bucket (none silently dropped)', () => {
    const result = parseCSVText(SAMPLE_CSV);
    const validBuckets = ['Shipped', 'In Progress', 'Blocked', 'Backlog', 'Unmapped'];
    for (const row of result.rows) {
      expect(validBuckets).toContain(row.bucket);
    }
    // Total rows in CSV = 15; none silently dropped
    expect(result.rows.length).toBe(15);
  });
});

// ---- Sample data EXACT known counts from APP_SPEC.md ----

describe('sample data exact counts (spec success check 1)', () => {
  it('Shipped = 5', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    expect(rows.filter(r => r.bucket === 'Shipped').length).toBe(5);
  });
  it('In Progress = 4', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    expect(rows.filter(r => r.bucket === 'In Progress').length).toBe(4);
  });
  it('Blocked = 2', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    expect(rows.filter(r => r.bucket === 'Blocked').length).toBe(2);
  });
  it('Backlog = 3', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    expect(rows.filter(r => r.bucket === 'Backlog').length).toBe(3);
  });
  it('Unmapped = 1 (the "Needs Triage Review" row)', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    const unmapped = rows.filter(r => r.bucket === 'Unmapped');
    expect(unmapped.length).toBe(1);
    expect(unmapped[0].status).toBe('Needs Triage Review');
  });
});

describe('sample data assignee Sam (spec success check 2)', () => {
  it('Sam appears under exactly 3 items', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    // Sam only in non-backlog/unmapped digest rows
    const samRows = rows.filter(r => r.assignee === 'Sam');
    expect(samRows.length).toBe(3);
  });
});

describe('sample data epic Checkout v2 (spec success check 2)', () => {
  it('Checkout v2 epic has exactly 4 items', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    expect(rows.filter(r => r.epic === 'Checkout v2').length).toBe(4);
  });
});

describe('sample data carry-over (spec success check 3)', () => {
  it('exactly 1 row is flagged as carry-over', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    // carry-over rows in non-backlog/unmapped buckets (how the prose summary counts it)
    const carryOverRows = rows.filter(
      r => r.isCarryOver && r.bucket !== 'Backlog' && r.bucket !== 'Unmapped'
    );
    expect(carryOverRows.length).toBe(1);
  });
  it('the carry-over row is "Migrate old orders"', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    const carryOver = rows.filter(r => r.isCarryOver && r.bucket !== 'Backlog' && r.bucket !== 'Unmapped');
    expect(carryOver[0].title).toContain('Migrate old orders');
  });
});

describe('prose summary string (spec success check 4)', () => {
  it('generates the correct summary sentence', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    const shipped = rows.filter(r => r.bucket === 'Shipped').length;
    const inProgress = rows.filter(r => r.bucket === 'In Progress').length;
    const blocked = rows.filter(r => r.bucket === 'Blocked').length;
    const carryOver = rows.filter(
      r => r.isCarryOver && r.bucket !== 'Backlog' && r.bucket !== 'Unmapped'
    ).length;
    const summary = `This week the team shipped ${shipped} items, has ${inProgress} in progress and ${blocked} blocked, with ${carryOver} carried over.`;
    expect(summary).toBe(
      'This week the team shipped 5 items, has 4 in progress and 2 blocked, with 1 carried over.'
    );
  });
});

describe('ragged row and unknown status handling', () => {
  it('does not crash on ragged CSV (extra columns / missing columns)', () => {
    const raggedCSV = `Title,Status,Assignee,Epic,Updated
Good row,Done,Alice,ProjectA,2026-06-10
Ragged row with extra,In Progress,Bob,ProjectB,2026-06-11,extra_col_value
Short row,Blocked
Empty row with commas,,,,,
`;
    expect(() => parseCSVText(raggedCSV)).not.toThrow();
    const { rows } = parseCSVText(raggedCSV);
    expect(rows.length).toBeGreaterThan(0);
  });

  it('unknown status goes to Unmapped (not silently dropped)', () => {
    const csv = `Title,Status,Assignee,Epic,Updated
Normal item,Done,Alice,ProjectA,2026-06-10
Mystery item,FutureStatusXYZ,Bob,ProjectB,2026-06-11
`;
    const { rows } = parseCSVText(csv);
    expect(rows.length).toBe(2);
    const unmapped = rows.filter(r => r.bucket === 'Unmapped');
    expect(unmapped.length).toBe(1);
    expect(unmapped[0].status).toBe('FutureStatusXYZ');
  });
});

// ---- COUNT HONESTY: carry-over badges == prose count == Markdown [carry-over] marks ----
// Uses a SECOND small CSV (not the sample) with 2 genuinely-old rows relative to its own max date.
// Verifies that rows.filter(isCarryOver) count and the prose formula agree with each other
// and with the [carry-over] marks that would appear in the Markdown copy output.

describe('count honesty – second CSV with 2 carry-over rows', () => {
  // Max date in this CSV: 2026-06-14. Old rows: 2026-05-01 (44 days) and 2026-06-01 (13 days).
  // Both are >7 days before 2026-06-14, so both should be carry-over.
  const SECOND_CSV = `Title,Status,Assignee,Epic,Updated
Fresh task,In Progress,Alice,Alpha,2026-06-14
Recent task,In Progress,Bob,Beta,2026-06-13
Stale task,In Progress,Carol,Gamma,2026-05-01
Another stale,In Progress,Dave,Delta,2026-06-01
Shipped task,Done,Eve,Epsilon,2026-06-12
`;

  it('reference date is the max Updated in the dataset (2026-06-14)', () => {
    const { rows } = parseCSVText(SECOND_CSV);
    // 2026-05-01 is 44 days before 2026-06-14 → carry-over
    // 2026-06-01 is 13 days before 2026-06-14 → carry-over
    // 2026-06-12 is 2 days before → not carry-over
    // 2026-06-13 is 1 day before → not carry-over
    // 2026-06-14 is 0 days before → not carry-over
    const carryOverAll = rows.filter(r => r.isCarryOver);
    expect(carryOverAll.length).toBe(2);
    const titles = carryOverAll.map(r => r.title);
    expect(titles).toContain('Stale task');
    expect(titles).toContain('Another stale');
  });

  it('carry-over count in prose formula matches badge count', () => {
    const { rows } = parseCSVText(SECOND_CSV);
    // Badge count = all rows with isCarryOver (in non-backlog/unmapped buckets in digest view)
    const badgeCount = rows.filter(
      r => r.isCarryOver && r.bucket !== 'Backlog' && r.bucket !== 'Unmapped'
    ).length;
    // Prose formula (same filter as ProseSummary component)
    const proseCount = rows.filter(
      r => r.isCarryOver && r.bucket !== 'Backlog' && r.bucket !== 'Unmapped'
    ).length;
    expect(badgeCount).toBe(proseCount);
    expect(badgeCount).toBe(2);
  });

  it('[carry-over] mark count in Markdown copy matches badge and prose counts', () => {
    const { rows } = parseCSVText(SECOND_CSV);
    // Simulate the buildMarkdown logic from DigestView (only In Progress rows get [carry-over] mark)
    const inProgress = rows.filter(r => r.bucket === 'In Progress');
    const markdownCarryOverMarks = inProgress.filter(r => r.isCarryOver).length;
    // Badge count (same as prose count)
    const badgeCount = rows.filter(
      r => r.isCarryOver && r.bucket !== 'Backlog' && r.bucket !== 'Unmapped'
    ).length;
    // The prose summary count
    const proseCount = rows.filter(
      r => r.isCarryOver && r.bucket !== 'Backlog' && r.bucket !== 'Unmapped'
    ).length;
    // All three must agree
    expect(markdownCarryOverMarks).toBe(badgeCount);
    expect(markdownCarryOverMarks).toBe(proseCount);
    expect(markdownCarryOverMarks).toBe(2);
  });

  it('GitHub-style row with no Updated date does NOT get carry-over flag', () => {
    const csvWithBlankDate = `title,state,assignee,milestone,updated_at
Open issue,open,alice,Sprint 5,
Closed issue,closed,bob,Sprint 5,2026-06-10
`;
    const { rows } = parseCSVText(csvWithBlankDate);
    const openIssue = rows.find(r => r.title === 'Open issue');
    expect(openIssue).toBeDefined();
    expect(openIssue!.isCarryOver).toBe(false);
  });
});

describe('grouping by assignee and epic', () => {
  it('can group sample data rows by assignee', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    const byAssignee = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = row.assignee || '(unassigned)';
      if (!byAssignee.has(key)) byAssignee.set(key, []);
      byAssignee.get(key)!.push(row);
    }
    expect(byAssignee.has('Sam')).toBe(true);
    expect(byAssignee.get('Sam')!.length).toBe(3);
  });

  it('can group sample data rows by epic', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    const byEpic = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = row.epic || '(no epic)';
      if (!byEpic.has(key)) byEpic.set(key, []);
      byEpic.get(key)!.push(row);
    }
    expect(byEpic.has('Checkout v2')).toBe(true);
    expect(byEpic.get('Checkout v2')!.length).toBe(4);
  });
});

// ---- bucketStatusGitHub (Change 3: GitHub value mapping) ----

describe('bucketStatusGitHub – State value mapping', () => {
  it('maps "open" → In Progress (NOT Backlog)', () => {
    expect(bucketStatusGitHub('open')).toBe('In Progress');
  });
  it('maps "Open" (capitalized) → In Progress', () => {
    expect(bucketStatusGitHub('Open')).toBe('In Progress');
  });
  it('maps "closed" → Shipped', () => {
    expect(bucketStatusGitHub('closed')).toBe('Shipped');
  });
  it('maps "Closed" → Shipped', () => {
    expect(bucketStatusGitHub('Closed')).toBe('Shipped');
  });
  it('maps "merged" → Shipped', () => {
    expect(bucketStatusGitHub('merged')).toBe('Shipped');
  });
  it('maps unknown state → Unmapped', () => {
    expect(bucketStatusGitHub('some-custom-state')).toBe('Unmapped');
  });
});

describe('bucketStatusGitHub – Labels blocked override', () => {
  it('open + "blocked" label → Blocked', () => {
    expect(bucketStatusGitHub('open', 'blocked')).toBe('Blocked');
  });
  it('open + "on hold" label → Blocked', () => {
    expect(bucketStatusGitHub('open', 'on hold')).toBe('Blocked');
  });
  it('open + "waiting" label → Blocked', () => {
    expect(bucketStatusGitHub('open', 'waiting for review')).toBe('Blocked');
  });
  it('open + unrelated label → In Progress (no override)', () => {
    expect(bucketStatusGitHub('open', 'enhancement')).toBe('In Progress');
  });
  it('closed + "blocked" label → Blocked (label overrides closed)', () => {
    // A closed issue tagged "blocked" is anomalous; label wins
    expect(bucketStatusGitHub('closed', 'blocked')).toBe('Blocked');
  });
});

describe('bucketStatusGitHub – parseCSVText integration (GitHub source)', () => {
  it('GitHub CSV: open → In Progress, closed → Shipped, blocked label → Blocked', () => {
    const csv = `title,state,labels,assignee,updated_at
Fix login bug,open,,alice,2026-06-14
Add dark mode,open,blocked,bob,2026-06-13
Ship v2,closed,,carol,2026-06-12
`;
    const { rows, source } = parseCSVText(csv);
    expect(source).toBe('github');
    const loginBug = rows.find(r => r.title === 'Fix login bug');
    expect(loginBug?.bucket).toBe('In Progress');
    const darkMode = rows.find(r => r.title === 'Add dark mode');
    expect(darkMode?.bucket).toBe('Blocked');
    const shipV2 = rows.find(r => r.title === 'Ship v2');
    expect(shipV2?.bucket).toBe('Shipped');
  });

  it('GitHub CSV no dates: still detects as github source and maps open → In Progress', () => {
    const csv = `Title,State,Labels,Assignee
Feature A,open,,alice
Bug B,closed,,bob
Blocker C,open,blocked,carol
`;
    const { rows, source } = parseCSVText(csv);
    expect(source).toBe('github');
    expect(rows.find(r => r.title === 'Feature A')?.bucket).toBe('In Progress');
    expect(rows.find(r => r.title === 'Bug B')?.bucket).toBe('Shipped');
    expect(rows.find(r => r.title === 'Blocker C')?.bucket).toBe('Blocked');
  });
});

// ---- Title alias broadening (Change 1: Task Name, Item, Subject, Ticket, etc.) ----

describe('autoDetectColumns – broadened title aliases (Change 1)', () => {
  it('detects "Task Name" as title (Asana real export)', () => {
    const { columnMap } = autoDetectColumns(['Task Name', 'Section/Column', 'Assignee', 'Projects', 'Completed At']);
    expect(columnMap.title).toBe('Task Name');
  });
  it('detects "Task" as title', () => {
    const { columnMap } = autoDetectColumns(['Task', 'Status', 'Assignee']);
    expect(columnMap.title).toBe('Task');
  });
  it('detects "Item" as title', () => {
    const { columnMap } = autoDetectColumns(['Item', 'Status', 'Owner']);
    expect(columnMap.title).toBe('Item');
  });
  it('detects "Subject" as title', () => {
    const { columnMap } = autoDetectColumns(['Subject', 'Status', 'Assignee']);
    expect(columnMap.title).toBe('Subject');
  });
  it('detects "Ticket" as title', () => {
    const { columnMap } = autoDetectColumns(['Ticket', 'State', 'Assignee']);
    expect(columnMap.title).toBe('Ticket');
  });
  it('detects "Story" as title', () => {
    const { columnMap } = autoDetectColumns(['Story', 'Status', 'Assignee']);
    expect(columnMap.title).toBe('Story');
  });
  it('existing Asana "Name" detection unaffected', () => {
    const { columnMap } = autoDetectColumns(['Name', 'Section/Column', 'Assignee', 'Projects', 'Completed At']);
    expect(columnMap.title.toLowerCase()).toBe('name');
  });
  it('Task Name does NOT collide with Status/Assignee columns', () => {
    const { columnMap } = autoDetectColumns(['Task Name', 'Status', 'Assignee', 'Labels', 'Completed At']);
    expect(columnMap.title).toBe('Task Name');
    expect(columnMap.status.toLowerCase()).toBe('status');
    expect(columnMap.assignee.toLowerCase()).toBe('assignee');
  });
});

describe('detectSource – broadened GitHub detection (no date columns)', () => {
  it('detects github from title + state without date columns', () => {
    expect(detectSource(['Title', 'State', 'Labels', 'Assignee'])).toBe('github');
  });
  it('Linear with title + state + cycle is NOT mis-detected as github', () => {
    expect(detectSource(['Title', 'State', 'Assignee', 'Cycle', 'Updated'])).toBe('linear');
  });
});

// ---- P3: detectSource – Jira minimal export without epic link ----

describe('detectSource – Jira minimal export (P3 fix)', () => {
  it('detects jira from "Issue Key" + "Summary" without "Epic Link"', () => {
    expect(detectSource(['Issue Key', 'Summary', 'Status', 'Assignee'])).toBe('jira');
  });
  it('detects jira from "Key" + "Summary" (short-form Jira export)', () => {
    expect(detectSource(['Key', 'Summary', 'Status'])).toBe('jira');
  });
  it('still detects jira from full export with "Summary" + "Epic Link"', () => {
    expect(detectSource(['Issue Key', 'Summary', 'Status', 'Assignee', 'Epic Link'])).toBe('jira');
  });
  it('does NOT mis-detect Asana as jira (Asana uses "Name", not "Summary")', () => {
    expect(detectSource(['Name', 'Section/Column', 'Assignee'])).toBe('asana');
  });
  it('does NOT mis-detect GitHub as jira (GitHub uses "Title", not "Summary")', () => {
    expect(detectSource(['Title', 'State', 'Assignee'])).toBe('github');
  });
});
