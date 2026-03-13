describe("audit contract baseline", () => {
  const now = new Date("2026-03-13T14:30:00.000Z");

  it("audit event contract", async () => {
    const { createAuditEvent, describeAuditEvent } = await import("../src/lib/audit/events");
    const { redactForLogs } = await import("../src/lib/logging/redaction");

    const event = createAuditEvent(
      {
        type: "security.session.revoked",
        actor: {
          accountId: "acct_1",
          workspaceId: "ws_1",
          sessionId: "sess_current",
          displayName: "Dra. Helena Prado",
        },
        subject: {
          kind: "session",
          id: "sess_old",
          label: "MacBook Air do consultório",
        },
        summary: "Sessão encerrada manualmente nas configurações de segurança.",
        metadata: {
          userAgent: "Mozilla/5.0",
          sessionToken: "session-secret-token",
          ipAddress: "203.0.113.10",
        },
      },
      {
        now,
        createId: () => "audit_1",
        redact: redactForLogs,
      },
    );

    expect(event).toMatchObject({
      id: "audit_1",
      type: "security.session.revoked",
      actor: {
        accountId: "acct_1",
        workspaceId: "ws_1",
        sessionId: "sess_current",
      },
      subject: {
        kind: "session",
        id: "sess_old",
        label: "MacBook Air do consultório",
      },
      summary: "Sessão encerrada manualmente nas configurações de segurança.",
    });
    expect(event.occurredAt).toEqual(now);
    expect(event.metadata).toEqual({
      userAgent: "Mozilla/5.0",
      sessionToken: "[redacted]",
      ipAddress: "[redacted]",
    });
    expect(describeAuditEvent(event)).toBe("Você encerrou a sessão “MacBook Air do consultório”.");
  });

  it("privacy-safe surfaces", async () => {
    const { redactForLogs } = await import("../src/lib/logging/redaction");

    expect(
      redactForLogs({
        patientName: "Ana Silva",
        noteContent: "Paciente relatou conteúdo sensível.",
        nested: {
          password: "Vault#2026",
          sessionToken: "tok_123",
          harmless: "ok",
        },
        tags: ["pix", "clinico"],
      }),
    ).toEqual({
      patientName: "[redacted]",
      noteContent: "[redacted]",
      nested: {
        password: "[redacted]",
        sessionToken: "[redacted]",
        harmless: "ok",
      },
      tags: ["pix", "clinico"],
    });
  });

  it.todo("session revocation");
  it.todo("sensitive action guard");
});
