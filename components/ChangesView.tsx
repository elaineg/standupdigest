"use client";

import { useState, useCallback, useMemo, useRef, DragEvent } from "react";
import type { DigestRow } from "@/lib/csvParser";
import { parseCSVText } from "@/lib/csvParser";
import {
  computeChanges,
  buildChangesMarkdown,
  buildChangesPlainText,
  type ChangesModel,
  type ChangesRow,
  type ChangesCopyModel,
} from "@/lib/changesDigest";

// ---- Editable inline line (mirrors DigestView/SprintReviewView pattern) ----

function EditableLine({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEdit = () => { setDraft(value); setEditing(true); };
  const commitEdit = () => {
    const trimmed = draft.trim();
    onChange(trimmed || value);
    setEditing(false);
  };

  if (editing) {
    return (
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
          className="flex-1 rounded border border-blue-400 px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Edit digest line"
        />
        <button onClick={commitEdit} className="text-xs text-blue-600 hover:text-blue-800">Save</button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 group">
      <span className="flex-1 text-sm text-gray-800">{value}</span>
      <button
        onClick={startEdit}
        aria-label={`Edit line: ${value}`}
        className="shrink-0 text-xs text-gray-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-blue-600 transition-opacity"
      >
        Edit line
      </button>
    </div>
  );
}

// ---- ChangesRow display ----

function ChangesRowItem({
  cr,
  onEdit,
  accentClass,
}: {
  cr: ChangesRow;
  onEdit: (id: string, title: string) => void;
  accentClass?: string;
}) {
  const displayTitle = cr.row.editedTitle ?? cr.row.title;

  const handleChange = useCallback(
    (newTitle: string) => onEdit(cr.row.id, newTitle),
    [cr.row.id, onEdit]
  );

  return (
    <li className="flex items-start gap-2">
      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${accentClass ?? "bg-gray-400"}`} />
      <div className="flex-1 min-w-0">
        <EditableLine value={displayTitle} onChange={handleChange} />
        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          {cr.row.assignee && (
            <span className="text-xs text-gray-400">({cr.row.assignee})</span>
          )}
          {cr.stilBlockedLabel && (
            <span className="inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
              {cr.stilBlockedLabel}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

// ---- Bucket section ----

function BucketSection({
  label,
  rows,
  accentClass,
  headerColorClass,
  onEdit,
}: {
  label: string;
  rows: ChangesRow[];
  accentClass: string;
  headerColorClass: string;
  onEdit: (id: string, title: string) => void;
}) {
  if (rows.length === 0) return null;
  return (
    <section className="mb-5" aria-label={label}>
      <h2 className={`mb-2 text-sm font-bold uppercase tracking-wide ${headerColorClass}`}>
        {label} ({rows.length})
      </h2>
      <ul className="space-y-2 pl-1">
        {rows.map((cr) => (
          <ChangesRowItem
            key={cr.row.id}
            cr={cr}
            onEdit={onEdit}
            accentClass={accentClass}
          />
        ))}
      </ul>
    </section>
  );
}

// ---- Collapsible secondary bucket ----

function CollapsibleBucket({
  label,
  rows,
  accentClass,
  headerColorClass,
  onEdit,
}: {
  label: string;
  rows: ChangesRow[];
  accentClass: string;
  headerColorClass: string;
  onEdit: (id: string, title: string) => void;
}) {
  const [open, setOpen] = useState(false);

  if (rows.length === 0) return null;
  return (
    <section className="mb-4" aria-label={label}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 text-sm font-bold uppercase tracking-wide ${headerColorClass} hover:opacity-80`}
        aria-expanded={open}
      >
        <span>{open ? "▾" : "▸"}</span>
        <span>{label} ({rows.length})</span>
      </button>
      {open && (
        <ul className="mt-2 space-y-2 pl-1">
          {rows.map((cr) => (
            <ChangesRowItem
              key={cr.row.id}
              cr={cr}
              onEdit={onEdit}
              accentClass={accentClass}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

// ---- Editable prose summary ----

function EditableProse({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEdit = () => { setDraft(value); setEditing(true); };
  const commitEdit = () => {
    const trimmed = draft.trim();
    onChange(trimmed || value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2" data-testid="changes-prose-summary">
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
          aria-label="Edit changes prose summary"
        />
        <button onClick={commitEdit} className="shrink-0 text-xs text-blue-600 hover:text-blue-800">
          Save
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 group" data-testid="changes-prose-summary">
      <p className="flex-1 text-base text-gray-700">{value}</p>
      <button
        onClick={startEdit}
        aria-label="Edit changes prose summary"
        className="shrink-0 mt-0.5 text-xs text-gray-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-blue-600 transition-opacity"
      >
        Edit
      </button>
    </div>
  );
}

// ---- Copy buttons ----

function ChangesCopyButtons({ copyModel }: { copyModel: ChangesCopyModel }) {
  const [mdState, setMdState] = useState<"idle" | "copied">("idle");
  const [ptState, setPtState] = useState<"idle" | "copied">("idle");

  const copyText = useCallback(
    async (text: string, setState: React.Dispatch<React.SetStateAction<"idle" | "copied">>) => {
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
    /* Fixed to viewport bottom — guarantees no mid-list wedge regardless of card height */
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-50 border-t border-gray-200 px-4 py-3 flex gap-3">
      <button
        aria-label="Copy as Markdown"
        onClick={() => copyText(buildChangesMarkdown(copyModel), setMdState)}
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
        onClick={() => copyText(buildChangesPlainText(copyModel), setPtState)}
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

// ---- Prior-export dropzone ----

function PriorDropzone({
  onFile,
}: {
  onFile: (file: File) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => inputRef.current?.click()}
      className={`rounded-xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-blue-400 bg-blue-50"
          : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
      }`}
      aria-label="Drop prior CSV export here"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        aria-label="Upload prior week CSV file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          // Reset so same file can be re-selected
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      <p className="text-sm font-medium text-gray-600">
        Drop last week&apos;s CSV here
      </p>
      <p className="mt-1 text-xs text-gray-400">
        the previous export of this same tracker
      </p>
      <p className="mt-2 text-xs text-blue-600 underline">or click to browse</p>
    </div>
  );
}

// ---- Main ChangesView ----

export interface ChangesViewProps {
  currentRows: DigestRow[];
  hasCurrentFile: boolean;
  onLoadCurrentFile: (file: File) => void;
  // Externally provided prior rows (for "Load sample data" → both loaded at once)
  externalPriorRows?: DigestRow[] | null;
  onRemapClick: () => void;
  onLoadSampleChanges: () => void;
}

export function ChangesView({
  currentRows,
  hasCurrentFile,
  onLoadCurrentFile,
  externalPriorRows,
  onRemapClick,
  onLoadSampleChanges,
}: ChangesViewProps) {
  // Internal prior rows (from dropzone) — overridden by externalPriorRows when set
  const [internalPriorRows, setInternalPriorRows] = useState<DigestRow[] | null>(null);
  const [priorError, setPriorError] = useState<string | null>(null);

  // Row title edits (applied to current rows by id)
  const [rowEdits, setRowEdits] = useState<Map<string, string>>(new Map());

  // Prose override (user inline-edits the summary line)
  const [editedProse, setEditedProse] = useState<string | null>(null);

  // internalPriorRows (from dropzone) takes precedence over externalPriorRows (from "Load sample"),
  // so the user can manually override the sample by dropping their own prior file.
  const priorRows = internalPriorRows ?? externalPriorRows;

  const handlePriorFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const result = parseCSVText(text);
        if (result.rows.length === 0) {
          setPriorError("No data rows found in the prior export.");
          return;
        }
        setPriorError(null);
        setInternalPriorRows(result.rows);
        setRowEdits(new Map());
        setEditedProse(null);
      } catch {
        setPriorError("Failed to parse prior CSV.");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleRowEdit = useCallback((id: string, title: string) => {
    setRowEdits((prev) => new Map(prev).set(id, title));
  }, []);

  // Apply edits to current rows
  const currentRowsWithEdits = useMemo(
    () =>
      currentRows.map((r) =>
        rowEdits.has(r.id) ? { ...r, editedTitle: rowEdits.get(r.id) } : r
      ),
    [currentRows, rowEdits]
  );

  // Compute the ONE changes model
  const model: ChangesModel | null = useMemo(() => {
    if (!priorRows) return null;
    return computeChanges(currentRowsWithEdits, priorRows);
  }, [currentRowsWithEdits, priorRows]);

  // Prose: auto from model, or user-edited override
  const prose = model ? (editedProse ?? model.proseText) : "";

  // Build the copy model from the SAME computed model (count-honesty: never recomputed)
  const copyModel: ChangesCopyModel | null = model
    ? {
        prose,
        newlyShipped: model.newlyShipped,
        newlyBlocked: model.newlyBlocked,
        slipped: model.slipped,
        reopened: model.reopened,
        newThisPeriod: model.newThisPeriod,
        unblocked: model.unblocked,
        newlyStarted: model.newlyStarted,
        stillBlocked: model.stillBlocked,
        carriedOver: model.carriedOver,
        removed: model.removed,
      }
    : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm" style={{ scrollPaddingBottom: "5rem" }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-6 py-3">
        <span className="text-sm font-semibold text-gray-700">Changes since last week</span>
        <button
          onClick={onRemapClick}
          className="text-xs font-medium text-blue-600 underline hover:text-blue-800"
          data-testid="changes-remap-columns-btn"
        >
          Remap columns
        </button>
      </div>

      <div className="px-6 py-5 pb-24 space-y-4">
        {/* Current file dropzone — only shown when no file is loaded at all */}
        {!hasCurrentFile && (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600">Current export (now)</p>
            <div
              className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              onClick={() => document.getElementById("current-file-input-changes")?.click()}
            >
              <input
                id="current-file-input-changes"
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                aria-label="Upload current CSV file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onLoadCurrentFile(file);
                }}
              />
              <p className="text-sm font-medium text-gray-600">Drop your current CSV here</p>
              <p className="mt-1 text-xs text-gray-400">or click to browse</p>
            </div>
          </div>
        )}

        {/* Prior export dropzone — always shown */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-600">
            Compare to last week&apos;s export (optional)
          </p>
          <PriorDropzone onFile={handlePriorFile} />
          {priorError && (
            <p role="alert" className="mt-2 text-sm text-red-600">{priorError}</p>
          )}
        </div>

        {/* Load sample data button */}
        <div className="flex items-center justify-center py-2">
          <button
            type="button"
            onClick={onLoadSampleChanges}
            data-testid="changes-load-sample"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Load sample data
          </button>
        </div>

        {/* Empty state — before any prior file is loaded */}
        {!priorRows && (
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-6 py-8 text-center">
            <p className="text-base font-semibold text-gray-700">See what changed since your last export.</p>
            <p className="mt-1 text-sm text-gray-500">
              Drop last week&apos;s CSV in the second box — we&apos;ll show what shipped, what&apos;s newly blocked, and what slipped.
            </p>
          </div>
        )}

        {/* Warnings / edge-case notes */}
        {model?.sameFileDetected && (
          <div role="status" className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            No changes detected — are these the same export?
          </div>
        )}

        {model && model.differentTrackerWarning && !model.sameFileDetected && (
          <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            These look like different exports — matching may be unreliable, but we&apos;ll attempt the match.
          </div>
        )}

        {model && !model.matchedById && !model.sameFileDetected && (
          <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Matched by title (less reliable) — no ID column found.
          </div>
        )}

        {/* Changes digest */}
        {model && !model.sameFileDetected && (
          <>
            {/* Prose summary (single source of truth for counts) */}
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
              <EditableProse
                value={prose}
                onChange={(v) => setEditedProse(v)}
              />
            </div>

            {/* Headline buckets */}
            <BucketSection
              label="Newly Shipped"
              rows={model.newlyShipped}
              accentClass="bg-green-500"
              headerColorClass="text-green-700"
              onEdit={handleRowEdit}
            />
            <BucketSection
              label="Newly Blocked"
              rows={model.newlyBlocked}
              accentClass="bg-red-500"
              headerColorClass="text-red-700"
              onEdit={handleRowEdit}
            />
            <BucketSection
              label="Slipped"
              rows={model.slipped}
              accentClass="bg-amber-500"
              headerColorClass="text-amber-700"
              onEdit={handleRowEdit}
            />
            <BucketSection
              label="Reopened"
              rows={model.reopened}
              accentClass="bg-orange-500"
              headerColorClass="text-orange-700"
              onEdit={handleRowEdit}
            />
            <BucketSection
              label="New this period"
              rows={model.newThisPeriod}
              accentClass="bg-blue-400"
              headerColorClass="text-blue-700"
              onEdit={handleRowEdit}
            />

            {/* Secondary buckets (always visible, not collapsible per spec) */}
            <BucketSection
              label="Unblocked"
              rows={model.unblocked}
              accentClass="bg-teal-400"
              headerColorClass="text-teal-700"
              onEdit={handleRowEdit}
            />
            <BucketSection
              label="Newly Started"
              rows={model.newlyStarted}
              accentClass="bg-indigo-400"
              headerColorClass="text-indigo-700"
              onEdit={handleRowEdit}
            />

            {/* Collapsible secondary */}
            <div className="border-t border-gray-100 pt-4">
              <CollapsibleBucket
                label="Carried over / unchanged-open"
                rows={model.carriedOver}
                accentClass="bg-gray-400"
                headerColorClass="text-gray-500"
                onEdit={handleRowEdit}
              />
              <CollapsibleBucket
                label="Still Blocked"
                rows={model.stillBlocked}
                accentClass="bg-red-300"
                headerColorClass="text-red-600"
                onEdit={handleRowEdit}
              />
            </div>

            {/* Removed from tracker (prior-only rows) */}
            {model.removed.length > 0 && (
              <section className="border-t border-gray-100 pt-4" aria-label="Removed from tracker">
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-400">
                  Removed from tracker ({model.removed.length})
                </h2>
                <ul className="space-y-1.5 pl-1">
                  {model.removed.map((cr) => (
                    <li key={cr.row.id} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
                      <span className="text-sm text-gray-500 italic">
                        {cr.row.editedTitle ?? cr.row.title}
                        {cr.row.assignee && (
                          <span className="ml-1 text-xs text-gray-400">({cr.row.assignee})</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>

      {/* Sticky copy bar — solid bg, scroll padding baked in via pb-24 above */}
      {copyModel && !model?.sameFileDetected && (
        <ChangesCopyButtons copyModel={copyModel} />
      )}
    </div>
  );
}
