/**
 * POST /api/digest-share
 * Body: DigestSnapshot JSON — creates a share link.
 * Returns { id: string } for the share URL /s/<id>.
 *
 * GET /api/digest-share?id=<id>
 * Returns { snapshot: DigestSnapshot }
 *
 * runtime = "nodejs" — libsql is NOT edge-compatible.
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { saveSnapshot, getSnapshot, type DigestSnapshot } from "../../../lib/shareDb";

function isValidSnapshot(raw: unknown): raw is DigestSnapshot {
  if (!raw || typeof raw !== "object") return false;
  const s = raw as Record<string, unknown>;
  return (
    typeof s.viewType === "string" &&
    typeof s.prose === "string" &&
    Array.isArray(s.sections)
  );
}

function sanitizeSnapshot(raw: DigestSnapshot): DigestSnapshot {
  return {
    viewType: (raw.viewType ?? "weekly").slice(0, 20),
    prose: (raw.prose ?? "").slice(0, 2000),
    sections: (raw.sections ?? []).slice(0, 50).map((sec) => ({
      label: (sec.label ?? "").slice(0, 100),
      items: (sec.items ?? []).slice(0, 200).map((item) => String(item).slice(0, 500)),
    })),
    metaLabel: raw.metaLabel ? String(raw.metaLabel).slice(0, 200) : undefined,
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : Date.now(),
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isValidSnapshot(body)) {
    return NextResponse.json({ error: "invalid_snapshot" }, { status: 400 });
  }

  try {
    const id = await saveSnapshot(sanitizeSnapshot(body));
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error("digest-share POST error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || id.length > 40) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    const snapshot = await getSnapshot(id);
    if (!snapshot) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ snapshot });
  } catch (err) {
    console.error("digest-share GET error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
