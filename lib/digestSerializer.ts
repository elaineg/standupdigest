// digestSerializer.ts — single source of truth for digest text output.
// Both the screen rendering model and the copy serializers derive from these
// same functions, so screen == Markdown == plain text always.

import type { DigestRow, GroupMode } from "@/lib/csvParser";

export interface DigestModel {
  prose: string; // the (possibly user-edited) one-line summary
  shipped: DigestRow[];
  inProgress: DigestRow[];
  blocked: DigestRow[];
  backlog: DigestRow[];
  unmapped: DigestRow[];
  groupMode: GroupMode;
}

function groupRows(rows: DigestRow[], groupMode: GroupMode): Map<string, DigestRow[]> {
  const groups = new Map<string, DigestRow[]>();
  for (const row of rows) {
    const key =
      groupMode === "assignee"
        ? row.assignee || "(unassigned)"
        : row.epic || "(no epic)";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }
  return groups;
}

function rowLine(row: DigestRow, opts: { includeAssignee: boolean; includeCarryOver: boolean }): string {
  const title = row.editedTitle ?? row.title;
  const co = opts.includeCarryOver && row.isCarryOver ? " [carry-over]" : "";
  const assignee = opts.includeAssignee && row.assignee ? ` (${row.assignee})` : "";
  return `${title}${assignee}${co}`;
}

function buildGroupedSection(
  label: string,
  rows: DigestRow[],
  groupMode: GroupMode,
  opts: { includeCarryOver: boolean }
): string[] {
  if (rows.length === 0) return [];
  const lines: string[] = [];
  lines.push(`## ${label} (${rows.length})`);
  const groups = groupRows(rows, groupMode);
  for (const [groupKey, groupRows_] of groups) {
    lines.push(`### ${groupKey}`);
    for (const r of groupRows_) {
      lines.push(`- ${rowLine(r, { includeAssignee: false, includeCarryOver: opts.includeCarryOver })}`);
    }
  }
  lines.push("");
  return lines;
}

function buildFlatSection(
  label: string,
  rows: DigestRow[],
  opts: { includeCarryOver: boolean; includeAssignee: boolean }
): string[] {
  if (rows.length === 0) return [];
  const lines: string[] = [];
  lines.push(`## ${label} (${rows.length})`);
  for (const r of rows) {
    lines.push(`- ${rowLine(r, { includeAssignee: opts.includeAssignee, includeCarryOver: opts.includeCarryOver })}`);
  }
  lines.push("");
  return lines;
}

export function buildMarkdown(model: DigestModel): string {
  const { prose, shipped, inProgress, blocked, backlog, unmapped, groupMode } = model;
  const sections: string[] = [];

  sections.push(prose);
  sections.push("");

  // Main digest buckets — grouped per the screen's groupMode
  sections.push(...buildGroupedSection("Shipped", shipped, groupMode, { includeCarryOver: false }));
  sections.push(...buildGroupedSection("In Progress", inProgress, groupMode, { includeCarryOver: true }));
  sections.push(...buildGroupedSection("Blocked", blocked, groupMode, { includeCarryOver: false }));

  // Backlog is rendered flat (muted, no grouping on screen either)
  sections.push(...buildFlatSection("Backlog / To Do", backlog, { includeCarryOver: false, includeAssignee: true }));

  // Unmapped: screen shows title + status but NOT assignee
  if (unmapped.length > 0) {
    sections.push(`## Unmapped (${unmapped.length})`);
    for (const r of unmapped) {
      const title = r.editedTitle ?? r.title;
      sections.push(`- ${title} (status: "${r.status}")`);
    }
  }

  return sections.join("\n").trimEnd();
}

export function buildPlainText(model: DigestModel): string {
  return buildMarkdown(model)
    .replace(/^### /gm, "  ")
    .replace(/^## /gm, "")
    .replace(/^- /gm, "• ");
}
