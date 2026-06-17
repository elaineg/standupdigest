"use client";

/**
 * ShareControl — opt-in "Create shareable link" button + privacy disclosure + copy-link flow.
 *
 * Design rules (UX_BRIEF §9, APP_SPEC SHARE CONTRACT):
 *  - First-class control, NOT confused with Copy buttons (label uses "Share"/"link")
 *  - First click reveals privacy disclosure; user must confirm before any POST
 *  - After confirm: POST snapshot to /api/digest-share, show URL + Copy link button
 *  - Copy link: persistent button flips IN PLACE to solid-green "Link copied ✓" with aria-live
 *  - Fallback hidden-textarea if clipboard blocked
 *  - Reports `onLinkCreated` so parent can make privacy claim mode-aware
 */

import { useState, useCallback, useRef, useEffect } from "react";
import type { DigestSnapshot } from "@/lib/shareDb";

export interface ShareControlProps {
  /** Called with snapshot data to serialize — MUST return the current formatted digest */
  getSnapshot: () => DigestSnapshot;
  /** Called once the share URL is minted so the parent can update privacy claims */
  onLinkCreated?: () => void;
}

type ShareState =
  | { phase: "idle" }
  | { phase: "disclosing" }
  | { phase: "posting" }
  | { phase: "error"; message: string }
  | { phase: "done"; url: string };

export function ShareControl({ getSnapshot, onLinkCreated }: ShareControlProps) {
  const [state, setState] = useState<ShareState>({ phase: "idle" });
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const hiddenTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset to idle if we need a fresh attempt
  const handleOpenDisclosure = useCallback(() => {
    setState({ phase: "disclosing" });
  }, []);

  const handleCancel = useCallback(() => {
    setState({ phase: "idle" });
  }, []);

  const handleConfirm = useCallback(async () => {
    setState({ phase: "posting" });
    try {
      const snapshot = getSnapshot();
      const res = await fetch("/api/digest-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `HTTP ${res.status}`);
      }
      const { id } = await res.json();
      // Build absolute URL using window.location (client-only — inside async after user action)
      const base = window.location.origin;
      const url = `${base}/s/${id}`;
      setState({ phase: "done", url });
      onLinkCreated?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create link";
      setState({ phase: "error", message: msg });
    }
  }, [getSnapshot, onLinkCreated]);

  const handleCopyLink = useCallback(async () => {
    if (state.phase !== "done") return;
    const url = state.url;
    // Optimistic flip first
    setCopyState("copied");
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback: hidden textarea
      const ta = hiddenTextareaRef.current;
      if (ta) {
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        ta.style.left = "-9999px";
        ta.style.opacity = "0";
        ta.focus();
        ta.select();
        document.execCommand("copy");
      }
    }
    setTimeout(() => setCopyState("idle"), 2000);
  }, [state]);

  // When error, allow retry
  const handleRetry = useCallback(() => {
    setState({ phase: "idle" });
  }, []);

  if (state.phase === "idle") {
    return (
      // B-fix: elevated to primary button — visually distinct from both copy buttons and Remap link.
      // Blue filled pill with link-glyph so it reads as THE headline share action, not a peer of Remap.
      <button
        type="button"
        data-testid="share-create-link-btn"
        onClick={handleOpenDisclosure}
        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
        aria-label="Create shareable link"
      >
        <svg
          className="h-3.5 w-3.5 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        Share link
      </button>
    );
  }

  if (state.phase === "disclosing") {
    return (
      <div
        className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm"
        data-testid="share-disclosure-panel"
        role="dialog"
        aria-label="Share link privacy disclosure"
      >
        <p className="font-semibold text-gray-800 mb-2">What gets uploaded?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-1">
              Uploaded
            </p>
            <p className="text-xs text-gray-700">
              Only the formatted digest you see here — the summary line and the
              categorized issue titles, assignees, and epics.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Stays on your device — never uploaded
            </p>
            <p className="text-xs text-gray-700">
              Your raw CSV, any Backlog/Todo and unmapped rows, and your column
              mappings.
            </p>
          </div>
        </div>
        <p className="text-xs text-amber-700 mb-3">
          Anyone with the link can view this digest. Don&apos;t create one for
          confidential data.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            data-testid="share-confirm-btn"
            onClick={handleConfirm}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Create link
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "posting") {
    return (
      <div
        className="flex items-center gap-2 text-sm text-gray-500"
        role="status"
        aria-live="polite"
        data-testid="share-posting-indicator"
      >
        <svg
          className="h-4 w-4 animate-spin text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 12 0 12 0v4a8 8 0 00-8 8H4z"
          />
        </svg>
        Creating link…
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div
        role="alert"
        className="flex items-center gap-2 flex-wrap text-sm"
        data-testid="share-error"
      >
        <span className="text-red-600">
          Could not create link: {state.message}
        </span>
        <button
          type="button"
          onClick={handleRetry}
          className="text-blue-600 underline hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    );
  }

  // phase === "done"
  return (
    <div
      className="flex flex-col gap-2"
      data-testid="share-link-panel"
    >
      <p className="text-xs text-gray-500">
        Your CSV stays in your browser. You&apos;ve shared a read-only copy of
        this digest via link.
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Selectable URL field */}
        <input
          readOnly
          value={state.url}
          data-testid="share-url-field"
          aria-label="Share link URL"
          className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-text select-all"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        {/* Persistent Copy link button — never unmounts so cue stays visible */}
        <button
          type="button"
          data-testid="share-copy-link-btn"
          aria-label="Copy link"
          onClick={handleCopyLink}
          className={`shrink-0 rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
            copyState === "copied"
              ? "bg-green-600 text-white"
              : "bg-gray-900 text-white hover:bg-gray-700"
          }`}
        >
          <span aria-live="polite" aria-atomic="true">
            {copyState === "copied" ? "Link copied ✓" : "Copy link"}
          </span>
        </button>
      </div>
      {/* Hidden textarea for clipboard fallback */}
      <textarea
        ref={hiddenTextareaRef}
        readOnly
        aria-hidden="true"
        tabIndex={-1}
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

/**
 * Hook for the "has link been created" state — used to make the privacy claim mode-aware.
 * Returns [hasLink, markLinkCreated].
 */
export function useShareLinkState(): [boolean, () => void] {
  const [hasLink, setHasLink] = useState(false);
  const markLinkCreated = useCallback(() => setHasLink(true), []);
  return [hasLink, markLinkCreated];
}
