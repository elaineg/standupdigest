"use client";

import { useState, useCallback } from "react";
import type { DigestRow, Bucket, GroupMode } from "@/lib/csvParser";

interface DigestViewProps {
  rows: DigestRow[];
  groupMode: GroupMode;
  onBucketChange: (rowId: string, bucket: Bucket) => void;
  onTitleEdit: (rowId: string, title: string) => void;
}

const BUCKET_MOVE_OPTIONS: Bucket[] = [
  "Shipped",
  "In Progress",
  "Blocked",
  "Backlog",
];

function ProseSummary({ rows }: { rows: DigestRow[] }) {
  const shipped = rows.filter((r) => r.bucket === "Shipped").length;
  const inProgress = rows.filter((r) => r.bucket === "In Progress").length;
  const blocked = rows.filter((r) => r.bucket === "Blocked").length;
  const carryOver = rows.filter(
    (r) => r.isCarryOver && r.bucket !== "Backlog" && r.bucket !== "Unmapped"
  ).length;

  return (
    <p className="text-base text-gray-700" data-testid="prose-summary">
      This week the team shipped{" "}
      <strong>{shipped}</strong>{" "}
      {shipped === 1 ? "item" : "items"}, has{" "}
      <strong>{inProgress}</strong>{" "}
      in progress and{" "}
      <strong>{blocked}</strong>{" "}
      blocked, with{" "}
      <strong>{carryOver}</strong>{" "}
      carried over.
    </p>
  );
}

function EditableLine({
  row,
  onEdit,
}: {
  row: DigestRow;
  onEdit: (id: string, title: string) => void;
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
        {row.assignee && (
          <span className="ml-2 text-xs text-gray-400">({row.assignee})</span>
        )}
      </span>
      <button
        onClick={startEdit}
        aria-label={`Edit line: ${displayTitle}`}
        className="shrink-0 text-xs text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-opacity"
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
                  <UnmappedItem
                    row={row}
                    onBucketChange={onBucketChange}
                  />
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
                  <EditableLine row={row} onEdit={onTitleEdit} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function CopyButtons({ rows }: { rows: DigestRow[] }) {
  const [mdState, setMdState] = useState<"idle" | "copied">("idle");
  const [ptState, setPtState] = useState<"idle" | "copied">("idle");

  const buildMarkdown = useCallback(() => {
    const sections: string[] = [];
    const shipped = rows.filter((r) => r.bucket === "Shipped");
    const inProgress = rows.filter((r) => r.bucket === "In Progress");
    const blocked = rows.filter((r) => r.bucket === "Blocked");
    const backlog = rows.filter((r) => r.bucket === "Backlog");
    const unmapped = rows.filter((r) => r.bucket === "Unmapped");
    const carryOver = rows.filter(
      (r) =>
        r.isCarryOver && r.bucket !== "Backlog" && r.bucket !== "Unmapped"
    ).length;

    const summary = `This week the team shipped ${shipped.length} ${
      shipped.length === 1 ? "item" : "items"
    }, has ${inProgress.length} in progress and ${blocked.length} blocked, with ${carryOver} carried over.`;
    sections.push(summary);
    sections.push("");

    if (shipped.length > 0) {
      sections.push(`## Shipped (${shipped.length})`);
      for (const r of shipped) {
        const t = r.editedTitle ?? r.title;
        sections.push(`- ${t}${r.assignee ? ` (${r.assignee})` : ""}`);
      }
      sections.push("");
    }
    if (inProgress.length > 0) {
      sections.push(`## In Progress (${inProgress.length})`);
      for (const r of inProgress) {
        const t = r.editedTitle ?? r.title;
        const co = r.isCarryOver ? " [carry-over]" : "";
        sections.push(
          `- ${t}${r.assignee ? ` (${r.assignee})` : ""}${co}`
        );
      }
      sections.push("");
    }
    if (blocked.length > 0) {
      sections.push(`## Blocked (${blocked.length})`);
      for (const r of blocked) {
        const t = r.editedTitle ?? r.title;
        sections.push(`- ${t}${r.assignee ? ` (${r.assignee})` : ""}`);
      }
      sections.push("");
    }
    if (backlog.length > 0) {
      sections.push(`## Backlog / To Do (${backlog.length})`);
      for (const r of backlog) {
        const t = r.editedTitle ?? r.title;
        sections.push(`- ${t}${r.assignee ? ` (${r.assignee})` : ""}`);
      }
      sections.push("");
    }
    if (unmapped.length > 0) {
      sections.push(`## Unmapped (${unmapped.length})`);
      for (const r of unmapped) {
        const t = r.editedTitle ?? r.title;
        sections.push(
          `- ${t} (status: "${r.status}")${r.assignee ? ` (${r.assignee})` : ""}`
        );
      }
    }
    return sections.join("\n");
  }, [rows]);

  const buildPlainText = useCallback(() => {
    return buildMarkdown()
      .replace(/^## /gm, "")
      .replace(/^- /gm, "• ");
  }, [buildMarkdown]);

  const copyText = useCallback(
    async (
      text: string,
      setState: React.Dispatch<React.SetStateAction<"idle" | "copied">>
    ) => {
      // Optimistic flip
      setState("copied");
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Fallback: hidden textarea
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
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
    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-10">
      <button
        aria-label="Copy as Markdown"
        onClick={() => copyText(buildMarkdown(), setMdState)}
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
        onClick={() => copyText(buildPlainText(), setPtState)}
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

export function DigestView({
  rows,
  groupMode,
  onBucketChange,
  onTitleEdit,
}: DigestViewProps) {
  const shipped = rows.filter((r) => r.bucket === "Shipped");
  const inProgress = rows.filter((r) => r.bucket === "In Progress");
  const blocked = rows.filter((r) => r.bucket === "Blocked");
  const backlog = rows.filter((r) => r.bucket === "Backlog");
  const unmapped = rows.filter((r) => r.bucket === "Unmapped");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Prose summary */}
      <div className="border-b border-gray-100 px-6 py-4">
        <ProseSummary rows={rows} />
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

        {/* Backlog - visually muted, shown separately */}
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

        {/* Unmapped status list - always rendered */}
        <div className="mt-2 border-t border-gray-100 pt-4">
          {unmapped.length === 0 ? (
            <p
              role="status"
              className="text-sm text-green-600 font-medium"
            >
              All statuses recognized ✓
            </p>
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

      <CopyButtons rows={rows} />
    </div>
  );
}
