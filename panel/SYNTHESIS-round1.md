# standupdigest — Panel SYNTHESIS round 1

Feature under test: "Remember last week" — save device-local snapshot of this week's digest → Changes tab auto-diffs a freshly dropped CSV against it (one-drop, no second upload). Baseline strip ("saved on this device — never uploaded") + pick-different/clear/promote + honest "nothing to compare yet" empty state.

URL: http://localhost:3211 (local prod server; no Vercel touch)

## Per-tester table

| Name   | In-aud? | Value | Clarity | Advocacy | One-line reason |
|--------|---------|-------|---------|----------|-----------------|
| Wen    | YES     | Yes   | Yes     | 9        | Removes her weekly two-export hand-diff; flow + counts + mobile all correct |
| Tomás  | YES     | Yes   | Yes     | 8        | Replaces 30-40min Excel chore; but same-session save→Changes self-compares ("No changes detected"), hides dropzone |
| Dana   | YES     | Yes   | Yes     | 8        | Real Friday recurring hook; nits: title-match warning + Changes tab has no dropzone |
| Elena  | YES     | Yes   | Yes     | 9        | Saves the worst part of her Friday; flawless canonical path, honest copy, mobile clean |
| Sam    | YES     | Yes   | Yes     | 9        | His Monday job; one-drop + copy-to-Slack flawless; phantom self-diff before promote costs the 10th pt |
| Priya  | no      | No    | Yes     | 5        | Non-fit (writes own bullets); verified network=zero-upload, counts byte-exact |
| Marcus | no      | No    | Yes     | 8        | Non-fit but slick; flags Changes tab missing a drop target |
| Jules  | no      | No    | Yes     | 4        | Non-fit (content, not tracker); well-built, trustworthy |
| Aisha  | no      | No    | Yes     | 7        | Craft considered, BUT "compare different export" path inverts diff direction + phantom assignee |
| Rob    | no      | No    | Yes     | 4        | Non-fit (solo freelancer, no team tracker); two Clear controls behave differently |

## In-audience tally at the bar (≥9, Value=Yes, Clarity=Yes)

In-audience compilers = Wen, Tomás, Dana, Elena, Sam.

- Wen — 9 ✓ AT BAR
- Tomás — 8 ✗ below
- Dana — 8 ✗ below
- Elena — 9 ✓ AT BAR
- Sam — 9 ✓ AT BAR

**3/5 at bar → NOT-PASS** (need 5/5). All 5 have Value=Yes + Clarity=Yes; only advocacy gates.

## Grouped named defects (ranked by impact on in-audience)

### D1 — Same-session save→Changes shows a phantom/empty self-diff and hides the drop zone (HIGHEST IMPACT)
The one defect that holds Tomás (8), Dana (8), and Sam (the 10th pt) — and also raised by Elena & Marcus.
Symptom: right after Save, opening Changes with this week's CSV still loaded auto-compares the file against its own snapshot → either "No changes detected — are these the same export?" (Tomás/Elena) or a phantom self-diff like "1 new" from an unmapped-status row (Sam). The Changes tab has no drop target, so the headline "one drop" promise looks broken until the user reloads/clears and loads next week's file. The real one-drop path currently routes through Weekly Status "Load different file," which is non-obvious (Dana, Marcus).
Personas: Tomás, Dana, Sam, Elena, Marcus.
Fix: Put a dedicated "drop next week's export" target ON the Changes tab itself so the one-drop is in-place and self-evident; and when the still-loaded current file equals the saved snapshot, show an instructive "drop next week's export to see changes" prompt instead of a self-diff or a "no changes" dead-end.

### D2 — "Compare to a different export instead" fallback path inverts the diff direction + drops the privacy line (CORRECTNESS / TRUST)
Raised by Aisha (non-fit, non-gating, but it's a real correctness bug). On the manual fallback path, an ADDED row showed as "REMOVED FROM TRACKER," a Blocked→In Progress item showed as "NEWLY BLOCKED," and the baseline strip silently lost its "never uploaded" reassurance. A status tool's whole value is trustworthy direction. Should be fixed alongside D1 since it lives in the same compare surface.

### D3 — Two "Clear" controls behave differently (CONSISTENCY)
Rob (non-fit): the Changes baseline-strip "Clear" didn't reset the loaded current export (dropzone never returned); only the Weekly Status toolbar "Clear" did. Confusing dual-affordance; align both.

### D4 — "Matched by title (less reliable) — no ID column found" warning reads alarming (COPY / TRUST, minor)
Dana, Elena, Juls flagged the wording dents diff trust for a first-timer. Soften copy / explain it's expected when the export lacks an ID column.

### D5 — Phantom "(Bob)" assignee on an unassigned item (DATA CORRECTNESS, minor)
Aisha. An item with no assignee rendered an assignee. Verify assignee parsing.

### D6 — Copy buttons are `<span>`s not real buttons (A11Y, minor)
Priya. Keyboard/screen-reader reachability.

## Fix plan (target the bar: get Tomás, Dana, Sam to ≥9)

1. **D1 (gating):** Add an in-place drop target on the Changes tab + replace the same-session self-compare with an instructive "drop next week's export" state. This is the single highest-impact fix — it directly lifts Tomás, Dana, and Sam, and the headline one-drop promise becomes self-evident. Wen/Elena already at 9 are unaffected.
2. **D2:** Fix diff-direction inversion + restore the "never uploaded" line on the "compare different export" fallback path (same compare surface as D1; correctness).
3. **D3:** Unify the two Clear controls.
4. **D4 / D5 / D6:** Copy softening, assignee parsing, button semantics — quick polish, fold in if cheap.

## Verdict

**NOT-PASS — 3/5 in-audience at the bar.** Single highest-impact named defect blocking the in-audience personas: **D1 — same-session save→Changes self-compares and the Changes tab has no in-place drop target, so the "one drop, no second upload" promise looks broken until a reload.** Fixing D1 (with D2 alongside) should lift Tomás, Dana, and Sam to 9 for a 5/5 pass.
