# StandupDigest — UX Brief

## 1. Problem statement
Drop the export your project tracker already gives you, and instantly get a publish-ready weekly status update you can paste into Slack — free, with nothing ever leaving your computer.

## 2. Primary user action
Drop (or pick) a Jira/Linear/Asana/GitHub issue CSV onto a single large dropzone and watch a categorized weekly digest render below it. The user never starts at a blank box: the dropzone has a prominent **"Load sample data"** button right inside it that seeds a known-value example digest in one click, so a skeptic sees the finished outcome before touching their own file.

## 3. Emotional tone
Calm, trustworthy, businesslike — like a clean internal tool a manager already trusts. Neutral cool grays + one confident blue accent; green reserved for "Shipped" and copy-confirmation only. System/sans font (Inter-feel), comfortable but efficient spacing — never cramped, never playful.

## 4. Design decisions
- **Show, don't tell — instant populated example.** The cold screen is never a lonely empty dropzone: a single-click "Load sample data" inside the dropzone fills the full digest (5 Shipped / 4 In Progress / 2 Blocked / 3 Backlog) so the value is legible in seconds. A "Clear" link returns to empty.
- **Copy confirmation lives on the button, unmissably.** Each copy button flips IN PLACE to a solid-green "Copied ✓" with `aria-live="polite"`, holds ~2s, then restores. The flip is optimistic (fires before the clipboard promise) and falls back to selecting a hidden textarea if clipboard is blocked — so a hurried human always sees it worked. No sub-second toast.
- **Distinct verbs on adjacent controls.** The two copy buttons read **"Copy Markdown"** and **"Copy plain text"** (different trailing words, never two "Copy" pills that look like one broken control). Inline digest editing = a pencil "Edit line"; unmapped re-bucketing = a "Move to…" dropdown; column fixes = "Remap columns" — three different verbs, never adjacent duplicates.
- **No-silent-drop trust signal, sized to its content.** The "Unmapped status" list always renders so users trust nothing was dropped, but when empty it collapses to one quiet line ("All statuses recognized ✓"); when populated it shows each unknown status with a "Move to…" control. The manual "Remap columns" panel stays hidden on the happy path and surfaces a contextual banner only when auto-detect confidence is low.

## 5. Three screen-states
**A. Cold / empty (above the fold, incl. 375px):**
- Headline: *"Turn your tracker export into a weekly status — in seconds."*
- Subtitle: *"Drop a Jira, Linear, Asana, or GitHub CSV. Get a Shipped / In Progress / Blocked digest ready to paste into Slack."*
- One large dropzone with **[Load sample data]** button inside it (the focal CTA when no file is loaded).
- Privacy line directly under the dropzone, always visible: *"Your file never leaves your browser — no upload, no signup."*

**B. Populated digest:** Prose one-liner at top ("This week the team shipped 5 items, has 4 in progress and 2 blocked, with 1 carried over."), then **Shipped / In Progress / Blocked** sections (Backlog/Todo shown separately, visually muted), a **Group by: Assignee ▸ Epic** toggle, carry-over rows tagged, the collapsed-when-empty Unmapped list, and a sticky **[Copy Markdown] [Copy plain text]** pair. Inline "Edit line" pencils per item.

**C. Low-confidence column mapping:** Digest still renders best-guess, but a contextual amber banner appears above it — *"We weren't sure which columns are which. [Remap columns]"* — opening per-field dropdowns (Title / Status / Assignee / Epic / Date). The choice is remembered in localStorage per source. On the happy path this banner and panel are absent.

## 5-second check (what a cold visitor sees above the fold)
Headline ("Turn your tracker export into a weekly status — in seconds"), one-line subtitle naming the four trackers + the Slack-paste outcome, the dropzone with a **Load sample data** button, and the privacy line — so within 5 seconds a PM/EM reads "drop my export, get a status to paste, free, nothing uploaded." On 375px the headline, subtitle, dropzone, Load-sample button, and privacy line all stay above the fold; the digest stacks vertically below.
