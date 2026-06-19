"use client";

import { useState, useCallback, useMemo, useRef, useEffect, DragEvent } from "react";
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
import { ShareControl } from "@/components/ShareControl";
import { buildChangesSnapshot } from "@/lib/snapshotSerializer";
import {
  clearSnapshot,
  saveSnapshot,
  snapshotToRows,
  relativeTime,
  type DigestSnapshotEntry,
} from "@/lib/snapshotStorage";

// ---- Editable inline line ----

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
  const handleChange = useCallback((newTitle: string) => onEdit(cr.row.id, newTitle), [cr.row.id, onEdit]);

  return (
    <li className="flex items-start gap-2">
      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${accentClass ?? "bg-gray-400"}`} />
      <div className="flex-1 min-w-0">
        <EditableLine value={displayTitle} onChange={handleChange} />
        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          {cr.row.assignee && <span className="text-xs text-gray-400">({cr.row.assignee})</span>}
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
  label, rows, accentClass, headerColorClass, onEdit,
}: {
  label: string; rows: ChangesRow[]; accentClass: string; headerColorClass: string;
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
          <ChangesRowItem key={cr.row.id} cr={cr} onEdit={onEdit} accentClass={accentClass} />
        ))}
      </ul>
    </section>
  );
}

// ---- Collapsible secondary bucket ----

function CollapsibleBucket({
  label, rows, accentClass, headerColorClass, onEdit,
}: {
  label: string; rows: ChangesRow[]; accentClass: string; headerColorClass: string;
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
            <ChangesRowItem key={cr.row.id} cr={cr} onEdit={onEdit} accentClass={accentClass} />
          ))}
        </ul>
      )}
    </section>
  );
}

// ---- Editable prose summary ----

function EditableProse({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const startEdit = () => { setDraft(value); setEditing(true); };
  const commitEdit = () => { const t = draft.trim(); onChange(t || value); setEditing(false); };

  if (editing) {
    return (
      <div className="flex items-center gap-2" data-testid="changes-prose-summary">
        <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(false); }}
          className="flex-1 rounded border border-blue-400 px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Edit changes prose summary"
        />
        <button onClick={commitEdit} className="shrink-0 text-xs text-blue-600 hover:text-blue-800">Save</button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 group" data-testid="changes-prose-summary">
      <p className="flex-1 text-base text-gray-700">{value}</p>
      <button onClick={startEdit} aria-label="Edit changes prose summary"
        className="shrink-0 mt-0.5 text-xs text-gray-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-blue-600 transition-opacity">
        Edit
      </button>
    </div>
  );
}

// ---- Copy buttons (P1-FIX: state/handlers passed from ChangesView to survive re-renders) ----

function ChangesCopyButtons({
  mdState,
  ptState,
  onCopyMd,
  onCopyPt,
}: {
  mdState: "idle" | "copied";
  ptState: "idle" | "copied";
  onCopyMd: () => void;
  onCopyPt: () => void;
}) {
  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-3 rounded-b-2xl">
      <button
        data-testid="copy-md-btn"
        aria-label="Copy as Markdown"
        onClick={onCopyMd}
        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${mdState === "copied" ? "bg-green-600 text-white" : "bg-gray-900 text-white hover:bg-gray-700"}`}>
        <span aria-live="polite" aria-atomic="true">{mdState === "copied" ? "Copied ✓" : "Copy Markdown"}</span>
      </button>
      <button
        data-testid="copy-pt-btn"
        aria-label="Copy as plain text"
        onClick={onCopyPt}
        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${ptState === "copied" ? "bg-green-600 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
        <span aria-live="polite" aria-atomic="true">{ptState === "copied" ? "Copied ✓" : "Copy plain text"}</span>
      </button>
    </div>
  );
}

// ---- Next-week dropzone (primary Changes-tab drop target) ----

function NextWeekDropzone({ onFile, testId }: { onFile: (file: File) => void; testId?: string }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div
      data-testid={testId}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => inputRef.current?.click()}
      className={`rounded-xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors ${isDragging ? "border-blue-500 bg-blue-50" : "border-blue-300 bg-blue-50/50 hover:border-blue-500 hover:bg-blue-50"}`}
      aria-label="Drop next week export here"
    >
      <input ref={inputRef} type="file" accept=".csv,text/csv" className="sr-only"
        aria-label="Upload next week CSV file"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) onFile(file); if (inputRef.current) inputRef.current.value = ""; }}
      />
      <p className="text-sm font-semibold text-blue-800">Drop next week&apos;s export here</p>
      <p className="mt-1 text-xs text-blue-600">We&apos;ll diff it against your saved baseline — no second upload needed</p>
      <p className="mt-2 text-xs text-blue-500 underline">drop here or click to browse</p>
    </div>
  );
}

// ---- Prior-export dropzone (optional fallback baseline override) ----

function PriorDropzone({ onFile }: { onFile: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => inputRef.current?.click()}
      className={`rounded-xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors ${isDragging ? "border-gray-400 bg-gray-100" : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"}`}
      aria-label="Drop prior CSV export here"
    >
      <input ref={inputRef} type="file" accept=".csv,text/csv" className="sr-only"
        aria-label="Upload prior week CSV file"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) onFile(file); if (inputRef.current) inputRef.current.value = ""; }}
      />
      <p className="text-sm font-medium text-gray-600">Drop a different prior/baseline export here</p>
      <p className="mt-1 text-xs text-gray-400">overrides the saved snapshot as the baseline for this comparison</p>
      <p className="mt-2 text-xs text-blue-600 underline">drop here or click to browse</p>
    </div>
  );
}

// ---- Baseline strip (which-baseline indicator) ----

function BaselineStrip({
  snapshot, onClear, onPromote, showPromote, promoteState,
}: {
  snapshot: DigestSnapshotEntry;
  onClear: () => void;
  onPromote: () => void;
  showPromote: boolean;
  promoteState: "idle" | "promoted";
}) {
  const when = relativeTime(snapshot.savedAt);
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3" data-testid="baseline-strip">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-blue-800">
            Comparing against: {snapshot.periodLabel} · saved {when}
          </p>
          <p className="mt-0.5 text-xs text-blue-600" data-testid="snapshot-device-local-note">
            Saved on this device — never uploaded
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onClear}
            data-testid="clear-snapshot-btn"
            className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50"
            aria-label="Clear saved snapshot"
          >
            Clear
          </button>
          {showPromote && (
            <button
              onClick={onPromote}
              data-testid="promote-snapshot-btn"
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${promoteState === "promoted" ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
              aria-label="Make this week the new baseline"
            >
              <span aria-live="polite" aria-atomic="true">
                {promoteState === "promoted" ? "Baseline updated ✓" : "Make this week the new baseline"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Main ChangesView ----

export interface ChangesViewProps {
  currentRows: DigestRow[];
  hasCurrentFile: boolean;
  onLoadCurrentFile: (file: File) => void;
  externalPriorRows?: DigestRow[] | null;
  onRemapClick: () => void;
  onLoadSampleChanges: () => void;
  onShareLinkCreated?: () => void;
  source?: string;
  recentlySavedSnapshot?: DigestSnapshotEntry | null;
}

export function ChangesView({
  currentRows,
  hasCurrentFile,
  onLoadCurrentFile,
  externalPriorRows,
  onRemapClick,
  onLoadSampleChanges,
  onShareLinkCreated,
  source,
  recentlySavedSnapshot,
}: ChangesViewProps) {
  // SSR-safe: never read localStorage in render/useState initializer
  const [savedSnapshot, setSavedSnapshot] = useState<DigestSnapshotEntry | null>(null);
  const [snapshotLoaded, setSnapshotLoaded] = useState(false);
  const [promoteState, setPromoteState] = useState<"idle" | "promoted">("idle");
  // P1-FIX: copy state lifted to ChangesView — survives any re-render of ChangesCopyButtons
  const [mdCopyState, setMdCopyState] = useState<"idle" | "copied">("idle");
  const [ptCopyState, setPtCopyState] = useState<"idle" | "copied">("idle");
  // useRef to hold latest copyModel for copy handlers — avoids stale closures
  const copyModelRef = useRef<ChangesCopyModel | null>(null);

  // D1 fix: internal "next week" rows dropped directly on the Changes tab.
  // These become the "current" side of the diff when present (overrides prop currentRows).
  const [changesNextRows, setChangesNextRows] = useState<DigestRow[] | null>(null);
  const [nextFileError, setNextFileError] = useState<string | null>(null);

  const handleNextWeekFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const result = parseCSVText(text);
        if (result.rows.length === 0) { setNextFileError("No data rows found in the export."); return; }
        setNextFileError(null);
        setChangesNextRows(result.rows);
        setRowEdits(new Map());
        setEditedProse(null);
      } catch { setNextFileError("Failed to parse CSV."); }
    };
    reader.readAsText(file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load snapshot from localStorage after mount
  useEffect(() => {
    if (!source) { setSnapshotLoaded(true); return; }
    const raw = window.localStorage.getItem(`standupdigest-snapshot-v1-${source}`);
    if (raw) {
      try { setSavedSnapshot(JSON.parse(raw) as DigestSnapshotEntry); } catch { /* ignore */ }
    }
    setSnapshotLoaded(true);
  }, [source]);

  // Pick up freshly-saved snapshot from Weekly Status tab
  useEffect(() => {
    if (recentlySavedSnapshot) {
      setSavedSnapshot(recentlySavedSnapshot);
      setPromoteState("idle");
      // D1 fix: clear any previously-loaded next-week file so we start fresh
      setChangesNextRows(null);
      setNextFileError(null);
    }
  }, [recentlySavedSnapshot]);

  // Internal prior rows (from manual baseline-override dropzone — D2: baseline/prior side only)
  const [internalPriorRows, setInternalPriorRows] = useState<DigestRow[] | null>(null);
  const [priorError, setPriorError] = useState<string | null>(null);
  const [manualOverrideOpen, setManualOverrideOpen] = useState(false);

  // Row title edits + prose override
  const [rowEdits, setRowEdits] = useState<Map<string, string>>(new Map());
  const [editedProse, setEditedProse] = useState<string | null>(null);

  const handlePriorFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const result = parseCSVText(text);
        if (result.rows.length === 0) { setPriorError("No data rows found in the prior export."); return; }
        setPriorError(null);
        setInternalPriorRows(result.rows);
        setRowEdits(new Map());
        setEditedProse(null);
      } catch { setPriorError("Failed to parse prior CSV."); }
    };
    reader.readAsText(file);
  }, []);

  const handleRowEdit = useCallback((id: string, title: string) => {
    setRowEdits((prev) => new Map(prev).set(id, title));
  }, []);

  // D1 fix: the "effective current" rows for the diff:
  //   - if a file was dropped directly on the Changes tab (changesNextRows), use those
  //   - otherwise fall back to the prop currentRows (loaded via Weekly Status)
  const effectiveCurrentRows = changesNextRows ?? currentRows;

  // Apply edits to effective current rows
  const currentRowsWithEdits = useMemo(
    () => effectiveCurrentRows.map((r) => rowEdits.has(r.id) ? { ...r, editedTitle: rowEdits.get(r.id) } : r),
    [effectiveCurrentRows, rowEdits]
  );

  // Snapshot rows (inflated from saved snapshot)
  const snapshotRows = useMemo(() => savedSnapshot ? snapshotToRows(savedSnapshot) : null, [savedSnapshot]);

  // Prior side priority: internalPriorRows (manual baseline override) > externalPriorRows (sample) > snapshotRows
  // D2 fix: internalPriorRows is ALWAYS the prior/baseline side — never the current side.
  const priorRows = internalPriorRows ?? externalPriorRows ?? snapshotRows;
  const priorSourceIsManual = !!internalPriorRows;

  // D1 fix: effective "has a current file" for the Changes tab:
  // true if we have changesNextRows (dropped on Changes tab) OR the prop hasCurrentFile
  const effectiveHasCurrentFile = !!changesNextRows || hasCurrentFile;

  // D1 fix: detect "same-session self-diff" — the prop currentRows equals the snapshot data
  // (user just saved this week as baseline; no next-week file dropped yet on Changes tab).
  // Only relevant when in snapshot mode and changesNextRows is null (nothing new dropped).
  const isSelfDiffScenario = useMemo(() => {
    if (!savedSnapshot || changesNextRows !== null || !hasCurrentFile || !snapshotRows) return false;
    // We have snapshot + current file loaded (from Weekly Status) but no next-week file dropped.
    // Check if the loaded file equals the snapshot (same export = self-diff scenario).
    if (currentRows.length === 0) return false;
    const snapshotIds = new Set(snapshotRows.map(r => r.issueKey?.toLowerCase()).filter(Boolean));
    const currentIds = new Set(currentRows.map(r => r.issueKey?.toLowerCase()).filter(Boolean));
    if (snapshotIds.size > 0 && currentIds.size > 0) {
      // Both have IDs — consider self-diff if ≥80% overlap (tolerates minor unmapped exclusions)
      const overlap = [...currentIds].filter(id => snapshotIds.has(id)).length;
      return overlap / Math.max(currentIds.size, snapshotIds.size) >= 0.8;
    }
    // Fallback: title-based check
    const snapshotTitles = new Set(snapshotRows.map(r => r.title?.toLowerCase().trim()).filter(Boolean));
    const currentTitles = new Set(currentRows.map(r => r.title?.toLowerCase().trim()).filter(Boolean));
    if (snapshotTitles.size === 0 || currentTitles.size === 0) return false;
    const titleOverlap = [...currentTitles].filter(t => snapshotTitles.has(t)).length;
    return titleOverlap / Math.max(currentTitles.size, snapshotTitles.size) >= 0.8;
  }, [savedSnapshot, changesNextRows, hasCurrentFile, currentRows, snapshotRows]);

  // ONE changes model — only compute when NOT in the self-diff scenario
  const model: ChangesModel | null = useMemo(() => {
    if (!priorRows) return null;
    if (isSelfDiffScenario) return null; // suppress self-diff; show instructive prompt instead
    return computeChanges(currentRowsWithEdits, priorRows);
  }, [currentRowsWithEdits, priorRows, isSelfDiffScenario]);

  const prose = model ? (editedProse ?? model.proseText) : "";

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

  // P1-FIX: keep copyModelRef current so copy handlers always see latest model
  copyModelRef.current = copyModel;

  const handleCopyMd = useCallback(async () => {
    setMdCopyState("copied");
    const text = buildChangesMarkdown(copyModelRef.current!);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setTimeout(() => setMdCopyState("idle"), 2000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopyPt = useCallback(async () => {
    setPtCopyState("copied");
    const text = buildChangesPlainText(copyModelRef.current!);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setTimeout(() => setPtCopyState("idle"), 2000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getShareSnapshot = useCallback(() => buildChangesSnapshot(copyModel!), [copyModel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Promote: save current week as the new baseline
  const handlePromote = useCallback(() => {
    if (!source || !effectiveHasCurrentFile) return;
    const dateLabel = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const label = `Saved on ${dateLabel}`;
    saveSnapshot(source, label, currentRowsWithEdits);
    const newEntry: DigestSnapshotEntry = {
      source,
      periodLabel: label,
      savedAt: Date.now(),
      // Include Backlog rows for Newly Started detection; exclude only Unmapped
      items: currentRowsWithEdits
        .filter((r) => r.bucket !== "Unmapped")
        .map((r) => ({ id: r.issueKey || "", bucket: r.bucket, title: r.title })),
    };
    setSavedSnapshot(newEntry);
    setPromoteState("promoted");
    setChangesNextRows(null); // after promoting next week becomes the new baseline; reset next-week drop
    setRowEdits(new Map());
    setEditedProse(null);
    setTimeout(() => setPromoteState("idle"), 3000);
  }, [source, effectiveHasCurrentFile, currentRowsWithEdits]);

  // Clear saved snapshot
  const handleClearSnapshot = useCallback(() => {
    if (!source) return;
    clearSnapshot(source);
    setSavedSnapshot(null);
    setPromoteState("idle");
  }, [source]);

  // First-ever save from the Changes tab
  const handleFirstBaselineSave = useCallback(() => {
    if (!source || !effectiveHasCurrentFile) return;
    const dateLabel = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const label = `Saved on ${dateLabel}`;
    // Save whichever rows are "current" at this point (could be changesNextRows or prop currentRows)
    const rowsToSave = changesNextRows ?? currentRows;
    saveSnapshot(source, label, rowsToSave);
    const newEntry: DigestSnapshotEntry = {
      source,
      periodLabel: label,
      savedAt: Date.now(),
      // Include Backlog rows for Newly Started detection; exclude only Unmapped
      items: rowsToSave
        .filter((r) => r.bucket !== "Unmapped")
        .map((r) => ({ id: r.issueKey || "", bucket: r.bucket, title: r.title })),
    };
    setSavedSnapshot(newEntry);
    setChangesNextRows(null); // saved file is now the baseline; clear the next-week drop
  }, [source, effectiveHasCurrentFile, changesNextRows, currentRows]);

  // Rendering logic — three states for the Changes tab body (before the diff model):
  //  A. First-ever empty: snapshotLoaded && !savedSnapshot && !internalPriorRows && !externalPriorRows
  //  B. Snapshot auto-diff: savedSnapshot && !internalPriorRows && !externalPriorRows
  //  C. No snapshot, manual prior only (prior dropzone shown)
  // D1 fix: isFirstEverEmpty still uses effectiveHasCurrentFile for the save button;
  // isSelfDiffScenario gate shows instructive prompt when loaded file === snapshot.
  const isFirstEverEmpty = snapshotLoaded && !savedSnapshot && !internalPriorRows && !externalPriorRows;
  const isSnapshotMode = !!savedSnapshot && !internalPriorRows && !externalPriorRows;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-6 py-3">
        <span className="text-sm font-semibold text-gray-700">Changes since last week</span>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={onRemapClick}
            className="text-xs font-medium text-blue-600 underline hover:text-blue-800"
            data-testid="changes-remap-columns-btn">
            Remap columns
          </button>
          {copyModel && !model?.sameFileDetected && (
            <ShareControl getSnapshot={getShareSnapshot} onLinkCreated={onShareLinkCreated} />
          )}
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">

        {/* ── STATE A: First-ever empty ── no snapshot, no manual prior */}
        {isFirstEverEmpty && (
          <>
            {/* Current file dropzone when no file loaded in Weekly Status */}
            {!hasCurrentFile && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-600">Current export (this week)</p>
                <div
                  className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  onClick={() => document.getElementById("changes-current-input")?.click()}
                >
                  <input id="changes-current-input" type="file" accept=".csv,text/csv" className="sr-only"
                    aria-label="Upload current CSV file"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onLoadCurrentFile(f); }}
                  />
                  <p className="text-sm font-medium text-gray-600">Drop your current CSV here</p>
                  <p className="mt-1 text-xs text-gray-400">or click to browse</p>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-gray-100 bg-gray-50 px-6 py-8 text-center"
              data-testid="first-ever-empty-state">
              <p className="text-base font-semibold text-gray-800">Nothing to compare yet.</p>
              <p className="mt-1 text-sm text-gray-500">
                Save this week as your baseline — next week, just drop your new export here and we&apos;ll show what changed.
              </p>
              {effectiveHasCurrentFile && (
                <button type="button" onClick={handleFirstBaselineSave}
                  data-testid="save-first-baseline-btn"
                  className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Save this week as your first baseline
                </button>
              )}
              <div className="mt-3">
                <button type="button" onClick={onLoadSampleChanges}
                  data-testid="changes-load-sample"
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Load sample data (demo)
                </button>
              </div>
              {/* Collapsible optional manual prior (baseline override, not current) */}
              <div className="mt-4 text-left">
                <button type="button" onClick={() => setManualOverrideOpen((o) => !o)}
                  className="text-xs text-blue-600 underline hover:text-blue-800" aria-expanded={manualOverrideOpen}>
                  {manualOverrideOpen ? "▾" : "▸"} Compare to a prior export directly (no baseline saved yet)
                </button>
                {manualOverrideOpen && (
                  <div className="mt-3">
                    <PriorDropzone onFile={handlePriorFile} />
                    {priorError && <p role="alert" className="mt-2 text-sm text-red-600">{priorError}</p>}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── STATE B: Snapshot mode ── show baseline strip + next-week drop target ── */}
        {isSnapshotMode && (
          <>
            <BaselineStrip
              snapshot={savedSnapshot!}
              onClear={handleClearSnapshot}
              onPromote={handlePromote}
              showPromote={!!model && !model.sameFileDetected}
              promoteState={promoteState}
            />

            {/* D1 fix: primary next-week drop target — only shown when no next-week file dropped yet */}
            {!changesNextRows && (
              <>
                <NextWeekDropzone
                  onFile={handleNextWeekFile}
                  testId="changes-tab-next-week-dropzone"
                />
                {nextFileError && <p role="alert" className="mt-2 text-sm text-red-600">{nextFileError}</p>}

                {/* D1 fix: self-diff instructive prompt — shown when loaded file === saved snapshot */}
                {isSelfDiffScenario && (
                  <div
                    role="status"
                    data-testid="self-diff-instructive-prompt"
                    className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"
                  >
                    This is the week you saved as the baseline. Drop next week&apos;s export above to see what changed.
                  </div>
                )}

                {/* When no current file loaded and no self-diff, show load sample */}
                {!hasCurrentFile && !isSelfDiffScenario && (
                  <div className="flex items-center justify-center py-2">
                    <button type="button" onClick={onLoadSampleChanges}
                      data-testid="changes-load-sample"
                      className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      Load sample data
                    </button>
                  </div>
                )}
              </>
            )}

            {/* When next-week file is loaded on Changes tab, show it as current indicator */}
            {changesNextRows && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800"
                data-testid="next-week-loaded-indicator">
                Comparing: {changesNextRows.length} rows (next week) vs saved baseline
                <button
                  className="ml-3 text-xs text-green-700 underline hover:text-green-900"
                  onClick={() => { setChangesNextRows(null); setNextFileError(null); setRowEdits(new Map()); setEditedProse(null); }}
                  aria-label="Clear next week file"
                >
                  Clear
                </button>
              </div>
            )}

            {/* D2 fix: optional baseline override (demoted, labelled as baseline/prior side) */}
            <div>
              <button type="button" onClick={() => setManualOverrideOpen((o) => !o)}
                className="text-xs text-gray-500 underline hover:text-gray-700" aria-expanded={manualOverrideOpen}>
                {manualOverrideOpen ? "▾" : "▸"} Use a different baseline instead (optional)
              </button>
              {manualOverrideOpen && (
                <div className="mt-3">
                  <PriorDropzone onFile={handlePriorFile} />
                  {priorError && <p role="alert" className="mt-2 text-sm text-red-600">{priorError}</p>}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── STATE C: Manual / sample prior — no snapshot (or snapshot cleared) */}
        {!isFirstEverEmpty && !isSnapshotMode && (
          <>
            {/* Current file dropzone when no file loaded */}
            {!hasCurrentFile && !changesNextRows && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-600">Current export (this week)</p>
                <div
                  className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  onClick={() => document.getElementById("changes-current-input-c")?.click()}
                >
                  <input id="changes-current-input-c" type="file" accept=".csv,text/csv" className="sr-only"
                    aria-label="Upload current CSV file"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onLoadCurrentFile(f); }}
                  />
                  <p className="text-sm font-medium text-gray-600">Drop your current CSV here</p>
                  <p className="mt-1 text-xs text-gray-400">or click to browse</p>
                </div>
              </div>
            )}

            {/* D2 fix: manual baseline indicator — includes "never uploaded" trust line */}
            {(priorSourceIsManual || !!externalPriorRows) && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                data-testid="manual-baseline-indicator">
                <p className="text-sm text-gray-700">
                  Comparing against: {priorSourceIsManual ? "the export you dropped as baseline" : "sample prior-week data"}
                </p>
                {priorSourceIsManual && (
                  <p className="mt-0.5 text-xs text-gray-500" data-testid="manual-baseline-device-local-note">
                    Saved on this device — never uploaded
                  </p>
                )}
              </div>
            )}

            {/* Prior dropzone — shown when no snapshot; always accessible to load/override prior */}
            {!internalPriorRows && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-600">
                  Last week&apos;s export (baseline)
                </p>
                <PriorDropzone onFile={handlePriorFile} />
                {priorError && <p role="alert" className="mt-2 text-sm text-red-600">{priorError}</p>}
              </div>
            )}

            {/* Show Load sample when no prior loaded yet */}
            {!priorRows && (
              <div className="flex items-center justify-center py-2">
                <button type="button" onClick={onLoadSampleChanges}
                  data-testid="changes-load-sample"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Load sample data
                </button>
              </div>
            )}

            {/* Empty explanation when no prior loaded yet */}
            {!priorRows && (
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-6 py-8 text-center">
                <p className="text-base font-semibold text-gray-700">See what changed since your last export.</p>
                <p className="mt-1 text-sm text-gray-500">
                  Drop last week&apos;s CSV above — we&apos;ll show what shipped, what&apos;s newly blocked, and what slipped.
                </p>
              </div>
            )}
          </>
        )}

        {/* ── Edge-case warnings ── */}
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

        {/* ── Changes digest (all paths that have a model) ── */}
        {model && !model.sameFileDetected && (
          <>
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
              <EditableProse value={prose} onChange={(v) => setEditedProse(v)} />
            </div>

            <BucketSection label="Newly Shipped" rows={model.newlyShipped} accentClass="bg-green-500" headerColorClass="text-green-700" onEdit={handleRowEdit} />
            <BucketSection label="Newly Blocked" rows={model.newlyBlocked} accentClass="bg-red-500" headerColorClass="text-red-700" onEdit={handleRowEdit} />
            <BucketSection label="Slipped" rows={model.slipped} accentClass="bg-amber-500" headerColorClass="text-amber-700" onEdit={handleRowEdit} />
            <BucketSection label="Reopened" rows={model.reopened} accentClass="bg-orange-500" headerColorClass="text-orange-700" onEdit={handleRowEdit} />
            <BucketSection label="New this period" rows={model.newThisPeriod} accentClass="bg-blue-400" headerColorClass="text-blue-700" onEdit={handleRowEdit} />
            <BucketSection label="Unblocked" rows={model.unblocked} accentClass="bg-teal-400" headerColorClass="text-teal-700" onEdit={handleRowEdit} />
            <BucketSection label="Newly Started" rows={model.newlyStarted} accentClass="bg-indigo-400" headerColorClass="text-indigo-700" onEdit={handleRowEdit} />

            <div className="border-t border-gray-100 pt-4">
              <CollapsibleBucket label="Carried over / unchanged-open" rows={model.carriedOver} accentClass="bg-gray-400" headerColorClass="text-gray-500" onEdit={handleRowEdit} />
              <CollapsibleBucket label="Still Blocked" rows={model.stillBlocked} accentClass="bg-red-300" headerColorClass="text-red-600" onEdit={handleRowEdit} />
            </div>

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
                        {cr.row.assignee && <span className="ml-1 text-xs text-gray-400">({cr.row.assignee})</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>

      {/* Static copy bar footer */}
      {copyModel && !model?.sameFileDetected && (
        <ChangesCopyButtons
          mdState={mdCopyState}
          ptState={ptCopyState}
          onCopyMd={handleCopyMd}
          onCopyPt={handleCopyPt}
        />
      )}
    </div>
  );
}
