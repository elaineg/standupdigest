# StandupDigest — Round 1 — Dana (Demand-gen marketer, IN-AUDIENCE)

5-sec reaction: "Turn your tracker export into a weekly status — in seconds" + "Drop a Jira,
Linear, Asana, or GitHub CSV." It names Asana, names the output (Shipped/In Progress/Blocked),
says no upload/no signup. That's my exact weekly chore. I stayed.

## Discovering the Changes tab
Found "Changes" as the 3rd tab unprompted. Clicked it → "Changes since last week" with an
optional last-week dropzone and a "Load sample data" button that loads BOTH current + prior
in one click. Worked first try, no errors.

## Trust check (the part that matters to me)
Prose summary: "Since last week: 3 shipped, 1 newly blocked, 2 slipped, 4 new."
On-screen section headers: NEWLY SHIPPED (3), NEWLY BLOCKED (1), SLIPPED/REOPENED (2),
NEW THIS PERIOD (4) — ALL MATCH the prose. Every header count = number of rows shown.
Copied Markdown AND plaintext: counts and rows identical to the screen, owners in parens,
"[blocked 2+ wks]" flag preserved, Removed-from-tracker list present. No mismatch anywhere.
This is the first status tool I've trusted on counts without re-counting by hand.
(Copy verified via clipboard read; sticky copy bar pinned to bottom of viewport — the
mid-page overlap I first saw was only a full-page-screenshot artifact, not a real bug.)

## Original Weekly Status tab
Still works. Group-by Assignee, week picker, SHIPPED(5)/IN PROGRESS(4)/BLOCKED(2) all match
its own prose line. No regression.

## Q1 — First reaction / would I use it for real work?
Yes. A "what changed since last week" digest is exactly the framing stakeholders want — they
don't want the full board, they want movement. Newly Shipped / Newly Blocked / Slipped is the
narrative I currently hand-type. I'd paste the plaintext straight into our exec Notion update.

## Q2 — The ONE thing stopping me from advocating harder
Value lands one scroll too low. The Changes tab opens with the dropzone + "Load sample data"
filling the whole first screen, so the digest summary line — the payoff — sits right at the
fold and I scroll past the uploader every single time after the first use. Once I've loaded a
file, push the summary to the top. Secondary: I have to export TWO Asana CSVs (this week +
last week) myself to use it for real; if it remembered last week's export locally so I only
drop the current one, that's the magic-moment upgrade.

## Q3 — Trustworthy and copy-ready?
Yes. Counts are internally consistent screen-vs-copy, both Markdown and plaintext are clean
and paste-ready (Notion/Slack), owner attribution intact. I'd ship it to stakeholders as-is.

ADVOCACY: 8/10  (would screenshot it for the team channel; -2 because I still hand-export two
CSVs and the summary buries under the uploader on repeat use)
VALUE: Yes
CLARITY: Yes

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Changes-tab summary sits below the dropzone — payoff buried one scroll down on repeat use", "Still must export TWO Asana CSVs by hand; no local memory of last week's export"], "priorConcernsAddressed": "n/a"}
```
