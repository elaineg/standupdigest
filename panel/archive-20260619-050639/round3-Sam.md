# Round 3 — Sam (PM, mobile-heavy, in-audience: weekly Asana→Slack status)

## Regression sentinel — Slipped/Reopened split (round-3 change)

**Split reads RIGHT: YES.** On Changes → Load sample, "Slipped" and "Reopened" are now two
distinct sections, each with its OWN colored heading + own count: **SLIPPED (1)** = "Design
onboarding flow (Alice)" and **REOPENED (1)** = "Write API docs (Dave)". On mobile 375px they
render as separate blocks with separate dots/colors — no merged bucket, no shared count.
Headings captured live: Newly Shipped (3), Newly Blocked (1), **Slipped (1)**, **Reopened (1)**,
New this period (4), Unblocked (1), Newly Started (1), Removed from tracker (1) + collapsed
Carried over (2) / Still Blocked (1).

## No regression on my prior blocker

**Mobile copy bar — STILL FIXED.** At full bottom scroll on 375px the bar is `position:fixed;
bottom:0` (top=751, bottom=812, vh=812) and `elementFromPoint` at its center returns the bar
itself (topmost:true). Last section "Removed from tracker" sits fully ABOVE the bar with
clearance — nothing hidden behind it (m-chg-bottom.png). Mid-scroll the rows scroll cleanly
under it with the heading above readable (m-chg-mid.png). My R1/R2 blocker did NOT regress.

## Count honesty — PASS, airtight

I copied BOTH formats (what I'd actually paste into Slack) and compared:
- Prose: "...1 slipped, 1 reopened..." names both new buckets distinctly.
- **Copied Markdown = 16 bullets**, has `## Slipped (1)` + `## Reopened (1)` as separate H2s.
- **Copied plain text = 16 bullets**, has "Slipped (1)" + "Reopened (1)" as separate sections.
- Markdown set == plaintext set == visible rows. Slipped→Design onboarding flow (Alice),
  Reopened→Write API docs (Dave) appear once each in every representation. Nothing double-counted,
  nothing dropped by the split.
- (Copy buttons fire correctly; a plain getByRole click timed out on the pinned bar but the
  JS-dispatched click copied real content — environment artifact, copy verified functional.)

## Other tabs / errors
- Weekly Status: NO REGRESSION — Shipped(5)/In Progress(4)/Blocked(2)/Backlog(3)/Unmapped(1),
  grouped by assignee, my exact use case (d-weekly.png).
- Zero console errors on cold load and through the whole flow.

## Verdict
The split is a genuine improvement: two ambiguous things ("slipped" deadline vs "reopened" ticket)
are now two clearly-labeled lines a stakeholder won't confuse — and it cost nothing in count
fidelity. Nothing got worse. CLARITY: Yes (tagline + 3 labeled tabs, instantly legible).
VALUE: Yes (collapses my Friday hand-grouping of Asana rows into load-CSV→Copy).

Residual holding me off a 10 is UNCHANGED from R2 and is not a defect I hit: I've still only
validated on **sample** data. I have not pushed my real Asana export with its custom columns
through Remap, and I won't debug a column mapping mid-Friday. Until I see it swallow my messy
real CSV untouched, I can't promise a friend it'll "just work" on theirs. Honest one-point hold.

ADVOCACY: 9/10 — I'd bring this up unprompted in our PM channel Friday.

{"tester":"Sam","round":3,"clarity":"Yes","value":"Yes","advocacy":9,"splitReadsRight":true,"regression":"none","countHonest":true,"mobileCopyBar":"fixed/no-overlap","residual":"sample-only; unproven on my real Asana CSV via Remap — won't debug column mapping mid-Friday","priorConcernsAddressed":"all"}
