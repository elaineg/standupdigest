# Marcus — Round 2

Frontend eng, high-tech, desktop Chrome + devtools. NON-FIT (I report up, not down). Re-testing to confirm my round-1 correctness bug.

## Re-check of my round-1 complaints
- **GitHub Issues mis-bucketing + false "All statuses recognized ✓"** — NOT RESOLVED. Fed the exact realistic GH export (`Title,State,Labels,Assignee`, State=open/closed, two rows labeled `blocked`). Result identical to round 1: all 4 `open` issues dumped to **BACKLOG / TO DO**, **IN PROGRESS (0)**, **BLOCKED (0)** — the two `blocked`-labeled issues (Investigate flaky CI, Upgrade Next.js to 15) are NOT flagged Blocked. And the green **"All statuses recognized ✓"** STILL shows. That is the precise false-confidence claim said to be fixed.
- **Copy matches screen** — RESOLVED. Copied Markdown = on-screen exactly (Shipped 2 / Backlog 4; empty In Progress & Blocked omitted, consistent with the 0/0 shown). No assignee mismatch this time. Clipboard worked.

## Why the "fix" missed my bug
The amber "Map your columns" panel only triggers on **column-name** detection failure. My bug was never columns — auto-detect got them RIGHT (Status→State, Epic→Labels, Assignee→Assignee). The bug is **value mapping**: `State=open` has no path to "In Progress", and **Labels are never read for status**, so `blocked` is ignored. On initial load there was NO banner and NO auto-open — it went straight to the wrong digest with the green checkmark. I only saw the panel after manually clicking "Remap columns", and even inside it there's no way to say "open = In Progress" or "blocked label = Blocked". So GitHub's open/closed+labels model still produces a silently-wrong digest, blessed by "All statuses recognized ✓". 0 console errors, clean CSS.

## (1) CLARITY — Yes
Unchanged. Headline, subhead (names Jira/Linear/Asana/GitHub), no-signup line — all legible in 5s.

## (2) VALUE — No (for me)
Honest non-fit: I don't run team standups, no recurring need. And the one path I'd actually try as an engineer (GitHub export) still mis-buckets my data while claiming success.

## (3) ADVOCACY — 4/10
Down one from round 1. The Jira/Linear happy path is still slick, but I came back specifically to confirm a correctness fix and the bug is verbatim still there — worse, it's now explicitly advertised as fixed. "Remap columns" reachability is a nice add, but it doesn't solve open→In Progress or label→Blocked, and the false "All statuses recognized ✓" is the trust-killer. I would not drop this in Slack telling engineers "GitHub works."

## ONE thing to raise the score
Make GitHub open/closed+labels actually map (open→In Progress, `blocked` label→Blocked), OR — if you can't infer it — DROP the green "All statuses recognized ✓" the moment a column maps to values you didn't recognize, and auto-open the mapping panel on a value-level miss (not just a column-name miss).

```json
{"tester": 2, "round": 2, "clarity": "Yes", "value": "No", "advocacy": 4, "topComplaints": ["GitHub Issues export STILL mis-bucketed: all `open`->Backlog, `blocked` label ignored (0 In Progress / 0 Blocked)", "False 'All statuses recognized ✓' STILL shows on a GitHub export it mapped wrong — claimed fixed, isn't", "Amber banner/auto-open only fires on column-NAME miss, not value-level miss; columns auto-detected fine so it never triggers for GitHub data"], "priorConcernsAddressed": "some"}
```
