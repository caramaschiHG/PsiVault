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

  it("session revocation", async () => {
    const { createSession } = await import("../src/lib/auth/session");
    const { createInMemoryAuditRepository } = await import("../src/lib/audit/repository");
    const { buildVisibleSessionList, revokeSessionAccess } = await import("../src/lib/security/session-control");

    const currentSession = createSession(
      {
        accountId: "acct_1",
        workspaceId: "ws_1",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36",
      },
      {
        now,
        createId: () => "sess_current",
        createToken: () => "sess_current_token",
      },
    );
    const mobileSession = createSession(
      {
        accountId: "acct_1",
        workspaceId: "ws_1",
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Version/17.4 Mobile/15E148 Safari/604.1",
      },
      {
        now: new Date("2026-03-13T09:00:00.000Z"),
        createId: () => "sess_mobile",
        createToken: () => "sess_mobile_token",
      },
    );
    const repository = createInMemoryAuditRepository();

    const result = revokeSessionAccess(
      {
        sessions: [currentSession, mobileSession],
        sessionId: "sess_mobile",
        currentSessionId: "sess_current",
        actingAccountId: "acct_1",
        workspaceId: "ws_1",
      },
      {
        now,
        repository,
        createAuditEventId: () => "audit_2",
      },
    );

    expect(result.status).toBe("revoked");
    expect(result.auditEvent?.type).toBe("security.session.revoked");
    expect(result.sessions.find((session) => session.id === "sess_mobile")?.revokedAt).toEqual(now);
    expect(repository.listForWorkspace("ws_1")).toHaveLength(1);
    expect(
      buildVisibleSessionList({
        sessions: result.sessions,
        currentSessionId: "sess_current",
        now,
      }),
    ).toEqual([
      expect.objectContaining({
        id: "sess_current",
        title: "Sessão atual",
        canRevoke: false,
      }),
    ]);
  });

  it("sensitive action guard", async () => {
    const {
      createSensitiveActionChallenge,
      evaluateSensitiveAction,
    } = await import("../src/lib/security/sensitive-actions");

    const challenge = createSensitiveActionChallenge(
      {
        actionId: "revoke-session",
        title: "Encerrar acesso deste dispositivo",
        reason: "Esta ação remove um acesso ativo do vault.",
        confirmationLabel: "ENCERRAR ACESSO",
      },
      {
        now,
        createId: () => "challenge_1",
      },
    );

    expect(challenge).toMatchObject({
      id: "challenge_1",
      actionId: "revoke-session",
      requiresReauth: true,
      confirmationLabel: "ENCERRAR ACESSO",
    });
    expect(
      evaluateSensitiveAction({
        challenge,
        confirmationValue: "ENCERRAR ACESSO",
        reauthVerifiedAt: null,
        now,
      }),
    ).toMatchObject({
      allowed: false,
      status: "needs_reauth",
    });
    expect(
      evaluateSensitiveAction({
        challenge,
        confirmationValue: "encerrar acesso",
        reauthVerifiedAt: new Date("2026-03-13T14:26:00.000Z"),
        now,
      }),
    ).toMatchObject({
      allowed: true,
      status: "approved",
    });
  });
});
