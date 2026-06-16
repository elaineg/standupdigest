# Wen — Round 2

**Persona:** Marketing data analyst, lives in CSV/BigQuery/Looker, distrusts invisible transforms. IN-AUDIENCE.

## Round-1 blocker — RESOLVED (yes, fully)
I rebuilt my exact `weird.csv` (`Task Name,Owner,State`, Title NOT named "Title") and uploaded it.
- **Amber "Map your columns" banner AUTO-OPENED** on partial detection: "We couldn't auto-detect which columns are which — pick them below so your digest is accurate." This is the transparency I demanded.
- Status auto-detected from "State", Assignee from "Owner" — but **Title is shown as `(none)` and I'm forced to pick it.** No silent "(untitled)" without warning. After I mapped Title→Task Name and clicked Apply, rows rendered correctly ("Migrate analytics pipeline to dbt", "Refactor GA4 export job"). "(untitled)" gone.
- **"Remap columns" link is ALWAYS visible** post-load (verified after sample data AND after the weird CSV). I can reopen the mapper anytime.
- **False "All statuses recognized ✓" is GONE** on partial detection — confirmed absent in DOM.
- **Phantom "(Bob)" is GONE.** The unmapped-status row "Audit accessibility issues" (Owner=Bob in CSV) shows NO assignee on screen AND none in copied Markdown. Copy === screen.

## Other features exercised
- Sample data: copied Markdown AND plain text both match the on-screen digest EXACTLY — epic grouping honored, "[carry-over]" flag preserved, no fabricated owners.
- Week filter: real options (specific week / "All dates") drive correct counts in the prose line.
- Grouping toggle Assignee↔Epic works.
- UNMAPPED STATUS bucket with "Move to…" still present — still asks instead of guessing. This remains the behavior that earns my trust.

## The three answers
- **CLARITY — Yes.** Same legible H1 + Jira/Linear/Asana/GitHub subline + "never leaves your browser, no signup."
- **VALUE — Yes.** Today I hand-build this from a Jira CSV in Sheets (pivot + manual prose) every Friday. This buckets, groups by assignee/epic, flags carry-over, writes the prose, and the copy is Slack-ready and provably faithful to the data. The non-standard-header path is now safe for real exports.
- **ADVOCACY — 9.** My round-1 trust gap is closed. I'd bring this up unprompted to my marketing-ops peers. Holding it back from a 10: see residual below.

## Residual hesitations (minor, not blockers)
- No CSV-OUT. I'm a "CSV in/out everywhere" person; I can copy MD/text but can't re-export the categorized rows as a CSV to diff against my source in Sheets. That's the one thing between 9 and 10 for me.
- I'd like the banner to name WHICH column it couldn't detect (it says "which columns are which" generically); minor polish.
- (Test-env note: the Copy button needed a DOM-dispatched click in headless due to a sticky-bar pointer overlay — copy output was correct and faithful; this is my environment, NOT an app regression.)

```json
{"tester": 3, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["No CSV export of the categorized rows — can't diff output against source in Sheets", "Mapping banner doesn't name which specific column failed to detect"], "priorConcernsAddressed": "all"}
```
