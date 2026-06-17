# StandupDigest — Round 1 — Tomás (Ops Analyst, Edge/Windows, IN-AUDIENCE)

## Cold open (5s)
Headline "Turn your tracker export into a weekly status — in seconds" + "Drop a Jira,
Linear, Asana, or GitHub CSV" told me instantly what it is and that it speaks my stack.
The line "Your file never leaves your browser — no upload, no signup" is the thing that
made me stay — that is my #1 worry pasting Jira data into a random site. I'd stay.

## Q1 — First reaction / would I use it for real work?
Yes. I hand-build a Shipped/In-Progress/Blocked roll-up from a Jira CSV in Excel every
week — this is literally that chore. The NEW Changes tab ("Changes since last week") is
better than what I do today: stakeholders constantly ask "what changed vs last week" and
I currently diff two exports by eye. I found the Changes tab on my own (3rd pill in the
tab row), hit "Load sample data", and it loaded BOTH current + prior week in one click and
produced Newly Shipped / Newly Blocked / Slipped / New this period / Unblocked / Newly
Started / Carried-over / Still Blocked / Removed-from-tracker. That's exactly my framing.

## Q2 — The ONE thing stopping me from advocating
Nothing structural blocks it — it's genuinely close to a 9. What holds it at 8: I can't
yet fully trust the CATEGORIZATION on MY messy real Jira export (custom statuses,
"In Review", "Won't Do"). The sample is clean; my exports aren't. The "Remap columns"
control exists, which is reassuring, but I'd need one real run on my own CSV before I'd
push it to my team. Also "Slipped / Reopened" lumps two different events under one count —
for a stakeholder I'd want to know which.

## Q3 — Trustworthy & copy-ready? — YES, verified
I checked counts across four places and they ALL agree:
- Prose summary: "3 shipped, 1 newly blocked, 2 slipped, 4 new."
- On-screen section headers + actual visible rows (expanded the collapsed Carried-over &
  Still-Blocked sections): 3/1/2/4/1unblocked/1started/2carried/1still-blocked/1removed.
- Copied Markdown (799 chars) and Copied plaintext (772 chars): row counts identical to
  screen, headers match, owners in parentheses preserved. No mismatch anywhere.
- Markdown uses ## headers + "- " bullets; plaintext uses "• " bullets — both paste-ready
  for Teams / a SharePoint status page. (Clipboard read worked in my env.)
- Network check: ZERO off-origin requests when loading sample data — data stays local,
  privacy claim holds. This is what earns my trust.
Original "Weekly Status" tab still works: summary "shipped 5, in progress 4, blocked 2,
1 carried over" matches its rows, group-by Assignee/Epic + week selector present.

## Scores
ADVOCACY: 8/10  (I'd bring it up to my ops peers; the missing point is needing one run on
my own real Jira export + Slipped/Reopened being a merged bucket.)
VALUE: Yes  (replaces a manual Excel diff I do weekly; saves real time, no install — passes
IT, which blocks desktop tools.)
CLARITY: Yes

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Categorization unproven on my own messy Jira export (custom statuses); only tested on clean sample", "Slipped / Reopened merges two distinct events into one count — stakeholders would want them split"], "priorConcernsAddressed": "n/a"}
```
