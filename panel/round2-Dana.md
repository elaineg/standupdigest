# Dana — Round 2

**Persona:** Demand-gen lead, runs a small Asana team, owes a weekly stakeholder status. Ruthless about time; value must land in one scroll.

## PRIOR CONCERNS — resolved?
- **Week-over-week / carry-over delta (my #1 ask): YES.** Week selector at top ("Week of Mon 8 Jun – Sun 14 Jun" / "All dates"). Switched to the empty old week (Dec 30 → "shipped 0 items") and the still-open prior-week item ("Migrate old orders [carry-over]") STAYED visible and flagged. The `[carry-over]` tag also carries into both copied formats. This is the delta stakeholders read — satisfied.
- **Phantom `(Bob)` in copy: YES, fixed.** Copied Markdown AND plain text exactly match the screen — no parens-name. Verified the literal clipboard text both formats.
- **Redundant `(assignee)` parens shown on-screen when grouped by assignee: NO, still there.** On-screen still renders "Launch payment flow(Sam)" under "👤 Sam". Cosmetic, and the COPY output drops it correctly, so it's a screen-only nit now.

## (1) CLARITY — Yes
Same strong landing ("Turn your tracker export into a weekly status — in seconds", no-upload/no-signup line under the dropzone). Got it in 5s. The new "Week:" selector and the "Week of <date>: ..." prose make the time-scope explicit, which is better for a status doc.

## (2) VALUE — Yes
Still beats my Notion/Canva hand-massage. The carry-over delta + editable prose are the unlock: I clicked "Edit", rewrote the opening line ("...billing reports unblocked. — Dana"), and it flowed verbatim into the copied Markdown. Grouping toggle (Assignee for 1:1s / Epic for execs) and both copy formats still work. Saves my ~20 min Friday.

## (3) ADVOCACY — 8/10
Up from a held-back 8; the delta ask landed but a real-data snag keeps it off 9. I uploaded an actual Asana export (columns: Task Name, Assignee, Section, Completed At). Statuses + counts mapped fine, but every task showed **"(untitled)"** — auto-detect missed the "Task Name" title column. The Remap panel auto-opened with a clear warning ("We couldn't auto-detect which columns are which") and Title/Summary set to "(none)"; I pointed it at "Task Name", hit Apply, and titles appeared correctly. Recoverable, well-signposted — but for "value in one scroll", the literal Asana column header should auto-map so I never see "(untitled)".

## Residual hesitations
- Asana's "Task Name" header not auto-detected → "(untitled)" on first parse (one manual Remap fixes it). Quote on screen: "(untitled)(Dana)".
- "All dates" prose still reads "**This week** the team shipped 5..." — wrong tense for the all-dates view; should say "Across all dates".
- On-screen redundant "(Sam)" parens under "👤 Sam" grouping persists (copy is clean).
- Still a per-export tool — no saved/recurring view; I re-export from Asana weekly.

```json
{"tester": 5, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Asana 'Task Name' header not auto-detected -> tasks show (untitled) until I manually Remap", "'All dates' prose still says 'This week the team shipped...' (wrong scope)"], "priorConcernsAddressed": "some"}
```
