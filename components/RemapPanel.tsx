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

const FIELDS: { key: keyof ColumnMap; label: string }[] = [
  { key: "title", label: "Title / Summary" },
  { key: "status", label: "Status" },
  { key: "assignee", label: "Assignee" },
  { key: "epic", label: "Epic / Group" },
  { key: "date", label: "Updated / Resolved Date" },
];

export function RemapPanel({
  headers,
  currentMap,
  onApply,
  onClose,
  lowConfidence,
}: RemapPanelProps) {
  const [draft, setDraft] = useState<ColumnMap>({ ...currentMap });

  const handleApply = () => {
    onApply(draft);
  };

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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label
              htmlFor={`remap-${key}`}
              className="mb-1 block text-xs font-medium text-amber-800"
            >
              {label}
            </label>
            <select
              id={`remap-${key}`}
              value={draft[key]}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, [key]: e.target.value }))
              }
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
        ))}
      </div>
      <div className="mt-4 flex gap-3">
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
      </div>
    </div>
  );
}
