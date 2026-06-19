# Round 3 — Dana (demand-gen marketer, in-audience) — REGRESSION SENTINEL

R2: advocacy 9, Value=Yes, Clarity=Yes.

ADVOCACY: 9
VALUE: Yes
CLARITY: Yes

## Split reads right?
YES. SLIPPED (1) and REOPENED (1) are now TWO distinct sections, each with its own H2
heading + own count, in the rendered DOM, the Markdown copy, AND the plaintext copy:
- DOM headings: ...NEWLY BLOCKED (1), SLIPPED (1), REOPENED (1), NEW THIS PERIOD (4)...
- Slipped (1) = "Design onboarding flow (Alice)"; Reopened (1) = "Write API docs (Dave)".
They no longer share a count. As a stakeholder reader these are genuinely two different
stories — "a date moved" vs "we thought it was done and it came back" — and they should
never have been one bucket. The split reads correctly to me. No merge artifact remains.

## Count honesty (re-verified, both copies compared)
Prose one-liner = "3 shipped, 1 started, 1 newly blocked, 1 unblocked, 1 slipped, 1
reopened, 4 new, 1 still blocked, 2 carried over, 1 removed" → digits sum 16.
- Markdown copy: 16 bullet rows; heading counts sum 16.
- Plaintext copy: 16 bullet rows; heading counts sum 16.
- Rendered DOM heading counts (incl. collapsed Carried-over/Still-blocked): sum 16.
All five views agree at 16, and the two copies are byte-for-byte equivalent in structure
(only ## vs plain heading, - vs •). Slipped=1 and Reopened=1 hold in every view. PASS.

## No regression
- Copy bar: pinned `fixed bottom:0`. Desktop full scroll — last row "Deprecate legacy API
  (Bob)" sits fully clear above the bar, both buttons hittable, no overlap. Mobile 375px —
  bar top 717 / bottom 780 (63px), last row bottom 651, 66px clearance. No overlap.
- Value lands in one scroll: the prose one-liner (with "slipped" AND "reopened") is in the
  first viewport right under Load-sample, before any rows. Still paste-and-go.
- Weekly Status tab: intact — "This week the team shipped 5 items, has 4 in progress and 2
  blocked, with 1 carried over", grouped sections, 2 copy buttons. No regression.

## Residual (unchanged, out of scope this round)
Still hand-export two Asana CSVs (this week + last week) for the diff; no local memory of
last week's drop. The split made nothing worse — it sharpened the output. Held off a 10
only by that two-export friction, same as R2.

{"tester":"Dana","round":3,"clarity":"Yes","value":"Yes","advocacy":9,"splitReadsRight":true,"noRegression":true,"countHonest":true,"priorConcernsAddressed":"all","residual":"still hand-export two Asana CSVs; no local memory of last week"}
