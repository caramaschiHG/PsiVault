/**
 * Reminder aggregate — workspace-scoped canonical shape.
 *
 * Security policy (SECU-05):
 * - Reminder title must NEVER appear in audit metadata, logs,
 *   or any non-reminder surface.
 *
 * Reminder lifecycle:
 * - completedAt === null  → active reminder
 * - completedAt !== null  → completed; never appears in listActive results
 */

export type ReminderLinkType = "patient" | "appointment" | "document" | "charge";

export interface ReminderLink {
  type: ReminderLinkType;
  id: string;
}

export interface Reminder {
  id: string;
  workspaceId: string;
  title: string;
  dueAt: Date | null;        // null = no due date
  link: ReminderLink | null; // null = free-standing reminder
  completedAt: Date | null;  // null = active; Date = completed
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReminderInput {
  workspaceId: string;
  title: string;
  dueAt?: Date | null;
  link?: ReminderLink | null;
}

interface CreateReminderDeps {
  now: Date;
  createId: () => string;
}

export function createReminder(
  input: CreateReminderInput,
  deps: CreateReminderDeps,
): Reminder {
  return {
    id: deps.createId(),
    workspaceId: input.workspaceId,
    title: input.title,
    dueAt: input.dueAt ?? null,
    link: input.link ?? null,
    completedAt: null,
    createdAt: deps.now,
    updatedAt: deps.now,
  };
}

interface CompleteReminderDeps {
  now: Date;
}

/**
 * Returns a new Reminder with completedAt and updatedAt set to deps.now.
 * The original reminder object is NOT mutated (immutable update pattern).
 * Calling on an already-completed reminder is idempotent — sets completedAt to the new now.
 */
export function completeReminder(
  reminder: Reminder,
  deps: CompleteReminderDeps,
): Reminder {
  return {
    ...reminder,
    completedAt: deps.now,
    updatedAt: deps.now,
  };
}
