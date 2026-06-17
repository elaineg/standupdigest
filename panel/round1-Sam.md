# StandupDigest — Round 1 — Sam (PM, mobile-heavy, IN-AUDIENCE)

Tested cold on a 375px mobile viewport (laptop is my fallback). No console errors anywhere.

## First 30 seconds
H1: "Turn your tracker export into a weekly status — in seconds." Subhead names Jira/Linear/
Asana/GitHub CSV → Shipped/In Progress/Blocked digest "ready to paste into Slack." That's my
Monday morning ritual described back to me. I'd stay. Three tabs visible immediately: Weekly
Status (default), Sprint Review, Changes. I spotted Changes without hunting.

## The new "Changes" tab — discovered it myself, clicked "Load sample data"
The empty state sells itself: two drop zones, "Current export (now)" + "Compare to last week's
export (optional)", with "See what changed since your last export." One "Load sample data" click
populated BOTH the current and prior week — exactly as promised, no second upload needed.

Output is genuinely the "what moved this week" framing I'd kill for in a stakeholder update:
Newly Shipped, Newly Blocked, Slipped/Reopened, New this period, Unblocked, Newly Started, plus
collapsible Carried-over, Still Blocked, and a "Removed from tracker" list. Owners in parens. A
one-line prose summary at top ("Since last week: 3 shipped, 1 newly blocked, 2 slipped, 4 new")
and an Edit line on every item. This makes me look organized with zero effort.

## Count + copy trust check (I did inspect the clipboard)
Prose summary "3 shipped, 1 newly blocked, 2 slipped, 4 new" matches the on-screen section
headers AND the item counts under them. I copied BOTH formats and read the clipboard:
- Markdown copy: every section header count (3/1/2/4/1/1/1/2/1) equals its bullet count. ✓
- Plaintext copy: identical counts, clean • bullets. ✓
- The collapsed Still Blocked (1) and Carried-over (2) sections show the right counts and their
  hidden rows appear correctly in the copied text. No phantom or missing rows. ✓
NO count mismatch found — screen, prose, markdown, and plaintext all agree. This is the thing I
most distrust in auto-summaries, and it held up.

## Weekly Status tab still works
Loaded sample: grouped by Assignee (Epic toggle present), week filter, prose summary "shipped 5,
4 in progress, 2 blocked, 1 carried over", SHIPPED (5) lists 5. Plus a nice "Unmapped status"
re-bucket control. No regression.

## Answers
- Q1 first reaction / would I use it: Yes — this is my real weekly Asana-to-Slack job, and the
  Changes tab is the part I currently do by hand-diffing two exports. I'd use it this Friday.
- Q2 the ONE thing stopping advocacy: I never proved it on MY real Asana CSV — only the sample.
  Asana column names (and my custom fields) are the usual failure point, and the persona won't
  debug a remap. "Remap columns" exists, but until I drop my own export and it just works, I
  hold back a full unprompted rave.
- Q3 trustworthy / copy-ready: Yes. Counts reconcile across screen and both clipboards, owners
  included, paste-ready Markdown for Slack/Notion. I'd paste this into a stakeholder update as-is.

## Scores
ADVOCACY: 8/10 — I'd bring it up to other PMs; the half-point-shy is only because I haven't run
my own messy export through it yet.
VALUE: Yes — replaces a manual two-export diff I do weekly.
CLARITY: Yes.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Only validated on sample data — unproven on my real Asana CSV with custom fields, and I won't debug a column remap", "Copy bar is sticky and overlaps content mid-scroll on mobile (cosmetic)"], "priorConcernsAddressed": "n/a"}
```
