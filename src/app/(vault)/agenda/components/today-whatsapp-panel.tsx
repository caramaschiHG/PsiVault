"use client";

import { useState, useEffect } from "react";

const DEFAULT_TEMPLATE =
  "Olá, {nome}! Lembrando da sua consulta em {data} às {hora}. Qualquer dúvida, estou à disposição!";

const TEMPLATE_KEY = "psilock_wapp_template";
const SENT_KEY_PREFIX = "psilock_wapp_sent_";

interface WhatsAppEntry {
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  whatsappUrl: string;
}

interface Props {
  entries: WhatsAppEntry[];
  noPhonePatients: string[];
  todayDateStr: string;
}

function buildUrl(template: string, entry: WhatsAppEntry): string {
  const text = template
    .replace(/\{nome\}/g, entry.patientName)
    .replace(/\{data\}/g, entry.appointmentDate)
    .replace(/\{hora\}/g, entry.appointmentTime);
  const digits = entry.patientPhone.replace(/\D/g, "");
  return `https://wa.me/55${digits}?text=${encodeURIComponent(text)}`;
}

function loadTemplate(): string {
  try {
    return localStorage.getItem(TEMPLATE_KEY) ?? DEFAULT_TEMPLATE;
  } catch {
    return DEFAULT_TEMPLATE;
  }
}

function loadSentIds(dateStr: string): Set<string> {
  try {
    const raw = localStorage.getItem(SENT_KEY_PREFIX + dateStr);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveSentIds(dateStr: string, ids: Set<string>) {
  try {
    localStorage.setItem(SENT_KEY_PREFIX + dateStr, JSON.stringify([...ids]));
  } catch {}
}

function cleanOldSentKeys(todayStr: string) {
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(SENT_KEY_PREFIX) && key.slice(SENT_KEY_PREFIX.length) < todayStr) {
        toRemove.push(key);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

export function TodayWhatsAppPanel({ entries, noPhonePatients, todayDateStr }: Props) {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  useEffect(() => {
    cleanOldSentKeys(todayDateStr);
    const savedTemplate = loadTemplate();
    const savedSent = loadSentIds(todayDateStr);
    setTemplate(savedTemplate);
    setSentIds(savedSent);
    setSelected(
      new Set(entries.filter((e) => !savedSent.has(e.appointmentId)).map((e) => e.appointmentId)),
    );
  }, [todayDateStr, entries]);

  if (entries.length === 0 && noPhonePatients.length === 0) return null;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function saveTemplate(val: string) {
    setTemplate(val);
    try {
      localStorage.setItem(TEMPLATE_KEY, val);
    } catch {}
  }

  async function sendAll() {
    const toSend = entries.filter((e) => selected.has(e.appointmentId));
    if (toSend.length === 0) return;
    setSending(true);
    const newSent = new Set(sentIds);
    for (let i = 0; i < toSend.length; i++) {
      window.open(buildUrl(template, toSend[i]), "_blank");
      newSent.add(toSend[i].appointmentId);
      if (i < toSend.length - 1) {
        await new Promise((res) => setTimeout(res, 800));
      }
    }
    setSentIds(newSent);
    saveSentIds(todayDateStr, newSent);
    setSelected(new Set());
    setSending(false);
  }

  return (
    <section style={panelStyle}>
      <div style={panelHeaderStyle}>
        <div>
          <p style={eyebrowStyle}>WhatsApp</p>
          <h2 style={panelTitleStyle}>Lembretes do dia</h2>
        </div>
        <div style={headerActionsStyle}>
          <button
            type="button"
            onClick={() => setEditingTemplate((v) => !v)}
            style={editButtonStyle}
            title="Personalizar mensagem"
          >
            ✏ Mensagem
          </button>
          <button
            onClick={sendAll}
            disabled={sending || selected.size === 0}
            style={selected.size > 0 ? sendButtonStyle : sendButtonDisabledStyle}
          >
            {sending ? "Abrindo…" : `Enviar lembretes (${selected.size})`}
          </button>
        </div>
      </div>

      {editingTemplate && (
        <div style={templateEditorStyle}>
          <p style={templateHintStyle}>
            Use {"{nome}"}, {"{data}"} e {"{hora}"} como variáveis.
          </p>
          <textarea
            value={template}
            onChange={(e) => saveTemplate(e.target.value)}
            rows={3}
            style={textareaStyle}
          />
          <button
            type="button"
            onClick={() => saveTemplate(DEFAULT_TEMPLATE)}
            style={resetTemplateButtonStyle}
          >
            Restaurar padrão
          </button>
        </div>
      )}

      {entries.length > 0 && (
        <ul style={listStyle}>
          {entries.map((entry) => {
            const isSent = sentIds.has(entry.appointmentId);
            return (
              <li key={entry.appointmentId} style={listItemStyle}>
                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={selected.has(entry.appointmentId)}
                    onChange={() => toggle(entry.appointmentId)}
                    style={checkboxStyle}
                  />
                  <div style={entryInfoStyle}>
                    <span style={isSent ? patientNameSentStyle : patientNameStyle}>
                      {entry.patientName}
                    </span>
                    <span style={timeStyle}>{entry.appointmentTime}</span>
                  </div>
                  {isSent && <span style={sentBadgeStyle}>✓ enviado</span>}
                </label>
              </li>
            );
          })}
        </ul>
      )}

      {noPhonePatients.length > 0 && (
        <p style={noPhoneStyle}>
          ⚠ Sem WhatsApp registrado: {noPhonePatients.join(", ")}
        </p>
      )}
    </section>
  );
}

const panelStyle = {
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  padding: "1.25rem",
  display: "grid",
  gap: "1rem",
} satisfies React.CSSProperties;

const panelHeaderStyle = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "1rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  fontSize: "0.7rem",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const panelTitleStyle = {
  margin: 0,
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const headerActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const editButtonStyle = {
  padding: "0.4rem 0.75rem",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border)",
  background: "transparent",
  color: "var(--color-text-2)",
  fontSize: "0.8rem",
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
} satisfies React.CSSProperties;

const sendButtonStyle = {
  padding: "0.45rem 1rem",
  borderRadius: "var(--radius-md)",
  border: "none",
  background: "#25d366",
  color: "#fff",
  fontSize: "0.85rem",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap" as const,
} satisfies React.CSSProperties;

const sendButtonDisabledStyle = {
  ...sendButtonStyle,
  opacity: 0.4,
  cursor: "not-allowed",
};

const templateEditorStyle = {
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  padding: "0.875rem",
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const templateHintStyle = {
  margin: 0,
  fontSize: "0.775rem",
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const textareaStyle = {
  width: "100%",
  padding: "0.5rem 0.625rem",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-1)",
  color: "var(--color-text-1)",
  fontSize: "0.85rem",
  fontFamily: "inherit",
  resize: "vertical" as const,
  lineHeight: 1.5,
  boxSizing: "border-box" as const,
} satisfies React.CSSProperties;

const resetTemplateButtonStyle = {
  justifySelf: "start" as const,
  padding: "0.3rem 0.65rem",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--color-border)",
  background: "transparent",
  color: "var(--color-text-2)",
  fontSize: "0.75rem",
  cursor: "pointer",
  fontFamily: "inherit",
} satisfies React.CSSProperties;

const listStyle = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "grid",
  gap: "0.4rem",
} satisfies React.CSSProperties;

const listItemStyle = {
  borderRadius: "var(--radius-sm)",
  transition: "background 0.1s",
} satisfies React.CSSProperties;

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.65rem",
  padding: "0.45rem 0.5rem",
  cursor: "pointer",
  borderRadius: "var(--radius-sm)",
} satisfies React.CSSProperties;

const checkboxStyle = {
  width: "1rem",
  height: "1rem",
  accentColor: "#25d366",
  cursor: "pointer",
  flexShrink: 0,
} satisfies React.CSSProperties;

const entryInfoStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  flex: 1,
  minWidth: 0,
} satisfies React.CSSProperties;

const patientNameStyle = {
  fontSize: "0.875rem",
  color: "var(--color-text-1)",
  fontWeight: 500,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const,
} satisfies React.CSSProperties;

const patientNameSentStyle = {
  fontSize: "0.875rem",
  color: "var(--color-text-2)",
  fontWeight: 500,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const,
} satisfies React.CSSProperties;

const timeStyle = {
  fontSize: "0.8rem",
  color: "var(--color-text-2)",
  whiteSpace: "nowrap" as const,
} satisfies React.CSSProperties;

const sentBadgeStyle = {
  fontSize: "0.7rem",
  color: "#25d366",
  fontWeight: 600,
  whiteSpace: "nowrap" as const,
  flexShrink: 0,
} satisfies React.CSSProperties;

const noPhoneStyle = {
  margin: 0,
  fontSize: "0.775rem",
  color: "#b45309",
  borderTop: "1px solid var(--color-border)",
  paddingTop: "0.75rem",
} satisfies React.CSSProperties;
