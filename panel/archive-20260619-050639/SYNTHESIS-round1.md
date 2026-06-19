# StandupDigest — Panel SYNTHESIS round 1 (share-link add-feature run 20260617-075102-daily)

Tested cold against local `next start` (http://localhost:3010). FULL panel re-spawned cold
(first add-feature round on a previously-carried app — carried scores not durable across runs).

Audience-weighted bar: in-audience report COMPILERS gate at adv≥9; IC-eng/designer non-fits
carry floors (non-gating).

## Score table
| Tester | Audience | Clarity | Value | Adv | Notes |
|--------|----------|---------|-------|-----|-------|
| Sam    | IN  | Yes | Yes | 9 | At bar. Off 10 only: tested clean sample not own messy Asana export. |
| Wen    | IN  | Yes | Yes | 8 | 8→9 blocker: no reusable saved preset for column-map/status rules → re-fiddle weekly. Trust intact. |
| Tomás  | IN  | Yes | Yes | 8 | 8→9: proved on sample/small, not a messy 400-row real export w/ custom statuses. No deal-breaker. |
| Dana   | IN  | Yes | Yes | 8 | 8→9: can't trust real messy Asana export cold; unsure custom statuses map without fiddling Remap. |
| Elena  | IN  | Yes | Yes | 8 | 8→9: proved on sample not own messy Linear export; Remap columns is the breakpoint. |
| Aisha  | non-fit | Yes | Marginal | 7 | Craft: "Share link" under-weighted (tiny text link = "Remap columns"); floating Copy bar. |
| Marcus | non-fit | Yes | No | 6 | Non-fit (reports up). Drag: Copy bar overlaps digest rows mid-list (z-index/sticky), looks unfinished. |
| Priya  | non-fit | Yes | No | 5 | Non-fit IC. Quality fine; zero personal recurrence. |
| Jules  | non-fit | Yes | No | 4 | Non-fit (content in Notion/Buffer). Same floating Copy bar bug. |
| Rob    | non-fit | Yes | No | 3 | Non-fit (solo). Floating Copy bar; says copy-confirmation not visible (8 others saw it). |

In-audience at bar: 1/5 (Sam). Need Wen/Tomás/Dana/Elena 8→9.

## THE FEATURE (share link) — UNANIMOUS PASS, zero defects
Every one of 10 testers found, used, and approved the opt-in share link end-to-end:
- Privacy disclosure (UPLOADED formatted-digest-only vs STAYS-ON-DEVICE raw CSV/backlog/unmapped/
  mappings + red "anyone with the link can view" warning) read as HONEST. Wen/Tomás/Priya
  inspected the actual POST payload in the network tab and verified ONLY the 3 status buckets are
  sent — no raw CSV/backlog/unmapped leak. NO trust-bomb. Page load zero-network.
- /s/<id> read-only view clean + glanceable at 375px on every tester's check; correctly omits
  backlog/unmapped; viral footer present.
- Copy-link green "Link copied ✓" confirmation visible to 8/10 (Rob the exception — see below).

## Grouped friction behind sub-bar scores
1. **Floating/overlapping Copy bar (CRAFT bug — 4 testers: Marcus, Jules, Aisha, Rob).** The
   sticky "Copy Markdown / Copy plain text" dark bar floats OVER digest rows mid-list (z-index/
   sticky), reads as unfinished/broken. GLOBAL surface (every view's main digest). REAL, recurring.
2. **"Share link" affordance under-weighted (Aisha).** The new marquee action is a tiny text link
   at equal weight to "Remap columns." Discoverability/craft. (added-feature-buried lesson.)
3. **In-audience 8→9: recurrence / real-data confidence (Wen, Tomás, Dana, Elena — all 4 gating).**
   Shared root: "great tool, but I only proved it on the idealized sample; will my real messy export
   with custom statuses map without fiddling Remap every week?" Wen names the fix explicitly: a
   reusable SAVED preset / persisted mapping + status rules so next week is one-drop, not re-fiddle.
   This is the recurrence (habit) gap, not the share feature.
4. **Copy-confirmation visibility (Rob only).** Rob saw no "Copied" cue on Copy Markdown/plaintext;
   8 others saw it clearly. Likely entangled with the floating-bar bug (1). Re-verify cue is
   unmissable on the persistent trigger after fixing (1).

## Fix plan → round 2 (targeted; each maps to a named complaint)
- A. Fix the floating/overlapping Copy bar so it never covers digest rows. [Marcus, Jules, Aisha, Rob] — GLOBAL → re-test ~all.
- B. Elevate "Share link" to a primary, visually-distinct button (not a peer of "Remap columns"). [Aisha]
- C. Recurrence/persistence: (i) surface clearly that column mapping + status rules are SAVED on this
  device so next week is just drop-the-new-export; (ii) PERSIST custom unmapped-status→bucket
  re-bucketing per source so a custom status auto-maps next week. [Wen, Tomás, Dana, Elena]
- D. Re-verify both copy cues unmissable on the persistent trigger post-A. [Rob]

Delta-retest plan: A + D are GLOBAL/shared-surface fixes → re-test all 5 in-audience (incl. Sam as
regression sentinel) + Aisha (craft). Carry Priya/Marcus/Jules/Rob floors (out-of-audience, non-gating,
unchanged need) unless A visibly lifts them. Gated on a clean re-verify.
