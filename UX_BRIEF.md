# StandupDigest — UX Brief

## 1. Problem statement
Drop the export your project tracker already gives you, and instantly get a publish-ready weekly status update you can paste into Slack — free, with nothing ever leaving your computer.

## 2. Primary user action
Drop (or pick) a Jira/Linear/Asana/GitHub issue CSV onto a single large dropzone and watch a categorized weekly digest render below it. The user never starts at a blank box: the dropzone has a prominent **"Load sample data"** button right inside it that seeds a known-value example digest in one click, so a skeptic sees the finished outcome before touching their own file.

> **Round-2 correctness principle (builder fix, stated here):** the copied output — BOTH Markdown and plain text — must EXACTLY match what is on screen: no phantom assignee `(Bob)` on rows the UI shows with no assignee, and the chosen Assignee/Epic grouping must be reflected in the copied text (not silently flattened).

## 3. Emotional tone
Calm, trustworthy, businesslike — like a clean internal tool a manager already trusts. Neutral cool grays + one confident blue accent; green reserved for "Shipped" and copy-confirmation only. System/sans font (Inter-feel), comfortable but efficient spacing — never cramped, never playful.

## 4. Design decisions
- **Show, don't tell — instant populated example.** The cold screen is never a lonely empty dropzone: a single-click "Load sample data" inside the dropzone fills the full digest (5 Shipped / 4 In Progress / 2 Blocked / 3 Backlog) so the value is legible in seconds. A "Clear" link returns to empty.
- **Copy confirmation lives on the button, unmissably.** Each copy button flips IN PLACE to a solid-green "Copied ✓" with `aria-live="polite"`, holds ~2s, then restores. The flip is optimistic (fires before the clipboard promise) and falls back to selecting a hidden textarea if clipboard is blocked — so a hurried human always sees it worked. No sub-second toast.
- **Distinct verbs on adjacent controls.** The two copy buttons read **"Copy Markdown"** and **"Copy plain text"** (different trailing words, never two "Copy" pills that look like one broken control). Inline digest editing = a pencil "Edit line"; unmapped re-bucketing = a "Move to…" dropdown; column fixes = "Remap columns" — three different verbs, never adjacent duplicates.
- **No-silent-drop trust signal, sized to its content.** The "Unmapped status" list always renders so users trust nothing was dropped, but when empty it collapses to one quiet line ("All statuses recognized ✓"); when populated it shows each unknown status with a "Move to…" control.
- **Column mapping is always reachable and never falsely reassuring (Wen, Marcus).** A persistent **"Remap columns"** link sits in the digest header (next to the week label) at ALL times, regardless of detection confidence — a user whose Title/Status/Assignee was mis-detected can always reopen the mapping dialog. The amber low-confidence banner + auto-open of the dialog triggers when ANY core field (Title, Status, OR Assignee) fails to detect — not only on overall low confidence. Three trusted states: (1) **fully detected** → quiet "All statuses recognized ✓" success line; (2) **partial / low-confidence** (a core column unmapped, e.g. titles fell to "(untitled)") → amber banner + auto-opened mapping dialog, and the "✓" success line is SUPPRESSED (never show success while a core column is unmapped — it gives false reassurance); (3) always, in any state → the manual "Remap columns" entry point in the header.

## 5. Three screen-states
**A. Cold / empty (above the fold, incl. 375px):**
- Headline: *"Turn your tracker export into a weekly status — in seconds."*
- Subtitle: *"Drop a Jira, Linear, Asana, or GitHub CSV. Get a Shipped / In Progress / Blocked digest ready to paste into Slack."*
- One large dropzone with **[Load sample data]** button inside it (the focal CTA when no file is loaded).
- Privacy line directly under the dropzone, always visible: *"Your file never leaves your browser — no upload, no signup."*

**B. Populated digest:** A **digest header row** carries the **week selector** (left) and the persistent **"Remap columns"** link (right). Directly below: an **editable** prose one-liner reading **"Week of <date>: the team shipped 5 items, has 4 in progress and 2 blocked, with 1 carried over."** — click to edit inline like the digest lines (Sam); the edited text flows verbatim into BOTH copy outputs. Then **Shipped / In Progress / Blocked** sections (Backlog/Todo shown separately, visually muted), a **Group by: Assignee ▸ Epic** toggle, carry-over rows tagged, the collapsed-when-empty Unmapped list, and a sticky **[Copy Markdown] [Copy plain text]** pair. Inline "Edit line" pencils per item.

- **Week filter (D — Elena, Dana, Sam).** Above the buckets, a single **week / date-range selector** filters which rows appear by their Updated/Resolved date, DEFAULTING to the most recent ISO week present in the data, labeled clearly (e.g. **"Week of Mon 9 Jun – Sun 15 Jun ▾"**). Changing it re-renders the buckets and updates the "Week of <date>:" prose stamp. This is a single-week FILTER ONLY — NOT week-over-week comparison/delta (that stays out of scope). On 375px the selector sits full-width at the top of the digest, above the prose line, stacking above the buckets.
- **Sticky copy bar must never occlude content (C — Tomás, Aisha, +3 mobile).** The sticky bottom copy bar gets a SOLID (opaque) background surface (matching the page bg, not translucent) so digest text never bleeds through or appears split, and the digest container carries **scroll padding equal to the bar's height** so the final rows (e.g. Backlog/Unmapped) are always scrollable clear of it and never hidden underneath — on both desktop and 375px mobile. Keep the in-place green "Copied ✓" confirmation on the persistent buttons.

**C. Low-confidence / partial column mapping:** When any core field (Title, Status, OR Assignee) fails to auto-detect, the digest still renders best-guess but the mapping dialog AUTO-OPENS and an amber banner appears above it — *"We weren't sure which columns are which. [Remap columns]"* — with per-field dropdowns (Title / Status / Assignee / Epic / Date). The "All statuses recognized ✓" success line is suppressed in this state. The choice is remembered in localStorage per source. The "Remap columns" link in the digest header is present in ALL states; only the auto-open + amber banner are conditional.

## 5-second check (what a cold visitor sees above the fold)
Headline ("Turn your tracker export into a weekly status — in seconds"), one-line subtitle naming the four trackers + the Slack-paste outcome, the dropzone with a **Load sample data** button, and the privacy line — so within 5 seconds a PM/EM reads "drop my export, get a status to paste, free, nothing uploaded." On 375px the headline, subtitle, dropzone, Load-sample button, and privacy line all stay above the fold; the digest stacks vertically below.
