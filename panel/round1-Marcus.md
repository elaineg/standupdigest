# Round 1 — Marcus

Frontend eng, high-tech, desktop Chrome + devtools. NON-FIT: I report up, not down — I don't aggregate a team's status. Tested out of early-adopter curiosity.

## (1) CLARITY — Yes
Within 5s I got it: headline "Turn your tracker export into a weekly status — in seconds", subhead names Jira/Linear/Asana/GitHub and the Shipped/In Progress/Blocked output, dropzone says "Your file never leaves your browser — no upload, no signup." Privacy + no-signup is stated, unambiguous. Clean, legible, no clutter.

## (2) VALUE — No (for me) / the engine itself is solid
For my real job: No. I don't run team standups; I'd never open this on a recurring basis. Honest non-fit, not a knock on craft.
On the sample data it's genuinely good: prose one-liner ("shipped 5, 4 in progress, 2 blocked, 1 carried over"), carry-over pill, assignee↔epic grouping toggle, an UNMAPPED STATUS bucket with a "Move to…" dropdown for unrecognized statuses (nice touch), and both Copy Markdown and Copy plain text produce clean paste-ready output with `[carry-over]` preserved. Clipboard worked, label flips to "Copied ✓".

## Bugs / confusion
- REAL: GitHub Issues support is weaker than the landing page implies. I fed a realistic GH export (State=open/closed + Labels incl. `blocked`). Every `open` issue got dumped into BACKLOG/TO DO, nothing landed In Progress, and an issue labeled `blocked` was NOT flagged Blocked — the parser keys off a status column and ignores labels. GitHub's open/closed+labels model doesn't map cleanly, so the digest came out wrong for my actual data. No error, just silently mis-bucketed → "All statuses recognized ✓" gave false confidence.
- MINOR data wobble: sample "Audit accessibility issues" (unmapped) shows NO assignee in the UI but `(Bob)` in the copied Markdown/plain text. Inconsistent.
- NOT a bug (retracted): the Copy bar looks like it floats mid-digest in a full-page screenshot — it's `sticky bottom-0`, intended behavior. Fine.
- Craft: clean Tailwind, zero console errors, good spacing/typography. No jank.

## (3) ADVOCACY — 5/10
The Jira/Linear path looks slick enough that I'd maybe drop it in Slack with a "nice for whoever runs standups." But it's not for me (no recurring need), and the GitHub path — the one an engineer like me would actually try — mis-bucketed my data without warning. That caps it.

## ONE thing to raise the score
Make GitHub Issues actually work: map open/closed sensibly and read `blocked`/status from Labels, not just a status column — and surface a "we guessed these mappings, review them" prompt instead of a silent "All statuses recognized ✓".

```json
{"tester": 0, "round": 1, "clarity": "Yes", "value": "No", "advocacy": 5, "topComplaints": ["GitHub Issues export silently mis-bucketed: open->Backlog, `blocked` label ignored, no In Progress", "False-confidence 'All statuses recognized ✓' on data it actually mapped wrong", "Unmapped item shows no assignee in UI but (Bob) in copied output"], "priorConcernsAddressed": "n/a"}
```
