# Round 1 — Wen (Marketing data analyst)

- In-audience: YES (recurring stakeholder report compiler; lives in CSV/BigQuery/Sheets/Looker)
- Device: desktop (also checked 375px mobile)
- **Value: Yes**
- **Clarity: Yes**
- **Advocacy: 9/10**

## What I did
1. Cold landing: H1 "Turn your tracker export into a weekly status — in seconds" + sub
   "Drop a Jira/Linear/Asana/GitHub CSV → Shipped/In Progress/Blocked digest for Slack."
   Purpose obvious in <5s. "Your file never leaves your browser — no upload, no signup" is
   exactly what I look for before dropping a stakeholder export.
2. Dropped a realistic 8-row tracker CSV (Issue key, Summary, Status, Assignee, Epic).
   Digest: SHIPPED 3 / IN PROGRESS 2 / BLOCKED 2 / BACKLOG 1 — matched my data exactly.
   "All statuses recognized ✓" — good honesty signal that nothing was silently dropped.
3. Clicked "Save this week's snapshot" → button flipped to "Saved on this device · All dates".
4. ONE-DROP test: loaded week2 export (no second upload), opened Changes tab. It
   auto-diffed week2 vs the saved week1 snapshot. Every bucket correct vs my known data:
   Newly Shipped 2, New 2, Unblocked 1, Newly Started 1, Still Blocked 1, Removed 3.
   No manual second upload required. The optional "Compare to a different export" fallback
   is there but collapsed — good default.
5. Baseline strip: "Comparing against: All dates · saved just now" + "Saved on this device
   — never uploaded" + Clear / Make-this-week-the-new-baseline controls. Crystal clear
   what's compared and that it's device-local.
6. Empty state (after Clear): "Nothing to compare yet. Save this week as your baseline…"
   — honest, with a clear CTA. Reachable and correct.
7. DATA-HYGIENE (the thing I distrust most): Copy Markdown AND Copy plain text both match
   on-screen counts EXACTLY — summary line "2 shipped, 1 started, 1 unblocked, 2 new, 1
   still blocked, 3 removed" identical; every section count and every row present. The
   STILL BLOCKED section was collapsed on screen but its count (1) showed and the row
   appears in the copy tagged "[still blocked]" — nothing hidden, nothing fabricated.
8. Mobile 375px: no horizontal overflow (scrollWidth==375); baseline strip, diff, copy
   buttons all stack cleanly.

## Defects / friction
- None blocking. Minor: on the Changes tab BEFORE loading a new export it says "No changes
  detected — are these the same export?" (current==saved). Technically true but mildly
  confusing for a first-timer who hasn't dropped next week's file yet — a "drop next week's
  export to see changes" nudge would read cleaner. Not a data bug.
- Counts honest in every copy path I tested. No silent mis-bucketing found.

## Why not 10
Genuinely good — I'd use this weekly and stop hand-diffing two CSVs in Sheets. Holding one
point only because I tested one clean export shape; I'd want to see it survive a messier
real Jira export (commas in summaries, custom status names) before I evangelize it
org-wide. The Remap columns affordance suggests it's handled, but I didn't stress it.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Pre-drop Changes tab says 'No changes detected — are these the same export?' which mildly confuses before next week's file is loaded"], "priorConcernsAddressed": "n/a"}
```
