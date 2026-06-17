"use client";

import { useState, useCallback } from "react";
import type { DigestRow, Bucket, GroupMode } from "@/lib/csvParser";
import { buildMarkdown, buildPlainText, type DigestModel } from "@/lib/digestSerializer";
import { ShareControl } from "@/components/ShareControl";
import { buildWeeklySnapshot } from "@/lib/snapshotSerializer";

export interface WeekOption {
  key: string; // "YYYY-Www" or "all"
  label: string; // "Week of Mon 9 Jun – Sun 15 Jun" or "All dates"
}

interface DigestViewProps {
  rows: DigestRow[];
  groupMode: GroupMode;
  weekFilter: string; // ISO week key "YYYY-Www" or "all"
  availableWeeks: WeekOption[];
  onWeekFilterChange: (week: string) => void;
  onBucketChange: (rowId: string, bucket: Bucket) => void;
  onTitleEdit: (rowId: string, title: string) => void;
  onRemapClick: () => void;
  suppressSuccess?: boolean; // Fix 1: suppress "All statuses recognized ✓" when core col unmapped
  onShareLinkCreated?: () => void; // Called when a share link is minted
  // C(ii): count of statuses auto-applied from saved rules (for "remembered" indicator)
  autoAppliedCount?: number;
}

const BUCKET_MOVE_OPTIONS: Bucket[] = [
  "Shipped",
  "In Progress",
  "Blocked",
  "Backlog",
];

// ---- Week filter helpers (exported for DigestApp to use) ----

export function getISOWeekKey(dateStr: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const day = d.getUTCDay(); // 0=Sun, 1=Mon
  const diff = day === 0 ? -6 : 1 - day; // days to Monday
  const mon = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff));
  const year = mon.getUTCFullYear();
  // ISO week number via Jan 4 rule
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const weekNum = Math.ceil(
    ((mon.getTime() - jan4.getTime()) / 86400000 + (jan4.getUTCDay() || 7) - 1) / 7 + 1
  );
  return `${year}-W${String(weekNum).padStart(2, "0")}`;
}

function formatWeekLabel(key: string): string {
  if (key === "all") return "All dates";
  const m = key.match(/^(\d{4})-W(\d{2})$/);
  if (!m) return key;
  const year = parseInt(m[1], 10);
  const week = parseInt(m[2], 10);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4.getTime() - (jan4Day - 1) * 86400000 + (week - 1) * 7 * 86400000);
  const sunday = new Date(monday.getTime() + 6 * 86400000);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });
  return `Week of ${fmt(monday)} – ${fmt(sunday)}`;
}

export function computeWeekOptions(rows: DigestRow[]): WeekOption[] {
  const seen = new Set<string>();
  for (const r of rows) {
    if (r.date) {
      const k = getISOWeekKey(r.date);
      if (k) seen.add(k);
    }
  }
  const keys = Array.from(seen).sort().reverse(); // most recent first
  const options: WeekOption[] = keys.map((k) => ({ key: k, label: formatWeekLabel(k) }));
  options.push({ key: "all", label: "All dates" });
  return options;
}

export function filterRowsByWeek(rows: DigestRow[], weekKey: string): DigestRow[] {
  if (weekKey === "all") return rows;
  return rows.filter((r) => {
    // Still-open rows (In Progress / Blocked) are always kept: rows in the current week
    // appear normally; rows from prior weeks are carry-over (isCarryOver is set at parse time).
    // An undated open row is also kept — don't drop work with no usable date.
    if (r.bucket === "In Progress" || r.bucket === "Blocked") return true;
    // Shipped / Backlog / Unmapped: filter strictly to the selected week.
    // Rows with no date are also kept (date unknown ≠ wrong week).
    if (!r.date) return true;
    return getISOWeekKey(r.date) === weekKey;
  });
}

// ---- Editable prose summary (Fix 5) ----

function EditableProseSummary({
  autoText,
  editedProse,
  onProseEdit,
}: {
  autoText: string;
  editedProse: string | null;
  onProseEdit: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const displayText = editedProse ?? autoText;

  const startEdit = () => {
    setDraft(displayText);
    setEditing(true);
  };

  const commitEdit = () => {
    const trimmed = draft.trim();
    onProseEdit(trimmed || displayText);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2" data-testid="prose-summary">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="flex-1 rounded border border-blue-400 px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Edit prose summary"
        />
        <button
          onClick={commitEdit}
          className="shrink-0 text-xs text-blue-600 hover:text-blue-800"
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 group" data-testid="prose-summary">
      <p className="flex-1 text-base text-gray-700">{displayText}</p>
      <button
        onClick={startEdit}
        aria-label="Edit prose summary"
        className="shrink-0 mt-0.5 text-xs text-gray-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-blue-600 transition-opacity"
      >
        Edit
      </button>
    </div>
  );
}

// ---- Editable digest line ----

function EditableLine({
  row,
  onEdit,
  suppressAssignee = false,
}: {
  row: DigestRow;
  onEdit: (id: string, title: string) => void;
  suppressAssignee?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const displayTitle = row.editedTitle ?? row.title;

  const startEdit = () => {
    setDraft(displayTitle);
    setEditing(true);
  };

  const commitEdit = () => {
    onEdit(row.id, draft.trim() || displayTitle);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="flex-1 rounded border border-blue-400 px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Edit digest line"
        />
        <button
          onClick={commitEdit}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 group">
      <span className="flex-1 text-sm text-gray-800">
        {row.isCarryOver && (
          <span className="mr-1.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
            carry-over
          </span>
        )}
        {displayTitle}
        {row.assignee && !suppressAssignee && (
          <span className="ml-2 text-xs text-gray-400">({row.assignee})</span>
        )}
      </span>
      <button
        onClick={startEdit}
        aria-label={`Edit line: ${displayTitle}`}
        className="shrink-0 text-xs text-gray-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-blue-600 transition-opacity"
      >
        Edit line
      </button>
    </div>
  );
}

function BucketSection({
  label,
  rows,
  colorClass,
  emptyText,
  onTitleEdit,
  onBucketChange,
  showMoveDropdown = false,
}: {
  label: string;
  rows: DigestRow[];
  colorClass: string;
  emptyText?: string;
  onTitleEdit: (id: string, title: string) => void;
  onBucketChange: (id: string, bucket: Bucket) => void;
  showMoveDropdown?: boolean;
}) {
  if (rows.length === 0 && !emptyText) return null;

  return (
    <section className="mb-6" aria-label={label}>
      <h2 className={`mb-2 text-sm font-bold uppercase tracking-wide ${colorClass}`}>
        {label} ({rows.length})
      </h2>
      {rows.length === 0 && emptyText ? (
        <p className="text-sm text-gray-400 italic">{emptyText}</p>
      ) : (
        <ul className="space-y-1.5 pl-1">
          {rows.map((row) => (
            <li key={row.id} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
              <div className="flex-1 min-w-0">
                {showMoveDropdown ? (
                  <UnmappedItem row={row} onBucketChange={onBucketChange} />
                ) : (
                  <EditableLine row={row} onEdit={onTitleEdit} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function UnmappedItem({
  row,
  onBucketChange,
}: {
  row: DigestRow;
  onBucketChange: (id: string, bucket: Bucket) => void;
}) {
  const displayTitle = row.editedTitle ?? row.title;
  // NOTE: screen does NOT show assignee for unmapped items; copy serializer matches this.
  return (
    <div className="flex flex-wrap items-start gap-2">
      <span className="flex-1 min-w-0 text-sm text-gray-700">
        {displayTitle}{" "}
        <span className="text-xs text-gray-400">(status: &quot;{row.status}&quot;)</span>
      </span>
      <select
        aria-label={`Move "${displayTitle}" to bucket`}
        onChange={(e) => onBucketChange(row.id, e.target.value as Bucket)}
        defaultValue=""
        className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="" disabled>
          Move to…
        </option>
        {BUCKET_MOVE_OPTIONS.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
    </div>
  );
}

function GroupedSection({
  rows,
  groupMode,
  bucketLabel,
  colorClass,
  onTitleEdit,
}: {
  rows: DigestRow[];
  groupMode: GroupMode;
  bucketLabel: string;
  colorClass: string;
  onTitleEdit: (id: string, title: string) => void;
}) {
  // When grouped by assignee, the group header already shows the name — suppress per-line (name)
  const suppressAssignee = groupMode === "assignee";
  const groups = new Map<string, DigestRow[]>();
  for (const row of rows) {
    const key =
      groupMode === "assignee"
        ? row.assignee || "(unassigned)"
        : row.epic || "(no epic)";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  return (
    <section className="mb-6" aria-label={bucketLabel}>
      <h2 className={`mb-2 text-sm font-bold uppercase tracking-wide ${colorClass}`}>
        {bucketLabel} ({rows.length})
      </h2>
      {Array.from(groups.entries()).map(([groupKey, groupRows]) => (
        <div key={groupKey} className="mb-3">
          <h3 className="text-xs font-semibold text-gray-500 mb-1 pl-1">
            {groupMode === "assignee" ? "👤 " : "📁 "}
            {groupKey}
          </h3>
          <ul className="space-y-1.5 pl-4">
            {groupRows.map((row) => (
              <li key={row.id} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
                <div className="flex-1 min-w-0">
                  <EditableLine row={row} onEdit={onTitleEdit} suppressAssignee={suppressAssignee} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

// ---- Copy buttons (Fix 2: shared model, Fix 3: opaque bg, A: non-overlapping static footer) ----

function CopyButtons({ model }: { model: DigestModel }) {
  const [mdState, setMdState] = useState<"idle" | "copied">("idle");
  const [ptState, setPtState] = useState<"idle" | "copied">("idle");

  const copyText = useCallback(
    async (
      text: string,
      setState: React.Dispatch<React.SetStateAction<"idle" | "copied">>
    ) => {
      setState("copied");
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        ta.style.left = "-9999px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setTimeout(() => setState("idle"), 2000);
    },
    []
  );

  return (
    // A-fix: static footer (not sticky) — sits below all content, never overlaps rows.
    // bg-white solid opaque; border-t for visual separation.
    <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-3 rounded-b-2xl">
      <button
        aria-label="Copy as Markdown"
        onClick={() => copyText(buildMarkdown(model), setMdState)}
        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
          mdState === "copied"
            ? "bg-green-600 text-white"
            : "bg-gray-900 text-white hover:bg-gray-700"
        }`}
      >
        <span aria-live="polite" aria-atomic="true">
          {mdState === "copied" ? "Copied ✓" : "Copy Markdown"}
        </span>
      </button>
      <button
        aria-label="Copy as plain text"
        onClick={() => copyText(buildPlainText(model), setPtState)}
        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
          ptState === "copied"
            ? "bg-green-600 text-white"
            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span aria-live="polite" aria-atomic="true">
          {ptState === "copied" ? "Copied ✓" : "Copy plain text"}
        </span>
      </button>
    </div>
  );
}

// ---- Main DigestView ----

export function DigestView({
  rows,
  groupMode,
  weekFilter,
  availableWeeks,
  onWeekFilterChange,
  onBucketChange,
  onTitleEdit,
  onRemapClick,
  suppressSuccess = false,
  onShareLinkCreated,
  autoAppliedCount = 0,
}: DigestViewProps) {
  // Fix 5: editable prose
  const [editedProse, setEditedProse] = useState<string | null>(null);

  // Fix 4: filter rows by selected week
  const visibleRows = filterRowsByWeek(rows, weekFilter);

  const shipped = visibleRows.filter((r) => r.bucket === "Shipped");
  const inProgress = visibleRows.filter((r) => r.bucket === "In Progress");
  const blocked = visibleRows.filter((r) => r.bucket === "Blocked");
  const backlog = visibleRows.filter((r) => r.bucket === "Backlog");
  const unmapped = visibleRows.filter((r) => r.bucket === "Unmapped");

  const currentWeekOption = availableWeeks.find((w) => w.key === weekFilter);
  const weekLabel = currentWeekOption?.label ?? "All dates";

  const carryOver = visibleRows.filter(
    (r) => r.isCarryOver && r.bucket !== "Backlog" && r.bucket !== "Unmapped"
  ).length;

  const autoProseText = `${weekLabel}: This week the team shipped ${shipped.length} ${
    shipped.length === 1 ? "item" : "items"
  }, has ${inProgress.length} in progress and ${blocked.length} blocked, with ${carryOver} carried over.`;

  // Shared digest model — screen and copy serializers use the same data
  const model: DigestModel = {
    prose: editedProse ?? autoProseText,
    shipped,
    inProgress,
    blocked,
    backlog,
    unmapped,
    groupMode,
  };

  // Snapshot builder for share — captures current formatted digest
  const getShareSnapshot = useCallback(
    () => buildWeeklySnapshot(model, weekLabel),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, weekLabel]
  );

  return (
    // A-fix: no scrollPaddingBottom needed — copy bar is now a static footer, not sticky
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Digest header: week selector (left) + Remap + Share (right) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-6 py-3">
        {/* Fix 4: week selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="week-filter" className="text-xs font-medium text-gray-500 whitespace-nowrap">
            Week:
          </label>
          <select
            id="week-filter"
            data-testid="week-filter"
            value={weekFilter}
            onChange={(e) => {
              setEditedProse(null); // reset prose on week change so auto-text updates
              onWeekFilterChange(e.target.value);
            }}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {availableWeeks.map((w) => (
              <option key={w.key} value={w.key}>
                {w.label}
              </option>
            ))}
          </select>
        </div>

        {/* Fix 1: persistent Remap columns button + Share link */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex flex-col items-end gap-0.5">
            <button
              onClick={onRemapClick}
              className="text-xs font-medium text-blue-600 underline hover:text-blue-800"
              data-testid="remap-columns-btn"
            >
              Remap columns
            </button>
            {/* C(i): surface persistence promise — visible near the remap entry point */}
            <span className="text-xs text-gray-400" data-testid="saved-on-device-note">
              Saved on this device — next week just drop your new export.
            </span>
          </div>
          <ShareControl
            getSnapshot={getShareSnapshot}
            onLinkCreated={onShareLinkCreated}
          />
        </div>
      </div>

      {/* Editable prose summary (Fix 5) */}
      <div className="border-b border-gray-100 px-6 py-4">
        <EditableProseSummary
          autoText={autoProseText}
          editedProse={editedProse}
          onProseEdit={setEditedProse}
        />
      </div>

      <div className="px-6 py-5">
        {/* Shipped */}
        <GroupedSection
          rows={shipped}
          groupMode={groupMode}
          bucketLabel="Shipped"
          colorClass="text-green-700"
          onTitleEdit={onTitleEdit}
        />

        {/* In Progress */}
        <GroupedSection
          rows={inProgress}
          groupMode={groupMode}
          bucketLabel="In Progress"
          colorClass="text-blue-700"
          onTitleEdit={onTitleEdit}
        />

        {/* Blocked */}
        <GroupedSection
          rows={blocked}
          groupMode={groupMode}
          bucketLabel="Blocked"
          colorClass="text-red-700"
          onTitleEdit={onTitleEdit}
        />

        {/* Backlog - visually muted */}
        {backlog.length > 0 && (
          <div className="mt-2 border-t border-gray-100 pt-4">
            <BucketSection
              label="Backlog / To Do"
              rows={backlog}
              colorClass="text-gray-400"
              onTitleEdit={onTitleEdit}
              onBucketChange={onBucketChange}
            />
          </div>
        )}

        {/* Unmapped status list */}
        <div className="mt-2 border-t border-gray-100 pt-4">
          {unmapped.length === 0 ? (
            // Fix 1: suppress success when core column unmapped (suppressSuccess flag from DigestApp)
            suppressSuccess ? null : (
              <>
                <p role="status" className="text-sm text-green-600 font-medium">
                  All statuses recognized ✓
                </p>
                {/* C(ii): show remembered indicator when saved rules auto-applied */}
                {autoAppliedCount > 0 && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    {autoAppliedCount} custom {autoAppliedCount === 1 ? "status" : "statuses"} remembered from last time ✓
                  </p>
                )}
              </>
            )
          ) : (
            <section aria-label="Unmapped statuses">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-amber-600">
                Unmapped status ({unmapped.length})
              </h2>
              <ul className="space-y-2">
                {unmapped.map((row) => (
                  <li key={row.id}>
                    <UnmappedItem row={row} onBucketChange={onBucketChange} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {/* Fix 2: copy from shared model; Fix 3: opaque sticky bar */}
      <CopyButtons model={model} />
    </div>
  );
}
