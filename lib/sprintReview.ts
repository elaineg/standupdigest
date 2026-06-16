// sprintReview.ts — single source of truth for Sprint Review computation.
// ONE computed model feeds the on-screen view AND both copy outputs (Markdown + plain text).
// This prevents the three-surface disagreement bug (carry-over bug pattern).

import type { DigestRow, GroupMode } from "./csvParser";

// ---- Types ----

export interface AssigneeStats {
  assignee: string;
  /** Total points across ALL committed rows for this assignee (shipped + open) */
  points: number;
  /** Points in Shipped bucket for this assignee */
  shippedPoints: number;
  issues: number;
  rows: DigestRow[];
}

export interface SprintReviewModel {
  sprintName: string;

  // Velocity (ONE computation, fed to screen + copy)
  committedPoints: number;
  shippedPoints: number;
  committedIssues: number;
  shippedIssues: number;

  // Scope change
  scopeSupported: boolean; // true when Sprint + Added-date column detected
  addedPoints: number;
  addedIssues: number;
  removedPoints: number;
  removedIssues: number;

  // Spillover — reuses carry-over logic: open rows in the sprint
  spilloverIssues: DigestRow[];

  // By assignee
  byAssignee: AssigneeStats[];

  // The editable prose lines (screen and copy read these, never recompute)
  velocityHeadline: string;      // e.g. "21 of 34 sprint pts shipped"
  velocityTooltip: string;       // inline help: "velocity = points in Shipped ÷ total points in the sprint"
  velocitySubline: string;       // e.g. "4 of 7 issues done"
  scopeLine: string;             // e.g. "+8 pts / 2 issues added, −2 pts / 1 issue removed"
  spilloverHeadline: string;     // e.g. "Spillover: 3 issues / 13 pts still open at sprint end"
}

// ---- Sprint list helpers ----

export function getSprintNames(rows: DigestRow[]): string[] {
  const seen = new Set<string>();
  for (const r of rows) {
    if (r.sprint) seen.add(r.sprint);
  }
  // Return most-recent first: try to sort Sprint N numerically, else alphabetically reversed
  const names = Array.from(seen);
  names.sort((a, b) => {
    const numA = parseInt(a.replace(/\D+/g, ""), 10);
    const numB = parseInt(b.replace(/\D+/g, ""), 10);
    if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
    return b.localeCompare(a);
  });
  return names;
}

// ---- Core computation ----

export function computeSprintReview(
  rows: DigestRow[],
  sprintName: string,
  hasSprintColumn: boolean,
  hasAddedColumn: boolean
): SprintReviewModel {
  // All rows belonging to the selected sprint
  const sprintRows = hasSprintColumn
    ? rows.filter((r) => r.sprint === sprintName)
    : rows;

  // Scope: removed rows (have a removedDate) are not counted as committed
  const removedRows = sprintRows.filter((r) => r.removedDate !== "");
  const committedRows = sprintRows.filter((r) => r.removedDate === "");

  // Shipped: committed rows in Shipped bucket
  const shippedRows = committedRows.filter((r) => r.bucket === "Shipped");
  // Open (spillover): committed rows in In Progress or Blocked
  const openRows = committedRows.filter(
    (r) => r.bucket === "In Progress" || r.bucket === "Blocked"
  );

  const committedPoints = committedRows.reduce((s, r) => s + r.storyPoints, 0);
  const shippedPoints = shippedRows.reduce((s, r) => s + r.storyPoints, 0);
  const committedIssues = committedRows.length;
  const shippedIssues = shippedRows.length;

  // Scope change: only supported when both Sprint and Added columns exist
  const scopeSupported = hasSprintColumn && hasAddedColumn;
  const addedRows = scopeSupported
    ? sprintRows.filter((r) => r.addedDate !== "")
    : [];
  const addedPoints = addedRows.reduce((s, r) => s + r.storyPoints, 0);
  const addedIssues = addedRows.length;
  const removedPoints = removedRows.reduce((s, r) => s + r.storyPoints, 0);
  const removedIssues = removedRows.length;

  // Spillover — reuse carry-over from existing logic (open rows in sprint)
  const spilloverIssues = openRows;
  const spilloverPoints = openRows.reduce((s, r) => s + r.storyPoints, 0);

  // By assignee (committed rows only) — track total points AND shipped points per person
  const assigneeMap = new Map<string, AssigneeStats>();
  for (const row of committedRows) {
    const key = row.assignee || "(unassigned)";
    if (!assigneeMap.has(key)) {
      assigneeMap.set(key, { assignee: key, points: 0, shippedPoints: 0, issues: 0, rows: [] });
    }
    const s = assigneeMap.get(key)!;
    s.points += row.storyPoints;
    if (row.bucket === "Shipped") s.shippedPoints += row.storyPoints;
    s.issues += 1;
    s.rows.push(row);
  }
  const byAssignee = Array.from(assigneeMap.values()).sort(
    (a, b) => b.points - a.points
  );

  // Build the canonical text strings ONCE (used by both screen and copy).
  // Label the denominator as "sprint pts" (not "committed") to be honest:
  // without an explicit commitment field, this is the sum of all sprint points.
  const velocityHeadline = `${shippedPoints} of ${committedPoints} sprint pts shipped`;
  const velocityTooltip = "velocity = points in Shipped ÷ total points in the sprint";
  const velocitySubline = `${shippedIssues} of ${committedIssues} issues done`;

  let scopeLine: string;
  if (!scopeSupported) {
    scopeLine =
      "Scope change unavailable — needs a Sprint + Added-date column";
  } else {
    const addedPart = `+${addedPoints} pts / ${addedIssues} ${addedIssues === 1 ? "issue" : "issues"} added`;
    const removedPart = `−${removedPoints} pts / ${removedIssues} ${removedIssues === 1 ? "issue" : "issues"} removed mid-sprint`;
    scopeLine = `${addedPart}, ${removedPart}`;
  }

  const spilloverHeadline = `Spillover: ${spilloverIssues.length} ${spilloverIssues.length === 1 ? "issue" : "issues"} / ${spilloverPoints} pts still open at sprint end`;

  return {
    sprintName,
    committedPoints,
    shippedPoints,
    committedIssues,
    shippedIssues,
    scopeSupported,
    addedPoints,
    addedIssues,
    removedPoints,
    removedIssues,
    spilloverIssues,
    byAssignee,
    velocityHeadline,
    velocityTooltip,
    velocitySubline,
    scopeLine,
    spilloverHeadline,
  };
}

// ---- Serializers (copy outputs read from the same model, never recompute) ----

export interface SprintReviewCopyModel {
  velocityHeadline: string;
  velocityTooltip?: string;
  velocitySubline: string;
  scopeLine: string;
  spilloverHeadline: string;
  spilloverRows: DigestRow[];
  byAssignee: AssigneeStats[];
  sprintName: string;
  groupMode: GroupMode;
}

function rowLine(row: DigestRow): string {
  const title = row.editedTitle ?? row.title;
  const assignee = row.assignee ? ` (${row.assignee})` : "";
  const co = row.isCarryOver ? " [carry-over]" : "";
  return `${title}${assignee}${co}`;
}

export function buildSprintMarkdown(model: SprintReviewCopyModel): string {
  const lines: string[] = [];

  lines.push(`## Sprint Review: ${model.sprintName}`);
  lines.push("");
  lines.push(`### Velocity`);
  lines.push(model.velocityHeadline);
  lines.push(model.velocitySubline);
  lines.push("");
  lines.push(`### Scope Change`);
  lines.push(model.scopeLine);
  lines.push("");
  lines.push(`### Spillover`);
  lines.push(model.spilloverHeadline);
  for (const r of model.spilloverRows) {
    lines.push(`- ${rowLine(r)}`);
  }
  lines.push("");
  lines.push(`### By Assignee`);
  for (const a of model.byAssignee) {
    const shippedPts = a.shippedPoints ?? 0;
    lines.push(`#### ${a.assignee} — ${shippedPts} of ${a.points} pts shipped · ${a.issues} ${a.issues === 1 ? "issue" : "issues"}`);
    for (const r of a.rows) {
      lines.push(`- ${r.editedTitle ?? r.title}`);
    }
  }

  return lines.join("\n").trimEnd();
}

export function buildSprintPlainText(model: SprintReviewCopyModel): string {
  return buildSprintMarkdown(model)
    .replace(/^#### /gm, "  ")
    .replace(/^### /gm, "")
    .replace(/^## /gm, "")
    .replace(/^- /gm, "• ");
}
