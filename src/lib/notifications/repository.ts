import type { NotificationJob } from "./model";

export interface NotificationJobRepository {
  save(job: NotificationJob): Promise<NotificationJob>;
  findByIdempotencyKey(key: string): Promise<NotificationJob | null>;
  listDue(now: Date): Promise<NotificationJob[]>;
  cancelByAppointment(appointmentId: string): Promise<void>;
  listByWorkspace(workspaceId: string): Promise<NotificationJob[]>;
}

export function createInMemoryNotificationJobRepository(): NotificationJobRepository {
  const store = new Map<string, NotificationJob>();

  return {
    save(job) {
      store.set(job.id, job);
      return Promise.resolve(job);
    },

    findByIdempotencyKey(key) {
      for (const job of store.values()) {
        if (job.idempotencyKey === key) return Promise.resolve(job);
      }
      return Promise.resolve(null);
    },

    listDue(now) {
      const result: NotificationJob[] = [];
      for (const job of store.values()) {
        if (job.status === "PENDING" && job.scheduledFor <= now) {
          result.push(job);
        }
      }
      return Promise.resolve(result);
    },

    cancelByAppointment(appointmentId) {
      for (const [id, job] of store.entries()) {
        if (job.appointmentId === appointmentId && job.status === "PENDING") {
          store.set(id, { ...job, status: "CANCELED", updatedAt: new Date() });
        }
      }
      return Promise.resolve();
    },

    listByWorkspace(workspaceId) {
      const result: NotificationJob[] = [];
      for (const job of store.values()) {
        if (job.workspaceId === workspaceId) result.push(job);
      }
      return Promise.resolve(result);
    },
  };
}
