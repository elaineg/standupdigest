# StandupDigest — Round 1 — Wen (Marketing Data Analyst, in-audience)

## Cold open (5s)
"Turn your tracker export into a weekly status — in seconds." + "Drop a Jira, Linear, Asana,
or GitHub CSV." I got it instantly. "Your file never leaves your browser — no upload, no
signup" is exactly the line that earns trust from someone who lives in data hygiene. I'd stay.

## The new Changes tab (discovered it myself, 3rd tab)
Loaded "Load sample data" (loads current + prior in one click). Digest rendered cleanly with
a prose one-liner + buckets + editable lines + Copy MD / Copy plaintext.

### Count audit (my specialty) — PASSED
Prose: "Since last week: 3 shipped, 1 newly blocked, 2 slipped, 4 new."
On-screen header counts == rows shown == copied Markdown == copied plaintext, exactly:
Newly Shipped 3, Newly Blocked 1, Slipped/Reopened 2, New 4, Unblocked 1, Newly Started 1,
Carried over 2, Still Blocked 1, Removed 1. No mismatch anywhere. The prose deliberately
highlights only 4 categories (not a grand total) — fine, it's a summary line, not a checksum.

### Bucketing audit with MY OWN crafted CSVs — PASSED (the thing that wins me over)
I built a 6-row prior/current pair to probe each transition and every row bucketed correctly:
In-Progress→Done = Newly Shipped; ToDo→Blocked = Newly Blocked; Blocked→In-Progress = Unblocked;
In-Progress→In-Progress = Carried over; row dropped from current = Removed from tracker;
row absent in prior = New this period. The diff keys on the issue Key column, not summary text,
so a renamed summary won't fake an add/remove. No silent mis-bucketing — this is what I came to
break and it held. "All statuses recognized ✓" on the Weekly tab is another good trust signal.

### Weekly Status tab still works — PASSED
My CSV: Shipped 1, In Progress 2, Blocked 1, Backlog 1, summary matches. Group-by Assignee works.

## The one real defect
Copy buttons LAYOUT BUG: in the default collapsed view the "Copy Markdown / Copy plain text"
buttons render mid-list (measured y=850, between Slipped at y=490 and New-this-period at y=939),
overlapping the digest instead of sitting at the bottom. Copied content is correct, but it looks
broken on first glance and made me double-check I'd copied the whole thing. Fix the button anchor.
(Copy verified by reading clipboard with permissions granted — output is faithful.)

## Q1 — First reaction / would I use it for real work?
Yes. I build recurring stakeholder status reports from Jira exports every week; this is the
diff-since-last-week view I currently hand-build. I'd genuinely drop my export here.

## Q2 — The ONE thing stopping advocacy
The mid-list copy-button overlap. It's cosmetic but it's the first thing a skeptic sees, and for
a tool whose whole pitch is trustworthy output, looking half-broken undercuts that on sight.

## Q3 — Trustworthy & copy-ready?
Yes. Counts reconcile screen↔prose↔both copy formats, bucketing is correct and key-based, and the
Markdown pastes straight into Slack/a doc. This is copy-ready for my marketing-ops stakeholders.

## Scores
ADVOCACY: 8/10 (would bring it up to my PM peers; the layout glitch holds it off a 9)
VALUE: Yes — replaces my manual week-over-week diff in Sheets
CLARITY: Yes

```json
{"tester": "Wen", "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Copy Markdown/plain-text buttons render mid-list in the default collapsed view, overlapping the digest (looks broken though copied text is correct)", "Prose one-liner only names 4 of 9 buckets — fine as a highlight, but a hygiene reader briefly wonders if Unblocked/Removed were dropped"], "priorConcernsAddressed": "n/a"}
```
