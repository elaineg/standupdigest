# StandupDigest — Round 1 — Aisha (Product designer, NON-FIT, judges craft hard)

## Cold open (5s)
Clear. Headline "Turn your tracker export into a weekly status — in seconds." + sub naming
Jira/Linear/Asana/GitHub CSV and "paste into Slack" told me exactly what it is and who it's
for. "Your file never leaves your browser — no upload, no signup" landed the trust hook. I'd stay.

## The new "Changes" tab
Discovered it as the 3rd tab; loaded BOTH samples in one click via "Load sample data".

### Craft — this is genuinely considered
- Empty state is the best part: two labeled drop zones ("Current export (now)" /
  "Compare to last week's export (optional)") + a centered explainer card with a bold
  "See what changed since your last export." and a plain-language sub. A designer respects this.
- Digest layout: color-coded dots per category (green shipped, red blocked, amber slipped,
  blue new), assignee in muted parentheses, generous vertical rhythm. Low-noise categories
  (Carried over / Still Blocked) are collapsed by default with ▸ disclosure — right call.
- Category labels read like a human wrote them: "Slipped / Reopened", "New this period",
  "Removed from tracker", "Unblocked". Tone is consistent and non-jargony.
- Copy buttons are a sticky footer pinned to the card bottom (always reachable while you
  scroll a long digest). NOTE: in a fullPage screenshot this stitches mid-list and looked
  broken at first — verified in a real viewport it's a clean pinned bar. Copy verified
  visually; not a regression.

### Count integrity — PASSES
Prose: "Since last week: 3 shipped, 1 newly blocked, 2 slipped, 4 new."
Rendered rows: Shipped 3, Newly Blocked 1, Slipped 2, New 4 — every surfaced count matches
the rows shown. Every header count (Unblocked 1, Newly Started 1, Still Blocked 1, Carried 2,
Removed 1) matches its rendered rows too. Copied Markdown AND plaintext are row-for-row
identical to the screen — no phantom or dropped items. Zero console errors.

### Craft nits (not bugs)
- The headline prose surfaces only 4 of 9 categories; a skimmer could miss that 1 was
  unblocked / 1 removed / 1 still blocked. Defensible as a "headline", but a more considered
  summary would say "+1 unblocked, 1 removed" rather than silently dropping them.

## Weekly Status (regression check) — still works
Summary "shipped 5, 4 in progress, 2 blocked, 1 carried over" matches SHIPPED(5)/IN PROGRESS(4)/
BLOCKED(2). Bonus considered touch: "Unmapped status (1)" with a "Move to…" remap dropdown.

## The three questions
**Q1 — first reaction / use it for real work?** Reaction: tidy, trustworthy, clearly made by
someone who cares about layout. But I'm a NON-FIT: I contribute to status, I don't own a
recurring tracker→digest. So no, *I* wouldn't open this weekly — though I'd send it to a PM/EM
who does. I'm judging craft, and the craft holds up.

**Q2 — the ONE thing stopping me advocating?** It solves a problem I don't personally own, so
my advocacy is second-hand. On craft alone the only real ding is the headline-summary dropping
5 categories — fix that and the prose feels complete, not partial.

**Q3 — trustworthy & copy-ready?** Yes. Counts match rows match clipboard, both Markdown and
plaintext are clean and paste-ready for Slack/Notion. I'd trust pasting this without re-checking.

## Scores
- ADVOCACY: 7  (high craft, clean & trustworthy output — but I don't own this workflow, so
  it's a hand-off recommendation, not an unprompted one; and the partial headline summary keeps
  it off a 9)
- VALUE: Marginal  (for ME — non-fit; the value is real but lands on PMs/EMs, not designers)
- CLARITY: Yes

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Marginal", "advocacy": 7, "topComplaints": ["Headline prose summary surfaces only 4 of 9 change categories — silently drops unblocked/removed/still-blocked, reads as partial", "Sticky copy-bar stitches mid-list in fullPage capture (cosmetic/test-env only, fine in real viewport)", "Non-fit: I contribute to status but don't own a recurring tracker digest, so advocacy is second-hand"], "priorConcernsAddressed": "n/a"}
```
