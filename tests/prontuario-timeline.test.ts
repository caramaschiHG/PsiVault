import { describe, it, expect } from "vitest";
import type { Appointment } from "@/lib/appointments/model";
import type { ClinicalNote } from "@/lib/clinical/model";

// NOTE: These imports will fail until Plan 02 creates the implementation module.
// That is the expected RED state — testes falham por módulo ausente, não por erro de sintaxe.
import {
  buildTimeline,
  buildNotesByAppointment,
  hasNotes,
} from "@/app/(vault)/prontuario/[patientId]/timeline";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const NOW = new Date("2026-04-03T12:00:00.000Z");

function makeAppt(overrides: Partial<Appointment>): Appointment {
  return {
    id: "appt_default",
    workspaceId: "ws_1",
    patientId: "pat_1",
    startsAt: new Date("2026-04-01T10:00:00.000Z"),
    endsAt: new Date("2026-04-01T11:00:00.000Z"),
    durationMinutes: 60,
    careMode: "IN_PERSON",
    status: "COMPLETED",
    seriesId: null,
    seriesIndex: null,
    rescheduledFromId: null,
    canceledAt: null,
    canceledByAccountId: null,
    canceledBy: null,
    confirmedAt: null,
    completedAt: null,
    noShowAt: null,
    seriesPattern: null,
    seriesDaysOfWeek: [],
    priceInCents: null,
    meetingLink: null,
    remoteIssueNote: null,
    createdAt: new Date("2026-03-01T00:00:00.000Z"),
    updatedAt: new Date("2026-03-01T00:00:00.000Z"),
    ...overrides,
  };
}

function makeNote(overrides: Partial<ClinicalNote>): ClinicalNote {
  return {
    id: "note_default",
    workspaceId: "ws_1",
    patientId: "pat_1",
    appointmentId: "appt_default",
    freeText: "Anotação clínica de teste.",
    demand: null,
    observedMood: null,
    themes: null,
    clinicalEvolution: null,
    nextSteps: null,
    createdAt: new Date("2026-04-01T00:00:00.000Z"),
    updatedAt: new Date("2026-04-01T00:00:00.000Z"),
    editedAt: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// CONT-04: empty state sem atendimentos
// ---------------------------------------------------------------------------

describe("CONT-04: empty state — sem atendimentos", () => {
  it("retorna upcoming=null e todas as listas vazias quando não há atendimentos", () => {
    const result = buildTimeline([], NOW);

    expect(result.upcoming).toBeNull();
    expect(result.completedVisible).toEqual([]);
    expect(result.completedHidden).toEqual([]);
    expect(result.dismissedAll).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// CONT-01: upcoming — atendimento futuro agendado
// ---------------------------------------------------------------------------

describe("CONT-01: upcoming — atendimento futuro", () => {
  it("aparece como primeiro item mesmo sendo futuro (startsAt > now)", () => {
    const futureAppt = makeAppt({
      id: "appt_future",
      status: "SCHEDULED",
      startsAt: new Date("2026-04-10T10:00:00.000Z"),
      endsAt: new Date("2026-04-10T11:00:00.000Z"),
    });

    const result = buildTimeline([futureAppt], NOW);

    expect(result.upcoming).not.toBeNull();
    expect(result.upcoming!.id).toBe("appt_future");
    expect(result.completedVisible).toEqual([]);
  });

  it("retorna o atendimento mais próximo quando há múltiplos futuros agendados", () => {
    const soon = makeAppt({
      id: "appt_soon",
      status: "SCHEDULED",
      startsAt: new Date("2026-04-05T10:00:00.000Z"),
      endsAt: new Date("2026-04-05T11:00:00.000Z"),
    });
    const later = makeAppt({
      id: "appt_later",
      status: "CONFIRMED",
      startsAt: new Date("2026-04-15T10:00:00.000Z"),
      endsAt: new Date("2026-04-15T11:00:00.000Z"),
    });

    const result = buildTimeline([later, soon], NOW);

    expect(result.upcoming!.id).toBe("appt_soon");
  });

  it("retorna upcoming=null quando todos os atendimentos são passados", () => {
    const pastAppt = makeAppt({
      id: "appt_past",
      status: "COMPLETED",
      startsAt: new Date("2026-03-20T10:00:00.000Z"),
      endsAt: new Date("2026-03-20T11:00:00.000Z"),
    });

    const result = buildTimeline([pastAppt], NOW);

    expect(result.upcoming).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// CONT-01: completed — ordenação cronológica decrescente
// ---------------------------------------------------------------------------

describe("CONT-01: completed — ordenação cronológica", () => {
  it("ordena por startsAt decrescente (mais recente primeiro)", () => {
    const older = makeAppt({
      id: "appt_older",
      status: "COMPLETED",
      startsAt: new Date("2026-03-01T10:00:00.000Z"),
      endsAt: new Date("2026-03-01T11:00:00.000Z"),
    });
    const newer = makeAppt({
      id: "appt_newer",
      status: "COMPLETED",
      startsAt: new Date("2026-03-20T10:00:00.000Z"),
      endsAt: new Date("2026-03-20T11:00:00.000Z"),
    });

    const result = buildTimeline([older, newer], NOW);

    expect(result.completedVisible[0].id).toBe("appt_newer");
    expect(result.completedVisible[1].id).toBe("appt_older");
  });

  it("com 5 ou menos completed, completedHidden é vazio", () => {
    const appts = [1, 2, 3, 4, 5].map((i) =>
      makeAppt({
        id: `appt_${i}`,
        status: "COMPLETED",
        startsAt: new Date(`2026-03-${String(i).padStart(2, "0")}T10:00:00.000Z`),
        endsAt: new Date(`2026-03-${String(i).padStart(2, "0")}T11:00:00.000Z`),
      }),
    );

    const result = buildTimeline(appts, NOW);

    expect(result.completedVisible).toHaveLength(5);
    expect(result.completedHidden).toHaveLength(0);
  });

  it("com mais de 5 completed, apenas 5 ficam visíveis e o restante em hidden", () => {
    const appts = [1, 2, 3, 4, 5, 6, 7].map((i) =>
      makeAppt({
        id: `appt_${i}`,
        status: "COMPLETED",
        startsAt: new Date(`2026-03-${String(i).padStart(2, "0")}T10:00:00.000Z`),
        endsAt: new Date(`2026-03-${String(i).padStart(2, "0")}T11:00:00.000Z`),
      }),
    );

    const result = buildTimeline(appts, NOW);

    expect(result.completedVisible).toHaveLength(5);
    expect(result.completedHidden).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// CONT-01: dismissed — CANCELED e NO_SHOW separados de completed
// ---------------------------------------------------------------------------

describe("CONT-01: dismissed — separados de completed", () => {
  it("CANCELED vai para dismissedAll, não para completedVisible", () => {
    const canceled = makeAppt({
      id: "appt_canceled",
      status: "CANCELED",
      startsAt: new Date("2026-03-15T10:00:00.000Z"),
      endsAt: new Date("2026-03-15T11:00:00.000Z"),
    });

    const result = buildTimeline([canceled], NOW);

    expect(result.dismissedAll).toHaveLength(1);
    expect(result.dismissedAll[0].id).toBe("appt_canceled");
    expect(result.completedVisible).toHaveLength(0);
  });

  it("NO_SHOW vai para dismissedAll, não para completedVisible", () => {
    const noShow = makeAppt({
      id: "appt_noshow",
      status: "NO_SHOW",
      startsAt: new Date("2026-03-10T10:00:00.000Z"),
      endsAt: new Date("2026-03-10T11:00:00.000Z"),
    });

    const result = buildTimeline([noShow], NOW);

    expect(result.dismissedAll).toHaveLength(1);
    expect(result.dismissedAll[0].id).toBe("appt_noshow");
    expect(result.completedVisible).toHaveLength(0);
  });

  it("CANCELED e NO_SHOW em ordem cronológica decrescente em dismissedAll", () => {
    const canceled = makeAppt({
      id: "appt_canceled",
      status: "CANCELED",
      startsAt: new Date("2026-03-05T10:00:00.000Z"),
      endsAt: new Date("2026-03-05T11:00:00.000Z"),
    });
    const noShow = makeAppt({
      id: "appt_noshow",
      status: "NO_SHOW",
      startsAt: new Date("2026-03-15T10:00:00.000Z"),
      endsAt: new Date("2026-03-15T11:00:00.000Z"),
    });

    const result = buildTimeline([canceled, noShow], NOW);

    expect(result.dismissedAll[0].id).toBe("appt_noshow");
    expect(result.dismissedAll[1].id).toBe("appt_canceled");
  });
});

// ---------------------------------------------------------------------------
// CONT-02: buildNotesByAppointment — lookup por appointmentId
// ---------------------------------------------------------------------------

describe("CONT-02: buildNotesByAppointment — lookup por appointmentId", () => {
  it("retorna a nota correta para um appointmentId existente", () => {
    const note = makeNote({ id: "note_1", appointmentId: "appt_1" });

    const map = buildNotesByAppointment([note]);

    expect(map.get("appt_1")).toBe(note);
  });

  it("retorna undefined para um appointmentId sem nota", () => {
    const note = makeNote({ id: "note_1", appointmentId: "appt_1" });

    const map = buildNotesByAppointment([note]);

    expect(map.get("appt_inexistente")).toBeUndefined();
  });

  it("mapeia múltiplas notas por appointmentId distinto", () => {
    const note1 = makeNote({ id: "note_1", appointmentId: "appt_1" });
    const note2 = makeNote({ id: "note_2", appointmentId: "appt_2" });

    const map = buildNotesByAppointment([note1, note2]);

    expect(map.get("appt_1")!.id).toBe("note_1");
    expect(map.get("appt_2")!.id).toBe("note_2");
    expect(map.size).toBe(2);
  });

  it("retorna Map vazio quando não há notas", () => {
    const map = buildNotesByAppointment([]);

    expect(map.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// CONT-04: hasNotes — badge "Novo acompanhamento"
// ---------------------------------------------------------------------------

describe("CONT-04: hasNotes — badge Novo acompanhamento", () => {
  it("retorna false quando latestNote é null (aciona badge)", () => {
    expect(hasNotes(null)).toBe(false);
  });

  it("retorna true quando latestNote existe", () => {
    const note = makeNote({});
    expect(hasNotes(note)).toBe(true);
  });
});
