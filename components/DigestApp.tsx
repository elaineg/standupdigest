"use client";

import { useState, useCallback, useRef, useEffect, DragEvent } from "react";
import {
  parseCSVText,
  type DigestRow,
  type ColumnMap,
  type Bucket,
  type GroupMode,
  type ParseResult,
} from "@/lib/csvParser";
import { SAMPLE_CSV, CHANGES_CURRENT_CSV, CHANGES_PRIOR_CSV } from "@/lib/sampleData";
import {
  DigestView,
  computeWeekOptions,
  type WeekOption,
} from "@/components/DigestView";
import { SprintReviewView } from "@/components/SprintReviewView";
import { ChangesView } from "@/components/ChangesView";
import { RemapPanel } from "@/components/RemapPanel";

const LS_MAP_KEY = (source: string) => `standupdigest-colmap-${source}`;
const LS_GROUP_KEY = "standupdigest-groupmode";
const LS_MODE_KEY = "standupdigest-mode";

type AppMode = "weekly" | "sprint" | "changes";

function loadSavedMap(source: string): Partial<ColumnMap> | null {
  try {
    const raw = window.localStorage.getItem(LS_MAP_KEY(source));
    if (!raw) return null;
    return JSON.parse(raw) as Partial<ColumnMap>;
  } catch {
    return null;
  }
}

function saveMap(source: string, map: ColumnMap) {
  try {
    window.localStorage.setItem(LS_MAP_KEY(source), JSON.stringify(map));
  } catch {
    // ignore
  }
}

// Fix 1: determine if any core column failed to auto-detect
function coreColumnsMissing(columnMap: ColumnMap): boolean {
  return !columnMap.title || !columnMap.status || !columnMap.assignee;
}

export default function DigestApp() {
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [rows, setRows] = useState<DigestRow[]>([]);
  const [groupMode, setGroupMode] = useState<GroupMode>("assignee");
  const [showRemap, setShowRemap] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rawCSV, setRawCSV] = useState<string>("");
  // Fix 4: week filter state
  const [weekFilter, setWeekFilter] = useState<string>("all");
  const [availableWeeks, setAvailableWeeks] = useState<WeekOption[]>([]);
  // Tab mode: "weekly" (default) | "sprint" | "changes"
  const [mode, setMode] = useState<AppMode>("weekly");
  // Changes tab: prior-period rows (set by "Load sample data" on the Changes tab)
  const [changesPriorRows, setChangesPriorRows] = useState<DigestRow[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore groupMode from localStorage after mount (SSR-safe: never read window in render/lazy-init)
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LS_GROUP_KEY);
      if (saved === "assignee" || saved === "epic") {
        setGroupMode(saved);
      }
    } catch {
      // ignore (private browsing / storage disabled)
    }
  }, []);

  // Restore mode from localStorage after mount (defaults to "weekly" if unset)
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LS_MODE_KEY);
      if (saved === "weekly" || saved === "sprint" || saved === "changes") {
        setMode(saved as AppMode);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist groupMode whenever it changes (after mount)
  useEffect(() => {
    try {
      window.localStorage.setItem(LS_GROUP_KEY, groupMode);
    } catch {
      // ignore
    }
  }, [groupMode]);

  // Persist mode whenever it changes
  useEffect(() => {
    try {
      window.localStorage.setItem(LS_MODE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode]);

  // Fix 1: whether any core column is missing (drives amber banner + suppressSuccess)
  const hasCoreMissing = parseResult
    ? coreColumnsMissing(parseResult.columnMap)
    : false;

  // Fix 1: open remap whenever low-confidence OR any core column missing
  const shouldAutoOpenRemap = useCallback(
    (result: ParseResult, overrideUsed: boolean): boolean => {
      if (overrideUsed) return false; // user already remapped
      return result.confidence === "low" || coreColumnsMissing(result.columnMap);
    },
    []
  );

  const processCSV = useCallback(
    (text: string, overrideMap?: Partial<ColumnMap>) => {
      try {
        const result = parseCSVText(text, overrideMap);
        if (result.rows.length === 0) {
          setErrorMsg("No data rows found in the CSV.");
          return;
        }
        setErrorMsg(null);

        const saved = loadSavedMap(result.source);
        const effectiveOverride = overrideMap ?? saved ?? undefined;

        const finalResult = effectiveOverride
          ? parseCSVText(text, effectiveOverride)
          : result;

        setParseResult(finalResult);
        setRows(finalResult.rows);

        // Fix 4: compute available weeks and default to most recent
        const weeks = computeWeekOptions(finalResult.rows);
        setAvailableWeeks(weeks);
        // Default to most recent week (first option, if it's not "all")
        const defaultWeek = weeks.length > 1 ? weeks[0].key : "all";
        setWeekFilter(defaultWeek);

        // Fix 1: auto-open remap on missing core column OR low confidence
        setShowRemap(shouldAutoOpenRemap(finalResult, !!effectiveOverride));
      } catch (e) {
        setErrorMsg("Failed to parse CSV. Please check the file format.");
        console.error(e);
      }
    },
    [shouldAutoOpenRemap]
  );

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setRawCSV(text);
        processCSV(text);
      };
      reader.readAsText(file);
    },
    [processCSV]
  );

  const handleLoadSample = useCallback(() => {
    setRawCSV(SAMPLE_CSV);
    processCSV(SAMPLE_CSV);
  }, [processCSV]);

  // Changes tab: load BOTH the current Changes sample AND the prior-week sample at once
  const handleLoadSampleChanges = useCallback(() => {
    // Load the current sample (the Changes-specific current export with Issue Keys)
    setRawCSV(CHANGES_CURRENT_CSV);
    processCSV(CHANGES_CURRENT_CSV);
    // Parse and set the prior rows for the Changes tab
    const priorResult = parseCSVText(CHANGES_PRIOR_CSV);
    setChangesPriorRows(priorResult.rows);
  }, [processCSV]);

  const handleClear = useCallback(() => {
    setParseResult(null);
    setRows([]);
    setRawCSV("");
    setErrorMsg(null);
    setShowRemap(false);
    setWeekFilter("all");
    setAvailableWeeks([]);
    setChangesPriorRows(null);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleRemap = useCallback(
    (newMap: ColumnMap) => {
      if (!parseResult) return;
      saveMap(parseResult.source, newMap);
      const reParsed = parseCSVText(rawCSV, newMap);
      setParseResult({ ...reParsed, columnMap: newMap, confidence: "high" });
      setRows(reParsed.rows);
      // Recompute weeks after remap (date column may have changed)
      const weeks = computeWeekOptions(reParsed.rows);
      setAvailableWeeks(weeks);
      const defaultWeek = weeks.length > 1 ? weeks[0].key : "all";
      setWeekFilter(defaultWeek);
      setShowRemap(false);
    },
    [parseResult, rawCSV]
  );

  const handleRowBucketChange = useCallback(
    (rowId: string, newBucket: Bucket) => {
      setRows((prev) =>
        prev.map((r) => (r.id === rowId ? { ...r, bucket: newBucket } : r))
      );
    },
    []
  );

  const handleRowTitleEdit = useCallback(
    (rowId: string, newTitle: string) => {
      setRows((prev) =>
        prev.map((r) =>
          r.id === rowId ? { ...r, editedTitle: newTitle } : r
        )
      );
    },
    []
  );

  const hasDigest = rows.length > 0;

  // Fix 1: show amber banner when any core column missing OR low confidence
  const showAmberBanner =
    hasDigest &&
    parseResult &&
    (parseResult.confidence === "low" || hasCoreMissing) &&
    !showRemap;

  // Detect Sprint Review column availability
  const hasSprintColumn = parseResult ? !!parseResult.columnMap.sprint : false;
  const hasAddedColumn = parseResult ? !!parseResult.columnMap.added : false;

  // Subtitle text varies by active tab (cold state)
  const coldSubtitle =
    mode === "sprint"
      ? "Drop the same CSV — get velocity, scope change, spillover, and points by assignee for a sprint."
      : mode === "changes"
      ? "Drop your current CSV and last week's export — see what shipped, what got blocked, and what slipped."
      : "Drop a Jira, Linear, Asana, or GitHub CSV. Get a Shipped / In Progress / Blocked digest ready to paste into Slack.";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <span className="text-lg font-semibold text-gray-900">
            StandupDigest
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Tab strip — visible in both cold and populated states, above the dropzone/digest */}
        <div className="mb-6 flex rounded-lg border border-gray-200 bg-white p-1 gap-1 w-fit" role="tablist" aria-label="Mode">
          <button
            role="tab"
            aria-selected={mode === "weekly"}
            data-testid="tab-weekly"
            onClick={() => setMode("weekly")}
            className={`rounded px-4 py-2 text-sm font-semibold transition-colors ${
              mode === "weekly"
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Weekly Status
          </button>
          <button
            role="tab"
            aria-selected={mode === "sprint"}
            data-testid="tab-sprint"
            onClick={() => setMode("sprint")}
            className={`rounded px-4 py-2 text-sm font-semibold transition-colors ${
              mode === "sprint"
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sprint Review
          </button>
          <button
            role="tab"
            aria-selected={mode === "changes"}
            data-testid="tab-changes"
            onClick={() => setMode("changes")}
            className={`rounded px-4 py-2 text-sm font-semibold transition-colors ${
              mode === "changes"
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Changes
          </button>
        </div>

        {/* Cold state hero — hidden on Changes tab (it has its own UI) */}
        {!hasDigest && mode !== "changes" && (
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Turn your tracker export into a weekly status — in seconds.
            </h1>
            <p className="mt-3 text-lg text-gray-500">
              {coldSubtitle}
            </p>
          </div>
        )}

        {/* Dropzone — hidden on Changes tab (ChangesView has its own dropzones) */}
        {!hasDigest && mode !== "changes" && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed px-8 py-12 text-center transition-colors ${
              isDragging
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={handleFileInput}
              aria-label="Upload CSV file"
            />
            <div className="flex flex-col items-center gap-4">
              <svg
                className="h-10 w-10 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div>
                <p className="text-base font-medium text-gray-700">
                  Drop your CSV here, or{" "}
                  <span className="text-blue-600">browse to select</span>
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Jira · Linear · Asana · GitHub Issues
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadSample();
                }}
                className="mt-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Load sample data
              </button>
              <p className="text-center text-sm text-gray-400">
                Your file never leaves your browser — no upload, no signup.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div
            role="alert"
            className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorMsg}
          </div>
        )}

        {/* Changes tab — always rendered (handles its own cold/populated state) */}
        {mode === "changes" && (
          <ChangesView
            currentRows={rows}
            hasCurrentFile={hasDigest}
            onLoadCurrentFile={handleFile}
            externalPriorRows={changesPriorRows}
            onRemapClick={() => setShowRemap(true)}
            onLoadSampleChanges={handleLoadSampleChanges}
          />
        )}

        {/* Remap panel (used by all tabs) */}
        {showRemap && parseResult && (
          <RemapPanel
            headers={parseResult.headers}
            currentMap={parseResult.columnMap}
            onApply={handleRemap}
            onClose={() => setShowRemap(false)}
            lowConfidence={
              parseResult.confidence === "low" || hasCoreMissing
            }
          />
        )}

        {/* Populated view — Weekly Status and Sprint Review tabs only */}
        {hasDigest && parseResult && mode !== "changes" && (
          <div>
            {/* Top bar with file controls + group-by (only on weekly tab) */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClear}
                  className="text-sm text-gray-500 underline hover:text-gray-700"
                >
                  Clear
                </button>
                <label className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                  Load different file
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="sr-only"
                    onChange={handleFileInput}
                  />
                </label>
                <button
                  onClick={handleLoadSample}
                  className="text-sm text-gray-500 underline hover:text-gray-700"
                >
                  Load sample data
                </button>
              </div>

              {/* Group-by toggle: only visible on Weekly Status tab */}
              {mode === "weekly" && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Group by:</span>
                  <button
                    onClick={() => setGroupMode("assignee")}
                    className={`rounded px-2 py-1 font-medium ${
                      groupMode === "assignee"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    aria-pressed={groupMode === "assignee"}
                  >
                    Assignee
                  </button>
                  <span>&#9658;</span>
                  <button
                    onClick={() => setGroupMode("epic")}
                    className={`rounded px-2 py-1 font-medium ${
                      groupMode === "epic"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    aria-pressed={groupMode === "epic"}
                  >
                    Epic
                  </button>
                </div>
              )}
            </div>

            {/* Fix 1: amber banner when any core column missing OR low confidence */}
            {showAmberBanner && (
              <div
                role="status"
                className="mb-4 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
              >
                <span>
                  We weren&apos;t sure which columns are which.
                </span>
                <button
                  onClick={() => setShowRemap(true)}
                  className="ml-4 font-semibold underline hover:text-amber-900"
                >
                  Remap columns
                </button>
              </div>
            )}

            {/* Tab body */}
            {mode === "weekly" ? (
              <DigestView
                rows={rows}
                groupMode={groupMode}
                weekFilter={weekFilter}
                availableWeeks={availableWeeks}
                onWeekFilterChange={setWeekFilter}
                onBucketChange={handleRowBucketChange}
                onTitleEdit={handleRowTitleEdit}
                onRemapClick={() => setShowRemap(true)}
                suppressSuccess={hasCoreMissing}
              />
            ) : (
              <SprintReviewView
                rows={rows}
                hasSprintColumn={hasSprintColumn}
                hasAddedColumn={hasAddedColumn}
                onRemapClick={() => setShowRemap(true)}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
