# Round 1 — Dana (Demand-gen marketer)

- Name: Dana
- In-audience: yes (recurring weekly status compiler; runs a small team, exports from a tracker)
- Value: **Yes**
- Clarity: **Yes**
- Advocacy: **8/10**

## Clarity (Yes)
Cold load nailed it in one scroll: H1 "Turn your tracker export into a weekly status — in
seconds", subline names **Asana** explicitly, "Shipped / In Progress / Blocked digest ready
to paste into Slack", plus "Your file never leaves your browser — no upload, no signup."
I could explain it to my team channel in one line. No confusion above the fold.

## Value (Yes)
Today I hand-compile this from an Asana board into Notion/Slack every Friday — ~20 min of
copy-paste. This produced a clean Shipped/In-Progress/Blocked digest from my CSV instantly,
correctly mapping Asana statuses (Done→Shipped, Todo→Backlog). The week-over-week feature is
the real win: I saved this week's snapshot, next week dropped the new export in Weekly Status,
and the **Changes** tab auto-diffed with NO second upload. That's a genuine recurring-habit
hook — one drop, not a two-CSV hand-export.

## Evidence
- save→Changes→one-drop: **WORKS**. Saved snapshot, dropped week2 in Weekly Status, Changes
  auto-diffed week2-vs-saved-week1. Diff was correct: NEWLY SHIPPED(2) Launch Q3 + LinkedIn
  copy (In Progress→Done), NEW(1) Plan Q4 ABM, UNBLOCKED(1) Fix HubSpot (Blocked→In Progress),
  NEWLY STARTED(1) webinar nurture (Todo→In Progress), CARRIED OVER(2) GA4 + UTM.
- Baseline strip: names snapshot "Comparing against: Week of Mon 15 Jun – Sun 21 Jun · saved
  just now" + "Saved on this device — never uploaded" + Clear + "Make this week the new
  baseline" (promote-to-baseline). All present and correct.
- Empty state: confirmed — "Nothing to compare yet. Save this week as your baseline — next
  week, just drop your new export and we'll show what changed." Honest, with sample/demo option.
- Counts honest: on-screen "2 shipped, 1 started, 1 unblocked, 1 new, 2 carried over" EXACTLY
  matched Copy Markdown output (headline + every section count). Verified copy on desktop AND
  mobile.
- Mobile 375px: full flow works (save → drop → auto-diff → copy). Zero horizontal overflow,
  tabs wrap cleanly, sections stack, copy buttons reachable.

## Defects / friction
- **Minor (not blocker):** "Matched by title (less reliable) — no ID column found" warning on
  my Asana export. Honest, but mildly unnerving — if two tasks share a name the diff could
  mismatch. Could nudge me to include a Task ID column. Costs ~1 pt of trust.
- **UX nit:** the one-drop model is slightly non-obvious. The Changes tab itself has no
  dropzone; the "current" week comes from whatever's loaded in Weekly Status. I initially
  expected to drop the new CSV directly on the Changes tab. It works once you get it, but a
  one-liner on Changes ("drop next week's export in Weekly Status — we'll diff it here") would
  remove a beat of confusion.
- No crashes, no console errors, counts honest throughout.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["no-ID 'matched by title (less reliable)' warning dents diff trust", "one-drop model non-obvious: Changes tab has no dropzone, current week comes from Weekly Status"], "priorConcernsAddressed": "n/a"}
```
