import { describe, it, expect } from "vitest";
import { buildReminderMessage, MockReminderSender } from "../../../../src/lib/agents/agenda/reminder-sender";

describe("buildReminderMessage", () => {
  it("formats single appointment message", () => {
    const msg = buildReminderMessage("Maria", [{ startsAt: new Date("2026-04-28T10:00:00Z") }]);
    expect(msg).toContain("1 atendimento amanhã");
    expect(msg).toContain("Maria");
  });

  it("formats multiple appointments message", () => {
    const msg = buildReminderMessage("João", [
      { startsAt: new Date("2026-04-28T10:00:00Z") },
      { startsAt: new Date("2026-04-28T14:00:00Z") },
    ]);
    expect(msg).toContain("2 atendimentos amanhã");
    // Times are formatted in America/Sao_Paulo (UTC-3)
    expect(msg).toContain("07:00");
    expect(msg).toContain("11:00");
  });

  it("sorts appointments by time", () => {
    const msg = buildReminderMessage("Test", [
      { startsAt: new Date("2026-04-28T14:00:00Z") },
      { startsAt: new Date("2026-04-28T10:00:00Z") },
    ]);
    // 10:00 UTC = 07:00 BRT, 14:00 UTC = 11:00 BRT
    expect(msg.indexOf("07:00")).toBeLessThan(msg.indexOf("11:00"));
  });
});

describe("MockReminderSender", () => {
  it("logs and returns sent=true", async () => {
    const sender = new MockReminderSender();
    const result = await sender.send("pat_1", "+5511999999999", "Olá, lembrete!");
    expect(result.sent).toBe(true);
    expect(result.log).toContain("pat_1");
    expect(result.log).toContain("Olá, lembrete!");
  });
});
