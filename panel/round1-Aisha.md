# Round 1 — Aisha (Product designer)

**In-audience:** no (judge craft primarily; not my own recurring tracker-digest need)
**Value:** No (for me) — would recommend to a PM/EM friend who runs standup, not use weekly myself
**Clarity:** Yes
**Advocacy:** 7/10

## Evidence
- Cold open clear in <5s: H1 "Turn your tracker export into a weekly status — in seconds." + "Drop a Jira, Linear, Asana, or GitHub CSV... ready to paste into Slack." Tone is tight and concrete. "Your file never leaves your browser — no upload, no signup" is exactly the reassurance I'd want, placed well.
- Digest craft is genuinely good: clear status hierarchy, the amber `carry-over` pill, the honest `UNMAPPED STATUS (1)` with a "Move to…" remap. This feels considered.
- Save→Changes→one-drop WORKS in the canonical path: loaded sample → "Save this week's snapshot" → Changes auto-diffed the loaded export against the snapshot with NO second upload. Baseline strip reads "Comparing against: Week of Mon 8 Jun – Sun 14 Jun · saved just now / Saved on this device — never uploaded" + Clear / "Make this week the new baseline" — excellent, trustworthy copy.
- Canonical diff was CORRECT: In Progress→Done = NEWLY SHIPPED; Blocked→In Progress = UNBLOCKED; To Do→In Progress = NEWLY STARTED; brand-new row = NEW THIS PERIOD. The labels are well-named.
- Empty state is the standout: "Nothing to compare yet." + plain-language loop explanation + demo button + escape hatch. Considered, not a dead end.
- Counts honest: copied plain text summary line + every section count == on-screen (1 newly blocked, 1 slipped, 1 reopened, 1 still blocked, 11 carried over, 1 removed). (Clipboard read worked in-test.)
- Mobile 375px: tabs wrap to 2 lines cleanly, baseline strip + buttons stack, warning wraps, no overflow. Good mobile craft.

## Defects
1. **Diff direction INVERTS on "Compare to a different export instead" path.** Dropping next-week's CSV there treats the DROP as old and the SNAPSHOT as new: a row I added ("Add dark mode") showed under "REMOVED FROM TRACKER"; Blocked→InProgress showed as "NEWLY BLOCKED." Backwards and misleading — and the baseline strip silently degrades to "Comparing against: loaded export," dropping the "never uploaded" reassurance. (P1)
2. **Phantom assignee.** "Audit accessibility issues" has NO assignee in the source, but the auto-diff labeled it "(Bob)". Wrong attribution in a status doc people paste to a team. (P2)
3. Two valid ways to feed "this week" (Load different file vs the alt-export drawer) behave differently and one is wrong — the dual path is a craft smell; should be one obvious flow.

## Why 7 not higher
Core loop, copy tone, empty state, and mobile are all genuinely considered — I'd advocate at 8–9 if the alt-export path weren't inverted and the assignee weren't fabricated. A status tool that ever shows a backwards diff or a wrong name loses the trust this category lives on. Fix those two and I'd bring it up to PM friends unprompted.

```json
{"tester": 0, "round": 1, "clarity": "Yes", "value": "No", "advocacy": 7, "topComplaints": ["'Compare to a different export' path inverts diff direction (added row shows as Removed; unblocked shows as Newly Blocked) and drops the 'never uploaded' line", "Phantom assignee '(Bob)' on an unassigned item in the diff", "Two ways to load 'this week' behave inconsistently — one produces a wrong diff"], "priorConcernsAddressed": "n/a"}
```
