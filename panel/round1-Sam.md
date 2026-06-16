# Round 1 — Sam

PM, mobile-heavy. My real weekly job: turn an Asana export into a stakeholder status to paste into Slack.

## (1) CLARITY — Yes
Headline "Turn your tracker export into a weekly status — in seconds" plus "Get a Shipped / In Progress / Blocked digest ready to paste into Slack" told me exactly what it does in ~3s. And right under the drop zone: "Your file never leaves your browser — no upload, no signup." That line is gold — it's the first thing my eyes wanted and it answered it. The "Jira · Linear · Asana · GitHub Issues" subtext sold me it'd take MY export.

## (2) VALUE — Yes
Today I hand-build this every Friday: open Asana, eyeball sections, retype a bulleted status into Slack, group it, write the one-liner. 20 minutes of busywork to look organized.
- Loaded sample: instant digest with a prose one-liner ("shipped 5, 4 in progress, 2 blocked, 1 carried over") — that's literally my opening sentence, done for me.
- Toggled Assignee ↔ Epic grouping: both clean. Epic grouping ("Checkout v2", "Finance") is how my stakeholders think.
- Dropped my OWN Asana-style CSV (Name/Assignee/Section/Projects/Completed At, with "Doing"/"Done"/"To Do"): parsed perfectly, mapped statuses right, and showed "All statuses recognized ✓". That confidence signal matters — I won't debug a mis-parse.
- Copy Markdown AND Copy plain text both produce clean Slack-ready output (`##`/`-` for Markdown, `•` bullets for plain). Carry-over tag survives the copy. This is the whole job, done in 15 seconds.

## (3) ADVOCACY — 8
I'd bring this up in my team channel unprompted Friday afternoon. Not a 9 only because I haven't trusted it with a messy real export yet (multi-project rows, weird custom sections), and "Move to…" for one unmapped status is a small manual step.

## Hesitation / bugs
- No real bug. (Copy buttons fired and flipped to "Copied ✓"; clipboard read was blocked in my test env, not the app — verified visually.)
- The floating "Copy Markdown / Copy plain text" bar sits mid-scroll on mobile, not pinned to the bottom — on a long digest I scrolled past it once. Minor.
- "Edit line" on every row is nice but visually noisy on mobile.

## ONE thing that would raise my score
Let me edit/override the auto one-line summary prose (or add a "for week of <date>" stamp) before copying — that sentence is the part my VP actually reads, and I'd want to tweak the tone. That + proving it eats a messy real Asana export gets it to a 9.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Copy bar floats mid-scroll on mobile instead of pinned, scrolled past it", "Can't edit the auto prose one-liner before copying", "Per-row 'Edit line' buttons add visual noise on mobile"], "priorConcernsAddressed": "n/a"}
```
