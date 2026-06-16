# Round 1 — Tomás

Operations analyst, Edge on a locked-down corporate laptop. I build a weekly Shipped/In-Progress/Blocked report from Jira CSV exports by hand in Excel every Friday. IT blocks installs, so a browser tool is the only kind I can use — but I will not paste company data into a site that phones home.

## (1) CLARITY — Yes
Within 5 seconds I got it. Headline "Turn your tracker export into a weekly status — in seconds." plus "Drop a Jira, Linear, Asana, or GitHub CSV. Get a Shipped / In Progress / Blocked digest." That's literally my chore named back to me. And the line I was hunting for is right on the drop zone: "Your file never leaves your browser — no upload, no signup." That sold me before I touched anything.

I didn't take the claim on faith — I watched the network. Loading my own CSV and hitting Copy fired ZERO POST/upload requests and ZERO external calls (all traffic stayed on localhost). That's the real reassurance, and the in-app copy matches reality. Good.

## (2) VALUE — Yes
This replaces my manual Excel pivot. I loaded a real Jira-style export (Issue key, Summary, Status, Assignee, Epic Link) and it:
- Mapped Done→Shipped, In Progress / In Review→In Progress, Blocked→Blocked, To Do→Backlog correctly, and printed "All statuses recognized ✓".
- Grouped by Assignee, toggled cleanly to group by Epic (my Q3 Reporting / Finance Ops epics showed up).
- Flagged the carry-over item with a yellow "carry-over" tag (huge — that's the thing stakeholders ask about).
- Gave a one-line prose summary I can drop at the top of a Teams post: "This week the team shipped 1 item, has 2 in progress and 1 blocked…"
- Copy as Markdown AND plain text both worked, both well-formatted, "Copied ✓" confirmed.
- Unmapped status ("Needs Triage Review") wasn't silently dropped — it was surfaced with a "Move to…" dropdown so I can reclassify. That's the kind of safety I need; nothing vanishes.

This genuinely saves me 20–30 min a week of copy/paste/sorting in Excel.

## Hesitation / bugs
- LAYOUT BUG: the "Copy Markdown / Copy plain text" buttons render mid-page, jammed between the BLOCKED and BACKLOG sections instead of at the bottom of the digest. Looked broken/misplaced on first glance — I expected them under the whole report.
- I send to Teams, not Slack; the subtitle says "ready to paste into Slack." Minor, but it momentarily made me think this wasn't for me. Plain-text copy works fine in Teams though.
- Would like to confirm it handles a messy real Jira export (custom columns, sub-tasks, commas in summaries) — my sample was clean.

## (3) ADVOCACY — 8/10
I'd bring this up to my analyst peers unprompted as soon as I'd run it on one real export without issue. The client-side guarantee (which I verified) plus no-install is exactly why it clears IT for me. Not a 9 because the misplaced Copy buttons look unfinished and "paste into Slack" made me momentarily doubt it fit a Teams shop.

The ONE thing that would raise it to 9–10: fix the Copy buttons to sit cleanly at the bottom of the digest, and either say "Slack/Teams" or make the destination generic.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Copy Markdown/plain-text buttons render mid-page between Blocked and Backlog — looks misplaced/unfinished", "Subtitle says 'paste into Slack' but I'm a Teams shop — momentarily read as not-for-me"], "priorConcernsAddressed": "n/a"}
```
