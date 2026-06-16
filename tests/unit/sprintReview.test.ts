import { describe, it, expect } from 'vitest';
import { parseCSVText } from '../../lib/csvParser';
import {
  computeSprintReview,
  getSprintNames,
  buildSprintMarkdown,
  buildSprintPlainText,
} from '../../lib/sprintReview';
import { SAMPLE_CSV } from '../../lib/sampleData';

// ---- Parse sample data once ----

function getSampleData() {
  const result = parseCSVText(SAMPLE_CSV);
  return result;
}

describe('Sprint Review — sample data sprint names', () => {
  it('detects Sprint 24, Sprint 23, Sprint 22', () => {
    const { rows } = getSampleData();
    const names = getSprintNames(rows);
    expect(names).toContain('Sprint 24');
    expect(names).toContain('Sprint 23');
    expect(names).toContain('Sprint 22');
  });

  it('Sprint 24 is first (most recent)', () => {
    const { rows } = getSampleData();
    const names = getSprintNames(rows);
    expect(names[0]).toBe('Sprint 24');
  });
});

describe('Sprint Review — Sprint 24 velocity (spec check 12)', () => {
  it('committed points = 34 (7 committed rows, excluding the 1 removed)', () => {
    const { rows } = getSampleData();
    const hasSprintCol = true;
    const hasAddedCol = true;
    const model = computeSprintReview(rows, 'Sprint 24', hasSprintCol, hasAddedCol);
    expect(model.committedPoints).toBe(34);
  });

  it('shipped points = 21 (4 shipped rows: 5+3+8+5)', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    expect(model.shippedPoints).toBe(21);
  });

  it('committed issues = 7', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    expect(model.committedIssues).toBe(7);
  });

  it('shipped issues = 4', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    expect(model.shippedIssues).toBe(4);
  });

  it('velocityHeadline = "21 of 34 sprint pts shipped" (FIX 1: honest label, not "points"/"committed")', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    expect(model.velocityHeadline).toBe('21 of 34 sprint pts shipped');
  });

  it('velocityTooltip explains the calc (FIX 1)', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    expect(model.velocityTooltip).toContain('velocity = points in Shipped');
    expect(model.velocityTooltip).toContain('total points in the sprint');
  });

  it('velocitySubline = "4 of 7 issues done"', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    expect(model.velocitySubline).toBe('4 of 7 issues done');
  });
});

describe('Sprint Review — Sprint 24 spillover (spec check 14)', () => {
  it('spillover = 3 issues (Build analytics, Review API, Deploy staging)', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    expect(model.spilloverIssues.length).toBe(3);
  });

  it('spilloverHeadline starts with "Spillover: 3 issues"', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    expect(model.spilloverHeadline).toContain('Spillover: 3 issues');
  });

  it('spillover includes "Build analytics dashboard"', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    const titles = model.spilloverIssues.map(r => r.title);
    expect(titles).toContain('Build analytics dashboard');
  });

  it('spillover includes "Review API endpoints"', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    const titles = model.spilloverIssues.map(r => r.title);
    expect(titles).toContain('Review API endpoints');
  });

  it('spillover includes "Deploy staging environment"', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    const titles = model.spilloverIssues.map(r => r.title);
    expect(titles).toContain('Deploy staging environment');
  });
});

describe('Sprint Review — Sprint 24 scope change (spec check 15)', () => {
  it('scope is supported when Sprint + Added columns exist', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    expect(model.scopeSupported).toBe(true);
  });

  it('added points = 8 (Fix cart total bug 3pts + Release billing reports 5pts)', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    expect(model.addedPoints).toBe(8);
  });

  it('added issues = 2', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    expect(model.addedIssues).toBe(2);
  });

  it('removed points = 2 (Update order confirmation email)', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    expect(model.removedPoints).toBe(2);
  });

  it('removed issues = 1', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    expect(model.removedIssues).toBe(1);
  });

  it('scopeLine = "+8 pts / 2 issues added, −2 pts / 1 issue removed mid-sprint"', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    expect(model.scopeLine).toBe('+8 pts / 2 issues added, −2 pts / 1 issue removed mid-sprint');
  });

  it('scope change unavailable when no sprint column', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', false, false);
    expect(model.scopeSupported).toBe(false);
    expect(model.scopeLine).toBe('Scope change unavailable — needs a Sprint + Added-date column');
  });

  it('scope change unavailable when sprint column but no added-date column', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, false);
    expect(model.scopeSupported).toBe(false);
    expect(model.scopeLine).toBe('Scope change unavailable — needs a Sprint + Added-date column');
  });
});

describe('Sprint Review — By Assignee for Sprint 24 (spec check 13)', () => {
  it('Sam has 18 pts (committed) and 3 issues in Sprint 24', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    const sam = model.byAssignee.find(a => a.assignee === 'Sam');
    expect(sam).toBeDefined();
    expect(sam!.points).toBe(18);
    expect(sam!.issues).toBe(3);
  });

  it('FIX 1: Sam shippedPoints = 13 (Launch 5 + AddPromo 8; Build analytics 5 is still open)', () => {
    // Sam's Sprint 24 committed: Launch(5, Shipped) + AddPromo(8, Shipped) + BuildAnalytics(5, InProgress)
    // shippedPoints = 5 + 8 = 13
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    const sam = model.byAssignee.find(a => a.assignee === 'Sam');
    expect(sam).toBeDefined();
    expect(sam!.shippedPoints).toBe(13);
  });

  it('FIX 1: by-assignee shippedPoints reconcile with velocity headline (sum shipped pts == model.shippedPoints)', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    const totalShippedByAssignee = model.byAssignee.reduce((s, a) => s + a.shippedPoints, 0);
    expect(totalShippedByAssignee).toBe(model.shippedPoints); // 21
  });
});

describe('Sprint Review — ONE source of truth (copy == screen)', () => {
  it('Markdown copy includes velocity headline from model', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    const copyModel = {
      sprintName: 'Sprint 24',
      velocityHeadline: model.velocityHeadline,
      velocitySubline: model.velocitySubline,
      scopeLine: model.scopeLine,
      spilloverHeadline: model.spilloverHeadline,
      spilloverRows: model.spilloverIssues,
      byAssignee: model.byAssignee,
      groupMode: 'assignee' as const,
    };
    const md = buildSprintMarkdown(copyModel);
    expect(md).toContain('21 of 34 sprint pts shipped');
    expect(md).toContain('4 of 7 issues done');
    expect(md).toContain('+8 pts / 2 issues added');
    expect(md).toContain('−2 pts / 1 issue removed mid-sprint');
    expect(md).toContain('Spillover: 3 issues');
    expect(md).toContain('Sam');
  });

  it('plain text copy is derived from Markdown (different heading markers)', () => {
    const { rows } = getSampleData();
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    const copyModel = {
      sprintName: 'Sprint 24',
      velocityHeadline: model.velocityHeadline,
      velocitySubline: model.velocitySubline,
      scopeLine: model.scopeLine,
      spilloverHeadline: model.spilloverHeadline,
      spilloverRows: model.spilloverIssues,
      byAssignee: model.byAssignee,
      groupMode: 'assignee' as const,
    };
    const pt = buildSprintPlainText(copyModel);
    expect(pt).toContain('21 of 34 sprint pts shipped');
    // Plain text should not have ## or ### prefixes
    expect(pt).not.toMatch(/^#{1,4} /m);
  });
});

describe('Sprint Review — SC15b: no-sprint CSV shows exact fallback text on screen AND in copied output', () => {
  const NO_SPRINT_CSV = `Summary,Status,Assignee,Story Points\nFix bug,Done,Alice,3\nAdd feature,In Progress,Bob,5\n`;

  it('scopeSupported=false when CSV has no Sprint column', () => {
    const { rows } = parseCSVText(NO_SPRINT_CSV);
    const model = computeSprintReview(rows, '', false, false);
    expect(model.scopeSupported).toBe(false);
  });

  it('scopeLine is the exact spec fallback string (screen source of truth)', () => {
    const { rows } = parseCSVText(NO_SPRINT_CSV);
    const model = computeSprintReview(rows, '', false, false);
    expect(model.scopeLine).toBe('Scope change unavailable — needs a Sprint + Added-date column');
  });

  it('Markdown copy includes the exact fallback text (single source of truth)', () => {
    const { rows } = parseCSVText(NO_SPRINT_CSV);
    const model = computeSprintReview(rows, '', false, false);
    const copyModel = {
      sprintName: '',
      velocityHeadline: model.velocityHeadline,
      velocitySubline: model.velocitySubline,
      scopeLine: model.scopeLine,
      spilloverHeadline: model.spilloverHeadline,
      spilloverRows: model.spilloverIssues,
      byAssignee: model.byAssignee,
      groupMode: 'assignee' as const,
    };
    const md = buildSprintMarkdown(copyModel);
    expect(md).toContain('Scope change unavailable — needs a Sprint + Added-date column');
  });

  it('Plain-text copy also includes the exact fallback text', () => {
    const { rows } = parseCSVText(NO_SPRINT_CSV);
    const model = computeSprintReview(rows, '', false, false);
    const copyModel = {
      sprintName: '',
      velocityHeadline: model.velocityHeadline,
      velocitySubline: model.velocitySubline,
      scopeLine: model.scopeLine,
      spilloverHeadline: model.spilloverHeadline,
      spilloverRows: model.spilloverIssues,
      byAssignee: model.byAssignee,
      groupMode: 'assignee' as const,
    };
    const pt = buildSprintPlainText(copyModel);
    expect(pt).toContain('Scope change unavailable — needs a Sprint + Added-date column');
  });

  it('velocity computes from all rows when no sprint column (points present)', () => {
    const { rows } = parseCSVText(NO_SPRINT_CSV);
    const model = computeSprintReview(rows, '', false, false);
    // Alice: 3pts Done (shipped), Bob: 5pts In Progress (open) => committed=8, shipped=3
    expect(model.committedPoints).toBe(8);
    expect(model.shippedPoints).toBe(3);
  });
});

describe('Sprint Review — weekly status checks 1-4 still pass after adding sprint columns', () => {
  it('Shipped = 5 (unchanged)', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    expect(rows.filter(r => r.bucket === 'Shipped').length).toBe(5);
  });
  it('In Progress = 4 (unchanged)', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    expect(rows.filter(r => r.bucket === 'In Progress').length).toBe(4);
  });
  it('Blocked = 2 (unchanged)', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    expect(rows.filter(r => r.bucket === 'Blocked').length).toBe(2);
  });
  it('Backlog = 3 (unchanged)', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    expect(rows.filter(r => r.bucket === 'Backlog').length).toBe(3);
  });
  it('Unmapped = 1 (unchanged)', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    expect(rows.filter(r => r.bucket === 'Unmapped').length).toBe(1);
  });
  it('Total rows = 15 (unchanged)', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    expect(rows.length).toBe(15);
  });
  it('carry-over count = 1 (unchanged)', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    const co = rows.filter(r => r.isCarryOver && r.bucket !== 'Backlog' && r.bucket !== 'Unmapped');
    expect(co.length).toBe(1);
  });
  it('Sam has 3 items (unchanged)', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    expect(rows.filter(r => r.assignee === 'Sam').length).toBe(3);
  });
  it('Checkout v2 has 4 items (unchanged)', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    expect(rows.filter(r => r.epic === 'Checkout v2').length).toBe(4);
  });
});

describe('Sprint Review — P2 point clamping: negative story points treated as 0', () => {
  it('negative story points are clamped to 0 (no negative spillover pts)', () => {
    const csv = `Summary,Status,Assignee,Story Points,Sprint\nBug fix,In Progress,Alice,-3,Sprint 1\n`;
    const { rows } = parseCSVText(csv);
    expect(rows[0].storyPoints).toBe(0);
    const model = computeSprintReview(rows, 'Sprint 1', true, false);
    expect(model.spilloverHeadline).not.toContain('-');
    expect(model.committedPoints).toBe(0);
  });
});

describe('Sprint Review — autoDetectColumns for new fields', () => {
  it('detects "Story Points" as storyPoints', () => {
    const { columnMap } = parseCSVText(SAMPLE_CSV);
    expect(columnMap.storyPoints).toBe('Story Points');
  });

  it('detects "Sprint" as sprint', () => {
    const { columnMap } = parseCSVText(SAMPLE_CSV);
    expect(columnMap.sprint).toBe('Sprint');
  });

  it('detects "Added" as added', () => {
    const { columnMap } = parseCSVText(SAMPLE_CSV);
    expect(columnMap.added).toBe('Added');
  });

  it('detects "Removed" as removed', () => {
    const { columnMap } = parseCSVText(SAMPLE_CSV);
    expect(columnMap.removed).toBe('Removed');
  });
});

// ---- FIX 1: by-assignee Markdown shows "shipped of committed" (reconciles with velocity headline) ----

describe('FIX 1 — by-assignee Markdown format: "X of Y pts shipped · Z issues"', () => {
  it('Markdown by-assignee for Sam shows "13 of 18 pts shipped · 3 issues"', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    const copyModel = {
      sprintName: 'Sprint 24',
      velocityHeadline: model.velocityHeadline,
      velocitySubline: model.velocitySubline,
      scopeLine: model.scopeLine,
      spilloverHeadline: model.spilloverHeadline,
      spilloverRows: model.spilloverIssues,
      byAssignee: model.byAssignee,
      groupMode: 'assignee' as const,
    };
    const md = buildSprintMarkdown(copyModel);
    // Sam: Launch(5,Shipped) + AddPromo(8,Shipped) + BuildAnalytics(5,InProgress) = 13 shipped of 18 total
    expect(md).toContain('Sam — 13 of 18 pts shipped · 3 issues');
  });

  it('sum of per-assignee shippedPoints equals total shippedPoints (reconciliation check)', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    const sum = model.byAssignee.reduce((s, a) => s + a.shippedPoints, 0);
    expect(sum).toBe(21); // matches velocity headline
  });

  it('Sprint 23 (0 shipped) shows "0 of X pts shipped" per assignee (self-consistency FIX 4)', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    const model = computeSprintReview(rows, 'Sprint 23', true, true);
    // All Sprint 23 rows are Blocked/In Progress → 0 shipped for everyone
    for (const a of model.byAssignee) {
      expect(a.shippedPoints).toBe(0);
    }
    expect(model.shippedPoints).toBe(0); // velocity denominator
    // velocityHeadline should say "0 of N sprint pts shipped" — consistent with by-assignee
    expect(model.velocityHeadline).toMatch(/^0 of \d+ sprint pts shipped$/);
  });
});

// ---- FIX 3: edit round-trip — edited velocityHeadline flows into copy output ----

describe('FIX 3 — edit round-trip: edited value flows into the copy model', () => {
  it('when velocityHeadline is overridden, Markdown copy uses the override', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    const editedHeadline = 'My custom velocity line';
    const copyModel = {
      sprintName: 'Sprint 24',
      velocityHeadline: editedHeadline, // simulates the editedVelocityHeadline state override
      velocitySubline: model.velocitySubline,
      scopeLine: model.scopeLine,
      spilloverHeadline: model.spilloverHeadline,
      spilloverRows: model.spilloverIssues,
      byAssignee: model.byAssignee,
      groupMode: 'assignee' as const,
    };
    const md = buildSprintMarkdown(copyModel);
    expect(md).toContain(editedHeadline);
    // Original headline must NOT appear in the copy (edit takes precedence)
    expect(md).not.toContain(model.velocityHeadline);
  });

  it('when velocityHeadline is not overridden, Markdown copy uses the model headline', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    const copyModel = {
      sprintName: 'Sprint 24',
      velocityHeadline: model.velocityHeadline, // null override → falls back to model
      velocitySubline: model.velocitySubline,
      scopeLine: model.scopeLine,
      spilloverHeadline: model.spilloverHeadline,
      spilloverRows: model.spilloverIssues,
      byAssignee: model.byAssignee,
      groupMode: 'assignee' as const,
    };
    const md = buildSprintMarkdown(copyModel);
    expect(md).toContain('21 of 34 sprint pts shipped');
  });

  it('plain-text copy also uses the edited value (single source of truth)', () => {
    const { rows } = parseCSVText(SAMPLE_CSV);
    const model = computeSprintReview(rows, 'Sprint 24', true, true);
    const editedHeadline = 'Edited for plain text test';
    const copyModel = {
      sprintName: 'Sprint 24',
      velocityHeadline: editedHeadline,
      velocitySubline: model.velocitySubline,
      scopeLine: model.scopeLine,
      spilloverHeadline: model.spilloverHeadline,
      spilloverRows: model.spilloverIssues,
      byAssignee: model.byAssignee,
      groupMode: 'assignee' as const,
    };
    const pt = buildSprintPlainText(copyModel);
    expect(pt).toContain(editedHeadline);
  });
});
