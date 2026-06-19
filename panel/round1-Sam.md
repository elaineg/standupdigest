# Round 1 — Sam (Product Manager)

**Name:** Sam — Product manager, mobile-heavy, medium tech, won't debug anything.
**In-audience:** yes (compiles a weekly stakeholder status from Asana every week; wants a copy-to-Slack digest).

**Value:** Yes
**Clarity:** Yes
**Advocacy:** 9

## What I'd tell a friend
"Drop your Asana/Jira/Linear CSV, get a Shipped / In Progress / Blocked weekly status grouped by person (or epic), and it remembers last week so next Monday you just drop the new export and it tells you what shipped, unblocked, started, and got removed — then one button copies it clean into Slack." The headline "Turn your tracker export into a weekly status — in seconds" + the Slack mention nailed it in ~5s.

## Evidence (375px mobile throughout)
- Cold landing obvious instantly: tabs, headline, "Load sample data". 0 console errors.
- Sample digest groups Shipped(5)/In Progress(4)/Blocked(2)/Backlog(3) by assignee, with a Group-by: Assignee/Epic toggle. Clean carry-over + unmapped-status handling.
- SAVE snapshot → strip shows "Saved on this device · Week of Mon 8 Jun – Sun 14 Jun".
- ONE-DROP next week WORKS: saved snapshot, then on Weekly Status "Load different file" → week2 CSV, switched to Changes — auto-diffed with NO second upload. Diff was 100% correct: Newly Shipped(1) Build analytics dashboard, New(1) Add SSO, Unblocked(1) Fix login redirect, Newly Started(1) Design onboarding, Still Blocked(1), Carried over(8), Removed from tracker(2). Every categorization matched my edits.
- Baseline strip: "Comparing against: Week of Mon 8 Jun – Sun 14 Jun · saved just now / Saved on this device — never uploaded" + Clear + "Make this week the new baseline". Promote works (baseline became 19 Jun).
- Empty state honest: "Nothing to compare yet. Save this week as your baseline…" with demo + manual-fallback link.
- COPY counts EXACTLY honest: copied plain text + Markdown both match on-screen counts; collapsed "Carried over (8)" expands to exactly 8 lines in the copy; summary line identical. Clipboard read succeeded — paste-into-Slack ready, no env block.
- Promote → identical data shows smart "No changes detected — are these the same export?"

## Defects / confusion
1. MINOR: Right after saving the snapshot, if I open Changes while the SAME file is still loaded, it diffs the file against itself and shows phantom changes ("1 new: Audit accessibility issues" [the unmapped-status item], "12 carried over") instead of the "No changes detected — are these the same export?" message it correctly shows after promote. Self-corrects once I drop a real new file, but a PM glancing at Changes immediately after Save could briefly be misled. Inconsistent with the post-promote no-change copy.
2. MINOR: Yellow "Matched by title (less reliable) — no ID column found" is a touch alarming for a non-debugger; an Asana export has a Task ID column I'd happily map, but I wasn't nudged to.

## Why 9 not 10
The recurring flow (save → next-week one-drop → correct diff → honest copy-to-Slack) is exactly my Monday job and works flawlessly on mobile. Holding back the 10th point only for the phantom self-diff right after saving (defect 1) — fix that consistency and this is an unprompted recommend.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Right after Save, Changes shows a phantom self-diff ('1 new' = unmapped-status item) instead of 'No changes detected' until a new file is dropped", "'Matched by title (less reliable)' warning is mildly alarming and doesn't nudge me to map the Asana Task ID column"], "priorConcernsAddressed": "n/a"}
```
