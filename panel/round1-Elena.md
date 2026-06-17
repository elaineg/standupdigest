# Round 1 — Elena (Eng Manager, 8 reports, IN-AUDIENCE)

Cold open on laptop, retested key flow on my real device (phone, 375px) since I use this between meetings.

## 30-second reaction
Landing is instantly legible: "Turn your tracker export into a weekly status — in seconds." + "Drop a Jira, **Linear**, Asana, or GitHub CSV." Linear is named, "no upload, no signup" is right there. I'd stay. This is the thing I dread doing every Friday.

## Discovering + using the Changes tab
Found the "Changes" tab unprompted (3rd pill, top). "Load sample data" loaded BOTH a current and prior-week CSV in one click — no second upload step, good. Header "Changes since last week" is exactly my skip-level's question phrased back to me.

## Count verification (the thing I care most about)
I copied the Markdown AND plaintext and inspected them against the rows on screen. Every count is honest end-to-end:
- Newly Shipped 3 / Newly Blocked 1 / Slipped-Reopened 2 / New 4 / Unblocked 1 / Newly Started 1 / Still Blocked 1 / Carried over 2 / Removed 1 — header count = rows shown = copied rows, in ALL nine sections.
- Prose summary "Since last week: 3 shipped, 1 newly blocked, 2 slipped, 4 new." matches the digest AND is byte-identical in the copied text.
- NO count mismatch found. This is the trust bar for me and it cleared.
- Markdown is clean `## Heading (n)` + `- item (Owner)`, pastes straight into a Google Doc or Slack. The "[blocked 2+ wks]" tag on Still Blocked is a genuinely useful carry-over flag.

## Weekly Status tab (regression check)
Still works. Groups by Assignee (my mental model), shows carry-over flag, and — nice — surfaces an "UNMAPPED STATUS" item ("Needs Triage Review") with a manual Move-to control. That's the right call for Linear teams with custom statuses; builds my trust instead of silently dropping the row.

## Q1 — First reaction / would I use it for real work?
Yes. "What changed since last week on my team" is the exact question my skip-level asks, and this turns a Linear CSV into that answer with one click. The Shipped/Blocked/Slipped framing is how I already think. I'd use this Friday.

## Q2 — The ONE thing stopping me from advocating
I haven't fed it MY real Linear export yet — I only trust the sample. My Linear CSV has custom statuses, sub-issues, and 8 people's noise. The Weekly tab's "Remap columns" + "Unmapped status" handling makes me *believe* it'll cope, but until I drop my own messy export and it doesn't choke or miscount, I'm at "promising," not "I bring it up unprompted." Closely behind: on phone the Copy buttons are sticky and overlap a digest row while scrolling (cosmetic, not a blocker).

## Q3 — Trustworthy and copy-ready?
Yes. Counts are internally consistent and match the copied output exactly; Markdown drops cleanly into Slack/Docs. (Clipboard read worked in my test env with permissions granted.) Copy-ready for where it needs to go.

---
ADVOCACY: 8/10
VALUE: Yes
CLARITY: Yes

What holds it back from 9: needs to survive MY real, messy Linear export — sample data is honest but not proof for my team yet. Fix the sticky-button overlap on mobile and I'd happily bring it up to other managers.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Only trusted the sample; haven't proven it on my own messy Linear export (custom statuses, sub-issues)", "On phone the sticky Copy Markdown/plain-text buttons overlap a digest row while scrolling"], "priorConcernsAddressed": "n/a"}
```
