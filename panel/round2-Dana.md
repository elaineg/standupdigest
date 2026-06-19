# Round 2 — Dana (Demand-gen lead, Asana, ruthless about time)

## R1 -> R2 delta: advocacy 8 -> 9. D1 RESOLVED.

### D1 re-check (the thing that blocked me last round)
FIXED. The Changes tab now has its OWN drop target: "Drop next week's export here — We'll
diff it against your saved baseline — no second upload needed." I saved week1 as baseline in
Weekly Status, switched to Changes, and dropped ONLY week2 — got a correct diff vs my saved
snapshot with zero re-upload of the prior file. Header reads "Comparing against: Week of Mon
15 Jun · saved just now / Saved on this device — never uploaded," so it's unambiguous it's MY
snapshot. This is genuinely one-drop and low-friction now.

### One-drop flow — worked end to end?
YES. Diff was correct: landing page -> NEWLY SHIPPED, attribution dashboard (Blocked->In
Progress) -> UNBLOCKED, HubSpot scoring (To Do->In Progress) -> NEWLY STARTED, Plan Q4 event
-> NEW THIS PERIOD, 3 carried over. Exactly what I'd put in a stakeholder update.

### Self-diff guard (step 5)
PASS. Before dropping, it shows "This is the week you saved as the baseline. Drop next week's
export above to see what changed." Dropping the SAME file returned "No changes detected — are
these the same export?" — NOT a fake self-diff. Honest.

### Count honesty (step 6)
PASS, exact. On-screen prose "1 shipped, 1 started, 1 unblocked, 1 new, 3 carried over" ==
section counts (1/1/1/1/3) == Copy Markdown == Copy plain text. Numbers line up everywhere.

### Copy cues
PASS. Button flips to "Copied ✓". Markdown and plaintext both clean, paste-ready for Slack/
Notion. (Clipboard read verified in test env.)

### Mobile 375px (I'm on my phone between meetings — this matters)
PASS. Changes tab reachable, dedicated drop target renders large and tappable, instructive
baseline prompt visible, full diff renders with NO horizontal overflow (scrollWidth 375).

## VALUE: Yes. Today I hand-write this from an Asana export in Notion/a doc weekly. This
turns the export into a paste-ready status in ~10 seconds, and the week-over-week diff is the
part I actually owe stakeholders. I'd use it every Friday.

## CLARITY: Yes. Headline "Turn your tracker export into a weekly status — in seconds" +
"Asana" named + "no upload, no signup" landed in one scroll. On Changes, the blue "Comparing
against... saved just now" banner makes the comparison obvious in <5s.

## ADVOCACY: 9. I'd screenshot the Changes diff into my team channel unprompted. Not a 10 only
because: the "Matched by title (less reliable) — no ID column found" warning on Asana exports
is a little alarming for a tool I'd push to my team (Asana exports don't carry a stable task
ID column, so title-match is the norm — soften that copy so it doesn't read like a defect).
Minor, but it's the one thing that gave me pause before recommending.

```json
{"tester": 4, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["'Matched by title (less reliable) — no ID column found' warning reads alarming for normal Asana exports; soften the copy"], "priorConcernsAddressed": "all"}
```
