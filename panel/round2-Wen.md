# Round 2 — Wen (Marketing data analyst; CSV in/out; count-honesty hawk)

R1 verdict: advocacy 8, Value=Yes, Clarity=Yes. One blocker held me off a 9: the
Copy bar rendered MID-LIST overlapping digest rows in the collapsed Changes view, and
the prose one-liner named only 4 of 9 buckets.

## What I checked (Changes tab, "Load sample data", desktop 1440 + mobile 375)

**Fix (a) — Copy bar overlap.** RESOLVED. Container computed `position: fixed; bottom: 0px`.
Scrolled to the bottom of the tall digest: the bar sits below the last row (REMOVED FROM
TRACKER → "Deprecate legacy API (Bob)") with whitespace clearance. `elementFromPoint` 6px
above the bar = the bar's own wrapper DIV, NOT a digest row. `elementFromPoint` at button
center = SPAN inside the button — buttons are hittable, not covered. Verified identically on
mobile 375px (both buttons visible, no overlap with "Deprecate legacy API"). The "looks broken
on first glance" problem is gone.

**Fix (b) — prose completeness.** RESOLVED. Summary now reads, byte-for-byte:
"Since last week: 3 shipped, 1 started, 1 newly blocked, 1 unblocked, 2 slipped, 4 new,
1 still blocked, 2 carried over, 1 removed from tracker." All 9 non-zero categories named.

## Count honesty (my specialty) — AIRTIGHT
Cross-checked prose vs on-screen badges vs copied Markdown vs copied plaintext:
- Every section header count == actual rows: Shipped 3, NewBlocked 1, Slipped 2, New 4,
  Unblocked 1, Started 1, StillBlocked 1, Carried 2, Removed 1. Zero mismatches. Total 16 rows.
- Markdown == plaintext after normalizing only the bullet glyph (`-` vs `•`) and `##` headers.
  Same rows, same order, same prose first line. Nothing silently dropped.
- IMPORTANT: the collapsed sections (Carried Over, Still Blocked) hide their BODIES on screen
  but the rows are STILL present in both copy outputs and the counts match the badges. No silent
  mis-bucketing, no dropped rows behind a collapse. Exactly what I distrust tools for — clean here.

**Weekly Status tab:** no regression. Loads sample, group-by Assignee/Epic, week selector,
prose summary ("shipped 5, 4 in progress, 2 blocked, 1 carried over"), SHIPPED (5) rows present.

## Verdict
The blocker is GONE and the prose is complete. The single thing that capped me at 8 is fixed,
and the count-honesty I most care about holds byte-for-byte across all four representations.
This is now a tool I'd paste a Jira export into for my weekly stakeholder status without
re-checking the math. Minor residual (not a blocker): collapsed sections require a click to see
bodies, and "Edit line" affordances add visual noise — but counts are honest and copy is complete.

CLARITY: Yes. VALUE: Yes (today I hand-bucket a Jira CSV in Sheets; this is seconds, CSV in,
markdown/plaintext out, math verified). ADVOCACY: 9 (R1 8 → R2 9). I'd bring this up unprompted
to anyone who writes a weekly status from a tracker export.

{"tester":"Wen","round":2,"clarity":"Yes","value":"Yes","advocacy":9,"blockerResolved":true,"residual":"collapsed sections need a click to reveal bodies; counts/copy unaffected"}
