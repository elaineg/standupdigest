# StandupDigest — Panel SYNTHESIS Round 2 (delta-retest)

Feature under test: 3rd tab **"Changes"** (week-over-week diff digest). Served locally at http://localhost:3211.
Bar: AUDIENCE-WEIGHTED — in-audience compilers (recurring team-status owners) must advocate at **ADVOCACY ≥ 9 with Value=Yes and Clarity=Yes**. Non-fit personas are carried, non-gating.

Round-1 result: all 5 in-audience compilers clustered at advocacy **8** (Value=Yes, Clarity=Yes), 0/5 at bar — a tight near-miss blocked by two named Changes-tab defects:
1. Copy bar floated mid-list, overlapping digest rows (looks broken; undercuts trust pitch).
2. Prose summary named only 4 of 9 categories (read partial).

Both were fixed and independently re-verified, then re-tested here by the SAME 5 compilers (delta-retest, carry-forward pattern).

## Per-tester table (re-tested in-audience compilers)

| Name | Advocacy R1→R2 | Value | Clarity | Round-1 blocker resolved? | Residual (non-gating) |
|------|----------------|-------|---------|---------------------------|------------------------|
| Wen   | 8 → **9** | Yes | Yes | **YES** — copy bar `fixed bottom-0`, no row overlap desktop+mobile; prose now names all 9 buckets; counts airtight (16/16/16/16) | Collapsed sections need a click to reveal bodies (counts/copy unaffected) — only thing shy of a 10 |
| Tomás | 8 → **8** | Yes | Yes | **YES** — verified copy bar pinned, clean gap desktop+mobile; prose complete; counts end-to-end honest | His OWN held-back concern is untouched & out of scope: "Slipped / Reopened" still merges two distinct events into one count; real-export unproven (he'd try it Monday) |
| Dana  | 8 → **9** | Yes | Yes | **YES** — copy bar `fixed bottom-0`, no overlap desktop+mobile; fuller prose now lands above the fold (kills his R1 "payoff too low" gripe); counts 16/16/16/16 | Still hand-exports two Asana CSVs; no local memory of last week — keeps it off a 10 |
| Elena | 8 → **9** | Yes | Yes | **YES** — her exact R1 blocker (mobile copy-bar overlap) gone: scrolled full 1754px digest at 375px, 0 overlapping rows, buttons hittable; prose complete; counts 16/16/16/16 | Hasn't run her own gnarly real Linear export — only thing shy of a 10 |
| Sam   | 8 → **9** | Yes | Yes | **YES** — his exact R1 blocker (mobile copy-bar overlap) gone: bar pinned topmost, rows scroll underneath, header above readable; prose complete; counts 16/16/16/16 | Sample-only; won't debug a column remap on his real Asana CSV — only thing shy of a 10 |

## In-audience tally at bar

In-audience compilers (5): **Wen, Tomás, Dana, Elena, Sam**.
At bar (Advocacy ≥ 9, Value=Yes, Clarity=Yes): **4 / 5** — Wen, Dana, Elena, Sam all rose 8→9.
Below bar: **Tomás at 8** (Value=Yes, Clarity=Yes). His round-1 blocker IS resolved and he confirmed the fixes did exactly what was promised and broke nothing — but he holds at 8 on his OWN distinct, out-of-scope concern: the "Slipped / Reopened" bucket merges two different events into one count, which he reports separately to stakeholders.

## Non-fit personas (carried forward, non-gating)

- **Aisha 7** — non-fit (judges craft, doesn't own a recurring team digest); R1 partial-prose gripe is now moot (prose names all 9). Carried.
- **Marcus 6** — non-fit; reports up, no team to aggregate. Carried.
- **Priya 4** — non-fit; IC writing her own Slack bullets, no recurring compile job. Carried.
- **Jules 3** — non-fit; tracks content in Notion/Buffer, no tracker export. Carried.
- **Rob 2** — non-fit; solo freelance designer, no team/tracker. Carried.

## Both round-1 defects: resolved (unanimous across all 5 re-testers)

1. **Copy bar overlap — RESOLVED.** All 5 independently confirmed `position:fixed; bottom:0` with content clearance; no digest row overlaps the bar at full-scroll on desktop (1280px) AND mobile (375px); both copy buttons hittable. The two testers whose specific blocker this was (Elena, Sam — mobile overlap) confirmed it on a 375px viewport.
2. **Prose completeness — RESOLVED.** All 5 confirmed the prose now names all 9 non-zero categories: "3 shipped, 1 started, 1 newly blocked, 1 unblocked, 2 slipped, 4 new, 1 still blocked, 2 carried over, 1 removed from tracker."

## Count-honesty re-check (this app's historical weak point) — PASS

Clean across all 5 re-testers. Prose total (16) == on-screen header counts summed (16) == copied Markdown bullets (16) == copied plaintext bullets (16), byte-aligned. Collapsed sections (Carried over, Still Blocked) hide bodies on screen but their rows ARE present in both copies with matching badge counts — no silent dropping. Weekly Status tab: no regression reported by anyone.

## Verdict

**NOT A PASS — 4/5 in-audience at the bar.** Four compilers (Wen, Dana, Elena, Sam) rose to advocacy 9 with Value=Yes / Clarity=Yes; both named round-1 defects are unanimously resolved and count honesty holds. The single sub-bar compiler is **Tomás at 8** — his round-1 blocker is gone, but he holds on a NEW/distinct named defect surfaced in round 1 and untouched by this round's scope:

**Remaining defect (Tomás, the path to 5/5):** the **"Slipped / Reopened" bucket merges two semantically distinct events into one count.** Repro: Changes tab → Load sample data → the "SLIPPED / REOPENED (2)" section groups a date-slipped item and a reopened/regressed item under one heading and one count. Tomás reports these as different stories to stakeholders and would hand-split them, holding him at 8. Splitting Slipped and Reopened into two separate buckets (each with its own count) is the fix that would lift him to 9 and the round to a 5/5 pass.
