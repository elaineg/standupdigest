# StandupDigest — Round 1 — Tomás (Ops analyst, Edge/Windows, wary of pasting company data)

## 1. CLARITY — Yes
Headline "Turn your tracker export into a weekly status — in seconds" + subline "Drop a Jira,
Linear, Asana, or GitHub CSV. Get a Shipped / In Progress / Blocked digest" told me exactly
what it does and that it's for me, inside 10 seconds. "Your file never leaves your browser —
no upload, no signup" right under the drop zone hit my single biggest concern before I asked.

## 2. VALUE — Yes
Today I hand-build this in Excel every Friday from a Jira export: pivot by status, regroup by
assignee, write the prose summary. This did all of it in one click. My own CSV (real Jira
headers: Issue key / Summary / Status / Assignee / Epic Link) parsed with zero config —
Done→Shipped, To Do→Backlog — and showed "All statuses recognized ✓". The auto-written prose
summary ("shipped 5, 4 in progress, 2 blocked, 1 carried over") is the exact sentence I type by
hand. Group-by-assignee/epic, carry-over flag, and an "Unmapped status" bucket are things my
spreadsheet does NOT do for free. Genuine time saver.

## 3. ADVOCACY — 8
I'd bring this up to my team. Holding it back from 9–10: I only proved it on a 4-row + sample
CSV. I can't yet confirm it survives a real 400-row export with custom workflow statuses and
commas-in-summaries. No deal-breaker, just "prove it on my real export before I rely on it."

## 4. SHARE NOTES — passes my trust test, NOT a bait-and-switch
- Sharing found easily ("Share link"). Clicking it opens a "What gets uploaded?" panel BEFORE
  creating anything: UPLOADED = "only the formatted digest... summary line and categorized issue
  titles, assignees, epics"; STAYS ON DEVICE = "your raw CSV, any Backlog/Todo and unmapped rows,
  and your column mappings", plus red warning "Anyone with the link can view this... don't create
  one for confidential data." Honest and reassuring.
- I verified the actual upload payload: it contained ONLY Shipped/In-Progress/Blocked items — NO
  backlog, NO unmapped rows, NO raw CSV. Disclosure is technically accurate, not spin. That turned
  my suspicion into trust. Parsing my own CSV fired ZERO network POSTs — privacy claim holds.
- Copy link confirmed: button changed to "Link copied ✓" and clipboard held the URL.
- Shared view = clean read-only page labeled "Read-only shared digest", shows only the 3 status
  buckets (backlog correctly absent). Renders well at 375px mobile.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Only proven on tiny/sample CSV — unverified on a real 400-row export with custom statuses and commas in summaries", "Single-week snapshot; want confidence at messy scale before recommending hard"], "priorConcernsAddressed": "n/a"}
```
