# Round 1 — Dana

**Persona:** Demand-gen lead, runs a small team in Asana, owes a weekly stakeholder status. Ruthless about time.

## (1) CLARITY — Yes
Within 5s I got it. Headline "Turn your tracker export into a weekly status — in seconds." plus "Drop a Jira, Linear, Asana, or GitHub CSV. Get a Shipped / In Progress / Blocked digest ready to paste into Slack." nails what + who. And "Your file never leaves your browser — no upload, no signup." is right under the dropzone — exactly the line that makes me trust dropping a work export. No login wall, no ask for my email. 

## (2) VALUE — Yes
Today I export my Asana board, then hand-massage it in Notion/Canva into a status nobody asked to be pretty. This kills that. I uploaded my OWN Asana-style CSV (Done/In Progress/Blocked/To Do, real teammates) and it parsed cleanly: mapped Done→Shipped, grouped by assignee, flagged "All statuses recognized ✓". The prose summary line ("shipped 2, 2 in progress, 1 blocked") is literally my opening sentence to stakeholders. Copy Markdown AND Copy plain text both worked — Markdown is Slack/Notion-ready, plain text for email. Toggling Assignee↔Epic grouping is genuinely useful (assignee for my 1:1s, epic for the exec roll-up). Carry-over flag and the "Move to…" for an unmapped status are thoughtful — that's the messy-real-data stuff that usually breaks these tools. This saves me ~20 min every Friday.

## (3) ADVOCACY — 8/10
I'd screenshot this into our team channel. Holds it back from 9: it's a per-export tool — I still have to manually export from Asana each week (no saved view/recurrence), and the digest is a snapshot, not a "last week vs this week" delta which is what stakeholders actually want.

## Hesitation / bugs / confusion
- Minor: every item shows the assignee in parens "(Sam)" even when already grouped under "👤 Sam" — redundant noise in the on-screen view (though fine in the copied output for ungrouped contexts).
- The Copy buttons sit in a sticky bar that floats over the middle of a long digest — looked slightly odd on a tall list, but they work. (Copy verified visually + clipboard read; both Markdown & plain text copied correctly.)
- No copy/parse bugs found. Sample data, my CSV, both grouping modes, both copy modes, unmapped-status handling all worked.

## ONE thing that would raise the score
A "what changed since last week" diff — paste/keep last week's digest and have it auto-mark new Shipped items and still-Blocked carry-overs. That's the actual thing my stakeholders read.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["redundant (assignee) label shown even when grouped by assignee", "snapshot only — no week-over-week delta, which is what stakeholders actually want"], "priorConcernsAddressed": "n/a"}
```
