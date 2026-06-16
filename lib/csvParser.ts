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

const TITLE_ALIASES = ["summary", "title", "name", "issue summary"];
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
    (lower.includes("updated_at") || lower.includes("closed_at"))
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

function detectCarryOver(date: string): boolean {
  if (!date) return false;
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  const diffDays =
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
  // Flag as carry-over if last updated more than 7 days ago
  return diffDays > 7;
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

  const rows: DigestRow[] = result.data.map((row, idx) => {
    const title = (columnMap.title ? row[columnMap.title] : "") ?? "";
    const status = (columnMap.status ? row[columnMap.status] : "") ?? "";
    const assignee = (columnMap.assignee ? row[columnMap.assignee] : "") ?? "";
    const epic = (columnMap.epic ? row[columnMap.epic] : "") ?? "";
    const date = (columnMap.date ? row[columnMap.date] : "") ?? "";

    const bucket = status ? bucketStatus(status) : "Unmapped";
    const isCarryOver = detectCarryOver(date);

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
