import Papa from "papaparse";

// ---- Types ----

export type Bucket = "Shipped" | "In Progress" | "Blocked" | "Backlog" | "Unmapped";
export type GroupMode = "assignee" | "epic";

export interface ColumnMap {
  title: string;
  status: string;
  assignee: string;
  epic: string;
  date: string;
}

export interface DigestRow {
  id: string;
  title: string;
  status: string;
  assignee: string;
  epic: string;
  date: string;
  bucket: Bucket;
  isCarryOver: boolean;
  editedTitle?: string;
}

export interface ParseResult {
  rows: DigestRow[];
  headers: string[];
  columnMap: ColumnMap;
  confidence: "high" | "low";
  source: "jira" | "linear" | "asana" | "github" | "unknown";
}

// ---- Header alias map (case-insensitive) ----

const TITLE_ALIASES = [
  // Canonical per-tracker
  "summary",        // Jira
  "title",          // Linear, GitHub
  "name",           // Asana (also "Task Name" below)
  "issue summary",
  // Broader synonyms for real-world exports (Dana: Asana "Task Name")
  "task name",
  "task",
  "item",
  "subject",
  "story",
  "ticket",
  "card",
];
const STATUS_ALIASES = [
  "status",
  "state",
  "section/column",
  "section",
  "column",
];
const ASSIGNEE_ALIASES = ["assignee", "assignees", "assigned to", "owner"];
const EPIC_ALIASES = [
  "epic link",
  "epic name",
  "parent",
  "project",
  "cycle",
  "projects",
  "parent task",
  "milestone",
  "labels",
  "epic",
];
const DATE_ALIASES = [
  "updated",
  "resolved",
  "completed",
  "completed at",
  "modified",
  "updated_at",
  "closed_at",
  "close date",
];

// ---- Status→Bucket keyword map ----

const SHIPPED_KEYWORDS = [
  "done",
  "closed",
  "resolved",
  "complete",
  "completed",
  "merged",
  "released",
];
const IN_PROGRESS_KEYWORDS = [
  "in progress",
  "in review",
  "in dev",
  "started",
  "doing",
  "active",
  "qa",
];
const BLOCKED_KEYWORDS = [
  "blocked",
  "on hold",
  "waiting",
  "stalled",
  "impediment",
];
const BACKLOG_KEYWORDS = [
  "to do",
  "todo",
  "backlog",
  "open",
  "new",
  "triage",
];

export function detectSource(
  headers: string[]
): "jira" | "linear" | "asana" | "github" | "unknown" {
  const lower = headers.map((h) => h.toLowerCase());
  if (lower.includes("summary") && lower.includes("epic link")) return "jira";
  if (lower.includes("title") && lower.some((h) => h === "cycle"))
    return "linear";
  if (lower.includes("name") && lower.includes("section/column"))
    return "asana";
  if (
    lower.includes("title") &&
    (lower.includes("updated_at") ||
      lower.includes("closed_at") ||
      // GitHub Issues CSV without date columns: Title + State (no cycle = not Linear)
      (lower.includes("state") && !lower.includes("cycle")))
  )
    return "github";
  return "unknown";
}

function matchHeader(headers: string[], aliases: string[]): string {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const alias of aliases) {
    const idx = lower.indexOf(alias.toLowerCase());
    if (idx >= 0) return headers[idx];
  }
  return "";
}

export function autoDetectColumns(headers: string[]): {
  columnMap: ColumnMap;
  confidence: "high" | "low";
} {
  const title = matchHeader(headers, TITLE_ALIASES);
  const status = matchHeader(headers, STATUS_ALIASES);
  const assignee = matchHeader(headers, ASSIGNEE_ALIASES);
  const epic = matchHeader(headers, EPIC_ALIASES);
  const date = matchHeader(headers, DATE_ALIASES);

  const found = [title, status, assignee].filter(Boolean).length;
  const confidence = found >= 2 ? "high" : "low";

  return {
    columnMap: { title, status, assignee, epic, date },
    confidence,
  };
}

// Match if the status value exactly equals a keyword, OR begins with it
// (e.g. "In Progress" matches keyword "in progress"). Never do substring match
// to avoid "Needs Triage Review" matching keyword "triage".
function matchesKeyword(s: string, k: string): boolean {
  return s === k || s.startsWith(k + " ") || s.endsWith(" " + k) || s.startsWith(k + "/");
}

export function bucketStatus(status: string): Bucket {
  const s = status.toLowerCase().trim();
  if (SHIPPED_KEYWORDS.some((k) => matchesKeyword(s, k))) return "Shipped";
  if (IN_PROGRESS_KEYWORDS.some((k) => matchesKeyword(s, k))) return "In Progress";
  if (BLOCKED_KEYWORDS.some((k) => matchesKeyword(s, k))) return "Blocked";
  if (BACKLOG_KEYWORDS.some((k) => matchesKeyword(s, k))) return "Backlog";
  return "Unmapped";
}

// GitHub-specific bucket logic:
// - "closed" → Shipped (handled by standard SHIPPED_KEYWORDS already)
// - "open"   → In Progress (NOT Backlog — GitHub "open" means active work)
// - Labels column with blocked-type terms overrides to Blocked.
// Returns the bucket for a GitHub row given the State value and optional Labels value.
export function bucketStatusGitHub(state: string, labels?: string): Bucket {
  const s = state.toLowerCase().trim();
  // Blocked labels override everything (check first)
  if (labels) {
    const l = labels.toLowerCase();
    if (BLOCKED_KEYWORDS.some((k) => l.includes(k))) return "Blocked";
  }
  // Shipped keywords (closed, resolved, merged, etc.)
  if (SHIPPED_KEYWORDS.some((k) => matchesKeyword(s, k))) return "Shipped";
  // In Progress keywords
  if (IN_PROGRESS_KEYWORDS.some((k) => matchesKeyword(s, k))) return "In Progress";
  // Blocked keywords on state itself
  if (BLOCKED_KEYWORDS.some((k) => matchesKeyword(s, k))) return "Blocked";
  // "open" → In Progress for GitHub (not Backlog)
  if (s === "open") return "In Progress";
  // Other Backlog keywords still apply (e.g. "triage", "new")
  if (BACKLOG_KEYWORDS.some((k) => matchesKeyword(s, k))) return "Backlog";
  return "Unmapped";
}

// Exported so unit tests can verify the logic directly.
// referenceDate: the "as-of" date for the dataset (defaults to now for ad-hoc use).
// No date string ⇒ not carry-over (P2 fix: baseless GitHub flag).
export function detectCarryOver(date: string, referenceDate: Date): boolean {
  if (!date) return false;
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  const diffDays =
    (referenceDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
  // Flag as carry-over if last updated more than 7 days before the reference date
  return diffDays > 7;
}

// Derive the dataset's own "as-of" date: the most-recent valid date among all rows.
// This makes carry-over detection relative to when the CSV was exported, not today —
// so sample data and old exports remain deterministic regardless of the current date.
function computeReferenceDate(
  rawData: Record<string, string>[],
  dateColumn: string
): Date {
  if (!dateColumn) return new Date();
  let maxMs = -Infinity;
  for (const row of rawData) {
    const raw = row[dateColumn];
    if (!raw) continue;
    const d = new Date(raw);
    if (!isNaN(d.getTime()) && d.getTime() > maxMs) {
      maxMs = d.getTime();
    }
  }
  // If no valid dates found, fall back to now (behaves same as before for date-less CSVs)
  return maxMs === -Infinity ? new Date() : new Date(maxMs);
}

export function parseCSVText(
  csvText: string,
  overrideMap?: Partial<ColumnMap>
): ParseResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const headers = result.meta.fields ?? [];
  const { columnMap: autoMap, confidence } = autoDetectColumns(headers);
  const source = detectSource(headers);

  const columnMap: ColumnMap = {
    title: overrideMap?.title ?? autoMap.title,
    status: overrideMap?.status ?? autoMap.status,
    assignee: overrideMap?.assignee ?? autoMap.assignee,
    epic: overrideMap?.epic ?? autoMap.epic,
    date: overrideMap?.date ?? autoMap.date,
  };

  // Compute a single reference date from the dataset's own most-recent date.
  // This is the ONE source of truth for carry-over detection — all rows, the
  // prose summary, and both copy outputs will read isCarryOver from this pass.
  const referenceDate = computeReferenceDate(result.data, columnMap.date);

  const rows: DigestRow[] = result.data.map((row, idx) => {
    const title = (columnMap.title ? row[columnMap.title] : "") ?? "";
    const status = (columnMap.status ? row[columnMap.status] : "") ?? "";
    const assignee = (columnMap.assignee ? row[columnMap.assignee] : "") ?? "";
    const epic = (columnMap.epic ? row[columnMap.epic] : "") ?? "";
    const date = (columnMap.date ? row[columnMap.date] : "") ?? "";

    // GitHub: use GitHub-specific bucket logic (open→In Progress, labels→Blocked override)
    const bucket = status
      ? source === "github"
        ? bucketStatusGitHub(status, epic)
        : bucketStatus(status)
      : "Unmapped";
    // Single carry-over computation per row — shared by digest tags, prose, and copy.
    const isCarryOver = detectCarryOver(date, referenceDate);

    return {
      id: `row-${idx}`,
      title: title.trim() || "(untitled)",
      status: status.trim(),
      assignee: assignee.trim(),
      epic: epic.trim(),
      date: date.trim(),
      bucket,
      isCarryOver,
    };
  });

  return { rows, headers, columnMap, confidence, source };
}
