# Standupdigest — Panel SYNTHESIS Round 3 (delta re-test)

URL tested: http://localhost:3210 (local `next start`, no deploy)
Ship bar: AUDIENCE-WEIGHTED — the 5 IN-AUDIENCE personas (Wen, Tomás, Dana, Sam, Elena) must hit adv≥9 / clarity=Yes / value=Yes. NON-FIT personas do not gate.

## Round-3 fixes shipped (verifier-confirmed)
1. Title auto-detect broadened — Asana `Task Name` (+ Name/Summary/Item/Subject/Story/Ticket/Card) auto-maps to Title. (Dana's blocker)
2. Mobile-visible Edit affordance — prose-summary Edit + per-line Edit buttons always visible at touch/<640px (hover-reveal still on desktop). (Sam's blocker)
3. GitHub State/Labels value mapping — closed→Shipped, open→In Progress, blocked/on hold/waiting label→Blocked; "All statuses recognized ✓" no longer fires falsely on unmapped statuses. (Marcus's trust bug)

## Score table — ALL 10

| # | Name | Audience | Clarity | Value | Advocacy | Round | Note |
|---|------|----------|---------|-------|----------|-------|------|
| 3 | Wen | IN-AUDIENCE | Yes | Yes | 9 | carried (r2) | passes bar |
| 4 | Tomás | IN-AUDIENCE | Yes | Yes | 9 | carried (r2) | passes bar |
| 5 | Dana | IN-AUDIENCE | Yes | Yes | 8 | round-3 | Task Name blocker RESOLVED; held at 8 |
| 9 | Elena | IN-AUDIENCE | Yes | Yes | 9 | carried (r2) | passes bar |
| 10 | Sam | IN-AUDIENCE | Yes | Yes | 9 | round-3 | mobile-Edit blocker RESOLVED → 9 |
| 1 | Priya | NON-FIT | — | — | 5 | carried (r1/r2) | does not gate |
| 2 | Marcus | NON-FIT | Yes | No | 7 | round-3 | GitHub bug RESOLVED (was 4); does not gate |
| 6 | Jules | NON-FIT | — | — | 6 | carried | does not gate |
| 7 | Aisha | NON-FIT | — | — | 8 | carried | does not gate |
| 8 | Rob | NON-FIT | — | — | 4 | carried | does not gate |

## In-audience tally (the ship gate)
IN-AUDIENCE at adv≥9 / clarity=Yes / value=Yes: **4 of 5** (Wen 9, Tomás 9, Sam 9, Elena 9).
Sub-bar in-audience holdout: **Dana — adv 8** (clarity Yes, value Yes).

## Blocker resolution
- Dana's `Task Name` auto-detect blocker: **RESOLVED** — built a real Asana export (`Task Name,Assignee,Section/Column,Due Date,Completed At,Tags`); all titles rendered on first parse, zero "(untitled)", zero manual remap. Copy output (Markdown + plain) clean.
- Sam's mobile hover-only Edit blocker: **RESOLVED** — at real 375px touch viewport, prose Edit + 14 per-line Edit buttons render at opacity:1 without hover; edit committed by touch and flowed verbatim into both Copy Markdown and Copy plain text. Advocacy rose 8→9.
- Marcus's GitHub correctness/trust bug: **RESOLVED** — `closed`→Shipped, `open`→In Progress, `open`+blocked label→Blocked all correct; unmapped status (`frobnicated`) surfaces an explicit "UNMAPPED STATUS" section instead of falsely claiming "All statuses recognized ✓". Advocacy rose 4→7 (NON-FIT, no recurring need).

## Remaining sub-bar IN-AUDIENCE complaint, grouped by cause
**Dana (adv 8) — two residual, both in-scope/fixable, NOT introduced since round 2:**
1. **Cosmetic redundant `(name)` parens** rendered on-screen under the `👤 <name>` group header (e.g. "(Sam)" beneath the "👤 Sam" header). Copy output is already clean — this is on-screen display only. (Cause: per-line attribution suffix not suppressed when already grouped by assignee.)
2. **No saved/recurring memory** — re-uploads and re-detects every week with no recall of last week's file/columns. A "remember my columns / last file" (localStorage) would push her to 9. Sam echoes the same shape ("no sticky Epic-grouping preference"), confirming a recurring-memory theme across in-audience PMs.

Neither is a regression from the round-3 changes; both are in-scope and small. The parens cleanup is a quick cosmetic fix; the sticky-preference is a localStorage add (allowed per no-signup rules).

## Recommendation
**FIX** — one in-audience holdout (Dana, adv 8) with two small in-scope complaints. Named changes for the next builder pass:
- (A) Suppress the redundant on-screen `(name)` suffix on lines already shown under a `👤 <name>` assignee-group header (display-only; copy output already correct).
- (B) Add localStorage persistence of last-used column mapping + grouping preference (assignee vs epic) so a returning weekly compiler doesn't re-detect/re-toggle — addresses Dana's #2 and Sam's residual sticky-preference nit. No identity/signup; device-local only.

After these, re-test Dana (and quick-confirm Sam's sticky-pref nit) for the 5th in-audience adv≥9.
