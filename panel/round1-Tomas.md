# Panel Round 1 — Tomás (Operations analyst)

- Name: Tomás — Operations analyst, mid-size co. Edge on corporate Windows laptop, medium tech.
- In-audience: yes (compiles weekly Jira-export status reports by hand in Excel today).

## Value: Yes
Today I hand-build a weekly Shipped/In-Progress/Blocked report in Excel from a Jira CSV
export — pivots, manual recategorization, ~30–40 min. This produced the exact digest from
one drop, grouped by assignee, with a paste-ready summary line. The week-over-week diff
(shipped/unblocked/newly-blocked/new/carried-over) is the part I currently can't do without
a painful two-export VLOOKUP. One drop next week instead of re-exporting twice is a genuine
time save. Privacy bar cleared: "Your file never leaves your browser — no upload, no signup"
is stated on every tab, and the baseline strip says "Saved on this device — never uploaded."
Snapshot persisted across a full page reload (localStorage), so the recurrence promise holds.

## Clarity: Yes
H1 "Turn your tracker export into a weekly status — in seconds" + the Drop CSV zone +
no-upload line told me what it is and that it's safe within 5 seconds. Sample-data button
let me try it with zero risk. Baseline strip wording is honest and specific.

## Advocacy: 8/10
I'd recommend it to other report-compilers, but not a 9 because of the same-session snag
below — a first-timer doing save→Changes in one sitting hits a dead end and may conclude
the one-drop "doesn't work" before they ever reload.

## Evidence
- Weekly digest from week1.csv: SHIPPED(2), IN PROGRESS(2), BLOCKED(1), BACKLOG(1) — matches
  source CSV exactly; narrative "shipped 2, 2 in progress, 1 blocked" correct.
- Save → green "Saved on this device · All dates" chip. Persisted across reload.
- Real next-week flow (reload, then drop week2 on Changes): CORRECT one-drop diff, NO second
  upload: NEWLY SHIPPED OPS-102, UNBLOCKED OPS-103, NEWLY BLOCKED OPS-106, NEW OPS-107,
  CARRIED 3. Baseline strip: "Comparing against: All dates · saved just now / Saved on this
  device — never uploaded" + Clear + "Make this week the new baseline" (promote).
- Empty state honest: "Nothing to compare yet. Save this week as your baseline…".
- Copy Markdown: clipboard text counts EXACTLY match on-screen (1 shipped, 1 newly blocked,
  1 unblocked, 1 new, 3 carried over; item lists match section counts). Counts honest.
- Mobile 375px: full save→reload→one-drop→diff works; no horizontal overflow; controls stack.

## Defects
- [P2 confusion] SAME-SESSION dead end: immediately after saving, switching to Changes
  auto-loads the still-loaded export as "current" and diffs it against its own snapshot →
  "No changes detected — are these the same export?" with NO visible drop zone (0 file
  inputs). To diff a new CSV in the same session you must expand "▸ Compare to a different
  export instead (optional)" — i.e. the fallback, not the advertised one-drop. The one-drop
  drop zone only appears after a reload/cleared current export. A new user testing the
  feature in one sitting will think the headline promise is broken. Fix: after Save, the
  Changes tab should offer a fresh drop zone (or a "drop new export" CTA) instead of
  silently self-comparing.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Same-session save→Changes self-compares and hides the drop zone (only works after reload), so the one-drop promise looks broken in one sitting", "One-drop requires reload/clear; in-session you fall back to the manual 'compare to a different export' disclosure"], "priorConcernsAddressed": "n/a"}
```
