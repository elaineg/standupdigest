# StandupDigest — Panel Round 2 Synthesis (delta re-test)

App served locally at http://localhost:3210 (next start prod build). Round 2 re-tested 6 personas
(Wen, Tomás, Dana, Sam — IN-AUDIENCE gating; Marcus, Aisha — NON-FIT, bug-confirm only). Elena,
Priya, Jules, Rob carried from round 1.

## Audience-weighted ship bar
Bar = **all 5 IN-AUDIENCE personas (Wen, Tomás, Dana, Sam, Elena) at advocacy ≥9 with clarity=Yes &
value=Yes.** NON-FIT personas do not gate.

## Score table (all 10)

| Persona | In-audience? | Clarity | Value    | Advocacy | Round | Δ vs R1 |
|---------|--------------|---------|----------|----------|-------|---------|
| Wen     | IN-AUDIENCE  | Yes     | Yes      | **9**    | R2    | 6 → 9 ✅ |
| Tomás   | IN-AUDIENCE  | Yes     | Yes      | **9**    | R2    | 8 → 9 ✅ |
| Dana    | IN-AUDIENCE  | Yes     | Yes      | **8**    | R2    | 8 → 8   |
| Sam     | IN-AUDIENCE  | Yes     | Yes      | **8**    | R2    | 8 → 8   |
| Elena   | IN-AUDIENCE  | Yes     | Yes      | 9        | R1 (carried) | — |
| Priya   | NON-FIT      | Yes     | No       | 5        | R1 (carried) | — |
| Marcus  | NON-FIT      | Yes     | No       | **4**    | R2    | 5 → 4 ⬇ |
| Jules   | NON-FIT      | Yes     | No       | 6        | R1 (carried) | — |
| Aisha   | NON-FIT      | Yes     | No       | **8**    | R2    | 6 → 8 ✅ |
| Rob     | NON-FIT      | Yes     | No       | 4        | R1 (carried) | — |

**IN-AUDIENCE passing at adv≥9 / clarity=Yes / value=Yes: 3 of 5** (Wen 9, Tomás 9, Elena 9).
Sub-bar in-audience: **Dana 8, Sam 8** (both value=Yes, fixable in-scope friction).

## Round-1 blocker resolution (in-audience)

| R1 blocker (cause group) | Tester(s) | Resolved in R2? | Evidence |
|--------------------------|-----------|-----------------|----------|
| A. Title-column silent miss / no Remap entry / false "All statuses recognized ✓" | Wen | **YES** | Amber banner auto-opens on column-NAME miss; Title shows `(none)` not silent "(untitled)"; persistent Remap; false ✓ gone. |
| B. Phantom `(Bob)` in copy; grouping not honored in copy | Wen, Dana, Aisha | **YES** | Copied MD + plain text exactly match screen; epic grouping preserved (`### Checkout v2`) in both copy formats (Aisha clipboard-verified). |
| C. Sticky copy bar occludes/splits digest | Tomás, Aisha, Sam | **YES** | Opaque bg, bottom-pinned, no bleed-through over BLOCKED/BACKLOG/UNMAPPED at any scroll; pinned on mobile. |
| D. Week filter / week-over-week delta / "week of <date>" stamp | Elena(carried), Dana, Sam | **YES** | "Week:" selector defaults to recent week + "All dates"; re-filters counts; carry-over rows stay flagged under a specific week; date baked into prose. |
| E. Editable one-line prose summary | Sam | **PARTIAL** | Edit works and flows verbatim into both copy formats, BUT the Edit affordance is `opacity:0`-until-hover → invisible/unreachable on touch/mobile. |

## Remaining complaints behind a SUB-BAR IN-AUDIENCE score, grouped by cause

### 1. Real-export header auto-detect still misses common non-"Title" headers — IN-AUDIENCE (Dana, holds 8 not 9) — NOT fully resolved
Dana uploaded a real Asana export with header `Task Name`; auto-detect did NOT map it, so every task
rendered "(untitled)" until she manually used Remap. The round-1 fix added the amber banner + Remap
recovery path (well-signposted, recoverable — that's why she didn't drop further), but the recovery is
a manual step that breaks her "value in one scroll" bar. **In-scope, fixable:** broaden title-column
auto-detection synonyms (Task Name / Summary / Name / Item / Subject) so common tracker exports
auto-map without a manual remap. (Same class as Wen's R1 blocker, just at the auto-detect layer rather
than the no-recovery layer.)

### 2. Editable prose Edit control is hover-gated → invisible on mobile — IN-AUDIENCE (Sam, holds 8 not 9) — PARTIAL
The marquee new feature (edit the VP sentence) works and round-trips into copy on desktop, but the Edit
button is `opacity:0` until hover, so on Sam's primary device (mobile) it's effectively absent and there's
no editable field before the click. **In-scope, fixable:** make the Edit affordance always-visible (or a
persistent control) on touch/small viewports.

### Minor / park-able (non-gating)
- **Tomás:** landing subtitle still says "paste into Slack"; he's a Teams shop (held off 10, but he's at 9). Genericize destination wording.
- **Wen:** wants CSV-out of categorized rows to diff against source (10-not-9 nice-to-have).
- **Dana:** redundant on-screen `(Sam)` parens when grouped by assignee (screen-only nit; copy is clean).

## NON-FIT findings (do NOT gate)
- **Aisha (NON-FIT, 6 → 8):** both her R1 craft issues (copy-bar occlusion, epic grouping not honored in
  copy) genuinely fixed; advocacy capped only on audience fit.
- **Marcus (NON-FIT, 5 → 4):** confirms a REAL in-scope correctness bug is **NOT resolved**. The R2 fix
  only triggers the banner/auto-open on a column-NAME detection MISS. For a GitHub export
  (`Title,State,Labels,Assignee`) auto-detect maps the column names correctly, so no banner fires — but
  the VALUE mapping is wrong: all `open` issues dump to BACKLOG (In Progress 0, Blocked 0), `blocked`
  labels are ignored, and the green "All statuses recognized ✓" STILL shows on this wrong output. This is
  a value-level mapping defect (open→In Progress, blocked-label→Blocked), not a column-name miss, so
  nothing shipped addresses it. GitHub Issues is advertised on the landing page. NON-FIT so non-gating,
  but it is a genuine correctness/trust defect against an advertised input and should be fixed or the
  GitHub claim dropped.

## Recommendation: **FIX with named changes** (do NOT ship yet)

3 of 5 in-audience clear adv≥9 (Wen, Tomás, Elena). Two in-audience holdouts (Dana 8, Sam 8) are
value=Yes with FIXABLE in-scope complaints — not NON-FIT, not out-of-scope. Round-2 fix list:

1. **Broaden title-column auto-detect synonyms** (Task Name / Summary / Name / Item / Subject / Card) so
   common Asana/Jira exports auto-map the title without a manual Remap step. — lifts **Dana** to 9.
2. **Make the prose-summary Edit affordance always-visible on touch/small viewports** (no hover gate). —
   lifts **Sam** to 9.
3. **(Non-gating but real)** Fix GitHub-export VALUE mapping: `State` open→In Progress / closed→Shipped,
   `blocked` label→Blocked; and don't show "All statuses recognized ✓" when rows fall through to Backlog
   from an unrecognized status value. Or drop GitHub from advertised inputs. — Marcus's bug; trust on an
   advertised path.

After (1) and (2), all 5 in-audience should clear adv≥9 → ship.
