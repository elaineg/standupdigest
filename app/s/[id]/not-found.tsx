/**
 * not-found.tsx for /s/[id]
 *
 * Rendered by Next.js when notFound() is called from page.tsx (bogus / expired share id).
 * Next.js automatically returns HTTP 404 for not-found pages.
 */

import Link from "@/components/Link";

export default function SharedDigestNotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-lg font-semibold text-gray-700 mb-2">
          This link is no longer available.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          The shared digest may have expired or the link is invalid.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Create your own digest
        </Link>
      </div>
    </main>
  );
}
