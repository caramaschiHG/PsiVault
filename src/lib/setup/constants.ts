export const SERVICE_MODE_OPTIONS = {
  inPerson: "in_person",
  online: "online",
  hybrid: "hybrid",
} as const;

export type ServiceMode =
  (typeof SERVICE_MODE_OPTIONS)[keyof typeof SERVICE_MODE_OPTIONS];

export const SETUP_STEP_IDS = {
  identity: "identity",
  contact: "contact",
  practiceDefaults: "practice_defaults",
  signatureAsset: "signature_asset",
} as const;

export type SetupStepId =
  (typeof SETUP_STEP_IDS)[keyof typeof SETUP_STEP_IDS];

export const SETUP_STEP_TITLES: Record<SetupStepId, string> = {
  [SETUP_STEP_IDS.identity]: "Identidade profissional",
  [SETUP_STEP_IDS.contact]: "Contato do consultorio",
  [SETUP_STEP_IDS.practiceDefaults]: "Padroes do consultorio",
  [SETUP_STEP_IDS.signatureAsset]: "Assinatura profissional",
};
