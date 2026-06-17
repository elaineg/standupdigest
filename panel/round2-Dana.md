# Round 2 — Dana (demand-gen marketer, in-audience)

R1: advocacy 8, Value=Yes, Clarity=Yes.

## Did the fixes land?
1. **Copy bar pinning** — FIXED. Element is literally `fixed bottom-0 left-0 right-0 z-50`.
   Desktop: scrolled to the very bottom, last row "Deprecate legacy API (Bob)" sits fully
   above the bar with clearance — no row overlap, both buttons hittable. Mobile (375px):
   bar at top 717 in a 780 viewport, 63px tall, sits flush at bottom, last row fully clear.
   My R1 "is it really pinned?" doubt is resolved — it's explicit and clean on both.
2. **Fuller prose summary** — FIXED and it MATTERS. Reads: "Since last week: 3 shipped,
   1 started, 1 newly blocked, 1 unblocked, 2 slipped, 4 new, 1 still blocked, 2 carried
   over, 1 removed from tracker." That's the whole status in one line — I could paste THAT
   alone into the stakeholder channel and be done. After clicking Load sample, this line
   sits comfortably above the fold with rows already showing. The R1 "payoff one scroll too
   low" gripe is gone — the payoff is now the first thing I read.

## Count honesty (re-confirmed)
Prose digits sum = 16. Header counts [3,1,2,4,1,1,2,1,1] = 16. Copied Markdown = 16
author-tagged rows. Copied plain text = 16. Prose one-liner is included in both copies.
Numbers are internally consistent everywhere. Pass.

## Regression — Weekly Status
Still works. Own prose summary ("This week the team shipped 5 items, has 4 in progress and
2 blocked, with 1 carried over"), group-by Assignee/Epic, week selector all present after
Load sample. No regression.

## Honest residual
The R1 blocker (payoff below fold + pinning doubt) is RESOLVED. My remaining held-back
concern stands but is untouched by this round: I still hand-export TWO Asana CSVs (this
week + last week) for the Changes diff, and there's no local memory of last week's export
so I re-drop it every time. That's the one thing keeping this from being a one-click
Monday ritual. Not a defect — a missing convenience. Everything I complained about that
WAS in scope this round got fixed cleanly, so I'm moving up.

VALUE: Yes — the full one-line summary alone replaces my manual "skim the board and write
the TL;DR" step; copy output is paste-ready for Slack/Notion.
CLARITY: Yes — "Turn your tracker export into a weekly status — in seconds" + the prose
line make it obvious in well under 30 seconds.
ADVOCACY: 9 — I'd screenshot the full one-liner into the team channel unprompted. Held off
a 10 only by the two-export friction / no remembered prior export.

{"tester":"Dana","round":2,"clarity":"Yes","value":"Yes","advocacy":9,"blockerResolved":true,"residual":"still hand-export two Asana CSVs for the diff; no local memory of last week's export"}
