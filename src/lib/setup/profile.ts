import { ServiceMode as PrismaServiceMode } from "@prisma/client";

import { db } from "../db";
import {
  SERVICE_MODE_OPTIONS,
  type ServiceMode,
} from "./constants";
import type {
  SetupProfileSnapshot,
  SignatureAssetSnapshot,
} from "./readiness";

const DEFAULT_PROFILE_SNAPSHOT: SetupProfileSnapshot = {
  fullName: null,
  crp: null,
  contactEmail: null,
  contactPhone: null,
  defaultAppointmentDurationMinutes: null,
  defaultSessionPriceInCents: null,
  serviceModes: [],
  signatureAsset: null,
};

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

function mapPrismaServiceMode(mode: PrismaServiceMode): ServiceMode {
  switch (mode) {
    case PrismaServiceMode.IN_PERSON:
      return SERVICE_MODE_OPTIONS.inPerson;
    case PrismaServiceMode.ONLINE:
      return SERVICE_MODE_OPTIONS.online;
    case PrismaServiceMode.HYBRID:
      return SERVICE_MODE_OPTIONS.hybrid;
  }
}

function mapToPrismaServiceMode(mode: ServiceMode): PrismaServiceMode {
  switch (mode) {
    case SERVICE_MODE_OPTIONS.inPerson:
      return PrismaServiceMode.IN_PERSON;
    case SERVICE_MODE_OPTIONS.online:
      return PrismaServiceMode.ONLINE;
    case SERVICE_MODE_OPTIONS.hybrid:
      return PrismaServiceMode.HYBRID;
  }
}

function mapSignatureAsset(
  asset:
    | {
        storageKey: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        uploadedAt: Date;
      }
    | null
    | undefined,
): SignatureAssetSnapshot | null {
  if (!asset) {
    return null;
  }

  return {
    storageKey: asset.storageKey,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    fileSize: asset.fileSize,
    uploadedAt: asset.uploadedAt,
  };
}

function mapProfileRowToSnapshot(
  profile:
    | {
        fullName: string | null;
        crp: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        defaultAppointmentDurationMinutes: number | null;
        defaultSessionPriceInCents: number | null;
        serviceModes: PrismaServiceMode[];
        signatureAsset?:
          | {
              storageKey: string;
              fileName: string;
              mimeType: string;
              fileSize: number;
              uploadedAt: Date;
            }
          | null;
      }
    | null,
): SetupProfileSnapshot {
  if (!profile) {
    return { ...DEFAULT_PROFILE_SNAPSHOT };
  }

  return {
    fullName: profile.fullName,
    crp: profile.crp,
    contactEmail: profile.contactEmail,
    contactPhone: profile.contactPhone,
    defaultAppointmentDurationMinutes:
      profile.defaultAppointmentDurationMinutes,
    defaultSessionPriceInCents: profile.defaultSessionPriceInCents,
    serviceModes: profile.serviceModes.map(mapPrismaServiceMode),
    signatureAsset: mapSignatureAsset(profile.signatureAsset),
  };
}

function buildProfileWriteData(profile: SetupProfileSnapshot) {
  return {
    fullName: profile.fullName,
    crp: profile.crp,
    contactEmail: profile.contactEmail,
    contactPhone: profile.contactPhone,
    defaultAppointmentDurationMinutes:
      profile.defaultAppointmentDurationMinutes,
    defaultSessionPriceInCents: profile.defaultSessionPriceInCents,
    serviceModes: profile.serviceModes.map(mapToPrismaServiceMode),
  };
}

export function normalizeServiceModes(input: Iterable<string>) {
  const validModes = new Set<ServiceMode>(Object.values(SERVICE_MODE_OPTIONS));
  const nextModes = [...new Set([...input].filter((entry): entry is ServiceMode => validModes.has(entry as ServiceMode)))];

  return nextModes;
}

export async function getPracticeProfileSnapshot(
  _accountId?: string,
  workspaceId?: string,
) {
  if (!workspaceId) {
    return { ...DEFAULT_PROFILE_SNAPSHOT };
  }

  const profile = await db.practiceProfile.findUnique({
    where: { workspaceId },
    include: { signatureAsset: true },
  });

  return mapProfileRowToSnapshot(profile);
}

export async function savePracticeProfile(input: {
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
  if (!input.workspaceId) {
    throw new Error("workspaceId is required to save the practice profile.");
  }

  const current = await getPracticeProfileSnapshot(
    input.accountId,
    input.workspaceId,
  );
  const next: SetupProfileSnapshot = {
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
      input.defaultAppointmentDurationMinutes ??
        current.defaultAppointmentDurationMinutes,
    ),
    defaultSessionPriceInCents: parsePositiveInteger(
      input.defaultSessionPriceInCents ?? current.defaultSessionPriceInCents,
    ),
    serviceModes:
      input.serviceModes !== undefined
        ? normalizeServiceModes(input.serviceModes)
        : current.serviceModes,
    signatureAsset: current.signatureAsset,
  };

  await db.practiceProfile.upsert({
    where: { workspaceId: input.workspaceId },
    create: {
      workspaceId: input.workspaceId,
      ...buildProfileWriteData(next),
    },
    update: buildProfileWriteData(next),
  });

  return next;
}

export async function saveSignatureAsset(input: {
  accountId?: string;
  workspaceId?: string;
  storageKey?: string;
  fileName: string;
  mimeType: string;
  fileSize: string | number;
}) {
  if (!input.workspaceId) {
    throw new Error("workspaceId is required to save the signature asset.");
  }

  const current = await getPracticeProfileSnapshot(
    input.accountId,
    input.workspaceId,
  );
  const nextAsset: SignatureAssetSnapshot = {
    storageKey: input.storageKey ?? `${input.workspaceId}/${input.fileName}`,
    fileName: input.fileName.trim(),
    mimeType: input.mimeType.trim() || "application/octet-stream",
    fileSize: parsePositiveInteger(input.fileSize) ?? 0,
    uploadedAt: new Date(),
  };

  await db.practiceProfile.upsert({
    where: { workspaceId: input.workspaceId },
    create: {
      workspaceId: input.workspaceId,
      ...buildProfileWriteData(current),
      signatureAsset: {
        create: nextAsset,
      },
    },
    update: {
      signatureAsset: {
        upsert: {
          create: nextAsset,
          update: nextAsset,
        },
      },
    },
  });

  return {
    ...current,
    signatureAsset: nextAsset,
  };
}

export async function clearSignatureAsset(
  _accountId?: string,
  workspaceId?: string,
) {
  if (!workspaceId) {
    return { ...DEFAULT_PROFILE_SNAPSHOT };
  }

  await db.signatureAsset.deleteMany({
    where: {
      profile: {
        workspaceId,
      },
    },
  });

  const current = await getPracticeProfileSnapshot(undefined, workspaceId);

  return {
    ...current,
    signatureAsset: null,
  };
}
