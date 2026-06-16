# StandupDigest

Purpose: For report compilers (PMs, eng managers, ops analysts) who owe a weekly stakeholder status — drop the Jira/Linear/Asana/GitHub issue CSV you already export and get a categorized, copy-ready weekly status digest, 100% in the browser.

Problem: Report COMPILERS — PMs, engineering managers, ops/data analysts, team leads — who owe a WEEKLY stakeholder status. They already export the CSV from their tracker; the recurring grunt work is sorting it by status, grouping by person/epic, spotting carry-over, and writing prose. A PM writing a weekly stakeholder status from an Asana/Jira export is the literal north star: recurring (weekly), single-session value, 30-second legible.

Beats alternative: Best alternative today = manually sorting the export in a spreadsheet (pivot/sort/group, then hand-write the prose) ~20–30 min/week, or pasting it into an LLM (leaks tracker data, still needs cleanup/formatting). StandupDigest turns it into a ~30-second drop-the-CSV → categorized digest, saving ~20–30 min/week per compiler with ZERO data leaving the browser. The paid incumbents (Standuply, Friday.app, Geekbot, eazyBI) all require connecting your tracker or a per-seat plan; the no-integration / no-upload / no-signup, fully client-side categorization is the reason this app exists.

Core flows:
1. Drop or select a Jira/Linear/Asana/GitHub issue CSV export (or click "Load sample data") → the file is parsed in-browser (never uploaded), columns are auto-detected via the tracker header-alias map, each row is bucketed by status keyword into Shipped / In Progress / Blocked (Backlog/Todo kept separate from the digest body), rows are grouped by assignee AND by epic, carry-over/spillover rows are flagged, and an editable weekly digest with a one-line prose summary renders. Every parsed row lands in exactly one bucket; any status that matches no keyword surfaces in a visible "Unmapped status" list rather than being dropped.
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
1. Click "Load sample data" → the digest renders with Shipped showing exactly 5 items, In Progress exactly 4, Blocked exactly 2; the Backlog/Todo group (separate from the digest body) shows exactly 3.
2. Assignee "Sam" appears under exactly 3 items across the digest; the digest is also viewable grouped by epic, where epic "Checkout v2" shows exactly 4 items.
3. Exactly 1 row is flagged as carry-over (spillover) in the sample data.
4. The one-line prose summary reads in the pattern: "This week the team shipped 5 items, has 4 in progress and 2 blocked, with 1 carried over." (counts match the buckets above).
5. The sample data includes one row whose status is the unknown value "Needs Triage Review"; it appears in the "Unmapped status" list (NOT in Shipped/In Progress/Blocked) and can be re-bucketed via flow 2.
6. Editing a digest line inline updates the rendered digest text; reloading after a manual column remap re-applies the remembered mapping for that source.
7. Clicking "Copy as Markdown" flips the button label to "Copied ✓"; clicking "Copy as plaintext" does the same — and pasting elsewhere yields the digest text.

Out of scope:
- Anything needing accounts, tracker integration, file upload, or a server (fully client-side; the CSV never leaves the browser).
- Sprint velocity / burndown charts — that is the separate SprintLens idea, explicitly out of scope here.
- Editing the source CSV (you edit the digest, not the input file).
- Persistence/sharing of digests across devices (localStorage holds only the per-source column mapping).

Production URL:
