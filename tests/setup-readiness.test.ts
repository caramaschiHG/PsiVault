import {
  SERVICE_MODE_OPTIONS,
  SETUP_STEP_IDS,
} from "../src/lib/setup/constants";
import {
  buildSetupReadiness,
  type SetupProfileSnapshot,
} from "../src/lib/setup/readiness";

function createProfileSnapshot(
  overrides: Partial<SetupProfileSnapshot> = {},
): SetupProfileSnapshot {
  return {
    fullName: "Dra. Helena Prado",
    crp: "CRP 06/123456",
    contactEmail: "contato@consultorio.com.br",
    contactPhone: "+55 11 99999-9999",
    defaultAppointmentDurationMinutes: 50,
    defaultSessionPriceInCents: 18000,
    serviceModes: [SERVICE_MODE_OPTIONS.inPerson],
    theoreticalOrientation: "Psicanálise",
    preferredThinker: "Freud",
    signatureAsset: null,
    ...overrides,
  };
}

describe("setup readiness", () => {
  it("profile completeness requires full name, CRP, and contact data before the vault is ready", () => {
    const readiness = buildSetupReadiness(
      createProfileSnapshot({
        fullName: " ",
        crp: "",
        contactPhone: "",
      }),
    );

    expect(readiness.vaultReady).toBe(false);
    expect(readiness.required.completed).toBe(1);
    expect(readiness.required.total).toBe(3);
    expect(readiness.steps[0]).toMatchObject({
      id: SETUP_STEP_IDS.identity,
      status: "incomplete",
      missingFields: ["fullName", "crp"],
    });
    expect(readiness.steps[1]).toMatchObject({
      id: SETUP_STEP_IDS.contact,
      status: "incomplete",
      missingFields: ["contactPhone"],
    });
  });

  it("practice defaults are required for vault readiness", () => {
    const readiness = buildSetupReadiness(
      createProfileSnapshot({
        defaultAppointmentDurationMinutes: 0,
        defaultSessionPriceInCents: null,
        serviceModes: [],
      }),
    );

    expect(readiness.vaultReady).toBe(false);
    expect(readiness.steps[2]).toMatchObject({
      id: SETUP_STEP_IDS.practiceDefaults,
      status: "incomplete",
      missingFields: [
        "defaultAppointmentDurationMinutes",
        "defaultSessionPriceInCents",
        "serviceModes",
      ],
    });
  });

  it("signature asset stays optional for vault readiness while remaining visible in later setup work", () => {
    const readiness = buildSetupReadiness(createProfileSnapshot());

    expect(readiness.vaultReady).toBe(true);
    expect(readiness.optional.completed).toBe(0);
    expect(readiness.optional.total).toBe(1);
    expect(readiness.steps[3]).toMatchObject({
      id: SETUP_STEP_IDS.signatureAsset,
      required: false,
      status: "optional",
      missingFields: ["signatureAsset"],
    });
  });

  it("setup hub state exposes progress and guided checklist labels for required and optional work", () => {
    const readiness = buildSetupReadiness(
      createProfileSnapshot({
        contactEmail: "",
        signatureAsset: {
          storageKey: "signatures/acct_1/signature.png",
          fileName: "signature.png",
          mimeType: "image/png",
          fileSize: 4200,
          uploadedAt: new Date("2026-03-13T12:00:00.000Z"),
        },
      }),
    );

    expect(readiness.progressLabel).toBe("3 de 4 etapas concluidas");
    expect(readiness.steps.map((step) => step.id)).toEqual([
      SETUP_STEP_IDS.identity,
      SETUP_STEP_IDS.contact,
      SETUP_STEP_IDS.practiceDefaults,
      SETUP_STEP_IDS.signatureAsset,
    ]);
    expect(readiness.steps.map((step) => step.status)).toEqual([
      "complete",
      "incomplete",
      "complete",
      "complete",
    ]);
  });
});
