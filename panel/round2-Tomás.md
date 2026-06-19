# Round 2 — Tomás (Ops analyst, Excel/Jira power user, wary of data leaving browser)

**R1 → R2 delta: 8 → 9.** D1 (the duplicate-upload Changes flow) is resolved.

## D1 re-test — RESOLVED
- Saved week1 via "Save this week's snapshot" → went to Changes tab → it has its OWN drop
  target ("Drop next week's export here · We'll diff it against your saved baseline — no
  second upload needed"). Dropped week2 ONLY. Correct diff, zero re-upload of the old file.
- Diff was exactly right vs my known changes (102 InProg→Done, 103 Blocked→Unblocked, 105
  removed, 106 new, 101+104 carried): NEWLY SHIPPED 1 / NEW 1 / UNBLOCKED 1 / CARRIED 2 /
  REMOVED 1. This is the chore I do by hand in Excel, done in one drop.
- Step-5 prompt confirmed: before dropping, it says "This is the week you saved as the
  baseline. Drop next week's export above to see what changed." — no misleading self-diff.

## VALUE: Yes
This replaces my weekly manual Excel diff of two Jira exports. Save once, drop next week,
copy the Markdown into Teams/the report. Genuinely saves me 20–30 min a week.

## CLARITY: Yes
Within 5s: "Comparing against: All dates · saved just now / Saved on this device — never
uploaded" makes it obvious I'm diffing MY snapshot, not some default. Headline + tab labels
are unambiguous.

## TRUST: passes my bar
"Your file never leaves your browser — no upload, no signup" + "Saved on this device —
never uploaded", AND I confirmed ZERO external network requests during the whole flow. I'd
actually run a company Jira export through this.

## Count-honesty: clean
On-screen counts == prose summary == Copy Markdown == Copy plain text, all 1/1/1/2/1.
Copy buttons flip to "Copied ✓". Clipboard read succeeded in test env (not blocked).

## Mobile 375px: fine
New drop target present + tappable, full diff renders, no horizontal overflow (scrollWidth
375), copy buttons reachable.

## Why 9 not 10
Minor: "Comparing: 5 rows (next week) vs saved baseline" — "5 rows" is raw-count jargon;
I'd prefer "5 items this week." And the baseline label says "All dates · saved just now"
rather than the source week's date, so a week later I can't tell at a glance WHICH week the
baseline is. Date-stamp the baseline and I'm at 10.

## ADVOCACY: 9 — I'd bring this up to my team unprompted next reporting cycle.

```json
{"tester": 4, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["baseline labeled 'saved just now'/'All dates' not the actual source-week date — hard to ID which week the baseline is a week later", "'5 rows (next week)' uses raw-count jargon instead of 'items'"], "priorConcernsAddressed": "all"}
```
