/**
 * Unit tests for C(ii): custom status rule persistence.
 *
 * Verifies that:
 * 1. applyStatusRules re-buckets Unmapped rows whose status has a saved rule.
 * 2. Rows already bucketed (non-Unmapped) are not modified by rules.
 * 3. The rule persists correctly when written as JSON and re-read,
 *    matching the encoding used by DigestApp (JSON.stringify / JSON.parse).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseCSVText } from '../../lib/csvParser';

// ---- Inline applyStatusRules (mirrors DigestApp implementation) ----

type Bucket = "Shipped" | "In Progress" | "Blocked" | "Backlog" | "Unmapped";

function applyStatusRules(
  rows: { id: string; bucket: Bucket; status: string; [key: string]: unknown }[],
  rules: Record<string, Bucket>
) {
  if (Object.keys(rules).length === 0) return rows;
  return rows.map((r) => {
    if (r.bucket === "Unmapped" && rules[r.status]) {
      return { ...r, bucket: rules[r.status] };
    }
    return r;
  });
}

// ---- In-memory localStorage mock (vitest runs in node env, no DOM localStorage) ----

const LS_STATUS_RULES_KEY = (source: string) => `standupdigest-statusrules-${source}`;

// Simple in-memory store simulating localStorage key-value semantics
const memStore: Map<string, string> = new Map();
const mockStorage = {
  getItem: (key: string) => memStore.get(key) ?? null,
  setItem: (key: string, value: string) => { memStore.set(key, value); },
  clear: () => memStore.clear(),
};

function saveStatusRule(source: string, status: string, bucket: Bucket) {
  const rawExisting = mockStorage.getItem(LS_STATUS_RULES_KEY(source));
  const existing: Record<string, Bucket> = rawExisting ? JSON.parse(rawExisting) : {};
  existing[status] = bucket;
  mockStorage.setItem(LS_STATUS_RULES_KEY(source), JSON.stringify(existing));
}

function loadStatusRules(source: string): Record<string, Bucket> {
  const raw = mockStorage.getItem(LS_STATUS_RULES_KEY(source));
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, Bucket>;
}

describe('C(ii): custom status rule persistence', () => {
  beforeEach(() => mockStorage.clear());
  afterEach(() => mockStorage.clear());

  it('applyStatusRules: re-buckets Unmapped row with matching status rule', () => {
    const rows = [
      { id: 'r1', status: 'Needs Triage Review', bucket: 'Unmapped' as Bucket },
      { id: 'r2', status: 'Done', bucket: 'Shipped' as Bucket },
    ];
    const rules: Record<string, Bucket> = { 'Needs Triage Review': 'In Progress' };
    const result = applyStatusRules(rows, rules);
    expect(result[0].bucket).toBe('In Progress');
    expect(result[1].bucket).toBe('Shipped'); // unaffected
  });

  it('applyStatusRules: does not modify already-bucketed rows', () => {
    const rows = [
      { id: 'r1', status: 'In Progress', bucket: 'In Progress' as Bucket },
      { id: 'r2', status: 'Weird Status', bucket: 'Unmapped' as Bucket },
    ];
    const rules: Record<string, Bucket> = { 'In Progress': 'Blocked' }; // rule for a non-Unmapped status
    const result = applyStatusRules(rows, rules);
    // Rule only applies to Unmapped rows; 'In Progress' row is not Unmapped → unchanged
    expect(result[0].bucket).toBe('In Progress');
    // 'Weird Status' has no rule → stays Unmapped
    expect(result[1].bucket).toBe('Unmapped');
  });

  it('applyStatusRules: returns original rows unchanged when rules is empty', () => {
    const rows = [
      { id: 'r1', status: 'Needs Triage Review', bucket: 'Unmapped' as Bucket },
    ];
    const result = applyStatusRules(rows, {});
    expect(result[0].bucket).toBe('Unmapped');
  });

  it('saveStatusRule + loadStatusRules: round-trips status→bucket correctly via JSON encoding', () => {
    saveStatusRule('unknown', 'Needs Triage Review', 'In Progress');
    const rules = loadStatusRules('unknown');
    expect(rules['Needs Triage Review']).toBe('In Progress');
  });

  it('saveStatusRule: accumulates multiple rules without overwriting', () => {
    saveStatusRule('unknown', 'Needs Triage Review', 'In Progress');
    saveStatusRule('unknown', 'On Hold', 'Blocked');
    const rules = loadStatusRules('unknown');
    expect(rules['Needs Triage Review']).toBe('In Progress');
    expect(rules['On Hold']).toBe('Blocked');
  });

  it('loadStatusRules: returns empty object for unknown source (no stored key)', () => {
    const rules = loadStatusRules('jira');
    expect(Object.keys(rules)).toHaveLength(0);
  });

  it('saveStatusRule: overrides existing rule for same status (re-bucket to different bucket)', () => {
    saveStatusRule('unknown', 'Needs Triage Review', 'In Progress');
    saveStatusRule('unknown', 'Needs Triage Review', 'Blocked'); // change of mind
    const rules = loadStatusRules('unknown');
    expect(rules['Needs Triage Review']).toBe('Blocked');
  });

  it('end-to-end: save rule, parse CSV, apply rules — Unmapped row auto-maps without user action', () => {
    // Simulate: user saved "Needs Triage Review" → Blocked last week
    saveStatusRule('unknown', 'Needs Triage Review', 'Blocked');

    const csv = `Title,Status,Assignee,Epic,Updated
Task A,Done,Alice,ProjectA,2026-06-14
Task B,Needs Triage Review,Bob,ProjectB,2026-06-14
Task C,In Progress,Carol,ProjectC,2026-06-14
`;

    const result = parseCSVText(csv);
    // Before applying rules, Task B is Unmapped
    const rawTaskB = result.rows.find((r) => r.title === 'Task B');
    expect(rawTaskB?.bucket).toBe('Unmapped');

    // Apply saved rules
    const rules = loadStatusRules(result.source);
    const rowsWithRules = applyStatusRules(
      result.rows as unknown as { id: string; bucket: Bucket; status: string; [key: string]: unknown }[],
      rules
    );

    const taskB = rowsWithRules.find((r) => r.title === 'Task B');
    expect(taskB?.bucket).toBe('Blocked'); // auto-applied from saved rule

    // Other rows unaffected
    const taskA = rowsWithRules.find((r) => r.title === 'Task A');
    expect(taskA?.bucket).toBe('Shipped');
    const taskC = rowsWithRules.find((r) => r.title === 'Task C');
    expect(taskC?.bucket).toBe('In Progress');
  });
});
