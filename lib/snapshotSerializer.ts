/**
 * snapshotSerializer.ts
 *
 * Converts the in-memory display models for each view type into a DigestSnapshot
 * suitable for writing to Turso and rendering on the read-only /s/[id] page.
 *
 * Only the FORMATTED digest (prose + titles/assignees/epics) is serialized.
 * Raw CSV data, Backlog/Todo rows, and unmapped rows are NOT included.
 */

import type { DigestModel } from "./digestSerializer";
import type { SprintReviewCopyModel } from "./sprintReview";
import type { ChangesCopyModel } from "./changesDigest";
import type { DigestSnapshot } from "./shareDb";

// ---- Weekly Status snapshot ----

export function buildWeeklySnapshot(
  model: DigestModel,
  weekLabel: string
): DigestSnapshot {
  const sections: DigestSnapshot["sections"] = [];

  function rowToString(row: import("./csvParser").DigestRow): string {
    const title = row.editedTitle ?? row.title;
    const co = row.isCarryOver ? " [carry-over]" : "";
    const assignee = row.assignee ? ` (${row.assignee})` : "";
    return `${title}${assignee}${co}`;
  }

  // Shipped
  if (model.shipped.length > 0) {
    sections.push({
      label: "Shipped",
      items: model.shipped.map((r) => rowToString(r)),
    });
  }
  // In Progress
  if (model.inProgress.length > 0) {
    sections.push({
      label: "In Progress",
      items: model.inProgress.map((r) => rowToString(r)),
    });
  }
  // Blocked
  if (model.blocked.length > 0) {
    sections.push({
      label: "Blocked",
      items: model.blocked.map((r) => rowToString(r)),
    });
  }
  // Unmapped rows stay local — NEVER uploaded per the share disclosure.
  // Backlog is also excluded (already handled by not being in this model).

  return {
    viewType: "weekly",
    prose: model.prose,
    sections,
    metaLabel: weekLabel,
    createdAt: Date.now(),
  };
}

// ---- Sprint Review snapshot ----

export function buildSprintSnapshot(
  copyModel: SprintReviewCopyModel
): DigestSnapshot {
  const sections: DigestSnapshot["sections"] = [];

  // Velocity
  sections.push({
    label: "Velocity",
    items: [
      copyModel.velocityHeadline,
      copyModel.velocitySubline,
      copyModel.velocityTooltip,
    ].filter((s): s is string => !!s),
  });

  // Scope change
  if (copyModel.scopeLine) {
    sections.push({
      label: "Scope Change",
      items: [copyModel.scopeLine],
    });
  }

  // Spillover
  if (copyModel.spilloverRows.length > 0) {
    sections.push({
      label: "Spillover",
      items: [
        copyModel.spilloverHeadline,
        ...copyModel.spilloverRows.map((r) => {
          const title = r.editedTitle ?? r.title;
          return r.assignee ? `${title} (${r.assignee})` : title;
        }),
      ],
    });
  } else {
    sections.push({
      label: "Spillover",
      items: [copyModel.spilloverHeadline],
    });
  }

  // By Assignee
  if (copyModel.byAssignee.length > 0) {
    for (const a of copyModel.byAssignee) {
      sections.push({
        label: `By Assignee — ${a.assignee}`,
        items: [
          `${a.assignee} — ${a.shippedPoints ?? 0} of ${a.points} pts shipped · ${a.issues} ${a.issues === 1 ? "issue" : "issues"}`,
          ...a.rows.map((r) => {
            const title = r.editedTitle ?? r.title;
            return r.assignee ? `${title} (${r.assignee})` : title;
          }),
        ],
      });
    }
  }

  return {
    viewType: "sprint",
    prose: `${copyModel.sprintName} — ${copyModel.velocityHeadline}`,
    sections,
    metaLabel: copyModel.sprintName,
    createdAt: Date.now(),
  };
}

// ---- Changes snapshot ----

function changesRowToString(cr: import("./changesDigest").ChangesRow): string {
  const title = cr.row.editedTitle ?? cr.row.title;
  const assignee = cr.row.assignee ? ` (${cr.row.assignee})` : "";
  const label = cr.stilBlockedLabel ? ` [${cr.stilBlockedLabel}]` : "";
  return `${title}${assignee}${label}`;
}

export function buildChangesSnapshot(
  copyModel: ChangesCopyModel
): DigestSnapshot {
  const sections: DigestSnapshot["sections"] = [];

  const add = (
    label: string,
    rows: import("./changesDigest").ChangesRow[]
  ) => {
    if (rows.length > 0) {
      sections.push({ label, items: rows.map(changesRowToString) });
    }
  };

  add("Newly Shipped", copyModel.newlyShipped);
  add("Newly Blocked", copyModel.newlyBlocked);
  add("Slipped", copyModel.slipped);
  add("Reopened", copyModel.reopened);
  add("New this period", copyModel.newThisPeriod);
  add("Unblocked", copyModel.unblocked);
  add("Newly Started", copyModel.newlyStarted);
  add("Still Blocked", copyModel.stillBlocked);
  add("Carried over / unchanged-open", copyModel.carriedOver);

  if (copyModel.removed.length > 0) {
    sections.push({
      label: "Removed from tracker",
      items: copyModel.removed.map(changesRowToString),
    });
  }

  return {
    viewType: "changes",
    prose: copyModel.prose,
    sections,
    createdAt: Date.now(),
  };
}
