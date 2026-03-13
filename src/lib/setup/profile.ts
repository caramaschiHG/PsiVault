import {
  SERVICE_MODE_OPTIONS,
  type ServiceMode,
} from "./constants";
import type {
  SetupProfileSnapshot,
  SignatureAssetSnapshot,
} from "./readiness";

export interface PracticeProfileRecord extends SetupProfileSnapshot {
  accountId: string;
  workspaceId: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __psivaultSetupProfiles__:
    | Map<string, PracticeProfileRecord>
    | undefined;
}

const DEFAULT_ACCOUNT_ID = "acct_1";
const DEFAULT_WORKSPACE_ID = "ws_1";

function getProfileStore() {
  globalThis.__psivaultSetupProfiles__ ??= new Map<string, PracticeProfileRecord>();

  return globalThis.__psivaultSetupProfiles__;
}

function createKey(accountId: string, workspaceId: string) {
  return `${accountId}:${workspaceId}`;
}

export function getDefaultPracticeProfileSnapshot(): PracticeProfileRecord {
  return {
    accountId: DEFAULT_ACCOUNT_ID,
    workspaceId: DEFAULT_WORKSPACE_ID,
    fullName: "Dra. Helena Prado",
    crp: "CRP 06/123456",
    contactEmail: "contato@consultorio.com.br",
    contactPhone: "",
    defaultAppointmentDurationMinutes: 50,
    defaultSessionPriceInCents: 18000,
    serviceModes: [SERVICE_MODE_OPTIONS.inPerson, SERVICE_MODE_OPTIONS.online],
    signatureAsset: null,
  };
}

export function getPracticeProfileSnapshot(
  accountId = DEFAULT_ACCOUNT_ID,
  workspaceId = DEFAULT_WORKSPACE_ID,
) {
  const store = getProfileStore();
  const key = createKey(accountId, workspaceId);
  const profile = store.get(key);

  if (profile) {
    return profile;
  }

  const seeded = {
    ...getDefaultPracticeProfileSnapshot(),
    accountId,
    workspaceId,
  };
  store.set(key, seeded);

  return seeded;
}

function parsePositiveInteger(value: string | number | null | undefined) {
  const numericValue = typeof value === "number" ? value : Number(value ?? "");

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  return Math.round(numericValue);
}

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

export function normalizeServiceModes(input: Iterable<string>) {
  const validModes = new Set<ServiceMode>(Object.values(SERVICE_MODE_OPTIONS));
  const nextModes = [...new Set([...input].filter((entry): entry is ServiceMode => validModes.has(entry as ServiceMode)))];

  return nextModes;
}

export function savePracticeProfile(input: {
  accountId?: string;
  workspaceId?: string;
  fullName?: string | null;
  crp?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  defaultAppointmentDurationMinutes?: string | number | null;
  defaultSessionPriceInCents?: string | number | null;
  serviceModes?: Iterable<string>;
}) {
  const current = getPracticeProfileSnapshot(
    input.accountId,
    input.workspaceId,
  );
  const next: PracticeProfileRecord = {
    ...current,
    fullName: hasText(input.fullName ?? null) ? input.fullName!.trim() : null,
    crp: hasText(input.crp ?? null) ? input.crp!.trim() : null,
    contactEmail: hasText(input.contactEmail ?? null)
      ? input.contactEmail!.trim()
      : null,
    contactPhone: hasText(input.contactPhone ?? null)
      ? input.contactPhone!.trim()
      : null,
    defaultAppointmentDurationMinutes: parsePositiveInteger(
      input.defaultAppointmentDurationMinutes ?? current.defaultAppointmentDurationMinutes,
    ),
    defaultSessionPriceInCents: parsePositiveInteger(
      input.defaultSessionPriceInCents ?? current.defaultSessionPriceInCents,
    ),
    serviceModes:
      input.serviceModes !== undefined
        ? normalizeServiceModes(input.serviceModes)
        : current.serviceModes,
  };

  getProfileStore().set(createKey(next.accountId, next.workspaceId), next);

  return next;
}

export function saveSignatureAsset(input: {
  accountId?: string;
  workspaceId?: string;
  fileName: string;
  mimeType: string;
  fileSize: string | number;
}) {
  const current = getPracticeProfileSnapshot(input.accountId, input.workspaceId);
  const nextAsset: SignatureAssetSnapshot = {
    storageKey: `signatures/${current.accountId}/${input.fileName}`,
    fileName: input.fileName.trim(),
    mimeType: input.mimeType.trim() || "application/octet-stream",
    fileSize: parsePositiveInteger(input.fileSize) ?? 0,
    uploadedAt: new Date(),
  };

  const next = {
    ...current,
    signatureAsset: nextAsset,
  };

  getProfileStore().set(createKey(next.accountId, next.workspaceId), next);

  return next;
}

export function clearSignatureAsset(
  accountId = DEFAULT_ACCOUNT_ID,
  workspaceId = DEFAULT_WORKSPACE_ID,
) {
  const current = getPracticeProfileSnapshot(accountId, workspaceId);
  const next = {
    ...current,
    signatureAsset: null,
  };

  getProfileStore().set(createKey(next.accountId, next.workspaceId), next);

  return next;
}
