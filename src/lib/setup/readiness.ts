import {
  type ServiceMode,
  SETUP_STEP_IDS,
  SETUP_STEP_TITLES,
  type SetupStepId,
} from "./constants";

export interface SignatureAssetSnapshot {
  storageKey: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface SetupProfileSnapshot {
  fullName: string | null;
  crp: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  defaultAppointmentDurationMinutes: number | null;
  defaultSessionPriceInCents: number | null;
  serviceModes: ServiceMode[];
  signatureAsset: SignatureAssetSnapshot | null;
}

export type SetupStepStatus = "complete" | "incomplete" | "optional";

export interface SetupStepState {
  id: SetupStepId;
  title: string;
  required: boolean;
  status: SetupStepStatus;
  missingFields: string[];
}

export interface SetupReadinessState {
  vaultReady: boolean;
  required: {
    completed: number;
    total: number;
  };
  optional: {
    completed: number;
    total: number;
  };
  completedSteps: number;
  totalSteps: number;
  progressLabel: string;
  steps: SetupStepState[];
}

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function hasPositiveNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function createStep(
  id: SetupStepId,
  required: boolean,
  missingFields: string[],
): SetupStepState {
  if (missingFields.length === 0) {
    return {
      id,
      title: SETUP_STEP_TITLES[id],
      required,
      status: "complete",
      missingFields: [],
    };
  }

  return {
    id,
    title: SETUP_STEP_TITLES[id],
    required,
    status: required ? "incomplete" : "optional",
    missingFields,
  };
}

export function buildSetupReadiness(
  profile: SetupProfileSnapshot,
): SetupReadinessState {
  const steps = [
    createStep(SETUP_STEP_IDS.identity, true, [
      ...(!hasText(profile.fullName) ? ["fullName"] : []),
      ...(!hasText(profile.crp) ? ["crp"] : []),
    ]),
    createStep(SETUP_STEP_IDS.contact, true, [
      ...(!hasText(profile.contactEmail) ? ["contactEmail"] : []),
      ...(!hasText(profile.contactPhone) ? ["contactPhone"] : []),
    ]),
    createStep(SETUP_STEP_IDS.practiceDefaults, true, [
      ...(!hasPositiveNumber(profile.defaultAppointmentDurationMinutes)
        ? ["defaultAppointmentDurationMinutes"]
        : []),
      ...(!hasPositiveNumber(profile.defaultSessionPriceInCents)
        ? ["defaultSessionPriceInCents"]
        : []),
      ...(profile.serviceModes.length === 0 ? ["serviceModes"] : []),
    ]),
    createStep(SETUP_STEP_IDS.signatureAsset, false, [
      ...(profile.signatureAsset ? [] : ["signatureAsset"]),
    ]),
  ];

  const requiredSteps = steps.filter((step) => step.required);
  const optionalSteps = steps.filter((step) => !step.required);
  const completedSteps = steps.filter((step) => step.status === "complete").length;

  return {
    vaultReady: requiredSteps.every((step) => step.status === "complete"),
    required: {
      completed: requiredSteps.filter((step) => step.status === "complete").length,
      total: requiredSteps.length,
    },
    optional: {
      completed: optionalSteps.filter((step) => step.status === "complete").length,
      total: optionalSteps.length,
    },
    completedSteps,
    totalSteps: steps.length,
    progressLabel: `${completedSteps} de ${steps.length} etapas concluidas`,
    steps,
  };
}
