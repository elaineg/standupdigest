# StandupDigest — Panel Report: "Changes since last week" (3rd tab, compare mode)

Feature under test: 3rd tab **"Changes"** — a week-over-week diff digest (load last-week +
this-week tracker exports → bucketed change summary + prose + copy-to-clipboard).
Tested locally at http://localhost:3211. Shipped to prod https://standupdigest.vercel.app.

## Bar — audience-weighted

Only the **5 in-audience compilers** (people who own a recurring team status they must
aggregate) gate the ship; they must advocate at **ADVOCACY ≥ 9 with Value=Yes and
Clarity=Yes**:

- **Wen** (data-hygiene analyst), **Tomás** (ops analyst), **Dana** (compiler/manager),
  **Elena** (EM), **Sam** (PM).

The **5 non-fits are carried, non-gating** (recorded each round, never re-spawned after R1):

- Aisha 7, Marcus 6, Priya 4, Jules 3, Rob 2 — low advocacy is pure audience fit (IC
  engineers report UP rather than compile; designers/content-marketers have no tracker
  export), NOT a quality or clarity deduction (all confirmed Clarity=Yes).

The bar was declared up front in every SYNTHESIS header. This is the standard ship gate for
narrow-but-deep compiler tools (StandupDigest's 3rd ship via the audience-weighted bar).

## Per-round arc — a real PASS (every cap was a fixable in-audience defect, not roster/scope)

| Round | In-audience at bar | What moved it |
|-------|--------------------|----------------|
| R1 | **0 / 5** (all five clustered at adv 8, Value=Yes, Clarity=Yes) | Two named defects: (1) sticky Copy bar floated MID-LIST overlapping digest rows — "looks half-broken, undercuts the trustworthy-output pitch" (7/10 testers saw the real overlap; the validator's full-page screenshot missed it); (2) prose summary named only 4 of 9 change categories — read partial. |
| R2 | **4 / 5** (Wen, Dana, Elena, Sam → 9; Tomás holds 8) | Copy bar re-pinned with `fixed bottom-0` (no overlap, desktop 1280px + mobile 375px); prose expanded to name all 9 non-zero buckets. Both defects unanimously resolved; count-honesty held (16/16/16/16 byte-aligned). Tomás's distinct, in-scope blocker surfaced: the "Slipped / Reopened" bucket merged two semantically distinct stakeholder events under one heading + one count. |
| R3 | **5 / 5** — PASS | "Slipped / Reopened" SPLIT into two separate buckets ("Slipped (1)" + "Reopened (1)"), each its own heading + count. Tomás 8→9; the four prior passers re-tested as sentinels (shared-output change to the digest) confirmed no regression — counts still byte-aligned, copy bar still pinned, Weekly Status intact, 0 console errors. |

Arc: **0/5 → 4/5 → 5/5.** Every cap along the way was a FIXABLE in-audience defect, so the
weighted bar correctly converged to a genuine PASS — contrast with a PARK (where the remaining
holdouts are unmovable roster/scope floors). The Slipped/Reopened merge was a real
product-clarity defect a compiler (Tomás) caught.

## Final per-tester verdicts (Round 3)

In-audience (gating):

| Name | Advocacy | Value | Clarity | Note |
|------|----------|-------|---------|------|
| Wen   | 9 | Yes | Yes | Split = two distinct H2 sections + counts in DOM and both copy formats; counts byte-aligned; copy bar pinned desktop+mobile; 0 console errors. |
| Tomás | 9 | Yes | Yes | Sole blocker (merged bucket) RESOLVED; items correctly classified, not relabeled; "I'll run my real Jira export Monday with confidence." |
| Dana  | 9 | Yes | Yes | Two distinct stakeholder stories; prose one-liner lands in first viewport; copy bar clear desktop + 66px clearance mobile. |
| Elena | 9 | Yes | Yes | No regression incl. her original mobile copy-bar blocker — `fixed` bar, 0 row overlap at 375px, buttons hittable. |
| Sam   | 9 | Yes | Yes | No regression incl. his original mobile blocker — bar topmost at full scroll, rows scroll underneath; copied MD/plaintext sets match visible rows. |

**At bar: 5/5. Below bar: none.**

Non-fits (carried, non-gating): Aisha 7, Marcus 6, Priya 4, Jules 3, Rob 2.

## Count-honesty (this app's #1 historical defect) — PASS, clean from build #1

Across all three rounds: prose total (16) == on-screen header/badge counts (16) == copied
Markdown bullets (16) == copied plaintext bullets (16), byte-aligned. The R3 split added no
double-count and dropped nothing; each new bucket carries exactly one correct bullet in DOM,
Markdown, and plaintext. The single `computeChanges` model feeding prose + buckets + copy held
the arithmetic honest from the first build. Weekly Status tab: no regression any round.

## Residual non-gating, out-of-scope notes (none affect count-honesty or the ship)

- Real-export-not-run (Tomás/Elena/Sam would run their own Jira/Linear/Asana export "Monday").
- Dana still hand-exports two Asana CSVs; no local memory of last week.
- Default-collapsed sections (Carried over, Still Blocked) need a click to reveal bodies —
  but rows ARE present in both copy formats with matching counts.

These keep some testers off a perfect 10 but are out-of-scope residuals, not defects. **Ship
verdict: PASS, 5/5 in-audience.**
