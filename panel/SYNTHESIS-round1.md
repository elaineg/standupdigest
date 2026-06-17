# StandupDigest — Panel SYNTHESIS Round 1

Feature under test: 3rd tab **"Changes"** (week-over-week diff digest). Served locally at http://localhost:3211.
Bar: AUDIENCE-WEIGHTED — in-audience personas (report compilers owing a recurring team status) must advocate at **ADVOCACY ≥ 9 with Value=Yes and Clarity=Yes**. Non-fit personas are recorded but do not gate.

## Per-tester table

| Name | In-audience? | Advocacy | Value | Clarity | The ONE thing blocking a higher score |
|------|-------------|----------|-------|---------|----------------------------------------|
| Wen | **IN-AUDIENCE** | 8 | Yes | Yes | Sticky Copy-buttons bar renders mid-list (overlaps digest) — looks half-broken, undercuts the trustworthy-output pitch |
| Tomás | **IN-AUDIENCE** | 8 | Yes | Yes | Wants one run on his own messy real Jira export; "Slipped / Reopened" merges two distinct events into one count |
| Dana | **IN-AUDIENCE** | 8 | Yes | Yes | Digest payoff sits below the dropzone — one scroll down on every repeat use; wants last week's export remembered |
| Elena | **IN-AUDIENCE** | 8 | Yes | Yes | Hasn't fed her own real Linear export yet; sticky Copy buttons overlap a digest row on mobile scroll |
| Sam | **IN-AUDIENCE** | 8 | Yes | Yes | Only validated on sample data, unproven on real Asana CSV w/ custom fields; sticky Copy bar overlaps on mobile |
| Aisha | non-fit | 7 | Marginal | Yes | Prose summary surfaces only 4 of 9 categories (drops unblocked/removed/still-blocked) — reads partial; not her workflow |
| Marcus | non-fit | 6 | Marginal | Yes | Pure audience fit — reports up, no team to aggregate |
| Priya | non-fit | 4 | No | Yes | Audience fit — IC who writes own Slack bullets; no recurring compile job |
| Jules | non-fit | 3 | No | Yes | Workflow non-fit — no tracker export; lives in Notion/Buffer |
| Rob | non-fit | 2 | No | Yes | Workflow non-fit — solo freelance designer, no team/tracker |

## In-audience tally

In-audience personas (5): **Wen, Tomás, Dana, Elena, Sam**.
At bar (Advocacy ≥ 9, Value=Yes, Clarity=Yes): **0 / 5**.
All five are clustered at **8** with Value=Yes and Clarity=Yes — a tight, consistent near-miss, not a scatter. Not a single in-audience persona reached 9.

Non-fit personas (5): Marcus, Priya, Jules, Rob, Aisha — recorded, do not gate. All confirm clarity=Yes and trustworthy output; their low advocacy is audience fit, not quality.

## Count-honesty / copy-cue check (this app's historical weak point)

**PASS — clean across all 10 testers.** Every tester independently copied both Markdown and plaintext and inspected the clipboard. The prose summary ("3 shipped, 1 newly blocked, 2 slipped, 4 new") reconciles with the section headers, the on-screen rows (including collapsed Carried-over / Still Blocked / Removed sections), AND both copied formats — byte-for-byte. Wen (the data-hygiene skeptic) also crafted her own prior/current CSVs and confirmed correct bucketing keyed on the issue Key column, so renamed rows don't fake adds/removes. No count mismatch anywhere. Weekly Status tab: no regression reported by anyone.

## Single most-common NAMED defect blocking in-audience advocacy

**Sticky "Copy Markdown / Copy plain text" button bar renders floating in the MIDDLE of the digest list, overlapping rows, instead of pinned at the bottom.**

- Reported by 7 of 10 testers (Wen, Tomás, Jules, Rob, Elena, Sam saw it; Marcus/Dana/Aisha inspected and called it a `sticky bottom-0` footer that only *looks* broken in a full-page screenshot).
- Repro: Changes tab → "Load sample data" → on a tall digest (desktop ~1280–1440px AND mobile scroll), the Copy bar wedges between the "SLIPPED / REOPENED (2)" section and its "(Dave)" row, splitting the section. Functions correctly; copied content is correct. Pure layout/CSS.
- Why it gates: in-audience testers explicitly tie it to the trust pitch ("looks half-broken... undercuts the trustworthy-output pitch" — Wen). It is the most-cited blocker on otherwise-9-ready verdicts.

Secondary named defect (2 mentions, Aisha + aligns w/ count-legibility): **prose summary surfaces only 4 of the 9 change categories** (shipped/blocked/slipped/new), silently omitting Unblocked / Newly Started / Still Blocked / Carried-over / Removed — reads as a partial summary even though section counts are all correct.

Tertiary (Dana): digest payoff sits below the dropzone after load — push the digest to the top once files are loaded so the value lands without a scroll.

## Verdict

**NOT A PASS — needs another round.** 0/5 in-audience at the bar; all five at a consistent Advocacy 8 / Value Yes / Clarity Yes. Fix the floating Copy-bar layout (primary, 7 mentions) and expand the prose summary to cover all populated categories (secondary); that addresses the named blockers keeping the five compilers off 9.
