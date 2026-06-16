"use client";

import { useState, useCallback, useMemo } from "react";
import type { DigestRow } from "@/lib/csvParser";
import {
  computeSprintReview,
  getSprintNames,
  buildSprintMarkdown,
  buildSprintPlainText,
  type SprintReviewCopyModel,
} from "@/lib/sprintReview";

interface SprintReviewViewProps {
  rows: DigestRow[];
  hasSprintColumn: boolean;
  hasAddedColumn: boolean;
  onRemapClick: () => void;
}

// ---- Editable line (reuses the same pattern as DigestView) ----

function EditableLine({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };

  const commitEdit = () => {
    const trimmed = draft.trim();
    onChange(trimmed || value);
    setEditing(false);
  };

  if (editing) {
    return (
      // FIX 3: relative z-20 ensures the edit row and Save button appear ABOVE the sticky copy bar (z-10),
      // so the Save button is always clickable even when editing a line near the viewport bottom.
      <div className="relative z-20 flex items-center gap-2">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); commitEdit(); }
            if (e.key === "Escape") setEditing(false);
          }}
          className={`flex-1 rounded border border-blue-400 px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${className ?? ""}`}
          aria-label="Edit sprint review line"
        />
        <button onClick={commitEdit} className="text-xs text-blue-600 hover:text-blue-800">
          Save
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 group">
      <span className={`flex-1 ${className ?? ""}`}>{value}</span>
      <button
        onClick={startEdit}
        aria-label={`Edit: ${value}`}
        className="shrink-0 text-xs text-gray-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-blue-600 transition-opacity"
      >
        Edit line
      </button>
    </div>
  );
}

// ---- Row editable line ----

function EditableRowLine({ row, onEdit }: { row: DigestRow; onEdit: (id: string, title: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const displayTitle = row.editedTitle ?? row.title;

  const startEdit = () => { setDraft(displayTitle); setEditing(true); };
  const commitEdit = () => { onEdit(row.id, draft.trim() || displayTitle); setEditing(false); };

  if (editing) {
    return (
      // FIX 3: relative z-20 ensures row edit + Save appear above the sticky copy bar (z-10)
      <div className="relative z-20 flex items-center gap-2">
        <input
          autoFocus value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitEdit(); } if (e.key === "Escape") setEditing(false); }}
          className="flex-1 rounded border border-blue-400 px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Edit digest line"
        />
        <button onClick={commitEdit} className="text-xs text-blue-600 hover:text-blue-800">Save</button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 group">
      <span className="flex-1 text-sm text-gray-800">
        {row.isCarryOver && (
          <span className="mr-1.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">carry-over</span>
        )}
        {displayTitle}
        {row.assignee && <span className="ml-2 text-xs text-gray-400">({row.assignee})</span>}
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

// ---- Copy buttons ----

function SprintCopyButtons({ copyModel }: { copyModel: SprintReviewCopyModel }) {
  const [mdState, setMdState] = useState<"idle" | "copied">("idle");
  const [ptState, setPtState] = useState<"idle" | "copied">("idle");

  const copyText = useCallback(
    async (text: string, setState: React.Dispatch<React.SetStateAction<"idle" | "copied">>) => {
      setState("copied");
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // FIX 3: position offscreen (not just opacity:0) so the fallback textarea never visually
        // overlaps the copy bar or edit inputs (which caused the "second input" overlap symptom).
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

  // FIX 2: bg-white (solid, not translucent) so sticky bar never bleeds through underlying content
  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-10">
      <button
        aria-label="Copy as Markdown"
        onClick={() => copyText(buildSprintMarkdown(copyModel), setMdState)}
        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
          mdState === "copied" ? "bg-green-600 text-white" : "bg-gray-900 text-white hover:bg-gray-700"
        }`}
      >
        <span aria-live="polite" aria-atomic="true">
          {mdState === "copied" ? "Copied ✓" : "Copy Markdown"}
        </span>
      </button>
      <button
        aria-label="Copy as plain text"
        onClick={() => copyText(buildSprintPlainText(copyModel), setPtState)}
        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
          ptState === "copied" ? "bg-green-600 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span aria-live="polite" aria-atomic="true">
          {ptState === "copied" ? "Copied ✓" : "Copy plain text"}
        </span>
      </button>
    </div>
  );
}

// ---- Main SprintReviewView ----

export function SprintReviewView({
  rows,
  hasSprintColumn,
  hasAddedColumn,
  onRemapClick,
}: SprintReviewViewProps) {
  const sprintNames = useMemo(() => getSprintNames(rows), [rows]);
  const [selectedSprint, setSelectedSprint] = useState<string>(sprintNames[0] ?? "");

  // Update selectedSprint when sprintNames changes (e.g. after remap)
  const effectiveSprint = sprintNames.includes(selectedSprint)
    ? selectedSprint
    : sprintNames[0] ?? "";

  // ONE computation — feeds screen AND copy
  const model = useMemo(
    () => computeSprintReview(rows, effectiveSprint, hasSprintColumn, hasAddedColumn),
    [rows, effectiveSprint, hasSprintColumn, hasAddedColumn]
  );

  // Editable overrides for the stat lines (velocity tooltip is not editable — it's a fixed help string)
  const [editedVelocityHeadline, setEditedVelocityHeadline] = useState<string | null>(null);
  const [editedVelocitySubline, setEditedVelocitySubline] = useState<string | null>(null);
  const [editedScopeLine, setEditedScopeLine] = useState<string | null>(null);
  const [editedSpilloverHeadline, setEditedSpilloverHeadline] = useState<string | null>(null);

  // Per-row title edits (spillover rows)
  const [rowEdits, setRowEdits] = useState<Map<string, string>>(new Map());

  const handleRowEdit = useCallback((id: string, title: string) => {
    setRowEdits((prev) => new Map(prev).set(id, title));
  }, []);

  // Build the rows with edits applied (for spillover display and copy)
  const spilloverRowsWithEdits = useMemo(() =>
    model.spilloverIssues.map((r) =>
      rowEdits.has(r.id) ? { ...r, editedTitle: rowEdits.get(r.id) } : r
    ), [model.spilloverIssues, rowEdits]);

  // By assignee rows with edits
  const byAssigneeWithEdits = useMemo(() =>
    model.byAssignee.map((a) => ({
      ...a,
      rows: a.rows.map((r) => rowEdits.has(r.id) ? { ...r, editedTitle: rowEdits.get(r.id) } : r),
    })), [model.byAssignee, rowEdits]);

  // Reset stat line edits when sprint changes
  const handleSprintChange = (name: string) => {
    setSelectedSprint(name);
    setEditedVelocityHeadline(null);
    setEditedVelocitySubline(null);
    setEditedScopeLine(null);
    setEditedSpilloverHeadline(null);
    setRowEdits(new Map());
  };

  // The copy model reads from edited values + same model data
  const copyModel: SprintReviewCopyModel = {
    sprintName: effectiveSprint,
    velocityHeadline: editedVelocityHeadline ?? model.velocityHeadline,
    velocityTooltip: model.velocityTooltip,
    velocitySubline: editedVelocitySubline ?? model.velocitySubline,
    scopeLine: editedScopeLine ?? model.scopeLine,
    spilloverHeadline: editedSpilloverHeadline ?? model.spilloverHeadline,
    spilloverRows: spilloverRowsWithEdits,
    byAssignee: byAssigneeWithEdits,
    groupMode: "assignee",
  };

  const noSprintData = sprintNames.length === 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm" style={{ scrollPaddingBottom: "5rem" }}>
      {/* Header: sprint selector (left) + Remap columns (right) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-6 py-3">
        <div className="flex items-center gap-2">
          <label htmlFor="sprint-filter" className="text-xs font-medium text-gray-500 whitespace-nowrap">
            Sprint:
          </label>
          {noSprintData ? (
            <span className="text-sm text-gray-400 italic">No sprint data detected</span>
          ) : (
            <select
              id="sprint-filter"
              data-testid="sprint-filter"
              value={effectiveSprint}
              onChange={(e) => handleSprintChange(e.target.value)}
              className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {sprintNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={onRemapClick}
          className="text-xs font-medium text-blue-600 underline hover:text-blue-800"
          data-testid="sprint-remap-columns-btn"
        >
          Remap columns
        </button>
      </div>

      {noSprintData && (
        <div className="px-6 pt-4 pb-0">
          <p role="status" className="text-sm text-gray-500 text-center">
            No sprint data found. Add a &quot;Sprint&quot; or &quot;Cycle&quot; column to your CSV, or use{" "}
            <button onClick={onRemapClick} className="text-blue-600 underline">Remap columns</button>{" "}
            to map an existing column.
          </p>
        </div>
      )}

      {/* FIX 2: pb-24 ensures the last BY ASSIGNEE / Blocked row is never hidden behind the sticky copy bar */}
      <div className="px-6 py-5 space-y-6 pb-24">
        {/* VELOCITY */}
        <section aria-label="Velocity">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Velocity</h2>
          <div data-testid="velocity-headline">
            <EditableLine
              value={editedVelocityHeadline ?? model.velocityHeadline}
              onChange={setEditedVelocityHeadline}
              className="text-2xl font-bold text-green-700"
            />
          </div>
          {/* FIX 1: inline help tooltip explaining the velocity calc */}
          <p className="mt-0.5 text-xs text-gray-400 italic" title={model.velocityTooltip}>
            {model.velocityTooltip}
          </p>
          <div className="mt-1" data-testid="velocity-subline">
            <EditableLine
              value={editedVelocitySubline ?? model.velocitySubline}
              onChange={setEditedVelocitySubline}
              className="text-sm text-gray-500"
            />
          </div>
        </section>

        {/* SCOPE CHANGE — always rendered; shows fallback text when columns are missing */}
        <section aria-label="Scope Change" className="border-t border-gray-100 pt-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Scope Change</h2>
          <div data-testid="scope-line">
            <EditableLine
              value={editedScopeLine ?? model.scopeLine}
              onChange={setEditedScopeLine}
              className={`text-sm ${model.scopeSupported ? "text-gray-700" : "text-gray-400 italic"}`}
            />
          </div>
        </section>

        {/* SPILLOVER */}
        <section aria-label="Spillover" className="border-t border-gray-100 pt-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-amber-600">Spillover</h2>
          <div className="mb-2" data-testid="spillover-headline">
            <EditableLine
              value={editedSpilloverHeadline ?? model.spilloverHeadline}
              onChange={setEditedSpilloverHeadline}
              className="text-sm text-gray-700"
            />
          </div>
          {spilloverRowsWithEdits.length > 0 ? (
            <ul className="space-y-1.5 pl-1">
              {spilloverRowsWithEdits.map((row) => (
                <li key={row.id} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  <div className="flex-1 min-w-0">
                    <EditableRowLine row={row} onEdit={handleRowEdit} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p role="status" className="text-sm text-green-600 font-medium">
              No spillover — all sprint issues completed ✓
            </p>
          )}
        </section>

        {/* BY ASSIGNEE */}
        <section aria-label="By Assignee" className="border-t border-gray-100 pt-4">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-700">By Assignee</h2>
          {byAssigneeWithEdits.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No assignee data.</p>
          ) : (
            <div className="space-y-4">
              {byAssigneeWithEdits.map((a) => (
                <div key={a.assignee}>
                  {/* FIX 1: show shipped-of-total per person so numbers reconcile with velocity headline */}
                  <h3 className="text-xs font-semibold text-gray-600 mb-1.5" data-testid={`assignee-${a.assignee}`}>
                    👤 {a.assignee} — {a.shippedPoints ?? 0} of {a.points} pts shipped · {a.issues} {a.issues === 1 ? "issue" : "issues"}
                  </h3>
                  <ul className="space-y-1 pl-4">
                    {a.rows.map((row) => (
                      <li key={row.id} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
                        <div className="flex-1 min-w-0">
                          <EditableRowLine row={row} onEdit={handleRowEdit} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Copy buttons */}
      <SprintCopyButtons copyModel={copyModel} />
    </div>
  );
}
