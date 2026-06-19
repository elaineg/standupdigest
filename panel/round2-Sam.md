# Round 2 — Sam (Product Manager, mobile-heavy)

**R1 advocacy: 9 (capped by D1) → R2 advocacy: 10. Delta +1.**

## D1 re-test (the thing I complained about): RESOLVED — well.
The Changes tab now has its OWN drop target. Flow I drove:
1. Loaded data on Weekly Status → grouped digest (Shipped/In Progress/Blocked/Backlog, grouped by Assignee, carry-over badge, prose summary). 
2. "Save this week's snapshot" → "Saved on this device · Week of Mon 8 Jun".
3. Changes tab shows "Comparing against: Week of Mon 8 Jun · saved just now" + dashed drop zone: **"Drop next week's export here / We'll diff it against your saved baseline — no second upload needed."** Exactly the fix promised.
4. Dropped a DIFFERENT CSV on that target — NO re-upload of the prior file. Got a correct diff: "2 shipped, 2 started, 1 unblocked, 2 new, 1 still blocked, 8 carried over." Spot-checked every line: Build analytics + Deploy staging → NEWLY SHIPPED, Fix login redirect → UNBLOCKED, Design onboarding/Write API docs → NEWLY STARTED. All correct. This is genuinely one drop now.
5. Before dropping, the baseline week showed the instructive prompt ("This is the week you saved as the baseline. Drop next week's export above…") — NOT a fake self-diff. Good.

## Count-honesty: PASS (this is the part I actually paste to Slack)
On-screen headers, prose, copied **Markdown**, and copied **plaintext** all agree exactly (2/2/1/2/1/8). Copied lists fully enumerate the 8 carried-over items. "Copied ✓" label confirmed (clipboard verified in test).

## Nice touches I noticed
- Honest warning "Matched by title (less reliable) — no ID column found." Builds trust.
- "Make this week the new baseline" — exactly the weekly rhythm I need.
- Mobile 375px: drop target full-width, tappable, diff renders cleanly, copy buttons reachable. Works between meetings.

## Defects / friction
- **Minor (not D1):** My hand-rolled Asana CSV with a "Completed" column got mis-mapped — the "Section/Column" was read as status, dropping all 7 into "Unmapped Status." There's a "Remap columns" link and an honest Unmapped bucket, so it's recoverable, but a real Asana export with a Completed/done column should auto-map. I won't debug column mapping; sample data and a Status-column CSV worked flawlessly. Doesn't cap me, but it's the next thing to harden.

## Verdicts
- **VALUE: Yes** — replaces my manual weekly Asana→Slack status compile. One drop, correct diff, copy-paste ready.
- **CLARITY: Yes** — "Comparing against: [my saved week] · saved just now" makes it obvious in <5s it's MY snapshot.
- **ADVOCACY: 10** — D1 is gone; the one-drop flow is clean, counts are honest end-to-end, mobile works. I'd bring this up unprompted to other PMs.

```json
{"tester": 4, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 10, "topComplaints": ["Real Asana CSV with a Completed column mis-mapped status into 'Unmapped' (recoverable via Remap, but should auto-map)"], "priorConcernsAddressed": "all"}
```
