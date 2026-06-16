# Round 1 — Wen

**Persona:** Marketing data analyst, lives in CSV/BigQuery/Looker, distrusts invisible transforms. IN-AUDIENCE.

## (1) CLARITY — Yes
Within 5s I got it: H1 "Turn your tracker export into a weekly status — in seconds," subline names Jira/Linear/Asana/GitHub and the Shipped/In Progress/Blocked output, paste-into-Slack. And the privacy line "Your file never leaves your browser — no upload, no signup" is right there under the dropzone. Exactly the two things I check first. No ambiguity.

## (2) VALUE — Yes
Today I hand-build these from a Jira CSV in Google Sheets with a pivot + manual prose. This does the bucketing, assignee/epic grouping, carry-over flag, and a one-line prose summary, then Copy as Markdown/plain text. That's a real chunk of my Friday gone. What earns my trust:
- **It does NOT silently mis-bucket.** Unknown statuses ("Needs Triage Review", "Won't Do", "Code Review") go to an explicit **UNMAPPED STATUS** bucket with a "Move to…" control — it asks instead of guessing. This is the single behavior that converts me.
- I audited my own 8-row CSV: every row accounted for (2+2+1+1+2=8), nothing dropped. Quoted commas in titles preserved. Lowercase "in progress" matched case-insensitively. Blank assignee handled cleanly ("(no epic)", no fake owner).
- When headers are unrecognizable it pops a **"Map your columns"** dialog. Transparent. Love it.
- Markdown + plain-text copy both fired ("Copied ✓"); output is clean and Slack-ready. (Clipboard read worked in my env.)

## (3) ADVOCACY — 7  → honest 6
I'd mention it to my marketing-ops peers, but not unprompted-evangelist level, because of one trust gap below.

## Hesitation / BUG (data-hygiene)
Real issue: with `weird.csv` (headers `Task Name,Owner,State`), it auto-detected the **status** column ("Closed"→Shipped, "Active"→In Progress — nice) but FAILED to detect the title column, so both rows rendered as **"(untitled)"** — and because partial auto-detect "succeeded," it **never showed the column-mapping dialog and offers NO way to reopen it.** No "Remap columns" button anywhere after load. So my titles silently vanished into "(untitled)" and I can only fix them one-by-one via "Edit line." For someone who distrusts invisible transforms, a title dropped to "(untitled)" with no warning is exactly the failure mode I fear — and real Jira/Asana exports have non-standard header names constantly.

Minor: in the Markdown copy, the unmapped "Audit accessibility issues" row gained "(Bob)" attribution that wasn't shown in the rendered view — small inconsistency.

## The ONE thing that would raise my score
Always expose a **"Remap columns"** button (and trigger the mapping dialog whenever ANY of title/status/assignee fails to auto-map, not only on total failure). The instant I can never get silently-"(untitled)" rows, I trust it on real exports and this goes to a 9.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 6, "topComplaints": ["Partial auto-detect drops title to '(untitled)' with no warning and no way to reopen the column mapper", "Mapping dialog only appears on total auto-detect failure, not partial — risky for non-standard Jira/Asana headers", "Markdown copy added an assignee to an unmapped row that the rendered view didn't show"], "priorConcernsAddressed": "n/a"}
```
