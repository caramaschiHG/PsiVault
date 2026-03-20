import { db } from "../db";
import type { SmtpConfigRepository, WorkspaceSmtpConfig } from "./smtp-config";
import type { WorkspaceSmtpConfig as PrismaSmtpConfig } from "@prisma/client";

function mapToDomain(r: PrismaSmtpConfig): WorkspaceSmtpConfig {
  return {
    id: r.id,
    workspaceId: r.workspaceId,
    host: r.host,
    port: r.port,
    secure: r.secure,
    username: r.username,
    passwordCiphertext: r.passwordCiphertext,
    fromName: r.fromName,
    fromEmail: r.fromEmail,
    sendReminder24h: r.sendReminder24h,
    sendReminder1h: r.sendReminder1h,
    sendConfirmation: r.sendConfirmation,
    sendCancellation: r.sendCancellation,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function createPrismaSmtpConfigRepository(): SmtpConfigRepository {
  return {
    async save(config) {
      const data = {
        workspaceId: config.workspaceId,
        host: config.host,
        port: config.port,
        secure: config.secure,
        username: config.username,
        passwordCiphertext: config.passwordCiphertext,
        fromName: config.fromName,
        fromEmail: config.fromEmail,
        sendReminder24h: config.sendReminder24h,
        sendReminder1h: config.sendReminder1h,
        sendConfirmation: config.sendConfirmation,
        sendCancellation: config.sendCancellation,
      };
      const r = await db.workspaceSmtpConfig.upsert({
        where: { workspaceId: config.workspaceId },
        update: data,
        create: { id: config.id, ...data },
      });
      return mapToDomain(r);
    },

    async findByWorkspace(workspaceId) {
      const r = await db.workspaceSmtpConfig.findUnique({ where: { workspaceId } });
      return r ? mapToDomain(r) : null;
    },
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __psivaultSmtpConfig__: SmtpConfigRepository | undefined;
}

export function getSmtpConfigRepository(): SmtpConfigRepository {
  globalThis.__psivaultSmtpConfig__ ??= createPrismaSmtpConfigRepository();
  return globalThis.__psivaultSmtpConfig__;
}
