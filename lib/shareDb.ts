/**
 * Lazily-instantiated libsql/Turso client for StandupDigest share links.
 *
 * - Does NOT connect at import/module-evaluation time — safe for next build
 *   even without env vars present.
 * - The digest MUST fully work with NO network/DB — Turso is touched ONLY
 *   when creating or opening a share link.
 *
 * Env vars:
 *   TURSO_DATABASE_URL  — e.g. libsql://<db>.turso.io  (prod: set by deployer)
 *   TURSO_AUTH_TOKEN    — Turso auth token              (prod only)
 *
 * LOCAL DEV FALLBACK: if TURSO_DATABASE_URL is not set, falls back to
 *   file:./local-shares.db (a SQLite file in the app root, no token needed).
 */

import { createClient, type Client } from "@libsql/client";

/** A serialized snapshot of the formatted digest as shown on screen. */
export interface DigestSnapshot {
  /** "weekly" | "sprint" | "changes" */
  viewType: string;
  /** The prose summary line (possibly user-edited) */
  prose: string;
  /** Serialized sections — each with a label and array of item strings */
  sections: Array<{
    label: string;
    items: string[];
  }>;
  /** Optional meta line, e.g. "Week of Mon 9 Jun – Sun 15 Jun" or "Sprint 24" */
  metaLabel?: string;
  /** Timestamp snapshot was created (ms since epoch) */
  createdAt: number;
}

let _client: Client | null = null;
let _initialized = false;

function getClient(): Client {
  if (!_client) {
    const url = process.env.TURSO_DATABASE_URL ?? "file:./local-shares.db";
    const authToken = process.env.TURSO_AUTH_TOKEN;
    _client = createClient({ url, authToken });
  }
  return _client;
}

export async function getDb(): Promise<Client> {
  const client = getClient();
  if (!_initialized) {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS digest_shares (
        id TEXT PRIMARY KEY,
        snapshot TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
    _initialized = true;
  }
  return client;
}

export function generateShareId(): string {
  // 24-char URL-safe random id
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 24; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export async function saveSnapshot(snapshot: DigestSnapshot): Promise<string> {
  const db = await getDb();
  const id = generateShareId();
  const now = Date.now();
  await db.execute({
    sql: "INSERT INTO digest_shares (id, snapshot, created_at) VALUES (?, ?, ?)",
    args: [id, JSON.stringify(snapshot), now],
  });
  return id;
}

export async function getSnapshot(id: string): Promise<DigestSnapshot | null> {
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT snapshot FROM digest_shares WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) return null;
  try {
    return JSON.parse(result.rows[0].snapshot as string) as DigestSnapshot;
  } catch {
    return null;
  }
}
