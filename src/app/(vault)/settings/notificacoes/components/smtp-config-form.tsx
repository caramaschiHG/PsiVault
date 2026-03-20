"use client";

import { useActionState, useState } from "react";
import { saveSmtpConfigAction, testSmtpConnectionAction } from "../actions";
import type { WorkspaceSmtpConfig } from "../../../../../lib/notifications/smtp-config";

interface Props {
  existing: WorkspaceSmtpConfig | null;
}

export function SmtpConfigForm({ existing }: Props) {
  const [saveState, saveAction, savePending] = useActionState(saveSmtpConfigAction, null);
  const [testState, testAction, testPending] = useActionState(testSmtpConnectionAction, null);
  const [secure, setSecure] = useState(existing?.secure ?? false);

  return (
    <div style={gridStyle}>
      {/* SMTP connection card */}
      <section style={cardStyle}>
        <div style={sectionHeadingStyle}>
          <p style={sectionEyebrowStyle}>Servidor SMTP</p>
          <h2 style={sectionTitleStyle}>Conexão de e-mail</h2>
        </div>

        <form action={saveAction} style={formStyle}>
          <div style={fieldRowStyle}>
            <label style={labelStyle}>
              Host *
              <input name="host" defaultValue={existing?.host ?? ""} placeholder="smtp.gmail.com" required style={inputStyle} />
            </label>
            <label style={{ ...labelStyle, maxWidth: "8rem" }}>
              Porta
              <input name="port" type="number" defaultValue={existing?.port ?? 587} style={inputStyle} />
            </label>
          </div>

          <label style={labelStyle}>
            <span style={checkboxLabelStyle}>
              <input
                type="checkbox"
                name="secure"
                value="true"
                checked={secure}
                onChange={(e) => setSecure(e.target.checked)}
                style={checkboxStyle}
              />
              Usar TLS/SSL (porta 465)
            </span>
          </label>

          <div style={fieldRowStyle}>
            <label style={labelStyle}>
              Usuário (login) *
              <input name="username" defaultValue={existing?.username ?? ""} placeholder="seu@email.com" required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Senha
              <input name="password" type="password" placeholder={existing ? "••••••••" : "Senha de app"} style={inputStyle} />
              {existing && (
                <span style={hintStyle}>Deixe em branco para manter a senha atual.</span>
              )}
            </label>
          </div>

          <div style={fieldRowStyle}>
            <label style={labelStyle}>
              Nome do remetente *
              <input name="fromName" defaultValue={existing?.fromName ?? ""} placeholder="Dra. Helena Prado" required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              E-mail do remetente *
              <input name="fromEmail" type="email" defaultValue={existing?.fromEmail ?? ""} placeholder="contato@consultorio.com.br" required style={inputStyle} />
            </label>
          </div>

          {/* Preferences */}
          <div style={prefsCardStyle}>
            <p style={prefsLabelStyle}>Enviar automaticamente</p>
            <div style={prefsGridStyle}>
              <CheckboxField name="sendConfirmation" label="Confirmação ao agendar" defaultChecked={existing?.sendConfirmation ?? true} />
              <CheckboxField name="sendReminder24h" label="Lembrete 24h antes" defaultChecked={existing?.sendReminder24h ?? true} />
              <CheckboxField name="sendReminder1h" label="Lembrete 1h antes" defaultChecked={existing?.sendReminder1h ?? true} />
              <CheckboxField name="sendCancellation" label="Aviso de cancelamento" defaultChecked={existing?.sendCancellation ?? true} />
            </div>
          </div>

          {saveState && (
            <p style={saveState.success ? successMsgStyle : errorMsgStyle}>
              {saveState.message ?? saveState.error}
            </p>
          )}

          <div style={actionsRowStyle}>
            <button type="submit" disabled={savePending} style={primaryButtonStyle}>
              {savePending ? "Salvando…" : "Salvar configuração"}
            </button>
          </div>
        </form>
      </section>

      {/* Test connection card */}
      <section style={cardStyle}>
        <div style={sectionHeadingStyle}>
          <p style={sectionEyebrowStyle}>Verificação</p>
          <h2 style={sectionTitleStyle}>Testar conexão SMTP</h2>
        </div>
        <p style={testDescStyle}>
          Preencha os campos acima e clique em "Testar" para verificar se o servidor SMTP responde corretamente.
        </p>
        <form action={testAction} style={formStyle}>
          <input type="hidden" name="host" value={existing?.host ?? ""} />
          <input type="hidden" name="port" value={existing?.port ?? 587} />
          <input type="hidden" name="secure" value={String(secure)} />
          <input type="hidden" name="username" value={existing?.username ?? ""} />
          <input type="hidden" name="fromName" value={existing?.fromName ?? ""} />
          <input type="hidden" name="fromEmail" value={existing?.fromEmail ?? ""} />

          {testState && (
            <p style={testState.success ? successMsgStyle : errorMsgStyle}>
              {testState.message ?? testState.error}
            </p>
          )}

          <button type="submit" disabled={testPending || !existing} style={secondaryButtonStyle}>
            {testPending ? "Testando…" : "Testar conexão"}
          </button>
        </form>
      </section>
    </div>
  );
}

function CheckboxField({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label style={checkboxFieldStyle}>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} style={checkboxStyle} />
      <span style={{ fontSize: "0.875rem", color: "var(--color-text-1)" }}>{label}</span>
    </label>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const gridStyle = {
  display: "grid",
  gap: "1.5rem",
} satisfies React.CSSProperties;

const cardStyle = {
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  padding: "1.5rem",
  display: "grid",
  gap: "1.25rem",
} satisfies React.CSSProperties;

const sectionHeadingStyle = {
  display: "grid",
  gap: "0.2rem",
} satisfies React.CSSProperties;

const sectionEyebrowStyle = {
  margin: 0,
  fontSize: "0.7rem",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const sectionTitleStyle = {
  margin: 0,
  fontSize: "1rem",
  fontWeight: 600,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const formStyle = {
  display: "grid",
  gap: "1rem",
} satisfies React.CSSProperties;

const fieldRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const labelStyle = {
  display: "grid",
  gap: "0.35rem",
  fontSize: "0.85rem",
  fontWeight: 500,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const inputStyle = {
  padding: "0.45rem 0.65rem",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--color-border-med)",
  background: "var(--color-surface-0)",
  fontSize: "0.875rem",
  fontFamily: "inherit",
  color: "var(--color-text-1)",
  width: "100%",
} satisfies React.CSSProperties;

const hintStyle = {
  fontSize: "0.75rem",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.875rem",
  color: "var(--color-text-1)",
  cursor: "pointer",
} satisfies React.CSSProperties;

const checkboxStyle = {
  width: "1rem",
  height: "1rem",
  accentColor: "var(--color-accent)",
  cursor: "pointer",
} satisfies React.CSSProperties;

const checkboxFieldStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  cursor: "pointer",
} satisfies React.CSSProperties;

const prefsCardStyle = {
  background: "var(--color-surface-0)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  padding: "1rem",
  display: "grid",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const prefsLabelStyle = {
  margin: 0,
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const prefsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const successMsgStyle = {
  margin: 0,
  padding: "0.6rem 0.9rem",
  borderRadius: "var(--radius-sm)",
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
  fontSize: "0.85rem",
  color: "#166534",
} satisfies React.CSSProperties;

const errorMsgStyle = {
  margin: 0,
  padding: "0.6rem 0.9rem",
  borderRadius: "var(--radius-sm)",
  background: "var(--color-accent-light)",
  border: "1px solid var(--color-border-med)",
  fontSize: "0.85rem",
  color: "var(--color-accent)",
} satisfies React.CSSProperties;

const actionsRowStyle = {
  display: "flex",
  gap: "0.75rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const primaryButtonStyle = {
  padding: "0.55rem 1.25rem",
  borderRadius: "var(--radius-md)",
  border: "none",
  background: "var(--color-accent)",
  color: "#fff7ed",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
} satisfies React.CSSProperties;

const secondaryButtonStyle = {
  padding: "0.55rem 1.25rem",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border-med)",
  background: "var(--color-surface-0)",
  color: "var(--color-text-1)",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
} satisfies React.CSSProperties;

const testDescStyle = {
  margin: 0,
  fontSize: "0.875rem",
  color: "var(--color-text-2)",
  lineHeight: 1.5,
} satisfies React.CSSProperties;
