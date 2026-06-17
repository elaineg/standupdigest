/**
 * /s/[id] — read-only shared digest view.
 * Renders the stored formatted snapshot: prose + bucketed sections.
 * No dropzone, no editing, no copy buttons, no create-link button.
 * Mobile-glanceable: single column, no horizontal scroll at 375px.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/Link";
import type { DigestSnapshot } from "@/lib/shareDb";

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchSnapshot(id: string): Promise<DigestSnapshot | null> {
  try {
    // We call the DB directly (server component — same process)
    const { getSnapshot } = await import("@/lib/shareDb");
    return await getSnapshot(id);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const snapshot = await fetchSnapshot(id);
  if (!snapshot) {
    return { title: "Shared Digest — StandupDigest" };
  }
  return {
    title: `${snapshot.viewType === "sprint" ? "Sprint Review" : snapshot.viewType === "changes" ? "Changes" : "Weekly Status"} — StandupDigest`,
    description: snapshot.prose.slice(0, 200),
  };
}

export default async function SharedDigestPage({ params }: Props) {
  const { id } = await params;
  const snapshot = await fetchSnapshot(id);

  if (!snapshot) {
    notFound();
  }

  const viewLabel =
    snapshot.viewType === "sprint"
      ? "Sprint Review"
      : snapshot.viewType === "changes"
      ? "Changes"
      : "Weekly Status";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <span className="text-lg font-semibold text-gray-900">
            StandupDigest
          </span>
          <span className="ml-3 text-sm text-gray-400">{viewLabel}</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 pb-16">
        {/* Read-only notice */}
        <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-2.5 flex items-center gap-2">
          <svg
            className="h-4 w-4 shrink-0 text-gray-400"
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span className="text-sm text-gray-500">
            Read-only shared digest
            {snapshot.metaLabel ? ` · ${snapshot.metaLabel}` : ""}
          </span>
        </div>

        {/* Digest card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Prose summary */}
          <div className="border-b border-gray-100 px-6 py-4">
            <p className="text-base text-gray-700">{snapshot.prose}</p>
          </div>

          {/* Sections */}
          <div className="px-6 py-5 space-y-6">
            {snapshot.sections.map((section, sIdx) => {
              if (section.items.length === 0) return null;

              // Color-code section headers by keyword
              const label = section.label.toLowerCase();
              let headerClass = "text-gray-600";
              if (
                label.includes("shipped") ||
                label.includes("velocity") ||
                label.includes("unblocked")
              ) {
                headerClass = "text-green-700";
              } else if (
                label.includes("blocked") ||
                label.includes("slipped") ||
                label.includes("reopened") ||
                label.includes("spillover")
              ) {
                headerClass = "text-red-700";
              } else if (
                label.includes("progress") ||
                label.includes("started") ||
                label.includes("new this")
              ) {
                headerClass = "text-blue-700";
              } else if (label.includes("scope") || label.includes("carried")) {
                headerClass = "text-amber-700";
              }

              return (
                <section key={sIdx} aria-label={section.label}>
                  <h2
                    className={`mb-2 text-sm font-bold uppercase tracking-wide ${headerClass}`}
                  >
                    {section.label} ({section.items.length})
                  </h2>
                  <ul className="space-y-1.5 pl-1">
                    {section.items.map((item, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
                        <span className="text-sm text-gray-800 break-words min-w-0">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-gray-500">
            Made free with{" "}
            <Link
              href="/"
              className="text-blue-600 hover:underline font-medium"
            >
              StandupDigest
            </Link>{" "}
            — no signup
          </p>
          <Link
            href="/"
            className="text-sm rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
          >
            Create your own digest
          </Link>
        </div>
      </footer>
    </main>
  );
}
