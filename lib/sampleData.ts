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
