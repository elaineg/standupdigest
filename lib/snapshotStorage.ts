/**
 * snapshotStorage.ts — device-local snapshot persistence for the Changes auto-diff.
 *
 * Stores per-source (jira/linear/asana/github) snapshots of the digest state:
 *   ONLY { stableId, bucket, periodLabel, savedAt } per item — NEVER raw CSV, NEVER body text.
 *
 * localStorage key scheme:
 *   standupdigest-snapshot-v1-<source>   →  DigestSnapshot  (current/default baseline)
 *
 * All functions are synchronous and safe to call from useEffect (never from render).
 */

import type { Bucket } from "./csvParser";
import type { DigestRow } from "./csvParser";

// One entry in the stored snapshot — minimal per-item data
export interface SnapshotItem {
  id: string;      // stable issue key (issueKey from DigestRow) or title-based fallback
  bucket: Bucket;  // status bucket at time of save
  title: string;   // title used as fallback match key (never for display body)
}

export interface DigestSnapshotEntry {
  source: string;       // "jira" | "linear" | "asana" | "github" | "unknown"
  periodLabel: string;  // e.g. "Week of Mon 9 Jun – Sun 15 Jun"
  savedAt: number;      // Date.now() ms
  items: SnapshotItem[];
}

const LS_SNAPSHOT_KEY = (source: string) =>
  `standupdigest-snapshot-v1-${source}`;

// ---- Save ----

export function saveSnapshot(
  source: string,
  periodLabel: string,
  rows: DigestRow[]
): void {
  // Store ONLY the diff-relevant fields: id (stable), bucket, title (fallback key).
  // Never store raw CSV, assignee, epic, date, or body text.
  // Backlog rows ARE included: they're needed to correctly classify "Newly Started"
  // transitions (Backlog prior → In Progress now). Unmapped rows are excluded because
  // they have no reliable bucket classification.
  const items: SnapshotItem[] = rows
    .filter((r) => r.bucket !== "Unmapped")
    .map((r) => ({
      id: r.issueKey || "",
      bucket: r.bucket,
      title: r.title,
    }));

  const entry: DigestSnapshotEntry = {
    source,
    periodLabel,
    savedAt: Date.now(),
    items,
  };

  try {
    window.localStorage.setItem(LS_SNAPSHOT_KEY(source), JSON.stringify(entry));
  } catch {
    // ignore (private browsing / storage disabled)
  }
}

// ---- Load ----

export function loadSnapshot(source: string): DigestSnapshotEntry | null {
  try {
    const raw = window.localStorage.getItem(LS_SNAPSHOT_KEY(source));
    if (!raw) return null;
    return JSON.parse(raw) as DigestSnapshotEntry;
  } catch {
    return null;
  }
}

// ---- Clear ----

export function clearSnapshot(source: string): void {
  try {
    window.localStorage.removeItem(LS_SNAPSHOT_KEY(source));
  } catch {
    // ignore
  }
}

// ---- Convert snapshot to DigestRow[] for the diff model ----
//
// The snapshot items are minimal: {id, bucket, title}.
// We inflate them into DigestRow-shaped objects that computeChanges() can digest.
// Fields not stored (assignee, epic, date, storyPoints) are left empty/zero —
// computeChanges() only reads issueKey, bucket, and title for matching/classification.

export function snapshotToRows(snapshot: DigestSnapshotEntry): DigestRow[] {
  return snapshot.items.map((item, idx) => ({
    id: `snapshot-${item.id || item.title}-${idx}`,
    title: item.title,
    status: item.bucket, // synthetic "status" = bucket name (matches bucket mapping)
    assignee: "",
    epic: "",
    date: "",
    bucket: item.bucket,
    isCarryOver: false,
    editedTitle: undefined,
    storyPoints: 0,
    sprint: "",
    addedDate: "",
    removedDate: "",
    issueKey: item.id,
  }));
}

// ---- Relative-time label ----

export function relativeTime(savedAt: number): string {
  const diffMs = Date.now() - savedAt;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 2) return "just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "1 week ago";
  return `${diffWeeks} weeks ago`;
}
