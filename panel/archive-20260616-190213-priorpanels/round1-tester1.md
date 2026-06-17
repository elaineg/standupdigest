```json
{
  "name": "Sam",
  "role": "Product manager",
  "clarity": "Yes",
  "clarity_reason": "Landing headline 'Turn your tracker export into a weekly status — in seconds' plus subtext 'Drop a Jira/Linear/Asana/GitHub CSV... ready to paste into Slack' tells me exactly what it does and that it's for me. The two modes are unmissable: a 'Weekly Status' / 'Sprint Review' toggle is right above the headline, highlighted. I got it in ~3 seconds on mobile.",
  "value": "Yes",
  "value_reason": "Sprint Review is squarely a thing I do — I report sprint outcomes to stakeholders. The tab shows everything I'd hand-assemble in Sheets: VELOCITY (21 of 34 pts / 4 of 7 issues), SCOPE CHANGE (+8/-2 mid-sprint), SPILLOVER (3 issues/13 pts still open, with the actual items), and BY ASSIGNEE with points per person. The sprint selector switches data correctly (Sprint 23 showed different numbers/people). Copy Markdown produces a clean, paste-ready report that EXACTLY matches the screen, and inline edits flow into the copy. My own Asana-style CSV auto-mapped and computed everything. This replaces ~15 min of manual Sheets+screenshot work I do per sprint.",
  "advocacy": 8,
  "advocacy_reason": "I'd bring this up to other PMs unprompted as a clean way to make a sprint review look organized with zero setup/signup. It does the real job and the copy output is genuinely good. Held back from 9-10 by: (1) on my own CSV, 'committed' velocity (21) was just the sum of ALL points incl. items I'd never committed — defensible since it tells me scope is unavailable, but a naive reader could mis-cite it; (2) the sticky Copy bar overlaps the By Assignee section a bit on mobile, looks slightly crowded.",
  "top_fix": "On Sprint Review, when there's no added-date/commitment column, label the velocity denominator honestly (e.g. 'of 34 pts in sprint' rather than implying 'committed'), or expose a way to mark commitment — so I can paste the velocity number to my VP without caveating it.",
  "notes": "No console/page errors anywhere. Mobile 375px layout is clean. Sprint selector works and recomputes (S24: 21/34; S23: 0/9 with different assignees). Inline 'Edit line' opens a focused text field and the change reflects on screen AND in copied Markdown — verified. Copy Markdown clipboard read worked in test env and matched the screen exactly (velocity/scope/spillover-with-items/by-assignee). Spillover lists the carried items by name with assignee — useful. Honest empty state: 'Scope change unavailable — needs a Sprint + Added-date column' instead of a fake number; builds trust. Minor friction: sticky Copy bar slightly overlaps the By Assignee header on a small screen."
}
```
