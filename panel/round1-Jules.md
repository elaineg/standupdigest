# StandupDigest — Round 1 — Jules (Content & community marketer, NON-FIT audience)

## 5-second cold reaction
Headline: "Turn your tracker export into a weekly status — in seconds." Subhead names
"Jira, Linear, Asana, or GitHub CSV... paste into Slack." In 5 seconds I knew exactly what
it is and who it's for — and it's not me. I track content in Notion + Buffer and report to
my team in a Notion doc / Slack thread by hand. I don't export issue-tracker CSVs. So:
crystal clear, but clearly a dev/PM tool, not a marketer tool.

## Changes tab (the new feature)
Discovered it as the 3rd pill ("Changes"). "Load sample data" loaded BOTH current + prior
week in one click — nice, no fumbling with two files. Output is a clean diff: Newly Shipped,
Newly Blocked, Slipped/Reopened, New this period, Unblocked, Newly Started, Carried over,
Still Blocked, Removed from tracker, plus a one-line prose summary and an editable line.

### Count integrity check (did it carefully)
Prose: "Since last week: 3 shipped, 1 newly blocked, 2 slipped, 4 new."
On-screen header counts vs actual rows vs copied Markdown vs copied plaintext — ALL MATCH:
- Newly Shipped (3)=3 rows=copy. Newly Blocked (1)=1. Slipped/Reopened (2)=2. New (4)=4.
- Unblocked (1), Newly Started (1), Still Blocked (1), Carried over (2), Removed (1) — all consistent.
Both Copy Markdown and Copy plain text produced well-formed, count-accurate output.
(Copy verified visually + clipboard read fine in test env.) No count mismatch anywhere — trustworthy.

### Real defect I hit (not a count issue — a layout one)
At desktop 1280px the **"Copy Markdown" / "Copy plain text" buttons render floating in the
MIDDLE of the list**, jammed between "SLIPPED / REOPENED (2)" and its "(Dave)" row, splitting
that section in two (see changes-loaded.png). The copy actions belong at the bottom (or top),
not buried inside the content. It looks broken even though it works, and it made the Slipped
section confusing to read.

## Weekly Status tab sanity
Still works. Loads sample, groups by Assignee, prose summary ("shipped 5, 4 in progress, 2
blocked, 1 carried over"), week selector all render. No page/console errors anywhere.

## Three questions
Q1 First reaction / would I use it for my work? Sharp, fast, no-signup — genuinely good for a
dev team. But for MY job (content/community marketing) there's no tracker CSV to feed it; my
"standup" is a Notion update and a Buffer queue. I'd try it once out of curiosity, then never
return. Wrong workflow for me, not a quality problem.

Q2 The ONE thing stopping advocacy? It doesn't map to my workflow at all — every input source
listed (Jira/Linear/Asana/GitHub) is engineering tooling. I have nobody to recommend it to
except the eng leads I sit next to, and they'd be the better judges. The floating Copy buttons
are the one thing I'd flag as an actual bug if I did pass it along.

Q3 Trustworthy / copy-ready? Yes. Counts are internally consistent across prose, screen, and
both copy formats; Markdown pastes clean into Slack/Notion. The only blemish is the misplaced
Copy buttons, which is visual, not data.

## Scores
ADVOCACY: 3/10 — well-built and trustworthy, but a complete workflow non-fit for a marketer;
I can't honestly bring this up unprompted to my circle. Score reflects fit, not quality.
VALUE: No — I have no CSV-export-to-status job; this saves me nothing over my Notion update.
CLARITY: Yes — I understood it and its (dev) audience in under 5 seconds.

```json
{"tester": 0, "round": 1, "clarity": "Yes", "value": "No", "advocacy": 3, "topComplaints": ["Workflow non-fit: every input source is an engineering tracker (Jira/Linear/Asana/GitHub) — no marketer CSV-to-status job exists for me", "Layout bug: Copy Markdown/plain-text buttons render floating in the MIDDLE of the Changes list, splitting the Slipped/Reopened section at desktop 1280px"], "priorConcernsAddressed": "n/a"}
```
