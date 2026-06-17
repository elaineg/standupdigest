# StandupDigest — Panel Synthesis, Round 1 (run 20260616-010023-daily)

## 1. Score table

| Tester | Role | Audience | Clarity | Value | Advocacy |
|--------|------|----------|---------|-------|----------|
| Sam   | Product manager            | in-audience  | Yes | Yes | 8 |
| Elena | Engineering manager        | in-audience  | Yes | Yes | 8 |
| Wen   | Marketing data analyst     | in-audience  | Yes | Yes | 8 |
| Tomás | Operations analyst         | in-audience  | Yes | Yes | 8 |
| Dana  | Demand-gen marketer        | non-fit*     | Yes | Yes | 8 |
| Marcus| Frontend engineer (IC)     | non-fit      | Yes | No  | 6 |
| Priya | Senior backend engineer(IC)| non-fit      | Yes | No  | 5 |
| Aisha | Product designer           | non-fit      | Yes | No  | 6 |
| Jules | Content/community marketer  | non-fit      | Yes | No  | 4 |
| Rob   | Brand/visual designer      | non-fit      | Yes | No  | 2 |

\*Dana is a non-fit by role, but uses the Weekly Status tab on a real Asana export weekly, has value=Yes, and reproduced the inline-edit bug — carry her into round 2 as the bug verifier.

## 2. Audience-weighted bar status

The 4 in-audience compilers (Sam, Elena, Wen, Tomás) must each reach advocacy ≥9.
Current: **all four at 8**. Gap: **+1 each** to clear the bar. No in-audience tester is below 8, so the bar is within reach if the recurring blockers are fixed.

## 3. Complaints grouped by cause

### A. Velocity / by-assignee number honesty — IN-AUDIENCE RECURRING (Sam, Wen, Tomás; Elena adjacent)
The "committed" denominator (34) is just sum-of-all-sprint-points, and BY ASSIGNEE shows committed points (totaling 34) not shipped, so it doesn't reconcile with the velocity headline (21 shipped). A stakeholder skimming "Sam — 18 pts" reads it as 18 delivered.
- Sam: label denominator honestly or expose a commitment marker.
- Wen: split by-assignee shipped-vs-committed ("Sam — 12 of 18 pts shipped").
- Tomás: add a "velocity = done / committed" tooltip.
- Elena: word "committed"/"completed" not used verbatim — ambiguous for skim-readers.
**This is the primary path-to-9 for the in-audience group.**

### B. Sample-data self-consistency — IN-AUDIENCE (Tomás; noted by Wen/Sam as benign)
Sprint 23 shows 0 pts shipped yet lists per-assignee points + spillover, which briefly made Tomás distrust the math. Relabel/fix the sparse Sprint 23 sample so it's obviously self-consistent.

### C. Inline-edit commit bug — IN-AUDIENCE-ADJACENT (Dana reproduced 3x; Tomás couldn't confirm)
Edited line stays trapped in the input, never commits to the rendered digest or copy output, and the Copy buttons become unreachable (a second empty input appears on top). Tomás couldn't confirm the edit→copy round trip. **Likely shared root cause with D** — the overlapping sticky bar may intercept the click/blur that commits the edit. Also: Enter doesn't commit (Wen, Aisha hit Enter, thought it broken) — accept Enter as well as Save.

### D. Sticky copy-bar overlap — CSS, BROAD (Sam minor/mobile; Priya, Marcus, Aisha, Rob)
The fixed bottom Copy bar overlaps the last BY-ASSIGNEE rows / Blocked section. Fix: solid background + bottom padding on the scroll container so content clears it. (Cheap, broad-impact, and may unblock the edit bug.)

### E. Audience non-fit / out-of-scope — DO NOT treat as build defects
- Priya, Marcus: IC engineers who report UP, not sprint-review owners.
- Jules: content marketer, no tracker/story points.
- Aisha, Rob: designers, no sprints/CSV.
- Elena's only path-to-9 ask is a paste-from-tracker input — out of scope (mapping is already remembered; file-drop is the supported path).
These cap advocacy by role, not by fixable defects.

## 4. Recommendation

**Fix (in-audience-blocking), ranked:**
1. **A — Velocity/by-assignee honesty**: label denominator ("of 34 pts in sprint"), split by-assignee into shipped-of-committed ("Sam — 12 of 18 pts shipped"), add a velocity tooltip. (Hits 3-4 in-audience testers; the main +1.)
2. **D — Sticky copy-bar overlap**: solid bg + bottom padding. (Broad, cheap, likely unblocks C.)
3. **C — Inline-edit commit bug**: Save (and Enter) must commit into rendered digest + both copy outputs, then return to static display; ensure Copy buttons stay reachable. (Trust-critical; Dana's value gate.)
4. **B — Sprint 23 sample self-consistency**: relabel/fix the 0-shipped-with-points sample.

**Re-test in round 2:** the 4 in-audience compilers (Sam, Elena, Wen, Tomás) + Dana (verifies the edit-bug fix, value=Yes).
**Carry forward unchanged:** the 5 audience non-fits (Marcus, Priya, Aisha, Jules, Rob) — no build fix changes their role mismatch.
