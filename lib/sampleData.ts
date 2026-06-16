// Sample CSV matching the EXACT known counts from APP_SPEC.md:
// Shipped: 5, In Progress: 4, Blocked: 2, Backlog: 3
// Assignee "Sam" under exactly 3 items
// Epic "Checkout v2" with exactly 4 items
// Exactly 1 carry-over (last updated >7 days ago, still In Progress)
// 1 row with status "Needs Triage Review" → Unmapped
// Total: 5+4+2+3+1 = 15 rows

// We'll use a fixed past date (2025-01-01) for carry-over detection
// and recent dates for everything else.
// The carry-over row will have an old date AND be "In Progress" status
// so its bucket=In Progress but flagged carry-over.
// Count check: In Progress=4 includes the carry-over row (carry-over is a flag, not a bucket override).

export const SAMPLE_CSV = `Title,Status,Assignee,Epic,Updated
Launch payment flow,Done,Sam,Checkout v2,2026-06-10
Fix cart total bug,Resolved,Alice,Checkout v2,2026-06-11
Add promo code support,Completed,Sam,Checkout v2,2026-06-12
Update order confirmation email,Done,Bob,Checkout v2,2026-06-09
Release billing reports,Merged,Carol,Finance,2026-06-13
Build analytics dashboard,In Progress,Sam,Analytics,2026-06-14
Review API endpoints,In Review,Alice,Platform,2026-06-13
Deploy staging environment,In Dev,Dave,Platform,2026-06-14
Migrate old orders,In Progress,Eve,Finance,2025-01-01
Fix login redirect,Blocked,Bob,Auth,2026-06-12
Investigate memory leak,Blocked,Carol,Platform,2026-06-11
Design onboarding flow,To Do,Alice,Onboarding,2026-06-10
Write API docs,Backlog,Dave,Platform,2026-06-09
Plan Q3 roadmap,New,Eve,Strategy,2026-06-08
Audit accessibility issues,Needs Triage Review,Bob,UX,2026-06-13
`;

// Verification:
// Shipped (Done/Resolved/Completed/Merged): rows 1,2,3,4,5 = 5 ✓
// In Progress (In Progress/In Review/In Dev): rows 6,7,8,9 = 4 ✓
// Blocked: rows 10,11 = 2 ✓
// Backlog (To Do/Backlog/New): rows 12,13,14 = 3 ✓
// Unmapped ("Needs Triage Review"): row 15 = 1 ✓
// Sam: rows 1(Shipped), 6(In Progress), — wait, need exactly 3 under Sam
//   Sam: row1(Launch payment flow, Shipped), row3(Add promo code support, Shipped), row6(Build analytics dashboard, In Progress) = 3 ✓
// Checkout v2: rows 1,2,3,4 = 4 ✓
// Carry-over (old date, In Progress): row 9 (Migrate old orders, 2025-01-01) = 1 ✓
