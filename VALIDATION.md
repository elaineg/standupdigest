# StandupDigest — Validation (share-link feature add)

**Verdict: SHIP** (one P1 disclosure-accuracy fix recommended before/with ship)

Tested the running production build at http://localhost:3010 over HTTP + Playwright. Did not read app source.

## 5-second test — PASS
Cold landing reads: headline "Turn your tracker export into a weekly status — in seconds.", subtitle naming Jira/Linear/Asana/GitHub + Slack-paste outcome, a dropzone with a "Load sample data" button, and the privacy line "Your file never leaves your browser — no upload, no signup." A PM/EM understands the value in one glance. (probe/desktop.png)

## Item-by-item results

### New share flow — PASS (with one P1)
- Share control discoverable + distinct: labeled "Share link" (contains "link", never "Copy"), sits in digest header next to Remap; distinct from "Copy Markdown"/"Copy plain text". (01-weekly-loaded.png)
- First click shows privacy disclosure BEFORE any network write: "What gets uploaded?" with UPLOADED vs "STAYS ON YOUR DEVICE — NEVER UPLOADED" columns, confidential-data warning, and a "Create link" + "Cancel" confirm step. Network capture confirms ZERO POSTs on the first click (POST fires only on "Create link"). (02-share-disclosure.png)
- After confirm: a single POST to /api/digest-share mints `/s/<id>`. (03-link-created.png)
- "Copy link" flips in place to solid-green "Link copied ✓" (computed bg = lab green); clipboard contains the exact share URL. (04-link-copied.png)
- Shared URL in a FRESH context: renders the SAME digest read-only — same prose + Shipped 5 / In Progress 4 / Blocked 2, carry-over tag preserved. NO dropzone, NO Load-sample, NO Remap, NO edit pencils, NO Share/Copy/selector controls; only a "Create your own digest" CTA. Footer "Made free with StandupDigest — no signup" present. (05-shared-desktop.png)
- 375px mobile: single column, no horizontal scroll (scrollWidth == 375). (06-shared-mobile.png)
- Privacy mode-awareness: with NO link, page shows the unqualified absolute "Your file never leaves your browser — no upload, no signup." After a link exists it correctly becomes "Your CSV stays in your browser. You've shared a read-only copy of this digest via link." — the absolute claim is never shown alongside a live link. PASS (spec check 25).
- Share works from the Changes view too; shared Changes view renders read-only with footer. (09-changes-shared.png)

### Regression — PASS
- Weekly buckets: Shipped 5 / In Progress 4 / Blocked 2 / Backlog 3 / Unmapped 1, assignees + carry-over tag correct.
- "Copy as Markdown" flips green to "Copied ✓"; copied text exactly matches on-screen (all 5 shipped items, carry-over tag, headings).
- Changes tab sample: prose reads EXACTLY "Since last week: 3 shipped, 1 started, 1 newly blocked, 1 unblocked, 1 slipped, 1 reopened, 4 new, 1 still blocked, 2 carried over, 1 removed from tracker." and every bucket count matches the spec oracle (Newly Shipped 3, Started 1, Blocked 1, Unblocked 1, Slipped 1, Reopened 1, New 4, Still Blocked 1, Carried 2, Removed 1). (08-changes.png)

### Break-it — PASS
- Bogus `/s/<id>`: no crash, no stack trace — graceful "This link is no longer available." + CTA. (Returns HTTP 200, not 404 — see P3.) (07-bogus-id.png)
- API abuse: empty body → 400 {"error":"invalid_json"}; non-JSON → 400 invalid_json; {} → 400 invalid_snapshot; wrong-type/oversized (2MB) → 400 invalid_snapshot. All errors are JSON, no stack traces.
- XSS: injected `<script>`/`<img onerror>`/`<b>` via the share payload render as ESCAPED TEXT in the shared view; no dialog fires, no live node. Safe.
- No page/console errors across any flow.

## Findings

### P1
1. **Disclosure says "unmapped rows ... never uploaded" but the shared snapshot DOES include the Unmapped status section — a trust/disclosure mismatch.**
   Repro: Load sample data → Share link. The disclosure panel states STAYS ON YOUR DEVICE → "your raw CSV, any Backlog/Todo and unmapped rows, and your column mappings — never uploaded." Create the link, open it fresh: the shared view shows "UNMAPPED STATUS (1) — Audit accessibility issues (status: "Needs Triage Review")". The captured POST body to /api/digest-share also contains a `{"label":"Unmapped status","items":[...]}` section.
   Observed: unmapped row is uploaded and publicly visible in the share link.
   Expected: per the disclosure, unmapped rows stay local and are NOT uploaded (Backlog/Todo IS correctly excluded — only the unmapped section leaks). Either (a) exclude the Unmapped section from the shared snapshot to honor the disclosure, or (b) amend the disclosure to say unmapped rows ARE included. Spec §25 / SHARE CONTRACT lists "unmapped rows" among what stays local, so option (a) is the spec-true fix. Not P0 because it does not break the core absolute-claim contradiction (that is handled correctly) and the data is the on-screen digest, but a user who read the disclosure would not expect the unmapped item in a public link.

### P3
2. **Bogus /s/<id> returns HTTP 200 instead of 404.** The in-app "This link is no longer available." message is graceful and correct UX, but the HTTP status is 200. The task/spec language says "404 gracefully"; consider returning a 404 status for correctness (crawlers/link-preview). Cosmetic — the user experience is already good.

## What this validation cannot catch
- Taste/aesthetics and whether the share view "looks trustworthy enough" to a real stakeholder.
- Real Turso durability/expiry behavior over days (I only tested same-session reads + a fabricated bogus id).
- Whether share-link IDs are sufficiently unguessable at scale (they look like 24-char random tokens; not enumerated).
- Accessibility nuance beyond the aria-live claim (screen-reader actual announcement, focus order).
- Real-world CSV variety (only the built-in sample + crafted API payloads were exercised).
- Multi-day retention / "would a PM actually paste this into Slack weekly."
