"use client";

import { useState } from "react";
import type { ColumnMap } from "@/lib/csvParser";

interface RemapPanelProps {
  headers: string[];
  currentMap: ColumnMap;
  onApply: (map: ColumnMap) => void;
  onClose: () => void;
  lowConfidence?: boolean;
}

const CORE_FIELDS: { key: keyof ColumnMap; label: string }[] = [
  { key: "title", label: "Title / Summary" },
  { key: "status", label: "Status" },
  { key: "assignee", label: "Assignee" },
  { key: "epic", label: "Epic / Group" },
  { key: "date", label: "Updated / Resolved Date" },
];

const SPRINT_FIELDS: { key: keyof ColumnMap; label: string }[] = [
  { key: "storyPoints", label: "Story Points / Estimate" },
  { key: "sprint", label: "Sprint / Cycle" },
  { key: "added", label: "Added-date (scope change)" },
  { key: "removed", label: "Removed-date (scope change)" },
];

function FieldSelect({
  field,
  headers,
  value,
  onChange,
}: {
  field: { key: keyof ColumnMap; label: string };
  headers: string[];
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={`remap-${field.key}`}
        className="mb-1 block text-xs font-medium text-amber-800"
      >
        {field.label}
      </label>
      <select
        id={`remap-${field.key}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-amber-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
      >
        <option value="">(none)</option>
        {headers.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
    </div>
  );
}

export function RemapPanel({
  headers,
  currentMap,
  onApply,
  onClose,
  lowConfidence,
}: RemapPanelProps) {
  const [draft, setDraft] = useState<ColumnMap>({ ...currentMap });
  const [saved, setSaved] = useState(false);

  const handleApply = () => {
    onApply(draft);
    setSaved(true);
    // Close after brief confirmation
    setTimeout(() => setSaved(false), 2000);
  };

  const setField = (key: keyof ColumnMap, val: string) =>
    setDraft((prev) => ({ ...prev, [key]: val }));

  return (
    <div
      role="region"
      aria-label="Remap columns"
      className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-amber-900">
          Map your columns
        </h3>
        <button
          onClick={onClose}
          aria-label="Close remap panel"
          className="text-amber-600 hover:text-amber-900 text-lg leading-none"
        >
          ×
        </button>
      </div>
      {lowConfidence && (
        <p className="mb-3 text-xs text-amber-800">
          We couldn&apos;t auto-detect which columns are which — pick them below so your digest is accurate.
        </p>
      )}

      {/* Core fields */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CORE_FIELDS.map((field) => (
          <FieldSelect
            key={field.key}
            field={field}
            headers={headers}
            value={draft[field.key]}
            onChange={(v) => setField(field.key, v)}
          />
        ))}
      </div>

      {/* Sprint Review fields */}
      <div className="mt-4 border-t border-amber-200 pt-3">
        <p className="mb-2 text-xs font-semibold text-amber-700 uppercase tracking-wide">
          Sprint Review columns (optional)
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SPRINT_FIELDS.map((field) => (
            <FieldSelect
              key={field.key}
              field={field}
              headers={headers}
              value={draft[field.key]}
              onChange={(v) => setField(field.key, v)}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={handleApply}
          className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          Apply mapping
        </button>
        <button
          onClick={onClose}
          className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm text-amber-800 hover:bg-amber-100"
        >
          Cancel
        </button>
        {/* C(i): persistence confirmation — surfaces the saved-on-device promise */}
        {saved && (
          <p role="status" className="text-xs text-green-700 font-medium">
            Saved on this device — next week just drop your new export.
          </p>
        )}
      </div>
      {/* C(i): always-visible persistence note (not just after apply) */}
      {!lowConfidence && (
        <p className="mt-2 text-xs text-gray-500">
          Your column mapping is saved on this device per tracker — next week just drop your new export.
        </p>
      )}
    </div>
  );
}
