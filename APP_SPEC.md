# StandupDigest

Purpose: For report compilers (PMs, eng managers, ops analysts) who owe a weekly stakeholder status — drop the Jira/Linear/Asana/GitHub issue CSV you already export and get a categorized, copy-ready weekly status digest, 100% in the browser.

Problem: Report COMPILERS — PMs, engineering managers, ops/data analysts, team leads — who owe a WEEKLY stakeholder status. They already export the CSV from their tracker; the recurring grunt work is sorting it by status, grouping by person/epic, spotting carry-over, and writing prose. A PM writing a weekly stakeholder status from an Asana/Jira export is the literal north star: recurring (weekly), single-session value, 30-second legible.

Beats alternative: Best alternative today = manually sorting the export in a spreadsheet (pivot/sort/group, then hand-write the prose) ~20–30 min/week, or pasting it into an LLM (leaks tracker data, still needs cleanup/formatting). StandupDigest turns it into a ~30-second drop-the-CSV → categorized digest, saving ~20–30 min/week per compiler with ZERO data leaving the browser. The paid incumbents (Standuply, Friday.app, Geekbot, eazyBI) all require connecting your tracker or a per-seat plan; the no-integration / no-upload / no-signup, fully client-side categorization is the reason this app exists.

Core flows:
1. Drop or select a Jira/Linear/Asana/GitHub issue CSV export (or click "Load sample data") → the file is parsed in-browser (never uploaded), columns are auto-detected via the tracker header-alias map, each row is bucketed by status keyword into Shipped / In Progress / Blocked (Backlog/Todo kept separate from the digest body), rows are grouped by assignee AND by epic, carry-over/spillover rows are flagged, and an editable weekly digest with a one-line prose summary renders. A WEEK FILTER selector at the top of the digest filters which rows appear by their Updated/Resolved date and DEFAULTS to the most recent ISO week present in the data (labeled "Week of <date>"), with an always-available "All dates" option; in a selected week, SHIPPED/resolved rows are filtered to that week but still-open (In Progress/Blocked) rows whose last update predates the week REMAIN and are flagged carry-over. Every parsed row lands in exactly one bucket; any status that matches no keyword surfaces in a visible "Unmapped status" list rather than being dropped.
2. Fix a misdetected column via a manual "map your columns" picker (the mapping is remembered in localStorage per detected source: jira/linear/asana/github) OR edit any digest line inline OR re-bucket an entry from the Unmapped list into Shipped/In Progress/Blocked/Backlog.
3. Copy the digest as Markdown or as plaintext; the clicked button flips to a "Copied ✓" confirmation.

Header-alias auto-detect map (builder MUST implement exactly; case-insensitive match):
- Title/Summary — Jira `Summary`; Linear `Title`; Asana `Name`; GitHub `title`.
- Status — Jira `Status`; Linear `Status`/`State`; Asana `Section/Column` (+ `Completed At`); GitHub `state` (open/closed) + Projects `Status`.
- Assignee — Jira `Assignee`; Linear `Assignee`; Asana `Assignee`; GitHub `assignee`/`assignees`.
- Epic/Group — Jira `Epic Link`/`Epic Name`/`Parent`; Linear `Project`/`Cycle`; Asana `Projects`/`Parent task`; GitHub `milestone`/`labels`.
- Updated/Resolved date — Jira `Updated`/`Resolved`; Linear `Updated`/`Completed`; Asana `Completed At`/`Modified`; GitHub `updated_at`/`closed_at`.

Status→bucket keyword map (builder MUST implement exactly; case-insensitive):
- Shipped: Done, Closed, Resolved, Complete, Completed, Merged, Released; GitHub `closed`; Asana `Completed At` non-empty.
- In Progress: In Progress, In Review, In Dev, Started, Doing, Active, QA.
- Blocked: Blocked, On Hold, Waiting, Stalled, Impediment.
- Backlog/Todo (kept separate, NOT in the digest body): To Do, Backlog, Open, New, Triage. GitHub `open` defaults here unless a Projects Status says otherwise.
- Reconciliation rule: every parsed row lands in exactly one bucket; any status matching no keyword goes to the "Unmapped status" list (never silently dropped).
- Spillover: a row whose status is unchanged across the export's Updated window (or carried from a prior cycle field) is flagged as carry-over.

Success checks (verifiable in seconds in the browser; the sample data has KNOWN values):
1. Click "Load sample data", then set the week filter to "All dates" → the digest renders with Shipped showing exactly 5 items, In Progress exactly 4, Blocked exactly 2; the Backlog/Todo group (separate from the digest body) shows exactly 3.
2. With the week filter on "All dates", assignee "Sam" appears under exactly 3 items across the digest; the digest is also viewable grouped by epic, where epic "Checkout v2" shows exactly 4 items.
3. With the week filter on "All dates", exactly 1 row is flagged as carry-over (spillover) in the sample data.
4. The one-line prose summary reads in the pattern: "This week the team shipped 5 items, has 4 in progress and 2 blocked, with 1 carried over." (counts match the buckets shown for the current week-filter selection).
5. With the week filter on "All dates", the sample data includes one row whose status is the unknown value "Needs Triage Review"; it appears in the "Unmapped status" list (NOT in Shipped/In Progress/Blocked) and can be re-bucketed via flow 2.
6. Reloading after a manual column remap re-applies the remembered mapping for that source.
7. Clicking "Copy as Markdown" flips the button label to "Copied ✓"; clicking "Copy as plaintext" does the same — and pasting elsewhere yields the digest text.
8. Load sample data → a "Week of <date>" selector is visible defaulting to the most recent week; switching it to "All dates" shows all rows and yields the known counts in checks 1–3 above.
9. Week-filter carry-over semantics: with a SPECIFIC week selected, SHIPPED/resolved rows are restricted to rows whose Updated/Resolved date falls in that week, BUT still-open (In Progress / Blocked) rows whose last update PREDATES the selected week still appear in the digest and are flagged as carry-over (so the default most-recent-week view shows "still open, carried in from a prior week" rather than dropping them by their stale date).
10. The editable prose summary can be edited inline and the edit flows into the copied text; copied Markdown and plain-text EXACTLY match the on-screen digest (no phantom assignee on unmapped rows; epic grouping honored when grouping by epic).

Out of scope:
- Anything needing accounts, tracker integration, file upload, or a server (fully client-side; the CSV never leaves the browser).
- Sprint velocity / burndown charts — that is the separate SprintLens idea, explicitly out of scope here.
- Week-over-week comparison / delta (e.g. "shipped 5 this week vs 3 last week") — the week filter is a single-week FILTER only, not a cross-week comparison.
- Editing the source CSV (you edit the digest, not the input file).
- Persistence/sharing of digests across devices (localStorage holds only the per-source column mapping).

Production URL: https://standupdigest.vercel.app
