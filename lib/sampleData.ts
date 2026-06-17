// Sample CSV matching the EXACT known counts from APP_SPEC.md:
// Shipped: 5, In Progress: 4, Blocked: 2, Backlog: 3
// Assignee "Sam" under exactly 3 items
// Epic "Checkout v2" with exactly 4 items
// Exactly 1 carry-over (last updated >7 days ago, still In Progress)
// 1 row with status "Needs Triage Review" → Unmapped
// Total: 5+4+2+3+1 = 15 rows
//
// Sprint Review (Sprint 24 = most recent):
// Sprint 24 committed rows (no Removed date): 7 rows
//   Shipped in Sprint 24: Launch(5) + FixCart(3) + AddPromo(8) + ReleaseBilling(5) = 21 pts, 4 issues
//   Open in Sprint 24 (spillover): BuildAnalytics(5) + ReviewAPI(3) + DeployStaging(5) = 13 pts, 3 issues
//   Total committed: 34 pts, 7 issues
// Sprint 24 removed (Removed date set): UpdateOrderEmail(2 pts) → −2 pts / 1 issue removed
// Sprint 24 added (Added date set): FixCart(Added=2026-06-08) + ReleaseBilling(Added=2026-06-10) → +8 pts / 2 issues added
// Sam in Sprint 24: Launch(5) + AddPromo(8) + BuildAnalytics(5) = 18 pts, 3 issues
// Spillover: 3 issues still open at sprint end

export const SAMPLE_CSV = `Title,Status,Assignee,Epic,Updated,Sprint,Story Points,Added,Removed
Launch payment flow,Done,Sam,Checkout v2,2026-06-10,Sprint 24,5,,
Fix cart total bug,Resolved,Alice,Checkout v2,2026-06-11,Sprint 24,3,2026-06-08,
Add promo code support,Completed,Sam,Checkout v2,2026-06-12,Sprint 24,8,,
Update order confirmation email,Done,Bob,Checkout v2,2026-06-09,Sprint 24,2,,2026-06-09
Release billing reports,Merged,Carol,Finance,2026-06-13,Sprint 24,5,2026-06-10,
Build analytics dashboard,In Progress,Sam,Analytics,2026-06-14,Sprint 24,5,,
Review API endpoints,In Review,Alice,Platform,2026-06-13,Sprint 24,3,,
Deploy staging environment,In Dev,Dave,Platform,2026-06-14,Sprint 24,5,,
Migrate old orders,In Progress,Eve,Finance,2025-01-01,Sprint 23,3,,
Fix login redirect,Blocked,Bob,Auth,2026-06-12,Sprint 23,2,,
Investigate memory leak,Blocked,Carol,Platform,2026-06-11,Sprint 23,4,,
Design onboarding flow,To Do,Alice,Onboarding,2026-06-10,Sprint 22,3,,
Write API docs,Backlog,Dave,Platform,2026-06-09,Sprint 22,1,,
Plan Q3 roadmap,New,Eve,Strategy,2026-06-08,Sprint 22,2,,
Audit accessibility issues,Needs Triage Review,Bob,UX,2026-06-13,Sprint 22,0,,
`;

// Verification (Weekly Status — unchanged):
// Shipped (Done/Resolved/Completed/Merged): rows 1,2,3,4,5 = 5 ✓
// In Progress (In Progress/In Review/In Dev): rows 6,7,8,9 = 4 ✓
// Blocked: rows 10,11 = 2 ✓
// Backlog (To Do/Backlog/New): rows 12,13,14 = 3 ✓
// Unmapped ("Needs Triage Review"): row 15 = 1 ✓
// Sam: row1(Shipped), row3(Shipped), row6(In Progress) = 3 ✓
// Checkout v2: rows 1,2,3,4 = 4 ✓
// Carry-over (old date, In Progress): row 9 (Migrate old orders, 2025-01-01) = 1 ✓
// Total rows: 15 ✓
//
// Verification (Sprint Review — Sprint 24):
// Sprint 24 rows: rows 1-8 (8 total)
// Sprint 24 committed (no Removed): rows 1,2,3,5,6,7,8 = 7 rows, 34 pts
// Sprint 24 shipped (committed, Shipped bucket): rows 1,2,3,5 = 4 issues, 21 pts ✓
// Sprint 24 spillover (committed, open): rows 6,7,8 = 3 issues ✓
// Scope added (Added date in Sprint 24): rows 2,5 = 3+5 = 8 pts, 2 issues ✓
// Scope removed (Removed date): row 4 = 2 pts, 1 issue ✓
// Sam in Sprint 24 (committed): rows 1,3,6 = 5+8+5 = 18 pts, 3 issues ✓

// ---- Changes tab sample data ----
//
// The Changes tab uses its own SEPARATE current+prior pair so that the transition oracle
// (APP_SPEC §"PRIOR-WEEK SAMPLE ORACLE") can be satisfied without altering SAMPLE_CSV
// (which must keep Shipped=5, InProgress=4, Blocked=2, Backlog=3 for SC1).
//
// CHANGES_CURRENT_CSV: 15 rows with stable Issue Key column (ENG-1..15).
//   Key assignments chosen so the oracle transitions are achievable:
//   Shipped: ENG-1,2,3,4,5
//   In Progress: ENG-6,7,8,9,14  (5 rows; ENG-14 is In Progress here for "Unblocked" transition)
//   Blocked: ENG-10,11
//   Backlog/Todo: ENG-12,13       (only 2 in this sample; SC1 is for SAMPLE_CSV, not this)
//   Unmapped: ENG-15
//   Total: 5+5+2+2+1 = 15 rows ✓ (every current row lands in exactly one bucket)
//
// CHANGES_PRIOR_CSV: 14 rows (ENG-1..14) + 1 prior-only row (ENG-99).
//   Dates one ISO week earlier (2026-06-01..07 vs current 2026-06-08..14).
//   ENG-11 prior date = 2026-05-01 (>2 wks before current max 2026-06-14) → "blocked 2+ wks".
//
// Transition oracle (updated — Slipped and Reopened are now separate buckets):
//   Newly Shipped:        ENG-1,2,3  (In Progress prior → Shipped now)         = 3
//   Newly Started:        ENG-6      (Backlog prior → In Progress now)          = 1
//   Newly Blocked:        ENG-10     (In Progress prior → Blocked now)          = 1
//   Unblocked:            ENG-14     (Blocked prior → In Progress now)          = 1
//   REOPENED:             ENG-13     (Shipped/Done prior → Backlog now)         = 1
//   SLIPPED:              ENG-12     (Blocked prior → To Do now)                = 1
//   New this period:      ENG-4,5,9,15 (absent from prior)                     = 4
//   Still Blocked:        ENG-11     (Blocked in both, prior ≥2wks)            = 1
//   Carried over/open:    ENG-7,8    (In Progress in both)                     = 2
//   Removed from tracker: ENG-99     (prior only)                              = 1
//   Total current rows: 3+1+1+1+1+1+4+1+2 = 15 ✓

export const CHANGES_CURRENT_CSV = `Issue Key,Title,Status,Assignee,Epic,Updated
ENG-1,Launch payment flow,Done,Sam,Checkout v2,2026-06-10
ENG-2,Fix cart total bug,Resolved,Alice,Checkout v2,2026-06-11
ENG-3,Add promo code support,Completed,Sam,Checkout v2,2026-06-12
ENG-4,Update order confirmation email,Done,Bob,Checkout v2,2026-06-09
ENG-5,Release billing reports,Merged,Carol,Finance,2026-06-13
ENG-6,Build analytics dashboard,In Progress,Sam,Analytics,2026-06-14
ENG-7,Review API endpoints,In Review,Alice,Platform,2026-06-13
ENG-8,Deploy staging environment,In Dev,Dave,Platform,2026-06-14
ENG-9,Migrate old orders,In Progress,Eve,Finance,2026-06-10
ENG-10,Fix login redirect,Blocked,Bob,Auth,2026-06-12
ENG-11,Investigate memory leak,Blocked,Carol,Platform,2026-06-11
ENG-12,Design onboarding flow,To Do,Alice,Onboarding,2026-06-10
ENG-13,Write API docs,Backlog,Dave,Platform,2026-06-09
ENG-14,Plan Q3 roadmap,In Progress,Eve,Strategy,2026-06-14
ENG-15,Audit accessibility issues,Needs Triage Review,Bob,UX,2026-06-13
`;

// PRIOR-WEEK CSV: ENG-1..14 (14 rows present in prior) + ENG-99 (prior-only = Removed).
// Dates one week earlier. ENG-11 is extra-old (2026-05-01) so "blocked 2+ wks" fires.
export const CHANGES_PRIOR_CSV = `Issue Key,Title,Status,Assignee,Epic,Updated
ENG-1,Launch payment flow,In Progress,Sam,Checkout v2,2026-06-03
ENG-2,Fix cart total bug,In Progress,Alice,Checkout v2,2026-06-04
ENG-3,Add promo code support,In Progress,Sam,Checkout v2,2026-06-05
ENG-6,Build analytics dashboard,To Do,Sam,Analytics,2026-06-07
ENG-7,Review API endpoints,In Review,Alice,Platform,2026-06-06
ENG-8,Deploy staging environment,In Dev,Dave,Platform,2026-06-07
ENG-10,Fix login redirect,In Progress,Bob,Auth,2026-06-05
ENG-11,Investigate memory leak,Blocked,Carol,Platform,2026-05-01
ENG-12,Design onboarding flow,Blocked,Alice,Onboarding,2026-06-03
ENG-13,Write API docs,Done,Dave,Platform,2026-06-04
ENG-14,Plan Q3 roadmap,Blocked,Eve,Strategy,2026-06-06
ENG-99,Deprecate legacy API,Done,Bob,Platform,2026-06-05
`;
