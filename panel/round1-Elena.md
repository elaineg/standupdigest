# Round 1 — Elena (Engineering manager, 8 reports)

- Name: Elena
- In-audience: yes (recurring weekly report compiler, lives in Linear)
- Value: **Yes**
- Clarity: **Yes**
- Advocacy: **9**

## Cold open (~5s)
H1 "Turn your tracker export into a weekly status — in seconds." + subline naming
Jira/Linear/Asana/GitHub + "Shipped / In Progress / Blocked digest ready to paste into
Slack" + "no upload, no signup." I understood it instantly and it speaks Linear. There is a
"Load sample data" button so I'm not forced to find a CSV first. No setup. Passes my 30s bar.

## Flow tested (real Linear-style CSV, 8 rows wk1, modified wk2 + 1 new task)
1. Dropped week1 → digest grouped by assignee: SHIPPED 3 / IN PROGRESS 3 / BLOCKED 2,
   "0 carried over". Counts match my CSV exactly. Statuses recognized ✓.
2. "Save this week's snapshot" — one click. Strip then reads "Saved on this device · All dates".
3. **One-drop diff WORKS.** Realistic next-week flow = open app fresh (snapshot persists in
   localStorage), Changes tab shows a single drop zone, drop week2 — NO second upload needed.
   Auto-diff: Newly Shipped 2 (SSO, billing), Newly Blocked 1 (latency), New 1 (CI pipeline),
   Unblocked 2 (auth, dashboard), Carried over 3. Every category correct vs my CSVs.
4. Baseline strip: "Comparing against: All dates · saved just now" + "Saved on this device —
   never uploaded" + Clear + "Make this week the new baseline" (promote). All present & honest.
5. Empty state honest: "Nothing to compare yet. Save this week as your baseline — next week,
   just drop your new export." Reachable on fresh load / before any snapshot.
6. Copy verified: clipboard text EXACTLY matches on-screen counts and every line item
   (header "2 shipped, 1 newly blocked, 2 unblocked, 1 new, 3 carried over" + all rows).
7. Mobile 375px: full flow works — save btn visible, drop zone present, one-drop diff renders,
   color-coded, NO horizontal overflow, tabs usable. I'd genuinely do this on my phone.

## Defects / friction
- **Confusing self-compare (minor but real):** If you SAVE the snapshot and immediately click
  Changes in the SAME session (week1 still loaded), it auto-compares week1 vs week1 and shows
  "No changes detected — are these the same export?" with NO visible drop zone to add the new
  week. I briefly thought it was broken. The drop zone only reappears on a fresh load. The
  same-session path should still offer a "drop this week's export" target instead of silently
  comparing the snapshot to itself.
- "Matched by title (less reliable) — no ID column found" warning appeared on my CSV. A real
  Linear export includes an ID column so this may not fire for me, but the wording is slightly
  alarming for a first-timer.
- No defects in counts, honesty, baseline labeling, empty state, or mobile.

Why 9 not 10: the same-session "no drop zone / self-compare" moment is the one spot that
could make a busy manager think it's broken before the (excellent) real flow kicks in.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Same-session save→Changes self-compares snapshot vs itself and hides the drop zone, looks broken", "'Matched by title (less reliable)' warning is alarming wording for first use"], "priorConcernsAddressed": "n/a"}
```
