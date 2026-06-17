# StandupDigest — Round 1 — Marcus (Frontend eng, 2yr; NON-FIT audience)

## Cold open (5s reaction)
H1: "Turn your tracker export into a weekly status — in seconds." Subtext names Jira/Linear/
Asana/GitHub CSV, "ready to paste into Slack," "no upload, no signup." I get it instantly —
CSV in, Slack-pasteable status out. Clean, no jank, no console errors. As an early adopter I'd
stay and poke it. The "no signup, stays in your browser" line is the right flex.

## Did I find + use the Changes tab?
Yes — three tabs, discovered "Changes" immediately. Its "Load sample data" loads BOTH current
and prior-week in one click as promised. Output rendered with the full taxonomy: Newly Shipped,
Newly Blocked, Slipped/Reopened, New this period, Unblocked, Newly Started, collapsible Carried-
over + Still-blocked, and an italic "Removed from tracker" list. Nice touch: "[blocked 2+ wks]"
tag on a still-blocked item.

## Count / trust verification (the important part)
Counts FULLY reconcile. Prose summary "Since last week: 3 shipped, 1 newly blocked, 2 slipped,
4 new." matches every section header (Newly Shipped 3, Newly Blocked 1, Slipped 2, New 4) AND
matches the copied Markdown exactly. I copied both formats and inspected:
- Markdown copy: complete, well-formed, all 9 sections incl. "Removed from tracker (1)".
- Plaintext copy (772 chars): also complete, includes Removed section, bullet style.
No count mismatch anywhere. This is trustworthy — I'd paste it without re-checking. That earns
real points; a digest tool that lies about counts is dead on arrival.

## Weekly Status regression check
Original tab still works — sample loads, "shipped 5 / 4 in progress / 2 blocked / 1 carried"
summary, group-by Assignee/Epic, week selector. No JS errors, no regression.

## Q1 — First reaction + use it for my work?
Slick and it works. But for MY job: I report UP to a lead, I don't aggregate a team's status,
and I don't keep a Jira/Linear export handy. The "diff since last week" framing is genuinely the
most interesting tab — I could imagine pointing it at a GitHub Issues export out of curiosity —
but I have no recurring need. A team lead or EM is the real user, not me.

## Q2 — The ONE thing stopping advocacy
Nothing's broken — it's audience fit. I'd only forward it to my EM in Slack, not adopt it. Minor
polish nit: the sticky Copy bar overlaps the digest rows mid-scroll on a tall result, which looks
janky on first load (it IS position:sticky, so functional, just visually messy until you scroll).

## Q3 — Output trustworthy + copy-ready?
Yes. Counts match rows AND match both copied formats. Markdown pastes clean into Slack/Notion.
This is the strongest part of the app.

ADVOCACY: 6
VALUE: Marginal  (no recurring need of my own; I report up, not down — real value is for a lead)
CLARITY: Yes

```json
{"tester": "Marcus", "round": 1, "clarity": "Yes", "value": "Marginal", "advocacy": 6, "topComplaints": ["No recurring need for me — I report up, not aggregate a team (audience non-fit)", "Sticky Copy bar visually overlaps digest rows mid-scroll on a tall result — looks janky on first load"], "priorConcernsAddressed": "n/a"}
```
