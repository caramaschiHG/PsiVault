import { createPrismaDocumentRepository } from "./repository.prisma";
import type { PracticeDocumentRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultDocumentRepository__: PracticeDocumentRepository | undefined;
}

export function getDocumentRepository(): PracticeDocumentRepository {
  globalThis.__psivaultDocumentRepository__ ??= createPrismaDocumentRepository();
  return globalThis.__psivaultDocumentRepository__;
}
