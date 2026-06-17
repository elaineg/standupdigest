// changesDigest.ts — single source of truth for the Changes tab computation.
// ONE computed ChangesModel feeds:
//   - the on-screen transition buckets
//   - the prose summary counts
//   - both copy outputs (Markdown + plain text)
// No count is ever recomputed independently (count-honesty rule from APP_SPEC).

import type { DigestRow, Bucket } from "./csvParser";

// ---- Transition types ----

export type Transition =
  | "newly-shipped"
  | "newly-started"
  | "newly-blocked"
  | "unblocked"
  | "slipped"
  | "reopened"
  | "new-this-period"
  | "still-blocked"
  | "carried-over"
  | "removed";

export interface ChangesRow {
  row: DigestRow;        // the current-period row (null for removed-only)
  priorRow?: DigestRow;  // the prior-period row (undefined for new-this-period)
  transition: Transition;
  stilBlockedLabel?: string; // "blocked 2+ wks" or "still blocked"
  editedTitle?: string;
}

export interface ChangesModel {
  // Headline buckets (shown first)
  newlyShipped: ChangesRow[];
  newlyBlocked: ChangesRow[];
  slipped: ChangesRow[];
  reopened: ChangesRow[];
  newThisPeriod: ChangesRow[];
  // Secondary buckets
  unblocked: ChangesRow[];
  newlyStarted: ChangesRow[];
  stillBlocked: ChangesRow[];
  carriedOver: ChangesRow[];
  // Prior-only
  removed: ChangesRow[];

  // Meta
  matchedById: boolean;       // true = id column matched; false = fell back to title
  sameFileDetected: boolean;  // true when current and prior appear identical
  differentTrackerWarning: boolean; // true when no id overlap and id column exists on both

  // The ONE prose summary (populated from bucket lengths; inline-editable)
  proseText: string;
}

// How many weeks old is a prior row's date relative to current-max-date?
// Used for "blocked 2+ wks" label.
function weeksOld(priorDateStr: string, currentMaxMs: number): number {
  if (!priorDateStr) return 0;
  const d = new Date(priorDateStr);
  if (isNaN(d.getTime())) return 0;
  return (currentMaxMs - d.getTime()) / (1000 * 60 * 60 * 24 * 7);
}

// Classify a transition given prior bucket and current bucket.
// Returns null only when the combination doesn't cleanly fit — callers
// treat that as "carried-over" (open in both, same bucket).
function classifyTransition(
  priorBucket: Bucket,
  currentBucket: Bucket,
  priorDateStr: string,
  currentMaxMs: number
): Transition {
  // Shipped now — was it previously not shipped?
  if (currentBucket === "Shipped" && priorBucket !== "Shipped") return "newly-shipped";
  // Blocked now — was it not blocked before?
  if (currentBucket === "Blocked" && priorBucket !== "Blocked") return "newly-blocked";
  // Now In Progress — was Backlog/Todo before → Newly Started
  if (currentBucket === "In Progress" && (priorBucket === "Backlog" || priorBucket === "Unmapped")) return "newly-started";
  // Now In Progress — was Blocked → Unblocked
  if (currentBucket === "In Progress" && priorBucket === "Blocked") return "unblocked";
  // REOPENED: prior was Shipped → current is NOT Shipped (came back from done)
  if (priorBucket === "Shipped" && currentBucket !== "Shipped") return "reopened";
  // SLIPPED: prior was In Progress or Blocked → current regressed to Backlog/Todo
  // (In Progress → Blocked is "newly-blocked" and is already handled above;
  //  Blocked → In Progress is "unblocked" and is already handled above)
  if (
    (priorBucket === "In Progress" || priorBucket === "Blocked") &&
    (currentBucket === "Backlog" || currentBucket === "Unmapped")
  ) return "slipped";
  // Still Blocked in both
  if (currentBucket === "Blocked" && priorBucket === "Blocked") {
    const weeks = weeksOld(priorDateStr, currentMaxMs);
    // The "still-blocked" label is set here; the duration label is applied separately
    return "still-blocked";
  }
  // Everything else: carried over / unchanged-open
  return "carried-over";
}

function computeCurrentMaxMs(currentRows: DigestRow[]): number {
  let maxMs = 0;
  for (const r of currentRows) {
    if (r.date) {
      const d = new Date(r.date);
      if (!isNaN(d.getTime()) && d.getTime() > maxMs) maxMs = d.getTime();
    }
  }
  return maxMs;
}

// Check if two sets of rows are "the same export": same row count and same set of
// normalized titles (or ids when available).
function isSameExport(currentRows: DigestRow[], priorRows: DigestRow[]): boolean {
  if (currentRows.length !== priorRows.length) return false;
  const hasIds = currentRows.some(r => r.issueKey) && priorRows.some(r => r.issueKey);
  if (hasIds) {
    const currentKeys = new Set(currentRows.map(r => r.issueKey.toLowerCase()));
    const priorKeys = new Set(priorRows.map(r => r.issueKey.toLowerCase()));
    if (currentKeys.size !== priorKeys.size) return false;
    for (const k of currentKeys) if (!priorKeys.has(k)) return false;
    return true;
  }
  // Fall back to title matching
  const currentTitles = new Set(currentRows.map(r => r.title.toLowerCase().trim()));
  const priorTitles = new Set(priorRows.map(r => r.title.toLowerCase().trim()));
  if (currentTitles.size !== priorTitles.size) return false;
  for (const t of currentTitles) if (!priorTitles.has(t)) return false;
  return true;
}

// Build a lookup map from prior rows (id → row, or title → row)
function buildPriorLookup(priorRows: DigestRow[], byId: boolean): Map<string, DigestRow> {
  const map = new Map<string, DigestRow>();
  for (const r of priorRows) {
    const key = byId
      ? r.issueKey.toLowerCase().trim()
      : r.title.toLowerCase().trim();
    if (key) map.set(key, r);
  }
  return map;
}

export function computeChanges(
  currentRows: DigestRow[],
  priorRows: DigestRow[]
): ChangesModel {
  // Edge case: same file
  const sameFileDetected = isSameExport(currentRows, priorRows);

  // Decide match strategy
  const currentHasIds = currentRows.some(r => r.issueKey);
  const priorHasIds = priorRows.some(r => r.issueKey);
  const matchedById = currentHasIds && priorHasIds;

  // Build prior lookup
  const priorLookup = buildPriorLookup(priorRows, matchedById);

  // Find the current-export max date for "blocked 2+ wks" computation
  const currentMaxMs = computeCurrentMaxMs(currentRows);

  // Different-tracker warning: both have ids but no overlap
  let differentTrackerWarning = false;
  if (matchedById) {
    const currentKeys = new Set(currentRows.map(r => r.issueKey.toLowerCase().trim()).filter(Boolean));
    const priorKeys = new Set(priorRows.map(r => r.issueKey.toLowerCase().trim()).filter(Boolean));
    const overlap = [...currentKeys].filter(k => priorKeys.has(k));
    if (overlap.length === 0 && currentKeys.size > 0 && priorKeys.size > 0) {
      differentTrackerWarning = true;
    }
  }

  // Classify every current row
  const newlyShipped: ChangesRow[] = [];
  const newlyBlocked: ChangesRow[] = [];
  const slipped: ChangesRow[] = [];
  const reopened: ChangesRow[] = [];
  const newThisPeriod: ChangesRow[] = [];
  const unblocked: ChangesRow[] = [];
  const newlyStarted: ChangesRow[] = [];
  const stillBlocked: ChangesRow[] = [];
  const carriedOver: ChangesRow[] = [];

  // Track which prior keys/titles were matched (to find removed-only rows)
  const matchedPriorKeys = new Set<string>();

  for (const row of currentRows) {
    const lookupKey = matchedById
      ? row.issueKey.toLowerCase().trim()
      : row.title.toLowerCase().trim();

    const priorRow = lookupKey ? priorLookup.get(lookupKey) : undefined;

    if (priorRow) {
      matchedPriorKeys.add(lookupKey);
      const transition = classifyTransition(
        priorRow.bucket,
        row.bucket,
        priorRow.date,
        currentMaxMs
      );

      const changesRow: ChangesRow = { row, priorRow, transition };

      if (transition === "newly-shipped") {
        newlyShipped.push(changesRow);
      } else if (transition === "newly-blocked") {
        newlyBlocked.push(changesRow);
      } else if (transition === "slipped") {
        slipped.push(changesRow);
      } else if (transition === "reopened") {
        reopened.push(changesRow);
      } else if (transition === "unblocked") {
        unblocked.push(changesRow);
      } else if (transition === "newly-started") {
        newlyStarted.push(changesRow);
      } else if (transition === "still-blocked") {
        const weeks = weeksOld(priorRow.date, currentMaxMs);
        const stilBlockedLabel = weeks >= 2 ? "blocked 2+ wks" : "still blocked";
        stillBlocked.push({ ...changesRow, stilBlockedLabel });
      } else {
        // carried-over (and any other combination defaults to carried-over)
        carriedOver.push(changesRow);
      }
    } else {
      // No prior match → New this period
      newThisPeriod.push({ row, transition: "new-this-period" });
    }
  }

  // Find removed-only rows (present in prior, absent in current)
  const removed: ChangesRow[] = [];
  for (const priorRow of priorRows) {
    const lookupKey = matchedById
      ? priorRow.issueKey.toLowerCase().trim()
      : priorRow.title.toLowerCase().trim();
    if (lookupKey && !matchedPriorKeys.has(lookupKey)) {
      // Create a synthetic DigestRow for the removed entry so we can display it
      removed.push({
        row: priorRow, // use prior row as the display row (it has the title/assignee)
        priorRow,
        transition: "removed",
      });
    }
  }

  // Build prose summary from the ONE model's bucket lengths (count-honesty rule)
  const proseText = buildChangesProse({
    newlyShipped,
    newlyBlocked,
    slipped,
    reopened,
    newThisPeriod,
    unblocked,
    newlyStarted,
    stillBlocked,
    carriedOver,
    removed,
    matchedById,
    sameFileDetected,
    differentTrackerWarning,
    proseText: "", // placeholder; computed below
  });

  return {
    newlyShipped,
    newlyBlocked,
    slipped,
    reopened,
    newThisPeriod,
    unblocked,
    newlyStarted,
    stillBlocked,
    carriedOver,
    removed,
    matchedById,
    sameFileDetected,
    differentTrackerWarning,
    proseText,
  };
}

// ---- Prose summary ----

export function buildChangesProse(model: Omit<ChangesModel, "proseText"> & { proseText: string }): string {
  // All counts come from the SAME model buckets (count-honesty rule — never recomputed).
  // Order: shipped, started, newly blocked, unblocked, slipped, reopened, new, still blocked,
  //        carried over, removed.  Only non-zero categories are included.
  const parts: string[] = [];
  if (model.newlyShipped.length > 0)
    parts.push(`${model.newlyShipped.length} shipped`);
  if (model.newlyStarted.length > 0)
    parts.push(`${model.newlyStarted.length} started`);
  if (model.newlyBlocked.length > 0)
    parts.push(`${model.newlyBlocked.length} newly blocked`);
  if (model.unblocked.length > 0)
    parts.push(`${model.unblocked.length} unblocked`);
  if (model.slipped.length > 0)
    parts.push(`${model.slipped.length} slipped`);
  if (model.reopened.length > 0)
    parts.push(`${model.reopened.length} reopened`);
  if (model.newThisPeriod.length > 0)
    parts.push(`${model.newThisPeriod.length} new`);
  if (model.stillBlocked.length > 0)
    parts.push(`${model.stillBlocked.length} still blocked`);
  if (model.carriedOver.length > 0)
    parts.push(`${model.carriedOver.length} carried over`);
  if (model.removed.length > 0)
    parts.push(`${model.removed.length} removed from tracker`);

  if (parts.length === 0) return "Since last week: no changes.";
  return `Since last week: ${parts.join(", ")}.`;
}

// ---- Copy serializers ----

export interface ChangesCopyModel {
  prose: string;
  newlyShipped: ChangesRow[];
  newlyBlocked: ChangesRow[];
  slipped: ChangesRow[];
  reopened: ChangesRow[];
  newThisPeriod: ChangesRow[];
  unblocked: ChangesRow[];
  newlyStarted: ChangesRow[];
  stillBlocked: ChangesRow[];
  carriedOver: ChangesRow[];
  removed: ChangesRow[];
}

function changesRowLine(cr: ChangesRow): string {
  const title = cr.row.editedTitle ?? cr.row.title;
  const assignee = cr.row.assignee ? ` (${cr.row.assignee})` : "";
  const label = cr.stilBlockedLabel ? ` [${cr.stilBlockedLabel}]` : "";
  return `${title}${assignee}${label}`;
}

function changesSection(label: string, rows: ChangesRow[]): string[] {
  if (rows.length === 0) return [];
  const lines: string[] = [];
  lines.push(`## ${label} (${rows.length})`);
  for (const cr of rows) lines.push(`- ${changesRowLine(cr)}`);
  lines.push("");
  return lines;
}

export function buildChangesMarkdown(model: ChangesCopyModel): string {
  const sections: string[] = [];
  sections.push(model.prose);
  sections.push("");
  sections.push(...changesSection("Newly Shipped", model.newlyShipped));
  sections.push(...changesSection("Newly Blocked", model.newlyBlocked));
  sections.push(...changesSection("Slipped", model.slipped));
  sections.push(...changesSection("Reopened", model.reopened));
  sections.push(...changesSection("New this period", model.newThisPeriod));
  sections.push(...changesSection("Unblocked", model.unblocked));
  sections.push(...changesSection("Newly Started", model.newlyStarted));
  sections.push(...changesSection("Still Blocked", model.stillBlocked));
  sections.push(...changesSection("Carried over / unchanged-open", model.carriedOver));
  if (model.removed.length > 0) {
    sections.push(`## Removed from tracker (${model.removed.length})`);
    for (const cr of model.removed) {
      const title = cr.row.editedTitle ?? cr.row.title;
      const assignee = cr.row.assignee ? ` (${cr.row.assignee})` : "";
      sections.push(`- ${title}${assignee}`);
    }
  }
  return sections.join("\n").trimEnd();
}

export function buildChangesPlainText(model: ChangesCopyModel): string {
  return buildChangesMarkdown(model)
    .replace(/^## /gm, "")
    .replace(/^- /gm, "• ");
}
